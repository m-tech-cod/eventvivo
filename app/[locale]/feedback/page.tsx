'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { FeedbackForm } from '@/components/feedback/FeedbackForm'

export default function FeedbackPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: { type: string; rating?: number; content: string }) => {
    setError(null)
    setLoading(true)

    if (!user) {
      setError('Vous devez être connecté pour envoyer un feedback')
      setLoading(false)
      return
    }

    if (!data.content.trim()) {
      setError('Veuillez écrire un message')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: user.id,
          type: data.type,
          rating: data.type === 'rating' ? data.rating : null,
          content: data.content,
          status: 'new',
        })

      if (error) throw error

      setSubmitted(true)
      setTimeout(() => router.push('/fr/dashboard'), 2000)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
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
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-6xl mb-4"
                >
                  🙏
                </motion.div>
                <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">Merci pour votre retour !</h2>
                <p className="text-gray-500">Votre feedback nous aide à améliorer Eventvivo.</p>
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
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
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
              Retour
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-[#1E3A8A] text-center font-poppins">
                  💬 Donnez votre avis
                </CardTitle>
                <CardDescription className="text-center">
                  Votre retour nous aide à nous améliorer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FeedbackForm onSubmit={handleSubmit} isLoading={loading} />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </BackgroundImage>
  )
}