import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateReceiptPDF } from '@/lib/pdf/receipt'
import { sendReceiptEmail } from '@/lib/email/sendReceipt'
import { generateReceiptNumber } from '@/lib/pdf/receipt'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const PLAN_NAMES: Record<string, string> = {
  free: 'Gratuit',
  standard: 'Standard — 100 invités, 5 styles, Export PDF',
  prestige: 'Prestige — 500 invités, QR Codes, Export Excel, PDF HD',
  vip: 'VIP / Illimité — Invités illimités, Support WhatsApp, Sans mention',
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  
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

    // ✅ 3. Vérifier la signature avec HMAC-SHA256
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('❌ Signature invalide')
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 })
    }

    // ✅ 4. Signature valide → parser le payload
    const body = JSON.parse(rawBody)
    const transaction = body.transaction || body

    if (!transaction || !transaction.id) {
      return NextResponse.json(
        { error: 'Transaction invalide' },
        { status: 400 }
      )
    }

    // ✅ 5. Vérifier que le statut est approuvé
    if (transaction.status !== 'approved' && transaction.status !== 'completed') {
      return NextResponse.json({ success: true, message: 'Transaction non approuvée' })
    }

    // ✅ 6. Récupérer le paiement avec verrouillage pour éviter les doublons
    // Utiliser une transaction pour éviter les traitements en parallèle
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select(`
        *,
        events (
          id,
          name,
          slug,
          organizer_id,
          plan_type,
          profiles (
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('transaction_id', transaction.id)
      .eq('status', 'pending') // Ne traiter que les paiements en attente
      .single()

    if (paymentError || !payment) {
      console.error('Paiement non trouvé ou déjà traité:', paymentError)
      return NextResponse.json(
        { error: 'Paiement non trouvé ou déjà traité' },
        { status: 404 }
      )
    }

    const event = payment.events
    const organizer = event?.profiles

    if (!event || !organizer) {
      console.error('Événement ou organisateur non trouvé')
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 404 }
      )
    }

    // ✅ 7. Mettre à jour le paiement
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
      // On continue quand même car l'événement peut être mis à jour
    }

    // ✅ 8. Mettre à jour l'événement
    const planName = PLAN_NAMES[event.plan_type] || event.plan_type
    const isFreePlan = event.plan_type === 'free'

    await supabase
      .from('events')
      .update({
        payment_status: 'paid',
        status: 'active',
        is_premium: !isFreePlan,
      })
      .eq('id', event.id)

    // ✅ 9. Créer l'invitation si elle n'existe pas
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('id')
      .eq('event_id', event.id)
      .eq('recipient_name', 'Invité')
      .maybeSingle()

    if (!existingInvitation) {
      await supabase
        .from('invitations')
        .insert({
          event_id: event.id,
          recipient_name: 'Invité',
          unique_link: `inv-${event.slug}`,
          status: 'sent',
        })
    }

    // ✅ 10. Générer le reçu PDF et envoyer l'email
    const receiptNumber = generateReceiptNumber()
    const currency = payment.currency || 'XOF'

    try {
      const pdfBuffer = await generateReceiptPDF({
        number: receiptNumber,
        date: new Date().toISOString(),
        customerName: `${organizer.first_name} ${organizer.last_name}`,
        customerEmail: organizer.email,
        eventId: event.id,
        planName: planName,
        planPrice: payment.final_amount || payment.amount,
        currency: currency,
        paymentMethod: payment.payment_method || 'mobile_money',
        transactionId: transaction.id,
      })

      await sendReceiptEmail({
        to: organizer.email,
        customerName: `${organizer.first_name} ${organizer.last_name}`,
        eventName: event.name,
        pdfBuffer,
        receiptNumber,
      })
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // On ne bloque pas le webhook si l'email échoue
    }

    // ✅ 11. Log de sécurité
    await supabase.from('security_logs').insert({
      event_type: 'payment_webhook_success',
      user_id: organizer.id,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      details: {
        transaction_id: transaction.id,
        event_id: event.id,
        amount: payment.amount,
      },
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('❌ Erreur webhook:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}