import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import { paymentSchema } from '@/lib/validations/payment'
import { getPriceForCurrency } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // ✅ Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await rateLimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives, réessaye dans 1 minute' },
      { status: 429 }
    )
  }

  const supabase = await createServerClient()
  const adminSupabase = createAdminClient() // pour la lecture de `ambassadors`, réservée aux admins par RLS
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()

  // ✅ Validation (schéma partagé avec le reste de l'app)
  const validation = paymentSchema.safeParse(body)
  if (!validation.success) {
    console.error('❌ Erreur validation:', validation.error.issues)
    return NextResponse.json(
      { error: 'Données invalides', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { event_id, currency, payment_method, promo_code, ambassador_id, plan_type } = validation.data

  // ✅ Source unique de vérité sur le prix : jamais le client. Le même
  // helper est utilisé côté affichage (checkout/page.tsx, premium/page.tsx)
  // et côté serveur (create-with-plan/route.ts) — un montant client
  // divergent ne peut donc être qu'une tentative de manipulation.
  const amount = getPriceForCurrency(currency, plan_type)
  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Prix indisponible pour ce plan' }, { status: 400 })
  }

  try {
    let finalAmount = amount
    let finalPromoCode = promo_code || null
    let finalAmbassadorId = ambassador_id || null

    // ✅ Code promo
    if (promo_code) {
      const { data: ambassador, error: ambassadorError } = await adminSupabase
        .from('ambassadors')
        .select('id, commission_rate, expires_at, status')
        .eq('promo_code', promo_code.toUpperCase())
        .eq('status', 'active')
        .single()

      if (ambassadorError || !ambassador) {
        return NextResponse.json({ error: 'Code promo invalide' }, { status: 400 })
      }

      if (ambassador.expires_at && new Date() > new Date(ambassador.expires_at)) {
        return NextResponse.json({ error: 'Ce code promo a expiré' }, { status: 400 })
      }

      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('promo_code', promo_code.toUpperCase())
        .eq('status', 'completed')
        .maybeSingle()

      if (existingPayment) {
        return NextResponse.json({ error: 'Vous avez déjà utilisé ce code promo' }, { status: 400 })
      }

      const rate = ambassador.commission_rate || 10
      finalAmount = Math.round(amount * (1 - rate / 100))
      finalPromoCode = promo_code.toUpperCase()
      finalAmbassadorId = ambassador.id
    }

    if (finalAmount <= 0) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    const apiKey = process.env.FEDAPAY_API_KEY
    if (!apiKey) {
      console.error('❌ FEDAPAY_API_KEY non définie')
      return NextResponse.json({ error: 'Configuration de paiement manquante' }, { status: 500 })
    }

    // ✅ Récupère les infos client nécessaires à FedaPay
    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name, phone, email')
      .eq('id', user.id)
      .maybeSingle()

    const customer: Record<string, any> = {
      firstname: profile?.first_name || 'Client',
      lastname: profile?.last_name || 'Eventvivo',
      email: profile?.email || user.email,
    }

    if (profile?.phone) {
      customer.phone_number = {
        number: profile.phone.replace(/[\s.\-()]/g, ''),
        country: 'bj',
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      // ── Étape 1 : créer la transaction ──────────────────────────────
      const createBody = {
        description: `Paiement ${plan_type || 'standard'} - ${event_id || 'nouvel_utilisateur'}`,
        amount: Math.round(finalAmount),
        currency: { iso: currency }, // ⚠️ FedaPay attend un objet, pas une string
        callback_url: 'https://eventvivo.com/fr/dashboard', // redirection du NAVIGATEUR après paiement
        customer,
      }

      const createResponse = await fetch('https://api.fedapay.com/v1/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const createText = await createResponse.text()

      let createData
      try {
        createData = JSON.parse(createText)
      } catch {
        console.error('❌ Réponse non-JSON (création):', createText)
        return NextResponse.json(
          { error: 'FedaPay a renvoyé une réponse invalide lors de la création de la transaction' },
          { status: 502 }
        )
      }

      if (!createResponse.ok) {
        console.error('❌ Erreur FedaPay (création):', createData)
        return NextResponse.json(
          { error: createData.message || createData.error || 'Erreur FedaPay' },
          { status: createResponse.status }
        )
      }

      const transaction = createData['v1/transaction'] ?? createData.transaction
      const transactionId = transaction?.id
      const paymentUrl = transaction?.payment_url

      if (!transactionId || !paymentUrl) {
        console.error('❌ Réponse FedaPay inattendue (id ou payment_url manquant):', createData)
        return NextResponse.json({ error: 'Réponse FedaPay inattendue' }, { status: 502 })
      }

      // Sauvegarder la transaction en base — client admin (service_role) :
      // user.id/amount/finalAmount sont déjà vérifiés/calculés côté serveur
      // ci-dessus, donc contourner RLS ici est sûr. Le client de session n'a
      // pas de droit d'écriture directe sur `payments` (voir permissions
      // côté Supabase) ; sans ce client admin, l'insert échouerait et le
      // webhook ne retrouverait jamais la transaction à la confirmation.
      const { error: insertError } = await adminSupabase
        .from('payments')
        .insert({
          event_id: event_id === 'pending' ? null : event_id,
          user_id: user.id,
          amount: amount,
          currency: currency,
          final_amount: finalAmount,
          payment_method: payment_method,
          provider: 'fedaPay',
          transaction_id: transactionId,
          status: 'pending',
          promo_code: finalPromoCode,
          ambassador_id: finalAmbassadorId,
          plan_type: plan_type,
          provider_response: createData,
        })

      if (insertError) {
        // ⚠️ Ne jamais renvoyer success:true ici : sans ligne `payments`, le
        // webhook ne retrouvera jamais cette transaction à la confirmation
        // et le client aura payé sans que son plan soit jamais activé.
        console.error('❌ Erreur insertion paiement:', insertError)
        return NextResponse.json(
          { error: 'Impossible d\'enregistrer le paiement, veuillez réessayer.' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        transaction_id: transactionId,
        payment_url: paymentUrl,
      })

    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Le paiement a pris trop de temps, veuillez réessayer' },
          { status: 504 }
        )
      }
      console.error('❌ Erreur fetch:', fetchError)
      return NextResponse.json(
        { error: fetchError.message || 'Erreur de communication avec FedaPay' },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Erreur générale:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    )
  }
}
