'use client'

import { ArrowLeft } from 'lucide-react'
import { useState, useRef } from 'react'
import Link from 'next/link'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha>(null)

  const logOutcome = async (event_type: string, details?: Record<string, unknown>) => {
    try {
      await fetch('/api/auth/log-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type, details }),
      })
    } catch {
      // La journalisation ne doit jamais bloquer le parcours utilisateur.
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (!captchaToken) {
      setError('Merci de valider le CAPTCHA avant de continuer')
      setLoading(false)
      return
    }

    try {
      const guardRes = await fetch('/api/auth/guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', identifier: email, captchaToken }),
      })
      const guard = await guardRes.json()

      if (!guard.allowed) {
        setError(
          guard.error === 'rate_limited'
            ? 'Trop de tentatives, réessayez dans quelques minutes'
            : 'Échec de la vérification CAPTCHA, réessayez'
        )
        captchaRef.current?.resetCaptcha()
        setCaptchaToken(null)
        setLoading(false)
        return
      }

      const result = await resetPassword(email, captchaToken)
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)

      if (result.success) {
        await logOutcome('reset_password_requested', { email })
        setSuccess(true)
      } else {
        setError(result.error || "Erreur lors de l'envoi de l'email")
      }
    } catch (err: any) {
      setError(err.message)
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35} animate="zoom" className="min-h-screen py-8">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex justify-center mb-4"
                >
                  <div className="flex items-center">
                    <span className="text-[#1E3A8A] font-bold text-3xl font-poppins">Event</span>
                    <span className="text-[#F59E0B] font-bold text-3xl font-poppins">vivo</span>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex justify-center mb-4"
                >
                  <CheckCircle className="w-16 h-16 text-[#10B981]" />
                </motion.div>
                <CardTitle className="text-2xl text-[#1E3A8A]">Email envoyé !</CardTitle>
                <CardDescription>
                  Nous vous avons envoyé un lien de réinitialisation à {email}
                </CardDescription>
              </CardHeader>
              <CardFooter className="border-t pt-6">
                <Link href="/fr/auth/login" className="w-full">
                  <Button className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                    Retour à la connexion
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  return (
    <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35} className="min-h-screen py-8">
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex justify-center mb-4"
              >
                <div className="flex items-center">
                  <span className="text-[#1E3A8A] font-bold text-3xl font-poppins">Event</span>
                  <span className="text-[#F59E0B] font-bold text-3xl font-poppins">vivo</span>
                </div>
              </motion.div>
              <CardTitle className="text-2xl text-[#1E3A8A]">Mot de passe oublié</CardTitle>
              <CardDescription>
                Entrez votre email pour recevoir un lien de réinitialisation
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button 
                variant="ghost" 
                className="mb-4 text-[#1E3A8A] hover:bg-[#1E3A8A]/10 flex items-center gap-2"
                onClick={() => window.location.href = '/'}
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                  />
                </div>

                <div className="flex justify-center">
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken(null)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                  disabled={loading}
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="border-t pt-6">
              <div className="text-sm text-gray-600 w-full text-center">
                Retour à{' '}
                <Link href="/fr/auth/login" className="text-[#1E3A8A] hover:underline">
                  la connexion
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </BackgroundImage>
  )
}