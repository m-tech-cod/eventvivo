import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getPlanMaxGuests, getPriceForCurrency } from '@/lib/utils/currency'

export const dynamic = 'force-dynamic'

const VALID_PLANS = ['free', 'standard', 'prestige', 'vip']

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const { planType, eventData } = body

  if (!planType || !VALID_PLANS.includes(planType)) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  if (!eventData?.name || !eventData?.date || !eventData?.type) {
    return NextResponse.json({ error: 'Informations d\'événement incomplètes' }, { status: 400 })
  }

  // ✅ Règle métier : 1 seul événement Gratuit actif/à venir à la fois.
  // Les plans payants sont illimités (même règle que le trigger SQL et
  // que checkout/page.tsx).
  if (planType === 'free') {
    const today = new Date().toISOString().split('T')[0]

    const { data: existingFreeEvent } = await supabase
      .from('events')
      .select('id')
      .eq('organizer_id', user.id)
      .eq('plan_type', 'free')
      .eq('status', 'active')
      .gte('date', today)
      .maybeSingle()

    if (existingFreeEvent) {
      return NextResponse.json(
        { error: 'Vous avez déjà un événement gratuit actif ou à venir. Choisissez un forfait payant pour créer un nouvel événement dès maintenant.' },
        { status: 400 }
      )
    }
  }

  try {
    const baseSlug = eventData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Suffixe aléatoire pour garantir l'unicité du slug
    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`

    const isFree = planType === 'free'

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,
        name: eventData.name,
        type: eventData.type,
        date: eventData.date,
        time: eventData.time || null,
        location: eventData.location || null,
        description: eventData.description || null,
        slug: slug,
        cover_image: eventData.cover_image || null,
        style: eventData.style || 'classique',
        is_qr_active: isFree ? false : (planType === 'prestige' || planType === 'vip'),
        plan_type: isFree ? 'free' : planType,
        max_guests: isFree ? getPlanMaxGuests('free') : null, // fixé après paiement pour les plans payants
        plan_price_fcfa: isFree ? 0 : getPriceForCurrency('XOF', planType),
        plan_price_eur: isFree ? 0 : getPriceForCurrency('EUR', planType),
        is_premium: false, // activé par le webhook après paiement confirmé, pour les plans payants
        payment_status: isFree ? 'paid' : 'pending',
        status: isFree ? 'active' : 'archived',
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erreur création événement:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      eventId: event.id,
      isFree,
    })
  } catch (error: any) {
    console.error('❌ Erreur create-with-plan:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}
