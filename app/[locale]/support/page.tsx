'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

export default function SupportPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('https://formspree.io/f/meenwbvo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', message: '' })
        setTimeout(() => setSubmitted(false), 5000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 py-12 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white font-poppins drop-shadow-lg">
              💬 Support
            </h1>
            <p className="text-white/80 drop-shadow mt-2">
              Nous sommes là pour vous aider
            </p>
          </motion.div>

          {/* Cartes */}
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* WhatsApp */}
            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-5xl mb-4"
                  >
                    💬
                  </motion.div>
                  <h3 className="font-semibold text-[#1E3A8A] text-lg">WhatsApp</h3>
                  <p className="text-gray-500 text-sm mt-2">Réponse rapide sous 24h</p>
                  <a
                    href="https://wa.me/22957562911"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4"
                  >
                    <Button className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white">
                      Nous écrire sur WhatsApp
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </motion.div>

            {/* Formulaire */}
            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">Envoyez-nous un message</CardTitle>
                  <CardDescription>Nous vous répondrons par email</CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted && (
                    <Alert className="mb-4 bg-green-50 border-green-200">
                      <AlertDescription className="text-green-700">
                        ✅ Message envoyé ! Nous vous répondrons rapidement.
                      </AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#1E3A8A]">Nom</Label>
                      <Input
                        id="name"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#1E3A8A]">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-[#1E3A8A]">Message</Label>
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Votre message..."
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
                      {loading ? 'Envoi en cours...' : 'Envoyer'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </StaggeredContainer>
        </div>
      </div>
    </BackgroundImage>
  )
}