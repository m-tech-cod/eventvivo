'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check, Star, Sparkles, Crown, Users, Shield, HeartHandshake } from 'lucide-react'
import { BounceOnHover } from '@/components/ui/animations'

export function PricingSection() {
  const [currency, setCurrency] = useState<'fcfa' | 'eur' | 'usd'>('fcfa')

  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price_fcfa: 0,
      price_eur: 0,
      price_usd: 0,
      guests: '10 invités',
      description: 'Pour tester Eventvivo',
      features: [
        'Lien RSVP partageable',
        'Miniature de la photo',
        'Tableau de bord basique',
        '1 style d\'invitation',
      ],
      icon: <Star className="w-5 h-5" />,
      iconColor: '#6B7280',
      popular: false,
      button: 'Commencer gratuitement',
      buttonStyle: 'outline-blue',
    },
    {
      id: 'standard',
      name: 'Standard',
      price_fcfa: 2000,
      price_eur: 9.99,
      price_usd: 9.99,
      guests: '100 invités',
      description: 'Pour les petits événements',
      features: [
        'RSVP avec miniature',
        'Tableau statistique',
        'Export PDF (1, 4, 10 cartes)',
        '5 styles d\'invitation',
      ],
      icon: <Sparkles className="w-5 h-5" />,
      iconColor: '#1E3A8A',
      popular: true,
      button: 'Choisir Standard',
      buttonStyle: 'gold',
    },
    {
      id: 'prestige',
      name: 'Prestige',
      price_fcfa: 5000,
      price_eur: 19.99,
      price_usd: 19.99,
      guests: '500 invités',
      description: 'Pour les grands événements',
      features: [
        'QR Codes sécurisés',
        'Export Excel + PDF HD',
        '50 styles premium',
        'Contrôle d\'accès',
      ],
      icon: <Crown className="w-5 h-5" />,
      iconColor: '#F59E0B',
      popular: false,
      button: 'Choisir Prestige',
      buttonStyle: 'outline-blue',
    },
    {
      id: 'vip',
      name: 'VIP',
      price_fcfa: 10000,
      price_eur: 39.99,
      price_usd: 39.99,
      guests: 'Illimité',
      description: 'Pour les organisateurs pro',
      features: [
        'Invités illimités',
        'Support prioritaire WhatsApp',
        'Sans mention "Propulsé par"',
        'Tout Prestige inclus',
      ],
      icon: <Users className="w-5 h-5" />,
      iconColor: '#10B981',
      popular: false,
      button: 'Choisir VIP',
      buttonStyle: 'outline-blue',
    },
  ]

  const getPrice = (plan: typeof plans[0]) => {
    if (currency === 'fcfa') return { price: plan.price_fcfa, symbol: 'FCFA' }
    if (currency === 'eur') return { price: plan.price_eur, symbol: '€' }
    return { price: plan.price_usd, symbol: '$' }
  }

  const buttonClass = (style: string) => {
    if (style === 'gold') return 'bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-bold shadow-md shadow-[#F59E0B]/20 hover:shadow-lg'
    if (style === 'outline-blue') return 'bg-white hover:bg-[#1E3A8A] text-[#1E3A8A] hover:text-white border-2 border-[#1E3A8A]/30 hover:border-[#1E3A8A] transition-all duration-300'
    return ''
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#10B981] mb-3">
            Tarifs
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] font-poppins mb-4">
            Simple et transparent
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            Choisissez le forfait qui correspond à votre événement. Changez à tout moment.
          </p>

          {/* Sélecteur devise */}
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
            {(['fcfa', 'eur', 'usd'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currency === curr
                    ? 'bg-[#1E3A8A] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {curr === 'fcfa' ? 'FCFA' : curr === 'eur' ? 'Euro €' : 'USD $'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan, index) => {
            const { price, symbol } = getPrice(plan)

            return (
              <BounceOnHover key={plan.id} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  className={`relative h-full rounded-2xl flex flex-col p-6 transition-all duration-300 ${
                    plan.popular
                      ? 'border-2 border-[#F59E0B] shadow-xl shadow-[#F59E0B]/10 bg-white'
                      : 'border-2 border-gray-100 hover:border-[#1E3A8A]/20 hover:shadow-lg bg-white'
                  }`}
                >
                  {/* Badge populaire */}
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F59E0B] text-[#1E3A8A] px-4 py-1 text-xs font-bold rounded-full whitespace-nowrap shadow-sm">
                      ⭐ Le plus choisi
                    </div>
                  )}

                  {/* Icône + nom */}
                  <div className="flex items-center gap-2 mb-4 mt-2">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${plan.iconColor}15`, color: plan.iconColor }}
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <p className="font-bold text-[#1E3A8A] text-sm">{plan.name}</p>
                      <p className="text-gray-400 text-xs">{plan.description}</p>
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#1E3A8A]">
                        {price === 0 ? 'Gratuit' : price.toLocaleString()}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-gray-400 font-medium">{symbol}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {plan.guests === 'Illimité' ? '♾️ Invités illimités' : `👥 Jusqu'à ${plan.guests}`}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-[#10B981] flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link href={`/fr/events/choose-plan?plan=${plan.id}`} className="block">
                    <Button className={`w-full rounded-xl py-5 text-sm ${buttonClass(plan.buttonStyle)}`}>
                      {plan.button}
                    </Button>
                  </Link>
                </motion.div>
              </BounceOnHover>
            )
          })}
        </div>

        {/* Ligne réassurance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-gray-400"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#10B981]" />
            Paiement sécurisé via FedaPay
          </span>
          <span className="flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-[#1E3A8A]" />
            Annulation à tout moment
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            Passage au forfait supérieur à tout moment
          </span>
        </motion.div>
      </div>
    </section>
  )
}
