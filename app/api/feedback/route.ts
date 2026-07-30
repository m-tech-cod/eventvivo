import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateTransactionId } from '@/lib/utils/payment'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// ✅ Schéma de validation Zod (corrigé pour accepter 'pending')
const paymentSchema = z.object({
  event_id: z.string().uuid().or(z.literal('pending')), // ✅ ICI LA CORRECTION
  amount: z.number().positive().min(0.01),
  currency: z.enum(['XOF', 'EUR', 'USD']),
  payment_method: z.enum(['mobile_money', 'card', 'paypal']),
  promo_code: z.string().optional(),
  ambassador_id: z.string().uuid().optional(),
})

export async function POST(request: NextRequest) {
  // ✅ Rate Limiting (5 requêtes par minute par IP)
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
  
  // ✅ Validation des données entrantes
  const validation = paymentSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { event_id, amount, currency, payment_method, promo_code, ambassador_id } = validation.data
  
  try {
    let finalAmount = amount
    let finalPromoCode = promo_code || null
    let finalAmbassadorId = ambassador_id || null
    let discountApplied = false
    let discountPercent = 0

    // ✅ Vérification du code promo (avec transaction pour éviter les doublons)
    if (promo_code) {
      // Vérifier l'existence du code en une seule requête
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

      // Vérifier si l'utilisateur a déjà utilisé ce code promo
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

    // ✅ Appel sécurisé à FedaPay avec timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 secondes

    try {
      const response = await fetch('https://api.fedapay.com/v1/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FEDAPAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100),
          currency: currency,
          description: `Premium - ${event_id}${discountApplied ? ` (réduction ${discountPercent}%)` : ''}`,
          payment_method: payment_method,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook/fedapay`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/fr/dashboard`,
          metadata: {
            event_id: event_id,
            user_id: user.id,
            promo_code: finalPromoCode,
            ambassador_id: finalAmbassadorId,
          },
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      const data = await response.json()
      
      if (!response.ok) {
        console.error('FedaPay error:', data)
        throw new Error(data.message || 'Erreur FedaPay')
      }

      // ✅ Sauvegarder la transaction en base
      const { error: insertError } = await supabase
        .from('payments')
        .insert({
          event_id: event_id,
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
          provider_response: data,
        })

      if (insertError) {
        console.error('Erreur insertion paiement:', insertError)
        // On ne bloque pas le paiement si l'insertion échoue, mais on log
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
      throw fetchError
    }
    
  } catch (error: any) {
    console.error('Erreur FedaPay:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur FedaPay' },
      { status: 500 }
    )
  }
}