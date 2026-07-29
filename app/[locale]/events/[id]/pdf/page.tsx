'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Download, FileText, Printer } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'
import jsPDF from 'jspdf'

export default function PDFPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const eventId = params.id as string

  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      setEvent(data)
      setLoading(false)
    }

    fetchEvent()
  }, [eventId, supabase])

  const generatePDF = () => {
    if (!event) return
    
    const doc = new jsPDF()
    
    doc.setFontSize(22)
    doc.setTextColor('#1E3A8A')
    doc.text(event.name, 105, 40, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor('#333333')
    doc.text(`Date : ${new Date(event.date).toLocaleDateString('fr-FR')}`, 20, 70)
    if (event.location) doc.text(`Lieu : ${event.location}`, 20, 85)
    if (event.description) {
      doc.text('Description :', 20, 100)
      doc.text(event.description, 20, 115, { maxWidth: 170 })
    }
    
    doc.setFontSize(10)
    doc.setTextColor('#999999')
    doc.text('Propulsé par Eventvivo', 105, 280, { align: 'center' })
    
    doc.save(`invitation-${event.slug}.pdf`)
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
      <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">
                  Événement non trouvé
                </h2>
                <Button
                  className="mt-4 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                  onClick={() => router.push('/fr/dashboard')}
                >
                  Retour au dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  return (
    <BackgroundImage src="/images/global-bg.jpg" overlayOpacity={0.35} animate="zoom">
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex justify-center mb-2"
                >
                  <span className="text-4xl">📄</span>
                </motion.div>
                <CardTitle className="text-2xl text-[#1E3A8A] text-center font-poppins">
                  Cartes d'invitation imprimables
                </CardTitle>
                <CardDescription className="text-center">
                  {event.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-[#1E3A8A]">Événement :</span> {event.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-[#1E3A8A]">Date :</span>{' '}
                    {new Date(event.date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-[#1E3A8A]">Lieu :</span> {event.location}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                    onClick={generatePDF}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le PDF
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                    onClick={() => window.print()}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </Button>
                </div>

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