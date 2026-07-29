import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; invitationId: string } }
) {
  const supabase = await createServerClient()

  // 1. Vérifier l'authentification de l'organisateur
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié. Veuillez vous connecter.' },
      { status: 401 }
    )
  }

  const { slug, invitationId } = params

  try {
    // 2. Récupérer l'événement pour vérifier que l'utilisateur est l'organisateur
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, organizer_id')
      .eq('slug', slug)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Événement non trouvé' },
        { status: 404 }
      )
    }

    // 3. Vérifier que l'utilisateur est l'organisateur
    if (event.organizer_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Seul l\'organisateur peut scanner.' },
        { status: 403 }
      )
    }

    // 4. Récupérer l'invitation avec les RSVP
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select(`
        id,
        recipient_name,
        recipient_email,
        status,
        viewed_at,
        responded_at,
        rsvps (
          id,
          status,
          number_of_guests,
          responded_at
        )
      `)
      .eq('id', invitationId)
      .eq('event_id', event.id)
      .maybeSingle()

    if (invError || !invitation) {
      return NextResponse.json(
        { error: 'Invitation introuvable' },
        { status: 404 }
      )
    }

    // 5. Extraire les données du RSVP
    const rsvp = invitation.rsvps?.[0] || null
    const rsvpStatus = rsvp?.status || 'pending'
    const numberOfGuests = rsvp?.number_of_guests || 0

    // 6. Vérifier le statut du scan
    const isScanned = invitation.status === 'scanned'
    const scannedAt = invitation.viewed_at

    // 7. Si ce n'est pas déjà scanné, marquer comme scanné
    if (!isScanned && rsvpStatus === 'attending') {
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'scanned',
          viewed_at: new Date().toISOString(),
        })
        .eq('id', invitationId)

      if (updateError) {
        console.error('Erreur mise à jour scan:', updateError)
      }
    }

    // 8. Déterminer le statut final
    let scanStatus: 'valid' | 'already_scanned' | 'not_confirmed' | 'invalid'

    if (rsvpStatus !== 'attending') {
      scanStatus = 'not_confirmed'
    } else if (isScanned) {
      scanStatus = 'already_scanned'
    } else {
      scanStatus = 'valid'
    }

    // 9. Retourner la réponse
    return NextResponse.json({
      success: true,
      data: {
        eventName: event.id,
        recipientName: invitation.recipient_name || 'Invité',
        numberOfGuests: numberOfGuests,
        status: scanStatus,
        scannedAt: scannedAt,
        rsvpStatus: rsvpStatus,
      },
    })

  } catch (error) {
    console.error('Erreur scan:', error)
    return NextResponse.json(
      { error: 'Erreur lors du scan' },
      { status: 500 }
    )
  }
}