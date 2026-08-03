'use client'

import { Eye, EyeOff } from 'lucide-react'
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
import { BackgroundImage } from '@/components/ui/BackgroundImage'

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HCaptcha>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      setLoading(false)
      return
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Le mot de passe doit contenir au moins une lettre et un chiffre')
      setLoading(false)
      return
    }

    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Le mot de passe doit contenir au moins une lettre et un chiffre')
      setLoading(false)
      return
    }

    if (!captchaToken) {
      setError('Merci de valider le CAPTCHA avant de continuer')
      setLoading(false)
      return
    }

    try {
      const result = await signUp({ firstName, lastName, email, password, confirmPassword, captchaToken })
      if (!result.success) {
        setError(result.error || "Erreur d'inscription")
        captchaRef.current?.resetCaptcha()
        setCaptchaToken(null)
      }
    } catch (err: any) {
      setError(err.message)
      captchaRef.current?.resetCaptcha()
      setCaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BackgroundImage
      src="/images/foule.webp"
      animate="zoom" overlayOpacity={0.35}
      className="min-h-screen py-8" 
    >
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card className="w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
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
              <CardTitle className="text-2xl text-[#1E3A8A]">Inscription</CardTitle>
              <CardDescription>
                Créez votre compte Eventvivo gratuitement
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

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      placeholder="Kouassi"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                  </div>
                </div>

                {/* ✅ Champs cachés pour tromper l'autofill */}
                <input type="text" className="hidden" aria-hidden="true" />
                <input type="password" className="hidden" aria-hidden="true" />

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoCorrect="off"
                    spellCheck="false"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <p className="text-xs text-gray-400 mt-1">
                    Au moins 8 caractères, avec une lettre et un chiffre
                  </p>
                </div>

                <div className="relative">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A] pr-10 mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[60%] -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                  {loading ? 'Inscription...' : 'Créer mon compte'}
                </Button>
              </form>

              <div className="relative my-6" suppressHydrationWarning>
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white/80 px-2 text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
                onClick={async () => {
                  setLoading(true)
                  const result = await signInWithGoogle()
                  if (!result.success) {
                    setError(result.error || 'Erreur avec Google')
                    setLoading(false)
                  }
                }}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
            </CardContent>

            <CardFooter className="border-t pt-6">
              <div className="text-sm text-gray-600 w-full text-center">
                Déjà un compte ?{' '}
                <Link href="/fr/auth/login" className="text-[#F59E0B] hover:underline font-medium">
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </BackgroundImage>
  )
}