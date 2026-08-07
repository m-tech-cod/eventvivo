// app/api/invitations/rsvp/route.ts
//
// Enregistre la réponse RSVP d'un invité anonyme (identifié par téléphone,
// pas de compte). Remplace l'écriture directe depuis le navigateur dans
// `invitations`/`rsvps` — celle-ci s'appuyait sur des policies RLS
// "publiques" (WITH CHECK true / scoping juste "événement actif") qui
// permettaient à n'importe quel visiteur de modifier le RSVP de n'importe
// quel autre invité, pas seulement le sien. Ici, la création/mise à jour
// est strictement bornée à l'invitation dont le téléphone correspond à
// celui fourni dans la requête — jamais une ligne arbitraire choisie par
// le client.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const rsvpSchema = z.object({
  event_id: z.string().uuid(),
  guest_name: z.string().trim().min(1).max(200),
  guest_phone: z.string().min(4).max(30),
  status: z.enum(['attending', 'declined']),
  guests: z.number().int().min(0).max(20),
})

function normalizePhone(phone: string) {
  return phone.replace(/[\s.\-()]/g, '')
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await rateLimit.limit(ip, 'invitation_rsvp:ip')
  if (!success) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const parsed = rsvpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const { event_id, guest_name, guest_phone, status, guests } = parsed.data
  const phone = normalizePhone(guest_phone)
  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('id, slug, is_qr_active, max_guests')
    .eq('id', event_id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle()

  if (!event) {
    return NextResponse.json({ error: 'event_not_found' }, { status: 404 })
  }

  // Un invité = une ligne `invitations` propre à lui (identifiée par
  // téléphone) — voir InvitationClient.tsx pour le contexte (comptage
  // correct, QR unique par personne).
  const { data: existingInvitation } = await supabase
    .from('invitations')
    .select('id')
    .eq('event_id', event_id)
    .eq('recipient_phone', phone)
    .maybeSingle()

  const existingInvitationId = existingInvitation?.id ?? null

  const { data: existingRsvp } = existingInvitationId
    ? await supabase.from('rsvps').select('id').eq('invitation_id', existingInvitationId).maybeSingle()
    : { data: null }

  const numberOfGuests = status === 'attending' ? guests : 0

  // Plafond du plan (events.max_guests ; null/0 = illimité) : compte le total
  // déjà confirmé (1 par invitation "attending" + ses accompagnateurs), en
  // excluant l'invitation courante pour ne pas se bloquer soi-même en cas de
  // simple modification de sa propre réponse. Fait AVANT la création de
  // l'invitation (voir plus bas) : si le quota est dépassé, aucune ligne
  // `invitations` n'est créée/marquée "responded" pour cet invité — sinon il
  // apparaîtrait comme "répondu" au dashboard sans RSVP réellement enregistrée.
  if (status === 'attending' && event.max_guests) {
    let quotaQuery = supabase
      .from('rsvps')
      .select('number_of_guests, invitations!inner(event_id)')
      .eq('invitations.event_id', event_id)
      .eq('status', 'attending')

    if (existingInvitationId) {
      quotaQuery = quotaQuery.neq('invitation_id', existingInvitationId)
    }

    const { data: attendingRsvps } = await quotaQuery

    const currentTotal = (attendingRsvps || []).reduce(
      (sum, r: any) => sum + 1 + (r.number_of_guests || 0),
      0
    )

    if (currentTotal + 1 + numberOfGuests > event.max_guests) {
      return NextResponse.json(
        { error: 'quota_exceeded', remaining: Math.max(0, event.max_guests - currentTotal - 1) },
        { status: 409 }
      )
    }
  }

  let invitationId: string

  if (existingInvitationId) {
    invitationId = existingInvitationId
  } else {
    const { data: newInvitation, error: invError } = await supabase
      .from('invitations')
      .insert({
        event_id,
        recipient_name: guest_name,
        recipient_phone: phone,
        unique_link: `inv-${event.slug}-${crypto.randomUUID()}`,
        status: 'responded',
      })
      .select('id')
      .single()

    if (invError || !newInvitation) {
      console.error('❌ Erreur création invitation:', invError)
      return NextResponse.json({ error: 'creation_failed' }, { status: 500 })
    }
    invitationId = newInvitation.id
  }

  if (existingRsvp) {
    await supabase
      .from('rsvps')
      .update({
        status,
        number_of_guests: numberOfGuests,
        responded_at: new Date().toISOString(),
      })
      .eq('id', existingRsvp.id)
  } else {
    await supabase
      .from('rsvps')
      .insert({
        invitation_id: invitationId,
        status,
        number_of_guests: numberOfGuests,
        responded_at: new Date().toISOString(),
      })
  }

  let qrToken: string | null = null

  if (status === 'attending' && event.is_qr_active) {
    qrToken = crypto.randomUUID()
    await supabase
      .from('invitations')
      .update({ status: 'responded', qr_code_token: qrToken })
      .eq('id', invitationId)
  } else {
    await supabase
      .from('invitations')
      .update({ status: 'responded' })
      .eq('id', invitationId)
  }

  return NextResponse.json({
    success: true,
    invitation_id: invitationId,
    qr_code_token: qrToken,
  })
}
