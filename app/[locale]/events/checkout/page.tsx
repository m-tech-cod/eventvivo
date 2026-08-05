'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, CheckCircle, XCircle, ShieldCheck, Sparkles, Check } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'
import { getCurrencyByCountry, getPriceForCurrency, getCurrencySymbol } from '@/lib/utils/currency'

// ✅ Configuration des plans
const PLANS = {
  free: { label: 'Gratuit', priceFcfa: 0, priceEur: 0, priceUsd: 0, features: ['Lien RSVP partageable', 'Tableau de bord basique'] },
  standard: {
    label: 'Standard',
    priceFcfa: 2000,
    priceEur: 9.99,
    priceUsd: 9.99,
    features: ['Jusqu\'à 100 invités', 'Tableau statistique', 'Export PDF', '5 styles d\'invitation'],
  },
  prestige: {
    label: 'Prestige',
    priceFcfa: 5000,
    priceEur: 19.99,
    priceUsd: 19.99,
    features: ['Jusqu\'à 500 invités', 'QR Codes sécurisés', 'Export Excel + PDF HD', '50 styles premium'],
  },
  vip: {
    label: 'VIP / Illimité',
    priceFcfa: 10000,
    priceEur: 39.99,
    priceUsd: 39.99,
    features: ['Invités illimités', 'Support prioritaire WhatsApp', 'Sans mention "Propulsé par"', 'Tout Prestige inclus'],
  },
}

const PLAN_ORDER = ['free', 'standard', 'prestige', 'vip'] as const

type PaymentMethod = 'mobile_money' | 'card'

