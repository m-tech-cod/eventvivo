'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'

export default function QRCodePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()
      
      setEvent(eventData)
      
      if (eventData && eventData.is_qr_active) {
        const qrData = `${window.location.origin}/api/rsvp/scan/${eventData.slug}`
        const encodedData = encodeURIComponent(qrData)
        const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}&bgcolor=FFFFFF&color=1E3A8A&margin=10`
        setQrImageUrl(apiUrl)
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [eventId, supabase])

  const downloadQRCode = async () => {
    if (!qrImageUrl) return
    
    try {
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `qrcode-${event?.slug || 'event'}.png`
      link.href = url
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  if (!event || !event.is_qr_active) {
    return (
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.4} animate="zoom">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-12">
                <div className="text-5xl mb-4">📱</div>
                <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">
                  QR Code désactivé
                </h2>
                <p className="text-gray-500">
                  Le QR Code n'est pas activé pour cet événement.
                </p>
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
    <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35} animate="zoom">
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-md">
          <AnimatedSection>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex justify-center mb-2"
                >
                  <span className="text-4xl">📱</span>
                </motion.div>
                <CardTitle className="text-2xl text-[#1E3A8A] text-center font-poppins">
                  QR Code
                </CardTitle>
                <CardDescription className="text-center">
                  {event.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <motion.div 
                    className="p-4 bg-white rounded-lg shadow-lg border-2 border-[#1E3A8A]/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    {qrImageUrl ? (
                      <img
                        src={qrImageUrl}
                        alt="QR Code"
                        className="w-64 h-64"
                      />
                    ) : (
                      <div className="w-64 h-64 flex items-center justify-center text-gray-400">
                        Génération...
                      </div>
                    )}
                  </motion.div>
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    Invitation pour : {event.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Scannez ce QR Code à l'entrée
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                    onClick={downloadQRCode}
                    disabled={!qrImageUrl}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger le QR Code
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                    onClick={() => router.push('/fr/dashboard')}
                  >
                    Retour au dashboard
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