'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Plus,
  Eye,
  Share2,
  Download,
  FileText,
  Sparkles,
  Crown,
  TrendingUp,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'
import { getPlanMaxGuests } from '@/lib/utils/currency'

const PLAN_CONFIG = {
  free: { label: 'Gratuit', color: 'text-gray-500', bg: 'bg-gray-100' },
  standard: { label: 'Standard', color: 'text-[#1E3A8A]', bg: 'bg-[#1E3A8A]/10' },
  prestige: { label: 'Prestige', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  vip: { label: 'VIP', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
}

// Palier suivant pour chaque plan — utilisé pour l'upsell dashboard et pour
// présélectionner le bon plan dans le tunnel choose-plan/checkout.
const NEXT_PLAN: Record<string, { id: string; label: string }> = {
  free: { id: 'standard', label: 'Standard' },
  standard: { id: 'prestige', label: 'Prestige' },
  prestige: { id: 'vip', label: 'VIP' },
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const [stats, setStats] = useState<any>(null)
  const [recentInvitations, setRecentInvitations] = useState<any[]>([])

  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingEventData, setLoadingEventData] = useState(false)
  const [eventsLoadError, setEventsLoadError] = useState(false)

  const [rsvpTrend, setRsvpTrend] = useState<{ date: string; attending: number; declined: number }[]>([])
  const [invitationTrend, setInvitationTrend] = useState<{ date: string; sent: number; responded: number }[]>([])
  const [receipts, setReceipts] = useState<any[]>([])

  const supabase = createClient()
  const router = useRouter()

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null

  // ✅ Charge l'utilisateur et TOUS ses événements (un organisateur peut en
  // avoir plusieurs — illimité en payant, un seul gratuit actif à la fois)
  const fetchUserAndEvents = async () => {
    setLoadingUser(true)
    setEventsLoadError(false)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/fr/auth/login')
      return
    }
    setUser(user)

    // ✅ Indépendantes l'une de l'autre (dépendent seulement de user.id) —
    // parallélisées au lieu d'être attendues l'une après l'autre.
    const [{ data: profile }, { data: eventsData, error: eventsError }] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', user.id).single(),
      supabase
        .from('events')
        .select('id, name, date, slug, plan_type, cover_image')
        .eq('organizer_id', user.id)
        .order('date', { ascending: true }),
    ])

    setUserRole(profile?.role || 'user')
    // ✅ Une erreur réseau/Supabase ne doit pas être confondue avec "0
    // événement" (message + CTA différents — voir events.length === 0).
    setEventsLoadError(!!eventsError)
    setEvents(eventsData || [])
    if (eventsData && eventsData.length > 0) {
      setSelectedEventId(eventsData[0].id)
    }

    setLoadingUser(false)
  }

  useEffect(() => {
    fetchUserAndEvents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, router])

  // ✅ Reçus de paiement : route dédiée (pas de lecture directe de
  // `payments` côté client) — voir api/payments/mine.
  useEffect(() => {
    if (!user) return

    fetch('/api/payments/mine')
      .then((res) => res.json())
      .then((data) => setReceipts(data.payments || []))
      .catch(() => setReceipts([]))
  }, [user])

  // ✅ Charge les stats/graphiques de l'événement sélectionné
  useEffect(() => {
    if (!selectedEventId) return

    const fetchEventData = async () => {
      setLoadingEventData(true)

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      // ✅ 4 requêtes indépendantes (aucune ne dépend du résultat d'une
      // autre) — parallélisées : la latence totale devient celle de la plus
      // lente au lieu de la somme des 4.
      const [
        { data: statsData },
        { data: invitationsData },
        { data: rsvpData },
        { data: invData },
      ] = await Promise.all([
        supabase.from('event_stats').select('*').eq('event_id', selectedEventId).single(),
        supabase
          .from('invitations')
          .select('id, recipient_name, created_at, status')
          .eq('event_id', selectedEventId)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('rsvps')
          .select('status, responded_at, invitations!inner(event_id)')
          .eq('invitations.event_id', selectedEventId)
          .gte('responded_at', sevenDaysAgo.toISOString())
          .order('responded_at', { ascending: true }),
        supabase
          .from('invitations')
          .select('status, created_at, responded_at')
          .eq('event_id', selectedEventId)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: true }),
      ])

      setStats(statsData)
      setRecentInvitations(invitationsData || [])

      const rsvpByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayData = rsvpData?.filter((r) => r.responded_at?.split('T')[0] === dateStr) || []
        return {
          date: dateStr,
          attending: dayData.filter((r) => r.status === 'attending').length,
          declined: dayData.filter((r) => r.status === 'declined').length,
        }
      }).reverse()
      setRsvpTrend(rsvpByDay)

      const invByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayData = invData?.filter((inv) => inv.created_at.split('T')[0] === dateStr) || []
        return {
          date: dateStr,
          sent: dayData.length,
          responded: dayData.filter((inv) => inv.status === 'responded').length,
        }
      }).reverse()
      setInvitationTrend(invByDay)

      setLoadingEventData(false)
    }

    fetchEventData()
  }, [selectedEventId, supabase])

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35} className="min-h-screen">
        <div className="flex-1 flex items-center justify-center px-4 min-h-[90vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="border-2 border-dashed border-gray-300 bg-white/95 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-[#F59E0B]" />
                </div>
                {eventsLoadError ? (
                  <>
                    <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">
                      Connexion impossible
                    </h2>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                      Vos événements n'ont pas pu être chargés — vérifiez votre connexion puis réessayez.
                    </p>
                    <Button
                      onClick={() => fetchUserAndEvents()}
                      className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-semibold"
                    >
                      Réessayer
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  if (!selectedEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  const planType = selectedEvent.plan_type || 'free'
  const plan = PLAN_CONFIG[planType as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free
  const totalInvitations = stats?.total_invitations || 0
  const maxGuests = getPlanMaxGuests(planType) // 0 = illimité
  const isVipPlan = planType === 'vip'
  const nextPlan = NEXT_PLAN[planType] || null
  const usageRatio = maxGuests > 0 ? totalInvitations / maxGuests : 0
  const isNearQuota = maxGuests > 0 && usageRatio >= 0.7
  const upgradeHref = nextPlan
    ? `/fr/events/choose-plan?upgrade=${selectedEvent.id}&plan=${nextPlan.id}`
    : `/fr/events/choose-plan?upgrade=${selectedEvent.id}`

  const maxRsvp = Math.max(...rsvpTrend.map((d) => Math.max(d.attending, d.declined)), 1)
  const maxInv = Math.max(...invitationTrend.map((d) => Math.max(d.sent, d.responded)), 1)

  return (
    <BackgroundImage src={selectedEvent.cover_image || '/images/foule.webp'} animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="container mx-auto max-w-5xl">

          {/* ✅ Sélecteur d'événement — visible seulement si plusieurs événements */}
          {events.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 mb-4 overflow-x-auto pb-1"
            >
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm transition-colors ${
                    ev.id === selectedEventId
                      ? 'bg-white text-[#1E3A8A]'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {ev.name}
                </button>
              ))}
              <Link href="/fr/events/choose-plan" className="shrink-0">
                <button className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F59E0B] text-[#1E3A8A] hover:bg-[#F59E0B]/90 flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Nouvel événement
                </button>
              </Link>
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h1 className="text-2xl font-bold text-white font-poppins drop-shadow-lg">
                {selectedEvent.name}
              </h1>
              <p className="text-sm text-white/80 drop-shadow">
                {new Date(selectedEvent.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link href={`/fr/events/${selectedEvent.id}/edit`}>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                  Modifier
                </Button>
              </Link>
              <Link href={`/fr/invite/${selectedEvent.slug}`} target="_blank">
                <Button size="sm" className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A]">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            <div className={`inline-flex items-center gap-2 ${plan.bg} ${plan.color} px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              {plan.label}
              {isVipPlan && <Crown className="w-3 h-3" />}
              {maxGuests === 0 ? (
                <span>♾️ Illimité</span>
              ) : (
                <span>• {totalInvitations}/{maxGuests} invités</span>
              )}
            </div>
            {userRole === 'ambassador' && (
              <div className="inline-flex items-center gap-2 bg-[#F59E0B]/20 text-[#F59E0B] px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                🎯 Ambassadeur Eventvivo
              </div>
            )}
          </motion.div>

          {/* Bannière d'upgrade — n'apparaît que si l'usage réel (invités
              utilisés / quota du plan) le justifie, jamais de fausse urgence */}
          {isNearQuota && nextPlan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Link href={upgradeHref}>
                <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#F59E0B] to-[#F59E0B]/80 text-[#1E3A8A] rounded-xl px-4 py-3 shadow-lg shadow-[#F59E0B]/25 hover:shadow-xl hover:scale-[1.01] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">
                        Vous approchez de votre limite : {totalInvitations}/{maxGuests} invités
                      </p>
                      <p className="text-xs text-[#1E3A8A]/80">
                        Passez à {nextPlan.label} pour continuer à inviter sans interruption
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 flex-shrink-0" />
                </div>
              </Link>
            </motion.div>
          )}

          {/* Statistiques */}
          <StaggeredContainer className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard icon={<Users className="w-5 h-5" />} label="Total invités" value={totalInvitations} color="blue" />
            <StatCard icon={<UserCheck className="w-5 h-5" />} label="Confirmés" value={stats?.confirmed || 0} color="green" />
            <StatCard icon={<UserX className="w-5 h-5" />} label="Refusés" value={stats?.declined || 0} color="red" />
            <StatCard icon={<Clock className="w-5 h-5" />} label="En attente" value={stats?.pending || 0} color="orange" />
          </StaggeredContainer>

          {/* Participants attendus */}
          <AnimatedSection delay={0.2}>
            <Card className="bg-[#1E3A8A]/90 backdrop-blur-sm text-white border-0 mb-6">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-white/70 text-sm">Participants attendus</p>
                  <p className="text-3xl font-bold">{stats?.expected_guests || 0}</p>
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* GRAPHIQUES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1E3A8A] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  Tendance RSVP (7 jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end h-24 gap-1.5">
                  {rsvpTrend.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full flex flex-col items-center gap-0.5">
                        <div
                          className="w-full bg-[#10B981] rounded-t transition-all duration-500"
                          style={{ height: `${(day.attending / maxRsvp) * 60}px`, minHeight: day.attending > 0 ? '4px' : '0px' }}
                        />
                        <div
                          className="w-full bg-red-400 rounded-b transition-all duration-500"
                          style={{ height: `${(day.declined / maxRsvp) * 60}px`, minHeight: day.declined > 0 ? '4px' : '0px' }}
                        />
                      </div>
                      <span className="text-[8px] text-gray-400 mt-1 truncate w-full text-center">
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    ✅ Confirmés
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    ❌ Refusés
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-[#1E3A8A] flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#F59E0B]" />
                  Activité des invitations (7 jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end h-24 gap-1.5">
                  {invitationTrend.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full flex flex-col items-center gap-0.5">
                        <div
                          className="w-full bg-[#1E3A8A] rounded-t transition-all duration-500"
                          style={{ height: `${(day.sent / maxInv) * 60}px`, minHeight: day.sent > 0 ? '4px' : '0px' }}
                        />
                        <div
                          className="w-full bg-[#F59E0B] rounded-b transition-all duration-500"
                          style={{ height: `${(day.responded / maxInv) * 60}px`, minHeight: day.responded > 0 ? '4px' : '0px' }}
                        />
                      </div>
                      <span className="text-[8px] text-gray-400 mt-1 truncate w-full text-center">
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-2 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#1E3A8A]" />
                    📤 Envoyées
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    📥 Répondues
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <StaggeredContainer className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <QuickAction icon={<Share2 className="w-5 h-5" />} label="Partager" href={`/fr/events/${selectedEvent.id}/share`} color="blue" />
            <QuickAction icon={<Download className="w-5 h-5" />} label="PDF" href={`/fr/events/${selectedEvent.id}/pdf`} color="green" />
            <QuickAction icon={<Users className="w-5 h-5" />} label="Invités" href={`/fr/events/${selectedEvent.id}/qr`} color="orange" />
          </StaggeredContainer>

          {/* Boutons d'action */}
          <AnimatedSection delay={0.3} className="flex flex-wrap gap-3 mb-6">
            <Link href={`/fr/events/${selectedEvent.id}/pdf`}>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                <FileText className="w-4 h-4 mr-2" />
                PDF imprimable
              </Button>
            </Link>

            {!isVipPlan && nextPlan && (
              <Link href={upgradeHref}>
                <Button className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-semibold shadow-md shadow-[#F59E0B]/20 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Passer à {nextPlan.label}
                </Button>
              </Link>
            )}

            {isVipPlan && (
              <div className="flex items-center gap-2 bg-[#10B981]/20 backdrop-blur-sm text-[#10B981] px-4 py-2 rounded-lg text-sm font-semibold">
                <Crown className="w-4 h-4" />
                VIP activé • Invités illimités
              </div>
            )}
          </AnimatedSection>

          {/* Invitations récentes */}
          <AnimatedSection delay={0.4}>
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-[#1E3A8A]">Dernières réponses</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEventData ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                  </div>
                ) : recentInvitations.length > 0 ? (
                  <div className="space-y-3">
                    {recentInvitations.map((invitation, index) => (
                      <motion.div
                        key={invitation.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-[#1E3A8A]">
                            {invitation.recipient_name || 'Invité'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(invitation.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invitation.status === 'responded'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invitation.status === 'responded' ? 'Répondu' : 'En attente'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucune invitation envoyée pour le moment
                  </p>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Mes reçus */}
          {receipts.length > 0 && (
            <AnimatedSection delay={0.5}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 mt-6">
                <CardHeader>
                  <CardTitle className="text-lg text-[#1E3A8A]">Mes reçus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {receipts.map((receipt) => (
                      <div
                        key={receipt.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-[#1E3A8A] capitalize">
                            {receipt.plan_type} {receipt.events?.name ? `— ${receipt.events.name}` : ''}
                          </p>
                          <p className="text-xs text-gray-500">
                            {receipt.completed_at && new Date(receipt.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {' • '}{receipt.final_amount} {receipt.currency || 'FCFA'}
                          </p>
                        </div>
                        <a
                          href={`/api/payments/${receipt.id}/receipt`}
                          className="flex items-center gap-1.5 text-sm font-medium text-[#1E3A8A] hover:underline shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Télécharger
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </div>
      </div>
    </BackgroundImage>
  )
}

// Composants auxiliaires (inchangés)
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'green' | 'red' | 'orange'
}) {
  const colors = {
    blue: 'bg-[#1E3A8A]/20 text-[#1E3A8A] backdrop-blur-sm',
    green: 'bg-[#10B981]/20 text-[#10B981] backdrop-blur-sm',
    red: 'bg-red-500/20 text-red-600 backdrop-blur-sm',
    orange: 'bg-[#F59E0B]/20 text-[#F59E0B] backdrop-blur-sm',
  }

  return (
    <motion.div variants={staggerItem}>
      <Card className="bg-white/95 backdrop-blur-sm border-0">
        <CardContent className="p-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${colors[color]}`}>
            {icon}
          </div>
          <p className="text-2xl font-bold text-[#1E3A8A]">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickAction({ icon, label, href, color }: {
  icon: React.ReactNode
  label: string
  href: string
  color: 'blue' | 'green' | 'orange'
}) {
  const colors = {
    blue: 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white',
    green: 'bg-[#10B981] hover:bg-[#10B981]/90 text-white',
    orange: 'bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A]',
  }

  return (
    <motion.div variants={staggerItem}>
      <Link href={href}>
        <Card className={`${colors[color]} border-0 cursor-pointer transition-colors`}>
          <CardContent className="flex flex-col items-center justify-center py-4">
            {icon}
            <span className="text-xs font-medium mt-1">{label}</span>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
