// app/api/ambassadors/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-log'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// ✅ Schéma de validation
const validateSchema = z.object({
  promo_code: z.string().min(1).max(20),
})

export async function POST(request: NextRequest) {
  // ✅ Rate Limiting (5 requêtes par minute par IP)
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await rateLimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { valid: false, error: 'Trop de tentatives, réessaye dans 1 minute' },
      { status: 429 }
    )
  }

  const supabase = await createServerClient()
  
  // ✅ Validation des données
  const body = await request.json()
  const validation = validateSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { valid: false, error: 'Code promo invalide' },
      { status: 400 }
    )
  }

  const { promo_code } = validation.data

  try {
    // 1. Récupérer l'ambassadeur
    const { data: ambassador, error } = await supabase
      .from('ambassadors')
      .select('id, commission_rate, expires_at, status')
      .eq('promo_code', promo_code.toUpperCase())
      .eq('status', 'active')
      .single()

    if (error || !ambassador) {
      // ✅ Log de tentative échouée
      await logSecurityEvent({
        event_type: 'invalid_promo_code',
        ip_address: ip,
        details: { promo_code: promo_code.toUpperCase() },
      })
      
      return NextResponse.json(
        { valid: false, error: 'Code promo invalide' },
        { status: 404 }
      )
    }

    // 2. Vérifier l'expiration
    if (ambassador.expires_at && new Date() > new Date(ambassador.expires_at)) {
      await logSecurityEvent({
        event_type: 'expired_promo_code',
        ip_address: ip,
        details: { promo_code: promo_code.toUpperCase() },
      })
      
      return NextResponse.json(
        { valid: false, error: 'Ce code promo a expiré' },
        { status: 400 }
      )
    }

    // 3. Vérifier si l'utilisateur a déjà utilisé ce code
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('promo_code', promo_code.toUpperCase())
        .eq('status', 'completed')
        .maybeSingle()

      if (existingPayment) {
        return NextResponse.json(
          { valid: false, error: 'Vous avez déjà utilisé ce code promo' },
          { status: 400 }
        )
      }
    }

    // ✅ Log de succès
    await logSecurityEvent({
      event_type: 'valid_promo_code',
      user_id: user?.id,
      ip_address: ip,
      details: { 
        promo_code: promo_code.toUpperCase(),
        ambassador_id: ambassador.id,
      },
    })

    // 4. Tout est bon
    return NextResponse.json({
      valid: true,
      discount_percent: ambassador.commission_rate || 10,
      ambassador_id: ambassador.id,
    })

  } catch (error) {
    console.error('Erreur validation promo:', error)
    return NextResponse.json(
      { valid: false, error: 'Erreur interne' },
      { status: 500 }
    )
  }
}