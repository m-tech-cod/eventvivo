import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { paymentSchema } from '@/lib/validations/payment'

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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  console.error('📦 Payload reçu:', JSON.stringify(body, null, 2))

  // ✅ Validation (schéma partagé avec le reste de l'app)
  const validation = paymentSchema.safeParse(body)
  if (!validation.success) {
    console.error('❌ Erreur validation:', validation.error.issues)
    return NextResponse.json(
      { error: 'Données invalides', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { event_id, amount, currency, payment_method, promo_code, ambassador_id, plan_type } = validation.data

  try {
    let finalAmount = amount
    let finalPromoCode = promo_code || null
    let finalAmbassadorId = ambassador_id || null

    // ✅ Code promo
    if (promo_code) {
      const { data: ambassador, error: ambassadorError } = await supabase
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

      console.error('📦 Requête FedaPay (création):', JSON.stringify(createBody, null, 2))

      const createResponse = await fetch('https://api.fedapay.com/v1/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createBody),
        signal: controller.signal,
      })

      const createText = await createResponse.text()
      console.error('📦 Réponse brute FedaPay (création):', createText)

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

      const transactionId = createData.transaction?.id ?? createData.id
      if (!transactionId) {
        console.error('❌ Pas d\'ID de transaction dans la réponse FedaPay:', createData)
        return NextResponse.json({ error: 'Réponse FedaPay inattendue' }, { status: 502 })
      }

      // ── Étape 2 : générer le lien de paiement (token) ───────────────
      const tokenResponse = await fetch(`https://api.fedapay.com/v1/transactions/${transactionId}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const tokenText = await tokenResponse.text()
      console.error('📦 Réponse brute FedaPay (token):', tokenText)

      let tokenData
      try {
        tokenData = JSON.parse(tokenText)
      } catch {
        console.error('❌ Réponse non-JSON (token):', tokenText)
        return NextResponse.json(
          { error: 'FedaPay a renvoyé une réponse invalide lors de la génération du lien de paiement' },
          { status: 502 }
        )
      }

      if (!tokenResponse.ok) {
        console.error('❌ Erreur FedaPay (token):', tokenData)
        return NextResponse.json(
          { error: tokenData.message || tokenData.error || 'Erreur FedaPay (génération du lien)' },
          { status: tokenResponse.status }
        )
      }

      const paymentUrl = tokenData.url || tokenData.token_url
      if (!paymentUrl) {
        console.error('❌ Pas d\'URL de paiement dans la réponse FedaPay:', tokenData)
        return NextResponse.json({ error: 'Lien de paiement introuvable dans la réponse FedaPay' }, { status: 502 })
      }

      // ✅ Sauvegarder la transaction en base
      const { error: insertError } = await supabase
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
          plan_type: plan_type || 'standard',
          provider_response: createData,
        })

      if (insertError) {
        console.error('❌ Erreur insertion paiement:', insertError)
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
