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

const NAVY = '#1E3A8A'
const AMBER = '#F59E0B'
const AMBER_DARK = '#B45309'
const GRAY_TEXT = '#64748B'
const GRAY_LINE = '#CBD5E1'
const BADGE_BG = '#EEF2FF'
const SHADOW = '#D9E0EA'

interface DrawGuestCardParams {
  x: number
  y: number
  cardWidth: number
  cardHeight: number
  imageHeight: number
  backgroundDataUrl: string | null
  qrDataUrl: string | null
  eventName: string
  eventDateLabel: string
  eventLocation?: string | null
  guestName: string
  guestExtra: number
  cardsPerPage: 1 | 4 | 10
}

// Dessine une carte "billet" : photo en médaillon (matte blanc), bandeau
// accent, séparateur pointillé façon souche de ticket, badge invité, encart
// QR — le tout en primitives vectorielles jsPDF (aucune police/asset externe
// requis, donc rien à embarquer/héberger en plus).
function drawGuestCard(doc: jsPDF, p: DrawGuestCardParams) {
  const { x, y, cardWidth, cardHeight, imageHeight, backgroundDataUrl, qrDataUrl, eventName, eventDateLabel, eventLocation, guestName, guestExtra, cardsPerPage } = p
  const compact = cardsPerPage === 10
  const roomy = cardsPerPage === 1

  // Ombre douce (légèrement décalée derrière la carte)
  doc.setFillColor(SHADOW)
  doc.roundedRect(x + 0.6, y + 0.9, cardWidth, cardHeight, 3, 3, 'F')

  // Carte : fond blanc + liseré navy
  doc.setFillColor('#FFFFFF')
  doc.setDrawColor(NAVY)
  doc.setLineWidth(0.35)
  doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD')

  // Photo en médaillon (marge blanche façon matte de cadre)
  const inset = 1.6
  const photoW = cardWidth - inset * 2
  const photoH = imageHeight - inset * 1.4
  if (backgroundDataUrl) {
    try {
      doc.addImage(backgroundDataUrl, imageFormatFromDataUrl(backgroundDataUrl), x + inset, y + inset, photoW, photoH)
    } catch {
      // si l'image échoue, on continue sans elle
    }
  }

  // Bandeau accent (signature de marque)
  const accentY = y + inset + photoH
  const accentH = compact ? 1.1 : 1.6
  doc.setFillColor(AMBER)
  doc.rect(x + inset, accentY, photoW, accentH, 'F')

  const panelY = accentY + accentH
  const panelHeight = y + cardHeight - panelY

  // Colonne QR (à droite) + séparateur pointillé façon souche de billet
  const qrSize = Math.min(panelHeight - (compact ? 3 : 5), cardWidth * 0.26)
  const qrBoxX = x + cardWidth - qrSize - (compact ? 2.5 : 4)
  const dividerX = qrBoxX - (compact ? 1.8 : 3)

  if (qrDataUrl) {
    const qrY = panelY + (panelHeight - qrSize) / 2
    doc.setDrawColor(GRAY_LINE)
    doc.setLineWidth(0.25)
    doc.roundedRect(qrBoxX - 0.8, qrY - 0.8, qrSize + 1.6, qrSize + 1.6, 1, 1, 'D')
    try {
      doc.addImage(qrDataUrl, imageFormatFromDataUrl(qrDataUrl), qrBoxX, qrY, qrSize, qrSize)
    } catch {
      // si le QR échoue, on continue sans lui
    }
    if (!compact) {
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(GRAY_TEXT)
      doc.setFontSize(4.8)
      doc.text('SCANNEZ', qrBoxX + qrSize / 2, qrY + qrSize + 3, { align: 'center' })
    }
  }

  doc.setDrawColor(GRAY_LINE)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([0.8, 0.8], 0)
  doc.line(dividerX, panelY + 1.5, dividerX, y + cardHeight - 1.5)
  doc.setLineDashPattern([], 0)

  // Bloc texte (à gauche du séparateur)
  const textX = x + inset + 2
  const textMaxWidth = dividerX - textX - 1.5
  let cursorY = panelY + (compact ? 3.4 : roomy ? 5.5 : 4.6)

  if (!compact) {
    doc.setFont('times', 'italic')
    doc.setTextColor(AMBER_DARK)
    doc.setFontSize(roomy ? 7.5 : 6.5)
    doc.text("VOUS ÊTES INVITÉ(E)", textX, cursorY, { maxWidth: textMaxWidth })
    cursorY += roomy ? 5.5 : 4.5
  }

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(NAVY)
  doc.setFontSize(roomy ? 13 : compact ? 6.5 : 9.5)
  doc.text(eventName, textX, cursorY, { maxWidth: textMaxWidth })
  cursorY += roomy ? 6.5 : compact ? 3.8 : 5

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(GRAY_TEXT)
  doc.setFontSize(roomy ? 9 : compact ? 5.2 : 7.2)
  doc.text(`• ${eventDateLabel}`, textX, cursorY, { maxWidth: textMaxWidth })
  cursorY += roomy ? 5.5 : compact ? 3.4 : 4.4

  if (eventLocation && !compact) {
    doc.text(`• ${eventLocation}`, textX, cursorY, { maxWidth: textMaxWidth })
  }

  // Badge invité (pilule) en bas du bloc texte
  const guestLabel = guestExtra > 0 ? `${guestName} (+${guestExtra})` : guestName
  const badgeFontSize = roomy ? 9.5 : compact ? 5.5 : 7.5
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(badgeFontSize)
  const guestTextWidth = Math.min(doc.getTextWidth(guestLabel), textMaxWidth - 4)
  const badgeH = badgeFontSize * 0.42
  const badgeY = y + cardHeight - inset - badgeH - (compact ? 1 : 1.8)
  doc.setFillColor(BADGE_BG)
  doc.roundedRect(textX - 1.2, badgeY, guestTextWidth + 4.4, badgeH + 2, badgeH / 2 + 0.4, badgeH / 2 + 0.4, 'F')
  doc.setTextColor(NAVY)
  doc.text(guestLabel, textX + 1, badgeY + badgeH + 0.4, { maxWidth: textMaxWidth - 2 })

  // Signature de marque (coin bas-droit, uniquement quand il y a la place)
  if (roomy) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6)
    doc.setTextColor(NAVY)
    const evLabel = 'Event'
    doc.text(evLabel, x + cardWidth - inset - doc.getTextWidth(evLabel) - doc.getTextWidth('vivo'), y + cardHeight - inset - 0.8)
    doc.setTextColor(AMBER)
    doc.text('vivo', x + cardWidth - inset - doc.getTextWidth('vivo'), y + cardHeight - inset - 0.8)
  }
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

        const qrUrl = guest.qrToken ? buildQrUrl(event.slug, guest.id) : null
        const qrDataUrl = qrUrl ? await urlToDataUrl(qrUrl).catch(() => null) : null

        drawGuestCard(doc, {
          x, y, cardWidth, cardHeight, imageHeight,
          backgroundDataUrl, qrDataUrl,
          eventName: event.name,
          eventDateLabel,
          eventLocation: event.location,
          guestName: guest.name,
          guestExtra: guest.numberOfGuests,
          cardsPerPage,
        })
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
