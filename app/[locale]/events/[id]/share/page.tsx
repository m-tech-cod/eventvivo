'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Copy, MessageCircle, ArrowLeft, Sparkles } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'

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

export default function ShareInvitationPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [invitationUrl, setInvitationUrl] = useState('')

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

  useEffect(() => {
    if (event?.slug) {
      setInvitationUrl(`${window.location.origin}/fr/invite/${event.slug}`)
    }
  }, [event])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // silencieux si le presse-papier n'est pas accessible
    }
  }

  const handleShare = (platform: string) => {
    const shareText = encodeURIComponent(
      `📢 *${event?.name}*\n\n` +
      `Vous êtes chaleureusement invité(e) !\n\n` +
      `📅 ${new Date(event?.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n` +
      `${event?.time ? `⏰ ${event?.time}\n` : ''}` +
      `${event?.location ? `📍 ${event?.location}\n` : ''}` +
      `\n👉 Confirmez votre présence en un clic, ça ne prend que 30 secondes :\n` +
      `${invitationUrl}\n\n` +
      `On compte sur vous ! 🎉`
    )
    
    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${shareText}`,
    }
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank')
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
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35} animate="zoom">
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
    <BackgroundImage src={getEventBackground(event)} overlayOpacity={0.35} animate="zoom">
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-md">
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
              Retour
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
                  <span className="text-4xl">📢</span>
                </motion.div>
                <CardTitle className="text-2xl text-[#1E3A8A] text-center font-poppins">
                  Partager l'invitation
                </CardTitle>
                <CardDescription className="text-center">
                  {event.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {event.is_premium && (
                  <div className="inline-flex items-center gap-2 bg-[#F59E0B]/10 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Premium
                  </div>
                )}

                <div className="p-4 bg-[#DCF8C6] rounded-lg border border-[#B6E5A3]">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">
                    📢 <strong>{event.name}</strong>
                    {'\n\n'}
                    Vous êtes chaleureusement invité(e) !
                    {'\n\n'}
                    📅 {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    {event.time && `\n⏰ ${event.time}`}
                    {event.location && `\n📍 ${event.location}`}
                    {'\n\n'}
                    👉 Confirmez votre présence en un clic, ça ne prend que 30 secondes :
                    {'\n'}
                    <span className="text-[#1E3A8A] underline">{invitationUrl}</span>
                    {'\n\n'}
                    On compte sur vous ! 🎉
                  </p>
                </div>

                <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                  <input
                    type="text"
                    value={invitationUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="flex-shrink-0 border-[#1E3A8A] text-[#1E3A8A]"
                  >
                    {copied ? 'Copié ✅' : 'Copier'}
                  </Button>
                </div>

                {copied && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">
                      ✅ Lien copié dans le presse-papiers !
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <p className="text-sm text-gray-500 text-center">Partager sur</p>
                  <div className="grid grid-cols-2 gap-3">
                    {/* WhatsApp */}
                    <Button
                      className="bg-[#10B981] hover:bg-[#10B981]/90 text-white py-6 text-lg font-semibold flex items-center justify-center"
                      onClick={() => handleShare('whatsapp')}
                    >
                      <svg 
                        className="w-5 h-5 mr-2" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      WhatsApp
                    </Button>

                    {/* Copier le lien */}
                    <Button
                      variant="outline"
                      className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/10 py-6 text-lg font-semibold flex items-center justify-center"
                      onClick={handleCopy}
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Copier le lien
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/10"
                    onClick={() => router.push('/fr/dashboard')}
                  >
                    Retour au dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}
