'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Star, TrendingUp, ArrowLeft, UserPlus, CreditCard } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    ambassadors: 0,
    feedbacks: 0,
    totalSales: 0,
    pendingFeedbacks: 0,
    totalUsers: 0,
    totalPayments: 0,
  })

  const [registrations, setRegistrations] = useState<{ date: string; count: number }[]>([])
  const [salesData, setSalesData] = useState<{ date: string; amount: number }[]>([])
  const [recentPayments, setRecentPayments] = useState<any[]>([])
  const [paymentStats, setPaymentStats] = useState({ total: 0, completed: 0, pending: 0, failed: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/fr/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/fr/dashboard')
        return
      }

      const { count: ambassadorsCount } = await supabase
        .from('ambassadors')
        .select('*', { count: 'exact', head: true })

      const { count: feedbacksCount } = await supabase
        .from('feedbacks')
        .select('*', { count: 'exact', head: true })

      const { count: pendingCount } = await supabase
        .from('feedbacks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new')

      const { data: payments } = await supabase
        .from('payments')
        .select('final_amount, status, created_at, plan_type, user_id, profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false })

      // ✅ Seuls les paiements réellement confirmés comptent comme "ventes"
      const completedPayments = payments?.filter(p => p.status === 'completed') || []
      const totalSales = completedPayments.reduce((sum, p) => sum + p.final_amount, 0)

      const completed = completedPayments.length
      const pending = payments?.filter(p => p.status === 'pending').length || 0
      const failed = payments?.filter(p => p.status === 'failed').length || 0

      setPaymentStats({ total: payments?.length || 0, completed, pending, failed })
      setRecentPayments(payments?.slice(0, 10) || [])

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: profiles } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString())

      const registrationsByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const count = profiles?.filter(p => p.created_at.split('T')[0] === dateStr).length || 0
        return { date: dateStr, count }
      }).reverse()

      setRegistrations(registrationsByDay)

      const salesByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const amount = completedPayments
          .filter(p => p.created_at.split('T')[0] === dateStr)
          .reduce((sum, p) => sum + p.final_amount, 0)
        return { date: dateStr, amount }
      }).reverse()

      setSalesData(salesByDay)

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      setStats({
        ambassadors: ambassadorsCount || 0,
        feedbacks: feedbacksCount || 0,
        totalSales: totalSales,
        pendingFeedbacks: pendingCount || 0,
        totalUsers: totalUsers || 0,
        totalPayments: payments?.length || 0,
      })

      setLoading(false)
    }

    fetchStats()
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  const maxRegistrations = Math.max(...registrations.map(d => d.count), 1)
  const maxSales = Math.max(...salesData.map(d => d.amount), 1)

  return (
    <BackgroundImage src="/images/foule.webp" animate="parallax" overlayOpacity={0.3}>
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <h1 className="text-2xl font-bold text-white font-poppins drop-shadow-lg">
              📊 Dashboard Admin
            </h1>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => router.push('/fr/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </motion.div>

          <StaggeredContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCardAdmin
              icon={<Users className="w-6 h-6 text-[#1E3A8A]" />}
              label="Utilisateurs"
              value={stats.totalUsers}
              color="blue"
            />
            <StatCardAdmin
              icon={<UserPlus className="w-6 h-6 text-[#10B981]" />}
              label="Ambassadeurs"
              value={stats.ambassadors}
              color="green"
            />
            <StatCardAdmin
              icon={<CreditCard className="w-6 h-6 text-[#F59E0B]" />}
              label="Paiements"
              value={stats.totalPayments}
              color="orange"
            />
            <StatCardAdmin
              icon={<TrendingUp className="w-6 h-6 text-[#10B981]" />}
              label="Ventes totales (confirmées)"
              value={`${stats.totalSales.toFixed(0)} FCFA`}
              color="green"
            />
          </StaggeredContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-[#1E3A8A] flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#10B981]" />
                  Inscriptions (7 jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end h-32 gap-2">
                  {registrations.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-[#1E3A8A] rounded-t transition-all duration-500"
                        style={{
                          height: `${(day.count / maxRegistrations) * 100}%`,
                          minHeight: day.count > 0 ? '8px' : '0px'
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </span>
                      <span className="text-xs font-bold text-[#1E3A8A]">{day.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle className="text-lg text-[#1E3A8A] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  Ventes confirmées (7 jours)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end h-32 gap-2">
                  {salesData.map((day, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-[#F59E0B] rounded-t transition-all duration-500"
                        style={{
                          height: `${(day.amount / maxSales) * 100}%`,
                          minHeight: day.amount > 0 ? '8px' : '0px'
                        }}
                      />
                      <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                        {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                      </span>
                      <span className="text-xs font-bold text-[#F59E0B]">{day.amount.toFixed(0)} FCFA</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-[#10B981]">{paymentStats.completed}</p>
                <p className="text-xs text-gray-500">✅ Payés</p>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-[#F59E0B]">{paymentStats.pending}</p>
                <p className="text-xs text-gray-500">⏳ En attente</p>
              </CardContent>
            </Card>
            <Card className="bg-white/95 backdrop-blur-sm border-0">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-500">{paymentStats.failed}</p>
                <p className="text-xs text-gray-500">❌ Échoués</p>
              </CardContent>
            </Card>
          </div>

          <AnimatedSection delay={0.3}>
            <Card className="bg-white/95 backdrop-blur-sm border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-[#1E3A8A]">📋 Dernières transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {recentPayments.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Aucune transaction</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-500 font-medium">Utilisateur</th>
                          <th className="text-left py-2 text-gray-500 font-medium">Plan</th>
                          <th className="text-left py-2 text-gray-500 font-medium">Montant</th>
                          <th className="text-left py-2 text-gray-500 font-medium">Statut</th>
                          <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPayments.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 text-[#1E3A8A]">
                              {payment.profiles?.first_name} {payment.profiles?.last_name}
                            </td>
                            <td className="py-2 capitalize">{payment.plan_type || 'N/A'}</td>
                            <td className="py-2 font-medium">{payment.final_amount} FCFA</td>
                            <td className="py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                payment.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : payment.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {payment.status === 'completed' ? '✅ Payé' :
                                 payment.status === 'pending' ? '⏳ En attente' : '❌ Échoué'}
                              </span>
                            </td>
                            <td className="py-2 text-gray-500">
                              {new Date(payment.created_at).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:shadow-xl transition-all bg-white/95 backdrop-blur-sm border-0"
                onClick={() => router.push('/fr/admin/ambassadors')}
              >
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-[#1E3A8A] mx-auto mb-3" />
                  <h3 className="font-semibold text-[#1E3A8A]">Gestion des ambassadeurs</h3>
                  <p className="text-sm text-gray-500">Créer, modifier, consulter les ambassadeurs</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-xl transition-all bg-white/95 backdrop-blur-sm border-0"
                onClick={() => router.push('/fr/admin/feedback')}
              >
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 text-[#F59E0B] mx-auto mb-3" />
                  <h3 className="font-semibold text-[#1E3A8A]">Gestion des feedbacks</h3>
                  <p className="text-sm text-gray-500">Consulter et traiter les retours utilisateurs</p>
                </CardContent>
              </Card>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}

function StatCardAdmin({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string | number
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
        <CardContent className="p-4 text-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${colors[color]}`}>
            {icon}
          </div>
          <p className="text-2xl font-bold text-[#1E3A8A]">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
