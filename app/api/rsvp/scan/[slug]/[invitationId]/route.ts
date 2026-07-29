// app/api/rsvp/scan/[slug]/[invitationId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; invitationId: string }> }
) {
  const { slug, invitationId } = await params

  const supabase = await createServerClient()

  // Récupérer l'événement
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  if (eventError || !event) {
    return NextResponse.json(
      { error: 'Événement non trouvé' },
      { status: 404 }
    )
  }

  // Récupérer l'invitation
  const { data: invitation, error: invError } = await supabase
    .from('invitations')
    .select('*, rsvps(*)')
    .eq('id', invitationId)
    .single()

  if (invError || !invitation) {
    return NextResponse.json(
      { error: 'Invitation non trouvée' },
      { status: 404 }
    )
  }

  // Vérifier si le QR Code a déjà été scanné
  if (invitation.scanned_at) {
    return NextResponse.json({
      success: true,
      data: {
        eventName: event.name,
        recipientName: invitation.recipient_name || 'Invité',
        isScanned: true,
        scannedAt: invitation.scanned_at,
        rsvpStatus: invitation.rsvps?.[0]?.status || 'pending',
      },
    })
  }

  // Marquer comme scanné
  await supabase
    .from('invitations')
    .update({ scanned_at: new Date().toISOString() })
    .eq('id', invitationId)

  return NextResponse.json({
    success: true,
    data: {
      eventName: event.name,
      recipientName: invitation.recipient_name || 'Invité',
      isScanned: false,
      rsvpStatus: invitation.rsvps?.[0]?.status || 'pending',
    },
  })
}