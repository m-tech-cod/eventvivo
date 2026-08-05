'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Sparkles, Users, Crown, Star, Loader2 } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price_fcfa: 0,
    price_eur: 0,
    price_usd: 0,
    guests: 10,
    styles: 1,
    features: ['Lien RSVP', 'Miniature de la photo', 'Tableau de bord basique'],
    isPopular: false,
    icon: <Star className="w-6 h-6 text-gray-400" />,
    badge: null,
  },
  {
    id: 'standard',
    name: 'Standard',
    price_fcfa: 2000,
    price_eur: 9.99,
    price_usd: 9.99,
    guests: 100,
    styles: 5,
    features: ['RSVP avec miniature', 'Tableau statistique', 'Export PDF'],
    isPopular: true,
    icon: <Sparkles className="w-6 h-6 text-[#1E3A8A]" />,
    badge: '⭐ Populaire',
  },
  {
    id: 'prestige',
    name: 'Prestige',
    price_fcfa: 5000,
    price_eur: 19.99,
    price_usd: 19.99,
    guests: 500,
    styles: 50,
    features: ['Tout Standard + QR Codes', 'Export Excel', 'PDF HD'],
    isPopular: false,
    icon: <Crown className="w-6 h-6 text-[#F59E0B]" />,
    badge: '👑 Prestige',
  },
  {
    id: 'vip',
    name: 'VIP / Illimité',
    price_fcfa: 10000,
    price_eur: 39.99,
    price_usd: 39.99,
    guests: 0,
    styles: 50,
    features: ['Tout Prestige', 'Support prioritaire WhatsApp', 'Sans mention "Propulsé par"'],
    isPopular: false,
    icon: <Users className="w-6 h-6 text-[#10B981]" />,
    badge: '🌟 VIP',
  },
]

export default function ChoosePlanPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const upgradeEventId = searchParams.get('upgrade') // présent si on vient de dashboard/edit pour upgrader un événement existant
  const requestedPlan = searchParams.get('plan')
  // Présélection : le plan demandé dans l'URL, sinon le plan populaire (Standard)
  // par défaut — évite un clic de friction supplémentaire avant "Continuer".
  const [selectedPlan, setSelectedPlan] = useState<string | null>(requestedPlan || 'standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChoosePlan = async () => {
    if (!selectedPlan) {
      setError('Veuillez sélectionner un forfait')
      return
    }

    if (!user) {
      router.push('/fr/auth/login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const plan = plans.find(p => p.id === selectedPlan)
      if (!plan) throw new Error('Plan non trouvé')

      if (plan.id === 'free') {
        router.push(`/fr/events/create?plan=${plan.id}`)
        return
      }

      const checkoutUrl = upgradeEventId
        ? `/fr/events/checkout?plan=${plan.id}&upgrade=${upgradeEventId}`
        : `/fr/events/checkout?plan=${plan.id}`

      router.push(checkoutUrl)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [currency, setCurrency] = useState<'fcfa' | 'eur' | 'usd'>('fcfa')

  const getPrice = (plan: any) => {
    if (currency === 'fcfa') return { price: plan.price_fcfa, symbol: 'FCFA' }
    if (currency === 'eur') return { price: plan.price_eur, symbol: '€' }
    return { price: plan.price_usd, symbol: '$' }
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 py-12 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins drop-shadow-lg">
              {upgradeEventId ? 'Passer à un forfait supérieur' : 'Choisissez votre forfait'}
            </h1>
            <p className="text-white/80 mt-2 drop-shadow">
              {upgradeEventId
                ? 'Débloquez plus de fonctionnalités pour votre événement'
                : 'Sélectionnez le plan qui correspond à votre événement'}
            </p>
          </motion.div>

          {/* Sélecteur de devise */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center gap-4 mb-8 flex-wrap"
          >
            {['fcfa', 'eur', 'usd'].map((cur) => (
              <button
                key={cur}
                onClick={() => setCurrency(cur as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currency === cur
                    ? 'bg-[#F59E0B] text-[#1E3A8A]'
                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
              >
                {cur === 'fcfa' ? 'FCFA' : cur === 'eur' ? 'Euro (€)' : 'USD ($)'}
              </button>
            ))}
          </motion.div>

          {/* Grille des forfaits */}
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.filter((p) => !upgradeEventId || p.id !== 'free').map((plan, index) => {
              const isSelected = selectedPlan === plan.id
              const { price, symbol } = getPrice(plan)
              const perGuest = price > 0 && plan.guests > 0 ? price / plan.guests : null

              return (
                <motion.div key={plan.id} variants={staggerItem} className="h-full">
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-2xl h-full backdrop-blur-sm ${
                      isSelected
                        ? plan.isPopular
                          ? 'border-2 border-[#F59E0B] shadow-2xl shadow-[#F59E0B]/30 bg-white lg:scale-105'
                          : 'border-2 border-[#F59E0B] shadow-lg bg-white/95'
                        : 'border-2 border-white/20 hover:border-[#F59E0B]/50 bg-white/80'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {plan.icon}
                          <CardTitle className="text-lg text-[#1E3A8A]">{plan.name}</CardTitle>
                        </div>
                        {plan.badge && (
                          <span className="text-xs font-semibold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-1 rounded-full">
                            {plan.badge}
                          </span>
                        )}
                        {isSelected && (
                          <div className="w-6 h-6 bg-[#F59E0B] rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-[#1E3A8A]" />
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <span className="text-3xl font-bold text-[#1E3A8A]">
                          {price === 0 ? 'Gratuit' : `${price} ${symbol}`}
                        </span>
                        {plan.price_fcfa > 0 && currency === 'fcfa' && (
                          <p className="text-sm text-gray-400">TTC</p>
                        )}
                      </div>
                      <CardDescription>
                        {plan.guests === 0 ? 'Invités illimités' : `Jusqu'à ${plan.guests} invités`}
                      </CardDescription>
                      {perGuest !== null && (
                        <p className="text-[11px] text-[#10B981] font-medium">
                          ≈ {perGuest < 1 ? perGuest.toFixed(2) : Math.round(perGuest)} {symbol} / invité
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-gray-600">
                            <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </StaggeredContainer>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400 rounded-lg text-white text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={handleChoosePlan}
              disabled={!selectedPlan || loading}
              className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-bold px-12 py-6 text-lg rounded-xl shadow-lg shadow-[#F59E0B]/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : (
                `Continuer avec ${plans.find(p => p.id === selectedPlan)?.name || ''} →`
              )}
            </Button>
            <p className="text-xs text-white/60 mt-4 drop-shadow">
              Paiement sécurisé par FedaPay
            </p>
          </motion.div>
        </div>
      </div>
    </BackgroundImage>
  )
}