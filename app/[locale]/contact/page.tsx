'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Phone, MapPin } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    try {
      const response = await fetch('https://formspree.io/f/meenwbvo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError(true)
      }
    } catch (err) {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35}>
      <div className="flex-1 py-12 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white font-poppins mb-4 drop-shadow-lg">
              Nous contacter
            </h1>
            <p className="text-white/80 drop-shadow max-w-2xl mx-auto">
              Une question ? Un problème ? Nous sommes là pour vous aider.
            </p>
          </motion.div>

          {/* Cartes d'info */}
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 hover:shadow-xl transition-shadow">
                <CardContent className="text-center p-6">
                  <Phone className="w-8 h-8 text-[#1E3A8A] mx-auto mb-2" />
                  <p className="font-medium text-[#1E3A8A]">Téléphone</p>
                  <p className="text-sm text-gray-500">+229 01 57 56 29 11</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 hover:shadow-xl transition-shadow">
                <CardContent className="text-center p-6">
                  <MapPin className="w-8 h-8 text-[#1E3A8A] mx-auto mb-2" />
                  <p className="font-medium text-[#1E3A8A]">Adresse</p>
                  <p className="text-sm text-gray-500">Porto-Novo, Bénin</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 hover:shadow-xl transition-shadow">
                <CardContent className="text-center p-6">
                  <a
                    href="https://wa.me/2290157562911"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-2 hover:bg-[#10B981]/80 transition-colors">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </div>
                    <p className="font-medium text-[#1E3A8A]">WhatsApp</p>
                    <p className="text-sm text-gray-500">Contactez-nous directement</p>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          </StaggeredContainer>

          {/* Formulaire */}
          <AnimatedSection>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-[#1E3A8A]">Envoyez-nous un message</CardTitle>
                <CardDescription>
                  Nous vous répondrons dans les plus brefs délais
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submitted && (
                  <Alert className="mb-4 bg-green-50 border-green-200">
                    <AlertDescription className="text-green-700">
                      🎉 Merci ! Votre message a été envoyé ! Nous vous répondrons rapidement.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      ❌ Une erreur est survenue. Veuillez réessayer.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom complet *</Label>
                      <Input
                        id="name"
                        placeholder="Jean Kouassi"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jean@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      placeholder="Sujet de votre message"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Décrivez votre demande..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                    disabled={loading}
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}