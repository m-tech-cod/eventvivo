'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'
import jsPDF from 'jspdf'

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

async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function imageFormatFromDataUrl(dataUrl: string): 'PNG' | 'JPEG' {
  return dataUrl.includes('image/png') ? 'PNG' : 'JPEG'
}

// Grilles disponibles pour l'impression (colonnes x lignes par page A4)
const LAYOUTS: Record<number, { cols: number; rows: number }> = {
  1: { cols: 1, rows: 1 },
  4: { cols: 2, rows: 2 },
  10: { cols: 2, rows: 5 },
}

export default function PDFPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const eventId = params.id as string

  const [event, setEvent] = useState<any>(null)
  const [guests, setGuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [cardsPerPage, setCardsPerPage] = useState<1 | 4 | 10>(4)

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      setEvent(eventData)

      if (eventData) {
        const { data: invitations } = await supabase
          .from('invitations')
          .select('id, recipient_name, qr_code_token, rsvps(status, number_of_guests)')
          .eq('event_id', eventId)

        const confirmed = (invitations || [])
          .filter((inv: any) => inv.rsvps?.[0]?.status === 'attending')
          .map((inv: any) => ({
            id: inv.id,
            name: inv.recipient_name,
            numberOfGuests: inv.rsvps?.[0]?.number_of_guests ?? 0,
            qrToken: inv.qr_code_token,
          }))

        setGuests(confirmed)
      }

      setLoading(false)
    }

    fetchData()
  }, [eventId, supabase])

  const generatePDF = async () => {
    if (!event || guests.length === 0) return

    setGenerating(true)

    try {
      const backgroundUrl = getEventBackground(event)
      const backgroundDataUrl = await urlToDataUrl(backgroundUrl).catch(() => null)

      const doc = new jsPDF({ unit: 'mm', format: 'a4' })
      const pageWidth = 210
      const pageHeight = 297
      const margin = 10
      const gap = 6

      const { cols, rows } = LAYOUTS[cardsPerPage]
      const cardWidth = (pageWidth - margin * 2 - gap * (cols - 1)) / cols
      const cardHeight = (pageHeight - margin * 2 - gap * (rows - 1)) / rows
      const imageHeight = cardHeight * 0.5

      const eventDateLabel = new Date(event.date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      for (let i = 0; i < guests.length; i++) {
        const guest = guests[i]
        const posInPage = i % (cols * rows)

        if (posInPage === 0 && i !== 0) {
          doc.addPage()
        }

        const col = posInPage % cols
        const row = Math.floor(posInPage / cols)
        const x = margin + col * (cardWidth + gap)
        const y = margin + row * (cardHeight + gap)

        // Cadre de la carte
        doc.setDrawColor('#1E3A8A')
        doc.setLineWidth(0.3)
        doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2)

        // Image de fond (photo de couverture ou style)
        if (backgroundDataUrl) {
          try {
            doc.addImage(
              backgroundDataUrl,
              imageFormatFromDataUrl(backgroundDataUrl),
              x + 0.5,
              y + 0.5,
              cardWidth - 1,
              imageHeight - 1
            )
          } catch {
            // si l'image échoue, on continue sans elle
          }
        }

        // Panneau blanc (infos + QR)
        const panelY = y + imageHeight
        const panelHeight = cardHeight - imageHeight
        doc.setFillColor('#FFFFFF')
        doc.rect(x + 0.5, panelY, cardWidth - 1, panelHeight - 0.5, 'F')

        const qrSize = Math.min(panelHeight - 4, cardWidth * 0.28)
        const textX = x + 3
        const textMaxWidth = cardWidth - qrSize - 8

        doc.setTextColor('#1E3A8A')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(cardsPerPage === 1 ? 14 : cardsPerPage === 4 ? 10 : 7)
        doc.text(event.name, textX, panelY + 5, { maxWidth: textMaxWidth })

        doc.setFont('helvetica', 'normal')
        doc.setTextColor('#555555')
        doc.setFontSize(cardsPerPage === 1 ? 10 : cardsPerPage === 4 ? 8 : 6)
        doc.text(eventDateLabel, textX, panelY + (cardsPerPage === 1 ? 12 : 10), { maxWidth: textMaxWidth })
        if (event.location) {
          doc.text(event.location, textX, panelY + (cardsPerPage === 1 ? 18 : 14), { maxWidth: textMaxWidth })
        }

        doc.setTextColor('#1E3A8A')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(cardsPerPage === 1 ? 12 : cardsPerPage === 4 ? 9 : 6.5)
        const guestLabel = guest.numberOfGuests > 0
          ? `${guest.name} (+${guest.numberOfGuests})`
          : guest.name
        doc.text(guestLabel, textX, panelY + panelHeight - 4, { maxWidth: textMaxWidth })

        // QR code individuel
        if (guest.qrToken) {
          const qrUrl = buildQrUrl(event.slug, guest.id)
          const qrDataUrl = await urlToDataUrl(qrUrl).catch(() => null)
          if (qrDataUrl) {
            doc.addImage(
              qrDataUrl,
              imageFormatFromDataUrl(qrDataUrl),
              x + cardWidth - qrSize - 2,
              panelY + (panelHeight - qrSize) / 2,
              qrSize,
              qrSize
            )
          }
        }
      }

      doc.save(`invitations-${event.slug}.pdf`)
    } catch (err) {
      console.error('Erreur génération PDF:', err)
    } finally {
      setGenerating(false)
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
              <div className="text-6xl mb-4">😕</div>
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
        <div className="container mx-auto max-w-2xl">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button
              variant="ghost"
              className="mb-4 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => router.push('/fr/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au dashboard
            </Button>
          </motion.div>

          <AnimatedSection>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }} className="flex justify-center mb-2">
                  <span className="text-4xl">📄</span>
                </motion.div>
                <CardTitle className="text-2xl text-[#1E3A8A] text-center font-poppins">
                  Cartes d'invitation imprimables
                </CardTitle>
                <CardDescription className="text-center">{event.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium text-[#1E3A8A]">Invités confirmés :</span> {guests.length}</p>
                  <p><span className="font-medium text-[#1E3A8A]">Date :</span> {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  {event.location && <p><span className="font-medium text-[#1E3A8A]">Lieu :</span> {event.location}</p>}
                </div>

                {guests.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center">
                    Aucun invité confirmé pour le moment. Les cartes seront disponibles dès qu'au moins un invité aura répondu "Je participe".
                  </p>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Cartes par page (mise en page d'impression)</p>
                      <div className="flex gap-2">
                        {[1, 4, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => setCardsPerPage(n as 1 | 4 | 10)}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors ${
                              cardsPerPage === n
                                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                                : 'bg-white text-[#1E3A8A] border-gray-200 hover:border-[#1E3A8A]/40'
                            }`}
                          >
                            {n} / page
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                      onClick={generatePDF}
                      disabled={generating}
                    >
                      {generating ? (
                        'Génération en cours...'
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger le PDF ({guests.length} carte{guests.length > 1 ? 's' : ''})
                        </>
                      )}
                    </Button>
                  </>
                )}

                <div className="text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
                  Propulsé par Eventvivo
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}
