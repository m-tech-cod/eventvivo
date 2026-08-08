'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Calendar, 
  Plus,
  Users,
  Eye,
  Crown,
  Star,
  Sparkles
} from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

const PLAN_CONFIG = {
  free: { label: 'Gratuit', maxGuests: 10, color: 'text-gray-500', bg: 'bg-gray-100' },
  standard: { label: 'Standard', maxGuests: 100, color: 'text-[#1E3A8A]', bg: 'bg-[#1E3A8A]/10' },
  prestige: { label: 'Prestige', maxGuests: 500, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  vip: { label: 'VIP', maxGuests: Infinity, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
}

export default function EventsPage() {
  const [user, setUser] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/fr/auth/login')
        return
      }
      setUser(user)

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false })

      setEvents(eventsData || [])
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 className="text-2xl font-bold text-white font-poppins drop-shadow-lg">
              Mes événements
            </h1>
            {/* Masqué en mobile : redondant avec le bouton flottant "+" de MobileNavigation */}
            <Link href="/fr/events/choose-plan" className="hidden md:block">
              <Button className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-semibold">
                <Plus className="w-4 h-4 mr-2" />
                Créer un événement
              </Button>
            </Link>
          </motion.div>

          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="border-2 border-dashed border-white/30 bg-white/95 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-10 h-10 text-[#F59E0B]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">
                    Aucun événement créé
                  </h2>
                  <p className="text-gray-500 text-center mb-6 max-w-md">
                    Créez votre premier événement pour commencer à utiliser Eventvivo
                  </p>
                  <Link href="/fr/events/choose-plan">
                    <Button className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-semibold">
                      <Plus className="w-4 h-4 mr-2" />
                      Créer un événement
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <StaggeredContainer className="space-y-4">
              {events.map((event) => {
                const plan = PLAN_CONFIG[event.plan_type as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free
                const totalInvitations = event.total_invitations || 0
                const maxGuests = plan.maxGuests
                const isFreePlan = event.plan_type === 'free'
                const isVipPlan = event.plan_type === 'vip'
                const progress = maxGuests === Infinity ? 100 : Math.min((totalInvitations / maxGuests) * 100, 100)

                return (
                  <motion.div key={event.id} variants={staggerItem}>
                    <Card className="hover:shadow-xl transition-shadow bg-white/95 backdrop-blur-sm border-0">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-[#1E3A8A]">
                              {event.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                              {event.location && ` • ${event.location}`}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${plan.bg} ${plan.color}`}>
                                {isVipPlan ? <Crown className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                                {plan.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {isVipPlan ? '♾️ Illimité' : `${totalInvitations}/${maxGuests} invités`}
                              </span>
                              {isFreePlan && (
                                <span className="text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">
                                  ⚡ Limité
                                </span>
                              )}
                              {isVipPlan && (
                                <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">
                                  👑 Illimité
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link href={`/fr/events/${event.id}/edit`}>
                              <Button variant="outline" size="sm" className="border-[#1E3A8A] text-[#1E3A8A]">
                                Modifier
                              </Button>
                            </Link>
                            <Link href={`/fr/invite/${event.slug}`} target="_blank">
                              <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                                <Eye className="w-4 h-4 mr-1" />
                                Voir
                              </Button>
                            </Link>
                            {!isVipPlan && (
                              <Link href={`/fr/events/choose-plan?upgrade=${event.id}`}>
                                <Button size="sm" className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A]">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Upgrader
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>

                        {!isVipPlan && (
                          <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progression des invités</span>
                              <span>{totalInvitations}/{maxGuests}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all ${
                                  progress >= 90 ? 'bg-red-500' : 
                                  progress >= 70 ? 'bg-[#F59E0B]' : 
                                  'bg-[#10B981]'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            {progress >= 90 && (
                              <p className="text-xs text-red-500 mt-1">
                                ⚠️ Limite d'invités approchée
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </StaggeredContainer>
          )}
        </div>
      </div>
    </BackgroundImage>
  )
}