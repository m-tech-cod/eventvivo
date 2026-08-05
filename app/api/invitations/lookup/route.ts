// app/api/invitations/lookup/route.ts
//
// Retrouve l'invitation + le RSVP d'un invité par (event_id, téléphone),
// pour l'invité anonyme qui revient sur le lien public afficher/vérifier sa
// réponse déjà envoyée. Remplace un accès direct depuis le navigateur à
// `invitations`/`rsvps` — celui-ci aurait dû s'appuyer sur des policies RLS
// "publiques" scoping uniquement par événement actif, qui exposaient en
// réalité TOUTES les invitations (noms, téléphones) de tous les événements
// actifs à n'importe quel visiteur, pas seulement l'invitation recherchée.
// Ici, le client admin ne renvoie jamais que la ligne exacte correspondant
// au téléphone fourni, et aucune donnée d'un autre invité.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const lookupSchema = z.object({
  event_id: z.string().uuid(),
  phone: z.string().min(4).max(30),
})

function normalizePhone(phone: string) {
  return phone.replace(/[\s.\-()]/g, '')
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await rateLimit.limit(ip, 'invitation_lookup:ip')
  if (!success) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const parsed = lookupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const { event_id, phone } = parsed.data
  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('id')
    .eq('id', event_id)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle()

  if (!event) {
    return NextResponse.json({ found: false })
  }

  const { data: invitation } = await supabase
    .from('invitations')
    .select('id, qr_code_token, rsvps(status, number_of_guests)')
    .eq('event_id', event_id)
    .eq('recipient_phone', normalizePhone(phone))
    .maybeSingle()

  const rsvp = Array.isArray(invitation?.rsvps) ? invitation.rsvps[0] : null

  if (!invitation || !rsvp) {
    return NextResponse.json({ found: false })
  }

  return NextResponse.json({
    found: true,
    invitation_id: invitation.id,
    qr_code_token: invitation.qr_code_token,
    rsvp: { status: rsvp.status, number_of_guests: rsvp.number_of_guests },
  })
}
