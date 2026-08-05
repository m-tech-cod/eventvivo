import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReceiptPDF, generateReceiptNumber } from '@/lib/pdf/receipt'
import { sendReceiptEmail } from '@/lib/email/sendReceipt'
import { getPlanMaxGuests } from '@/lib/utils/currency'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const PLAN_NAMES: Record<string, string> = {
  free: 'Gratuit',
  standard: 'Standard — 100 invités, 5 styles, Export PDF',
  prestige: 'Prestige — 500 invités, QR Codes, Export Excel, PDF HD',
  vip: 'VIP / Illimité — Invités illimités, Support WhatsApp, Sans mention',
}

export async function POST(request: NextRequest) {
  // ⚠️ Le webhook FedaPay est un appel serveur-à-serveur : il n'y a jamais
  // de session utilisateur (pas de cookies, pas de auth.uid()). Toutes les
  // policies RLS basées sur auth.uid() (events_update_own, payments n'a
  // même pas de policy UPDATE, profiles_update_own, etc.) bloqueraient donc
  // SILENCIEUSEMENT chaque écriture — sans erreur visible, juste 0 ligne
  // affectée. La vraie sécurité de cette route est la vérification de
  // signature HMAC ci-dessous, pas RLS : on utilise donc le client admin
  // (service_role) qui contourne RLS, pour TOUTES les opérations.
  const supabase = createAdminClient()

  try {
    // ✅ 1. Lire le corps brut pour la signature
    const rawBody = await request.text()

    // ✅ 2. Récupérer et vérifier la signature
    const signature = request.headers.get('x-fedapay-signature')
    if (!signature) {
      console.error('❌ Signature manquante')
      return NextResponse.json({ error: 'Signature manquante' }, { status: 401 })
    }

    const secret = process.env.FEDAPAY_WEBHOOK_SECRET
    if (!secret) {
      console.error('❌ FEDAPAY_WEBHOOK_SECRET non configuré')
      return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    // Comparaison en temps constant : une comparaison `!==` classique sort
    // dès le premier octet différent, ce qui fuit (via le timing de réponse)
    // des informations sur la signature attendue à un attaquant qui
    // bombarderait ce endpoint public de tentatives.
    const signatureBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)
    const signatureValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer)

    if (!signatureValid) {
      console.error('❌ Signature invalide')
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }

    // ✅ 3. Signature valide → parser le payload
    // Le format FedaPay est { name: "transaction.approved", entity: {...} },
    // pas { transaction: {...} }.
    const body = JSON.parse(rawBody)
    const eventName = body.name as string | undefined
    const transaction = body.entity

    if (!transaction || !transaction.id) {
      console.error('❌ Payload webhook inattendu:', body)
      return NextResponse.json({ error: 'Transaction invalide' }, { status: 400 })
    }

    // ✅ 4. Ne traiter que les transactions approuvées
    const isApproved = eventName === 'transaction.approved' || transaction.status === 'approved'
    if (!isApproved) {
      return NextResponse.json({ success: true, message: 'Événement ignoré (non approuvé)' })
    }

    // ✅ 5. Récupérer le paiement en attente correspondant
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        events (
          id,
          name,
          slug,
          plan_type
        )
      `)
      .eq('transaction_id', transaction.id)
      .eq('status', 'pending')
      .single()

    if (paymentError || !payment) {
      console.error('Paiement non trouvé ou déjà traité:', paymentError)
      return NextResponse.json(
        { error: 'Paiement non trouvé ou déjà traité' },
        { status: 404 }
      )
    }

    // ✅ 6. Récupérer l'organisateur directement via payment.user_id
    // (indépendant de l'existence d'un événement — nécessaire pour le cas
    // d'un nouvel événement pas encore créé, où payment.event_id est NULL)
    const { data: organizer, error: organizerError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('id', payment.user_id)
      .single()

    if (organizerError || !organizer) {
      console.error('Organisateur non trouvé:', organizerError)
      return NextResponse.json({ error: 'Organisateur non trouvé' }, { status: 404 })
    }

    const event = payment.events // peut être null si l'événement n'est pas encore créé

    // ✅ 7. Marquer le paiement comme complété
    const { error: updatePaymentError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        webhook_received_at: new Date().toISOString(),
      })
      .eq('transaction_id', transaction.id)

    if (updatePaymentError) {
      console.error('Erreur mise à jour paiement:', updatePaymentError)
    }

    // ✅ 7bis. Programme ambassadeur : verrouille le parrain (une seule fois,
    // à la toute première confirmation de paiement avec un code promo) et
    // crédite la commission de l'ambassadeur sur CE paiement, qu'il s'agisse
    // du premier achat (avec réduction) ou d'un achat suivant (sans
    // réduction, mais toujours avec commission).
    if (payment.ambassador_id) {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('referred_by_ambassador_id')
        .eq('id', payment.user_id)
        .maybeSingle()

      if (currentProfile && !currentProfile.referred_by_ambassador_id) {
        await supabase
          .from('profiles')
          .update({ referred_by_ambassador_id: payment.ambassador_id })
          .eq('id', payment.user_id)
      }

      const { data: ambassador } = await supabase
        .from('ambassadors')
        .select('commission_rate, total_earned')
        .eq('id', payment.ambassador_id)
        .maybeSingle()

      if (ambassador) {
        const commission = Math.round(
          (payment.final_amount || payment.amount) * (ambassador.commission_rate / 100)
        )
        await supabase
          .from('ambassadors')
          .update({ total_earned: (ambassador.total_earned || 0) + commission })
          .eq('id', payment.ambassador_id)
      }
    }

    // ✅ 8. Activer l'événement — uniquement s'il existe déjà (upgrade d'un
    // événement existant via premium/page.tsx). Si event_id est NULL, c'est
    // un paiement pour un événement pas encore créé (checkout/page.tsx) :
    // le paiement reste marqué 'completed' et sera rattaché à l'événement
    // au moment de sa création (voir note ci-dessous).
    if (event) {
      await supabase
        .from('events')
        .update({
          payment_status: 'paid',
          status: 'active',
          plan_type: payment.plan_type,
          is_premium: payment.plan_type !== 'free',
          max_guests: getPlanMaxGuests(payment.plan_type),
        })
        .eq('id', event.id)
    } else {
      console.log('ℹ️ Paiement complété pour un événement pas encore créé (event_id NULL). user_id:', payment.user_id, 'plan_type:', payment.plan_type)
    }

    // ✅ 9. Générer le reçu PDF et envoyer l'email (indépendant de l'existence
    // de l'événement)
    const planName = PLAN_NAMES[payment.plan_type] || payment.plan_type
    const receiptNumber = generateReceiptNumber()
    const currency = payment.currency || 'XOF'

    try {
      const pdfBuffer = await generateReceiptPDF({
        number: receiptNumber,
        date: new Date().toISOString(),
        customerName: `${organizer.first_name} ${organizer.last_name}`,
        customerEmail: organizer.email,
        eventId: event?.id || null,
        eventName: event?.name || null,
        planName: planName,
        planPrice: payment.final_amount || payment.amount,
        currency: currency,
        paymentMethod: payment.payment_method || 'mobile_money',
        transactionId: transaction.id,
      })

      await sendReceiptEmail({
        to: organizer.email,
        customerName: `${organizer.first_name} ${organizer.last_name}`,
        eventName: event?.name || 'Nouvel événement Eventvivo',
        pdfBuffer,
        receiptNumber,
      })
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // On ne bloque pas le webhook si l'email échoue
    }

    // ✅ 10. Log de sécurité
    await supabase.from('security_logs').insert({
      event_type: 'payment_webhook_success',
      user_id: organizer.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      details: {
        transaction_id: transaction.id,
        event_id: event?.id || null,
        amount: payment.amount,
        plan_type: payment.plan_type,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Erreur webhook:', error)
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 })
  }
}
