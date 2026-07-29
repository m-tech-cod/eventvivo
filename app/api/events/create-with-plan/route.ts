import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { generateTransactionId } from '@/lib/utils/payment'

export const dynamic = 'force-dynamic'

const PLANS = {
  free: { maxGuests: 10, priceFcfa: 0, priceEur: 0 },
  standard: { maxGuests: 100, priceFcfa: 2000, priceEur: 4.99 },
  prestige: { maxGuests: 500, priceFcfa: 5000, priceEur: 9.99 },
  vip: { maxGuests: null, priceFcfa: 10000, priceEur: 16.99 }, // null = illimité
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const { planType, eventData } = body

  if (!planType || !PLANS[planType as keyof typeof PLANS]) {
    return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
  }

  const plan = PLANS[planType as keyof typeof PLANS]

  // Vérifier si l'utilisateur a déjà un événement
  const { data: existingEvent } = await supabase
    .from('events')
    .select('id')
    .eq('organizer_id', user.id)
    .single()

  if (existingEvent) {
    return NextResponse.json(
      { error: 'Vous avez déjà créé un événement. Un seul événement est autorisé dans cette version.' },
      { status: 400 }
    )
  }

  try {
    // Créer le slug
    const slug = eventData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Si le plan est gratuit → créer l'événement directement
    if (planType === 'free') {
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
          is_qr_active: false,
          plan_type: 'free',
          max_guests: plan.maxGuests,
          plan_price_fcfa: plan.priceFcfa,
          plan_price_eur: plan.priceEur,
          payment_status: 'paid',
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        eventId: event.id,
        isFree: true,
      })
    }

    // Pour les plans payants → créer un événement en "pending" + rediriger vers FedaPay
    const transactionId = generateTransactionId()

    // Créer un événement en attente de paiement
    const { data: pendingEvent, error: eventError } = await supabase
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
        is_qr_active: planType === 'prestige' || planType === 'vip',
        plan_type: planType,
        max_guests: plan.maxGuests,
        plan_price_fcfa: plan.priceFcfa,
        plan_price_eur: plan.priceEur,
        payment_status: 'pending',
        status: 'archived', // Caché tant que le paiement n'est pas confirmé
      })
      .select()
      .single()

    if (eventError) throw eventError

    // Sauvegarder la transaction en base
    await supabase
      .from('payments')
      .insert({
        event_id: pendingEvent.id,
        user_id: user.id,
        amount: plan.priceFcfa,
        currency: 'XOF',
        final_amount: plan.priceFcfa,
        payment_method: 'mobile_money', // À adapter selon le choix
        provider: 'fedaPay',
        transaction_id: transactionId,
        status: 'pending',
        provider_response: { transactionId },
      })

    // Appeler FedaPay pour créer la transaction (à implémenter)
    // Pour l'instant, on retourne l'ID de l'événement

    return NextResponse.json({
      success: true,
      eventId: pendingEvent.id,
      transactionId: transactionId,
      isFree: false,
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}