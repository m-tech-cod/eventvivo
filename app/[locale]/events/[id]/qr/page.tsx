'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, CheckCircle2, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, StaggeredContainer, staggerItem } from '@/components/ui/animations'

const STYLE_BACKGROUNDS: Record<string, string> = {
  classique: '/images/styles/classique.jpg',
  moderne: '/images/styles/moderne.jpg',
  nature: '/images/styles/nature.jpg',
  elegant: '/images/styles/elegant.jpg',
  luxe: '/images/styles/luxe.jpg',
}

function getEventBackground(event: any) {
  return event?.cover_image || STYLE_BACKGROUNDS[event?.style] || '/images/foule.webp'
}

function buildQrUrl(slug: string, invitationId: string) {
  const qrData = `${window.location.origin}/fr/rsvp/scan/${slug}/${invitationId}`
  const encodedData = encodeURIComponent(qrData)
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedData}&bgcolor=FFFFFF&color=1E3A8A&margin=10`
}

export default function GuestQRDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const eventId = params.id as string

  const [event, setEvent] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    setEvent(eventData)

    if (eventData) {
      const { data: invitations } = await supabase
        .from('invitations')
        .select('id, recipient_name, recipient_phone, qr_code_token, scanned_at, rsvps(status, number_of_guests, responded_at)')
        .eq('event_id', eventId)

      const confirmed = (invitations || [])
        .filter((inv: any) => inv.rsvps?.[0]?.status === 'attending')
        .map((inv: any) => ({
          id: inv.id,
          name: inv.recipient_name,
          phone: inv.recipient_phone,
          numberOfGuests: inv.rsvps?.[0]?.number_of_guests ?? 0,
          respondedAt: inv.rsvps?.[0]?.responded_at,
          scannedAt: inv.scanned_at,
          qrUrl: inv.qr_code_token ? buildQrUrl(eventData.slug, inv.id) : null,
        }))
        .sort((a: any, b: any) => new Date(b.respondedAt).getTime() - new Date(a.respondedAt).getTime())

      setGuests(confirmed)
    }

    setLoading(false)
  }, [eventId, supabase])

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel(`guests-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rsvps' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitations' }, fetchData)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, fetchData, supabase])

  const downloadQRCode = async (qrUrl: string, guestName: string) => {
    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `qrcode-${guestName.replace(/\s+/g, '-').toLowerCase()}.png`
      link.href = url
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur téléchargement QR:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.4} animate="zoom">
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl max-w-md">
            <CardContent className="text-center py-12">
              <div className="text-5xl mb-4">😕</div>
              <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">Événement non trouvé</h2>
              <Button className="mt-4 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" onClick={() => router.push('/fr/dashboard')}>
                Retour au dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </BackgroundImage>
    )
  }

  return (
    <BackgroundImage src={getEventBackground(event)} overlayOpacity={0.35} animate="zoom" className="min-h-screen py-10">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="container mx-auto max-w-5xl">
          <AnimatedSection>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white font-poppins drop-shadow-lg mb-2">
                Invités confirmés{event.is_qr_active ? ' & QR Codes' : ''}
              </h1>
              <p className="text-white/80 drop-shadow">{event.name}</p>
              <div className="flex justify-center gap-4 mt-4 text-white/90 drop-shadow text-sm">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> {guests.length} confirmé{guests.length > 1 ? 's' : ''}
                </span>
                {event.is_qr_active && (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {guests.filter(g => g.scannedAt).length} déjà entré{guests.filter(g => g.scannedAt).length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </AnimatedSection>

          {!event.is_qr_active && (
            <AnimatedSection>
              <div className="mb-6 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 text-sm">
                <span className="text-gray-600">
                  💡 Le contrôle d'accès par QR Code individuel n'est pas activé sur ce plan.
                </span>
                <Link href={`/fr/events/choose-plan?upgrade=${event.id}`}>
                  <Button size="sm" className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] shrink-0">
                    Passer à Prestige
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          )}

          {guests.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Aucun invité n'a encore confirmé sa présence.</p>
                <p className="text-gray-400 text-sm mt-1">Cette page se met à jour automatiquement dès qu'une réponse arrive.</p>
              </CardContent>
            </Card>
          ) : (
            <StaggeredContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {guests.map((guest) => (
                <motion.div key={guest.id} variants={staggerItem}>
                  <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-[#1E3A8A]">{guest.name}</CardTitle>
                      <CardDescription>
                        {guest.numberOfGuests > 0
                          ? `+${guest.numberOfGuests} accompagnateur${guest.numberOfGuests > 1 ? 's' : ''}`
                          : 'Seul(e)'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs text-gray-400">
                        Répondu le {new Date(guest.respondedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>

                      {event.is_qr_active && (
                        <>
                          <div className="flex justify-center">
                            {guest.qrUrl ? (
                              <img src={guest.qrUrl} alt={`QR de ${guest.name}`} className="w-32 h-32" />
                            ) : (
                              <div className="w-32 h-32 flex items-center justify-center text-xs text-gray-400 border rounded">
                                QR non généré
                              </div>
                            )}
                          </div>

                          {guest.scannedAt ? (
                            <div className="flex items-center gap-2 justify-center text-xs text-green-700 bg-green-50 rounded-full py-1.5 px-3">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Entré à {new Date(guest.scannedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 justify-center text-xs text-gray-500 bg-gray-50 rounded-full py-1.5 px-3">
                              <Clock className="w-3.5 h-3.5" />
                              Pas encore scanné
                            </div>
                          )}

                          {guest.qrUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-[#1E3A8A] border-[#1E3A8A]/30"
                              onClick={() => downloadQRCode(guest.qrUrl!, guest.name)}
                            >
                              <Download className="w-3.5 h-3.5 mr-1.5" />
                              Télécharger
                            </Button>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </StaggeredContainer>
          )}

          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => router.push('/fr/dashboard')}
            >
              Retour au dashboard
            </Button>
          </div>
        </div>
      </div>
    </BackgroundImage>
  )
}
