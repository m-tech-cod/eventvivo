// app/api/ambassadors/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-log'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// ✅ Schéma de validation POST
const createAmbassadorSchema = z.object({
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  promo_code: z.string().min(3).max(20),
  commission_rate: z.number().min(0).max(100).default(10),
  expires_at: z.string().optional(),
})

// GET : Récupérer tous les ambassadeurs (admin uniquement)
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  // ✅ Vérifier si l'utilisateur est admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    await logSecurityEvent({
      event_type: 'unauthorized_ambassador_access',
      user_id: user.id,
      details: { attempt: 'GET /api/ambassadors' },
    })
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('ambassadors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

// POST : Créer un ambassadeur (admin uniquement)
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  
  // ✅ Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await rateLimit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives, réessaye dans 1 minute' },
      { status: 429 }
    )
  }

  // ✅ Vérifier si l'utilisateur est admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    await logSecurityEvent({
      event_type: 'unauthorized_ambassador_create',
      user_id: user.id,
      ip_address: ip,
      details: { attempt: 'POST /api/ambassadors' },
    })
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  // ✅ Validation des données
  const body = await request.json()
  const validation = createAmbassadorSchema.safeParse(body)
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { 
    first_name, 
    last_name, 
    email, 
    phone, 
    promo_code, 
    commission_rate,
    expires_at,
  } = validation.data

  try {
    // ✅ Vérifier que le code promo est unique
    const { data: existing } = await supabase
      .from('ambassadors')
      .select('id')
      .eq('promo_code', promo_code.toUpperCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Ce code promo est déjà utilisé' },
        { status: 400 }
      )
    }

    // ✅ Insérer
    const { data, error } = await supabase
      .from('ambassadors')
      .insert({
        first_name,
        last_name,
        email,
        phone,
        promo_code: promo_code.toUpperCase(),
        commission_rate: commission_rate || 10,
        expires_at: expires_at || null,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // ✅ Log de création
    await logSecurityEvent({
      event_type: 'ambassador_created',
      user_id: user.id,
      ip_address: ip,
      details: { 
        ambassador_id: data.id,
        promo_code: data.promo_code,
      },
    })

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Erreur création ambassadeur:', error)
    return NextResponse.json(
      { error: 'Erreur interne' },
      { status: 500 }
    )
  }
}