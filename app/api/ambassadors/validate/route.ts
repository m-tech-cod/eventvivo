// app/api/ambassadors/validate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-log'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const validateSchema = z.object({
  promo_code: z.string().min(1).max(20),
})

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await rateLimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { valid: false, error: 'Trop de tentatives, réessaye dans 1 minute' },
      { status: 429 }
    )
  }

  const supabase = await createServerClient() // identifie l'utilisateur courant (respecte sa session)
  const adminSupabase = createAdminClient() // lit `ambassadors` (réservé aux admins par RLS, un client normal serait bloqué)

  const body = await request.json()
  const validation = validateSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({ valid: false, error: 'Code promo invalide' }, { status: 400 })
  }

  const { promo_code } = validation.data

  try {
    // 1. Récupérer l'ambassadeur correspondant au code saisi
    const { data: ambassador, error } = await adminSupabase
      .from('ambassadors')
      .select('id, first_name, commission_rate, expires_at, status')
      .eq('promo_code', promo_code.toUpperCase())
      .eq('status', 'active')
      .single()

    if (error || !ambassador) {
      await logSecurityEvent({
        event_type: 'invalid_promo_code',
        ip_address: ip,
        details: { promo_code: promo_code.toUpperCase() },
      })
      return NextResponse.json({ valid: false, error: 'Code promo invalide' }, { status: 404 })
    }

    // 2. Vérifier l'expiration
    if (ambassador.expires_at && new Date() > new Date(ambassador.expires_at)) {
      await logSecurityEvent({
        event_type: 'expired_promo_code',
        ip_address: ip,
        details: { promo_code: promo_code.toUpperCase() },
      })
      return NextResponse.json({ valid: false, error: 'Ce code promo a expiré' }, { status: 400 })
    }

    // 3. Vérifier si l'utilisateur a déjà un parrain enregistré (parrainage
    // permanent, indépendant du code promo saisi). Si oui : la réduction ne
    // s'applique plus, mais l'ambassadeur d'origine touche quand même sa
    // commission sur cet achat.
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('referred_by_ambassador_id')
        .eq('id', user.id)
        .single()

      if (profile?.referred_by_ambassador_id) {
        // Déjà parrainé — pas de nouvelle réduction, mais on garde
        // l'ambassadeur d'ORIGINE (pas forcément celui du code tapé ici,
        // si l'utilisateur essaie un autre code par la suite).
        const { data: lockedAmbassador } = await adminSupabase
          .from('ambassadors')
          .select('id, first_name')
          .eq('id', profile.referred_by_ambassador_id)
          .single()

        return NextResponse.json({
          valid: true,
          discount_percent: 0,
          ambassador_id: profile.referred_by_ambassador_id,
          already_referred: true,
          message: lockedAmbassador
            ? `Vous bénéficiez déjà du parrainage de ${lockedAmbassador.first_name}. La réduction ne s'applique qu'une seule fois, mais votre achat compte quand même pour votre parrain.`
            : 'Vous avez déjà utilisé votre réduction de parrainage. Cet achat ne bénéficie plus de réduction.',
        })
      }
    }

    // 4. Première utilisation : réduction + commission appliquées, le
    // verrouillage définitif de l'ambassadeur se fait à la confirmation du
    // paiement (webhook), pas ici — on ne fait ici que valider.
    await logSecurityEvent({
      event_type: 'valid_promo_code',
      user_id: user?.id,
      ip_address: ip,
      details: { promo_code: promo_code.toUpperCase(), ambassador_id: ambassador.id },
    })

    return NextResponse.json({
      valid: true,
      discount_percent: ambassador.commission_rate || 10,
      ambassador_id: ambassador.id,
      already_referred: false,
    })

  } catch (error) {
    console.error('Erreur validation promo:', error)
    return NextResponse.json({ valid: false, error: 'Erreur interne' }, { status: 500 })
  }
}