export default function CheckoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const planType = searchParams.get('plan') || 'standard'
  const upgradeEventId = searchParams.get('upgrade') // présent si on upgrade un événement existant (depuis edit/page.tsx)

  const [loading, setLoading] = useState(true)
  const [submittingMethod, setSubmittingMethod] = useState<PaymentMethod | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currency, setCurrency] = useState('USD')
  const [price, setPrice] = useState(0)
  const [symbol, setSymbol] = useState('$')

  // ✅ Code promo
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)
  const [originalPrice, setOriginalPrice] = useState(0)

  const plan = PLANS[planType as keyof typeof PLANS] || PLANS.standard
  const submitting = submittingMethod !== null

  // ✅ Upsell : propose le forfait juste au-dessus, avec le delta de prix réel
  // (calculé, jamais inventé) — le saut Standard → Prestige ne coûte souvent
  // que quelques milliers de FCFA de plus pour 5x plus d'invités.
  const currentIndex = PLAN_ORDER.indexOf(planType as typeof PLAN_ORDER[number])
  const nextPlanType = currentIndex >= 0 && currentIndex < PLAN_ORDER.length - 1 ? PLAN_ORDER[currentIndex + 1] : null
  const nextPlan = nextPlanType ? PLANS[nextPlanType] : null
  const nextPlanPrice = nextPlanType ? getPriceForCurrency(currency, nextPlanType) : null
  const upsellDelta = nextPlanPrice !== null ? Math.round((nextPlanPrice - originalPrice) * 100) / 100 : null

  const switchToPlan = (targetPlan: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('plan', targetPlan)
    router.replace(`/fr/events/checkout?${params.toString()}`)
  }

  // Détection de la devise par géolocalisation IP — une seule fois au montage.
  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        setCurrency(getCurrencyByCountry(data.country_code))
      } catch {
        setCurrency('USD')
      }
      setLoading(false)
    }

    detectCurrency()
  }, [])

  // Synchronise le prix affiché avec la devise, le plan choisi (via l'upsell
  // ou le sélecteur) et une éventuelle réduction déjà appliquée — source
  // unique de vérité pour éviter qu'un changement de plan n'efface
  // silencieusement le code promo actif.
  useEffect(() => {
    const basePrice = getPriceForCurrency(currency, planType)
    setOriginalPrice(basePrice)
    setSymbol(getCurrencySymbol(currency))

    const computedFinal = promoApplied && discountPercent > 0
      ? Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100
      : basePrice

    setPrice(basePrice)
    setFinalPrice(computedFinal)
  }, [currency, planType, promoApplied, discountPercent])

  // ✅ Validation du code promo
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo')
      return
    }

    setPromoLoading(true)
    setPromoError(null)

    try {
      const response = await fetch('/api/ambassadors/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promo_code: promoCode }),
      })

      const result = await response.json()

      if (!response.ok || !result.valid) {
        setPromoError(result.error || 'Code promo invalide')
        setPromoLoading(false)
        return
      }

      const discount = result.discount_percent ?? 10
      setDiscountPercent(discount)
      setPromoApplied(true)
      setAmbassadorId(result.ambassador_id)
      setPromoError(result.already_referred ? result.message : null)
      setPromoError(null)
    } catch {
      setPromoError('Erreur lors de la validation du code')
    } finally {
      setPromoLoading(false)
    }
  }

  const removePromoCode = () => {
    setPromoApplied(false)
    setPromoCode('')
    setAmbassadorId(null)
    setPromoError(null)
    setDiscountPercent(0)
  }

  // ✅ Paiement — un seul clic sur un moyen de paiement suffit à lancer la redirection FedaPay
  const handlePayment = async (method: PaymentMethod) => {
    setError(null)
    setSubmittingMethod(method)

    try {
      // Règle métier : seul le plan Gratuit est limité à 1 événement actif/à venir
      // à la fois. Les plans payants sont illimités (même règle que le trigger SQL
      // et que app/[locale]/events/create/page.tsx).
      if (planType === 'free') {
        const today = new Date().toISOString().split('T')[0]

        const { data: existingFreeEvent } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', user?.id)
          .eq('plan_type', 'free')
          .eq('status', 'active')
          .gte('date', today)
          .maybeSingle()

        if (existingFreeEvent) {
          setError('Vous avez déjà un événement gratuit actif ou à venir. Choisissez un forfait payant pour créer un nouvel événement dès maintenant.')
          setSubmittingMethod(null)
          return
        }
      }

      const payload = {
        event_id: upgradeEventId || 'pending', // événement existant si upgrade, sinon sera créé après paiement
        amount: finalPrice,
        currency: currency,
        payment_method: method,
        promo_code: promoApplied ? promoCode : null,
        ambassador_id: ambassadorId,
        plan_type: planType,
      }

      const response = await fetch('/api/payments/fedapay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Erreur de paiement')
        setSubmittingMethod(null)
        return
      }

      if (data.payment_url) {
        window.location.href = data.payment_url
      } else {
        setError('Lien de paiement introuvable, veuillez réessayer.')
        setSubmittingMethod(null)
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setSubmittingMethod(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  const hasDiscount = promoApplied && discountPercent > 0

  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="mb-4 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </motion.div>

          <AnimatedSection>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="flex justify-center mb-2"
                >
                  <span className="text-4xl">💳</span>
                </motion.div>
                <CardTitle className="text-2xl text-[#1E3A8A] text-center font-poppins">
                  Paiement
                </CardTitle>

                <CardDescription className="text-center">
                  {plan.label} — {originalPrice} {symbol}
                </CardDescription>
              </CardHeader>

              {/* Sélecteur de devise */}
              <div className="flex justify-center gap-2 -mt-2 mb-6">
                {['XOF', 'EUR', 'USD'].map((cur) => (
                  <button
                    key={cur}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      currency === cur
                        ? 'bg-[#1E3A8A] text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    onClick={() => setCurrency(cur)}
                  >
                    {cur === 'XOF' ? 'FCFA' : cur === 'EUR' ? '€' : '$'}
                  </button>
                ))}
              </div>

              <CardContent className="space-y-6">
                {/* Prix */}
                <div className="text-center p-2 bg-[#1E3A8A]/5 rounded-lg border border-[#1E3A8A]/10">
                  {hasDiscount ? (
                    <>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-xl text-gray-400 line-through">
                          {originalPrice} {symbol}
                        </span>
                        <span className="text-3xl font-bold text-[#10B981]">
                          {finalPrice} {symbol}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 mt-1 bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full text-xs font-medium">
                        -{discountPercent}%
                      </div>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-[#1E3A8A]">
                      {finalPrice} {symbol}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 -mt-1">Paiement unique</p>
                </div>

                {/* Récap de ce qui est inclus — rassure au moment où le doute
                    apparaît le plus (juste avant de sortir la carte/le mobile money) */}
                <div className="space-y-1.5 bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wide">
                    Inclus dans {plan.label}
                  </p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nudge d'upsell — montre l'écart de prix réel vers le forfait
                    supérieur pendant que l'utilisateur a déjà sa carte/son
                    mobile money en main. */}
                {nextPlan && upsellDelta !== null && (
                  <motion.button
                    type="button"
                    onClick={() => switchToPlan(nextPlanType!)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full text-left p-3 rounded-lg border-2 border-dashed border-[#F59E0B]/50 bg-[#F59E0B]/5 hover:bg-[#F59E0B]/10 hover:border-[#F59E0B] transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                      <span className="text-sm text-gray-700">
                        <span className="font-semibold text-[#1E3A8A]">Passer à {nextPlan.label}</span>
                        {' '}pour seulement{' '}
                        <span className="font-semibold text-[#F59E0B]">+{upsellDelta} {symbol}</span>
                      </span>
                    </div>
                    <span className="text-xs font-medium text-[#1E3A8A] whitespace-nowrap">Changer →</span>
                  </motion.button>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* CODE PROMO */}
                <div className="space-y-2 border-t border-gray-200 pt-4">
                  <Label htmlFor="promo_code" className="text-sm font-medium text-[#1E3A8A]">
                    Code promo
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo_code"
                      placeholder="Ex: BINT2025"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={promoApplied || promoLoading}
                      className="flex-1 uppercase"
                    />
                    {promoApplied ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={removePromoCode}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Retirer
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/10"
                        onClick={applyPromoCode}
                        disabled={promoLoading || !promoCode.trim()}
                      >
                        {promoLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Appliquer'
                        )}
                      </Button>
                    )}
                  </div>
                  {promoError && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {promoError}
                    </p>
                  )}
                  {promoApplied && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Réduction de {discountPercent}% appliquée !
                    </p>
                  )}
                </div>

                {/* Méthode de paiement — FedaPay gère Mobile Money ET Carte bancaire,
                    quelle que soit la devise choisie (utile pour les clients à l'international) */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                  <p className="font-medium text-[#1E3A8A] text-sm">
                    Choisissez votre moyen de paiement pour continuer
                  </p>

                  <button
                    className="w-full p-4 rounded-lg border-2 border-gray-200 text-left transition-colors hover:border-[#1E3A8A]/50 hover:bg-[#1E3A8A]/5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between"
                    onClick={() => handlePayment('mobile_money')}
                    disabled={submitting}
                  >
                    <div>
                      <span className="font-medium">📱 Mobile Money</span>
                      <p className="text-xs text-gray-500">MTN, Orange, Moov</p>
                    </div>
                    {submittingMethod === 'mobile_money' && (
                      <Loader2 className="w-5 h-5 animate-spin text-[#1E3A8A]" />
                    )}
                  </button>

                  <button
                    className="w-full p-4 rounded-lg border-2 border-gray-200 text-left transition-colors hover:border-[#1E3A8A]/50 hover:bg-[#1E3A8A]/5 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between"
                    onClick={() => handlePayment('card')}
                    disabled={submitting}
                  >
                    <div>
                      <span className="font-medium">💳 Carte bancaire</span>
                      <p className="text-xs text-gray-500">Visa, Mastercard</p>
                    </div>
                    {submittingMethod === 'card' && (
                      <Loader2 className="w-5 h-5 animate-spin text-[#1E3A8A]" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  <span>Paiement sécurisé via FedaPay. Vous serez redirigé automatiquement.</span>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}
