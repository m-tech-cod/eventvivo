'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Star, Sparkles, Crown, Users } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

export default function PricingPage() {
  const [currency, setCurrency] = useState<'fcfa' | 'eur' | 'usd'>('fcfa')

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price_fcfa: 0,
      price_eur: 0,
      price_usd: 0,
      guests: '10 invités',
      features: ['Lien RSVP', 'Miniature de la photo', 'Tableau de bord basique', '1 style'],
      icon: <Star className="w-5 h-5 text-gray-400" />,
      popular: false,
      color: 'border-gray-200',
      button: 'Commencer gratuitement',
    },
    {
      id: 'standard',
      name: 'Standard',
      price_fcfa: 2000,
      price_eur: 9.99,
      price_usd: 9.99,
      guests: '100 invités',
      features: ['RSVP avec miniature', 'Tableau statistique', 'Export PDF', '5 styles'],
      icon: <Sparkles className="w-5 h-5 text-[#1E3A8A]" />,
      popular: true,
      color: 'border-[#1E3A8A]',
      button: 'Choisir Standard',
    },
    {
      id: 'prestige',
      name: 'Prestige',
      price_fcfa: 5000,
      price_eur: 19.99,
      price_usd: 19.99,
      guests: '500 invités',
      features: ['QR Codes uniques', 'Export Excel', 'PDF HD', '50 styles premium'],
      icon: <Crown className="w-5 h-5 text-[#F59E0B]" />,
      popular: false,
      color: 'border-[#F59E0B]',
      button: 'Choisir Prestige',
    },
    {
      id: 'vip',
      name: 'VIP / Illimité',
      price_fcfa: 10000,
      price_eur: 39.99,
      price_usd: 39.99,
      guests: '♾️ Illimité',
      features: [
        'Support prioritaire WhatsApp',
        'Sans mention "Propulsé par"',
        'Tout Prestige + VIP'
      ],
      icon: <Users className="w-5 h-5 text-[#10B981]" />,
      popular: false,
      color: 'border-[#10B981]',
      button: 'Choisir VIP',
    },
  ]

  const getPrice = (plan: any) => {
    if (currency === 'fcfa') return { price: plan.price_fcfa, symbol: 'FCFA' }
    if (currency === 'eur') return { price: plan.price_eur, symbol: '€' }
    return { price: plan.price_usd, symbol: '$' }
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 py-12 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white font-poppins mb-4 drop-shadow-lg">
              Tarifs simples et transparents
            </h1>
            <p className="text-white/80 drop-shadow max-w-2xl mx-auto">
              Choisissez le forfait qui correspond à votre événement
            </p>

            {/* Sélecteur de devise */}
            <div className="flex justify-center gap-4 mt-6 flex-wrap">
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
            </div>
          </motion.div>

          {/* Grille des plans */}
          <StaggeredContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const { price, symbol } = getPrice(plan)

              return (
                <motion.div key={plan.id} variants={staggerItem}>
                  <Card
                    className={`relative overflow-hidden transition-all hover:shadow-2xl border-2 backdrop-blur-sm ${
                      plan.popular
                        ? 'border-[#F59E0B] shadow-lg bg-white/95'
                        : `${plan.color} hover:border-[#F59E0B]/50 bg-white/90`
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 right-0 bg-[#F59E0B] text-[#1E3A8A] px-3 py-1 text-xs font-semibold rounded-bl-lg">
                        ⭐ Populaire
                      </div>
                    )}

                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {plan.icon}
                        <CardTitle className="text-lg text-[#1E3A8A]">{plan.name}</CardTitle>
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
                        {plan.guests === '♾️ Illimité' ? '♾️ Illimité' : `👥 ${plan.guests}`}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-600">
                            <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Link href={`/fr/events/choose-plan?plan=${plan.id}`} className="block mt-6">
                        <Button
                          className={`w-full ${
                            plan.popular
                              ? 'bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A]'
                              : plan.id === 'free'
                              ? 'bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white px-4 py-2.5 min-h-[44px] text-sm font-medium'
                              : 'bg-white hover:bg-gray-50 text-[#1E3A8A] border-2 border-[#1E3A8A]'
                          }`}
                        >
                          {plan.button}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </StaggeredContainer>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center text-sm text-white/60 drop-shadow"
          >
            <p>Paiement sécurisé par FedaPay • Mobile Money • Carte bancaire (Visa, Mastercard)</p>
          </motion.div>
        </div>
      </div>
    </BackgroundImage>
  )
}