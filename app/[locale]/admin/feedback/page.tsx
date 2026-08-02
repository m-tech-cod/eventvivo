'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

function Badge({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) {
  const variants: Record<string, string> = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-800',
    destructive: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  )
}

export default function AdminFeedbackPage() {
  const router = useRouter()
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const response = await fetch('/api/feedback')
      const result = await response.json()

      if (!response.ok) {
        // Non authentifié ou pas admin : retour au dashboard
        router.push('/fr/dashboard')
        return
      }

      setFeedbacks(result.data || [])
      setLoading(false)
    }

    fetchFeedbacks()
  }, [router])

  const updateStatus = async (id: string, status: string) => {
    setError(null)
    setUpdatingId(id)

    // Sauvegarde l'état précédent pour pouvoir l'annuler en cas d'échec
    const previousFeedbacks = feedbacks

    // Mise à jour optimiste de l'affichage
    setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status } : f))

    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // Échec réel : on annule la mise à jour optimiste
        setFeedbacks(previousFeedbacks)
        setError(result.error || 'Impossible de mettre à jour le statut')
      }
    } catch (err: any) {
      setFeedbacks(previousFeedbacks)
      setError('Erreur réseau, veuillez réessayer')
    } finally {
      setUpdatingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      new: { label: 'Nouveau', variant: 'default' as const, icon: <Clock className="w-3 h-3" /> },
      in_progress: { label: 'En cours', variant: 'secondary' as const, icon: <AlertCircle className="w-3 h-3" /> },
      resolved: { label: 'Résolu', variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      closed: { label: 'Fermé', variant: 'outline' as const, icon: <CheckCircle className="w-3 h-3" /> },
    }
    return config[status as keyof typeof config] || config.new
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="parallax" overlayOpacity={0.3}>
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-4xl">
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
                <CardTitle className="text-2xl text-[#1E3A8A] font-poppins">
                  📋 Gestion des feedbacks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {feedbacks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Aucun feedback pour le moment</p>
                ) : (
                  <StaggeredContainer className="space-y-4">
                    {feedbacks.map((feedback) => {
                      const statusBadge = getStatusBadge(feedback.status)
                      return (
                        <motion.div key={feedback.id} variants={staggerItem}>
                          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow hover:shadow-lg transition-all">
                            <CardContent className="p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-[#1E3A8A]">
                                      {feedback.profiles?.first_name} {feedback.profiles?.last_name}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {feedback.type === 'rating' && '⭐ Note'}
                                      {feedback.type === 'suggestion' && '💡 Suggestion'}
                                      {feedback.type === 'bug_report' && '🐛 Problème'}
                                      {feedback.type === 'compliment' && '❤️ Compliment'}
                                    </Badge>
                                    {feedback.rating && (
                                      <span className="text-[#F59E0B] text-sm">
                                        {'★'.repeat(feedback.rating)}
                                      </span>
                                    )}
                                    <Badge variant={statusBadge.variant}>
                                      <span className="flex items-center gap-1">
                                        {statusBadge.icon}
                                        {statusBadge.label}
                                      </span>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{feedback.content}</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(feedback.created_at).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {feedback.status === 'new' && (
                                    <Button
                                      size="sm"
                                      className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                                      onClick={() => updateStatus(feedback.id, 'in_progress')}
                                      disabled={updatingId === feedback.id}
                                    >
                                      Prendre en charge
                                    </Button>
                                  )}
                                  {feedback.status === 'in_progress' && (
                                    <Button
                                      size="sm"
                                      className="bg-[#10B981] hover:bg-[#10B981]/90 text-white"
                                      onClick={() => updateStatus(feedback.id, 'resolved')}
                                      disabled={updatingId === feedback.id}
                                    >
                                      Résolu
                                    </Button>
                                  )}
                                  {feedback.status === 'resolved' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-300"
                                      onClick={() => updateStatus(feedback.id, 'closed')}
                                      disabled={updatingId === feedback.id}
                                    >
                                      Fermer
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </StaggeredContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}
