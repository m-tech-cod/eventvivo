// app/[locale]/scan/[slug]/[invitationId]/page.tsx
//
// Scanné par le personnel de l'événement à l'entrée, sans authentification —
// juste le lien du QR code, dont l'UUID imprévisible fait office de jeton
// d'accès. RLS ne peut pas exprimer "seulement cette ligne précise" (elle ne
// voit que le rôle appelant, pas les filtres de la requête), donc la
// restriction réelle vient des filtres exacts ci-dessous (slug, id,
// event_id), appliqués via le client admin plutôt que RLS.
import { createAdminClient } from '@/lib/supabase/admin'
import { ScanResult } from '@/components/rsvp/ScanResult'

type Params = { params: Promise<{ slug: string; invitationId: string }> }

export default async function ScanPage({ params }: Params) {
  const { slug, invitationId } = await params
  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!event) {
    return (
      <ScanResult
        data={{
          recipientName: '',
          numberOfGuests: 0,
          status: 'invalid',
        }}
      />
    )
  }

  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, rsvps(*)')
    .eq('id', invitationId)
    .eq('event_id', event.id)
    .single()

  if (!invitation) {
    return (
      <ScanResult
        data={{
          recipientName: '',
          numberOfGuests: 0,
          status: 'invalid',
        }}
      />
    )
  }

  const rsvp = invitation.rsvps?.[0]
  const rsvpStatus = rsvp?.status || 'pending'
  const numberOfGuests = rsvp?.number_of_guests ?? 0
  const recipientName = invitation.recipient_name || 'Invité'

  if (rsvpStatus !== 'attending') {
    return (
      <ScanResult
        data={{
          recipientName,
          numberOfGuests,
          status: 'not_confirmed',
          rsvpStatus,
        }}
      />
    )
  }

  if (invitation.scanned_at) {
    return (
      <ScanResult
        data={{
          recipientName,
          numberOfGuests,
          status: 'already_scanned',
          scannedAt: invitation.scanned_at,
          rsvpStatus,
        }}
      />
    )
  }

  // Premier scan valide : on marque l'entrée
  await supabase
    .from('invitations')
    .update({ scanned_at: new Date().toISOString() })
    .eq('id', invitationId)

  return (
    <ScanResult
      data={{
        recipientName,
        numberOfGuests,
        status: 'valid',
        rsvpStatus,
      }}
    />
  )
}
