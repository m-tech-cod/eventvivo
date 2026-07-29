'use client'

import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BackgroundImage } from '@/components/ui/BackgroundImage'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      setLoading(false)
      return
    }

    try {
      const result = await updatePassword(password)
      if (!result.success) {
        setError(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35}>
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
              <CardTitle className="text-2xl text-[#1E3A8A]">Nouveau mot de passe</CardTitle>
              <CardDescription>
                Choisissez un nouveau mot de passe pour votre compte
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
                  <Label htmlFor="password">Nouveau mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                  />
                  <p className="text-xs text-gray-500">Minimum 6 caractères</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                  disabled={loading}
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
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