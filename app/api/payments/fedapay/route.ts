import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// ✅ Schéma de validation Zod
const paymentSchema = z.object({
  event_id: z.string().optional(),
  amount: z.number().positive().min(0.01),
  currency: z.string(),
  payment_method: z.string(),
  promo_code: z.string().optional().nullable(),
  ambassador_id: z.string().optional().nullable(),
  plan_type: z.string().optional(),
})

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

  // ✅ Validation
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
    let discountApplied = false
    let discountPercent = 0

    // ✅ Code promo
    if (promo_code) {
      const { data: ambassador, error: ambassadorError } = await supabase
        .from('ambassadors')
        .select('id, commission_rate, expires_at, status')
        .eq('promo_code', promo_code.toUpperCase())
        .eq('status', 'active')
        .single()

      if (ambassadorError || !ambassador) {
        return NextResponse.json(
          { error: 'Code promo invalide' },
          { status: 400 }
        )
      }

      if (ambassador.expires_at && new Date() > new Date(ambassador.expires_at)) {
        return NextResponse.json(
          { error: 'Ce code promo a expiré' },
          { status: 400 }
        )
      }

      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('promo_code', promo_code.toUpperCase())
        .eq('status', 'completed')
        .maybeSingle()

      if (existingPayment) {
        return NextResponse.json(
          { error: 'Vous avez déjà utilisé ce code promo' },
          { status: 400 }
        )
      }

      const rate = ambassador.commission_rate || 10
      discountPercent = rate
      discountApplied = true
      finalAmount = amount * (1 - (rate / 100))
      finalAmount = Math.round(finalAmount * 100) / 100
      finalPromoCode = promo_code.toUpperCase()
      finalAmbassadorId = ambassador.id
    }

    if (finalAmount <= 0) {
      return NextResponse.json(
        { error: 'Montant invalide' },
        { status: 400 }
      )
    }

    // ✅ Appel à FedaPay
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      // ✅ Vérifier la clé API
      const apiKey = process.env.FEDAPAY_API_KEY
      if (!apiKey) {
        console.error('❌ FEDAPAY_API_KEY non définie')
        throw new Error('Configuration de paiement manquante')
      }

      // ✅ Utiliser une URL de callback valide
      const callbackUrl = process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/fedapay`
        : 'https://eventvivo.com/api/payments/webhook/fedapay'

      const requestBody = {
        amount: Math.round(finalAmount * 100),
        currency: currency,
        description: `Paiement ${plan_type || 'standard'} - ${event_id || 'nouvel_utilisateur'}`,
        payment_method: payment_method,
        callback_url: 'https://eventvivo.com/api/payments/webhook/fedapay',
        return_url: 'https://eventvivo.com/fr/dashboard',
        metadata: {
          event_id: event_id || 'pending',
          user_id: user.id,
          promo_code: finalPromoCode,
          ambassador_id: finalAmbassadorId,
          plan_type: plan_type || 'standard',
        },
      }
      console.error('📦 Requête FedaPay:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('https://api.fedapay.com/v1/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // ✅ Lire la réponse
      const responseText = await response.text()
      console.error('📦 Réponse brute de FedaPay:', responseText)

      // ✅ Parser la réponse
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ Réponse non-JSON:', responseText)
        return NextResponse.json(
          { error: `FedaPay a renvoyé une erreur: ${responseText}` },
          { status: 500 }
        )
      }

      if (!response.ok) {
        console.error('❌ Erreur FedaPay:', data)
        return NextResponse.json(
          { error: data.message || data.error || 'Erreur FedaPay' },
          { status: response.status }
        )
      }

      // ✅ Sauvegarder la transaction
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
          transaction_id: data.transaction.id,
          status: 'pending',
          promo_code: finalPromoCode,
          ambassador_id: finalAmbassadorId,
          plan_type: plan_type || 'standard',
          provider_response: data,
        })

      if (insertError) {
        console.error('❌ Erreur insertion paiement:', insertError)
      }

      return NextResponse.json({
        success: true,
        transaction_id: data.transaction.id,
        payment_url: data.transaction.payment_url,
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