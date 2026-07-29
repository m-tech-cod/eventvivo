'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCurrencyByCountry, getPriceForCurrency, getCurrencySymbol } from '@/lib/utils/currency'
import { ArrowLeft, Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'

export default function PremiumPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [currency, setCurrency] = useState('USD')
  const [originalPrice, setOriginalPrice] = useState(4.99)
  const [price, setPrice] = useState(4.99)
  const [symbol, setSymbol] = useState('$')
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'card' | 'paypal'>('mobile_money')
  const [error, setError] = useState<string | null>(null)

  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null)
  const [discountPercent, setDiscountPercent] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventData } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      setEvent(eventData)

      if (user){
        const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'ambassador') {
        router.push('/fr/dashboard');
        return;
      }}
        

      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        const countryCode = data.country_code
        const detectedCurrency = getCurrencyByCountry(countryCode)
        setCurrency(detectedCurrency)
        const basePrice = getPriceForCurrency(detectedCurrency)
        setOriginalPrice(basePrice)
        setPrice(basePrice)
        setSymbol(getCurrencySymbol(detectedCurrency))
      } catch {
        setCurrency('USD')
        setOriginalPrice(4.99)
        setPrice(4.99)
        setSymbol('$')
      }

      setLoading(false)
    }

    fetchData()
  }, [eventId, supabase, user, router])

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

    const discount = result.discount_percent || 10
    const newPrice = originalPrice * (1 - (discount / 100))
    setDiscountPercent(discount)
    setPrice(Math.round(newPrice * 100) / 100)
    setPromoApplied(true)
    setAmbassadorId(result.ambassador_id)
    setPromoError(null)

  } catch (err) {
    setPromoError('Erreur lors de la validation du code')
  } finally {
    setPromoLoading(false)
  }
}

  const removePromoCode = () => {
    setPromoApplied(false)
    setPromoCode('')
    setPrice(originalPrice)
    setAmbassadorId(null)
    setPromoError(null)
    setDiscountPercent(0)
  }

  const handlePayment = async () => {
    setError(null)
    setSubmitting(true)

    try {
      const payload = {
        event_id: eventId,
        amount: price,
        currency: currency,
        payment_method: paymentMethod,
        promo_code: promoApplied ? promoCode : null,
        ambassador_id: ambassadorId,
      }

      const endpoint = paymentMethod === 'paypal'
        ? '/api/payments/paypal'
        : '/api/payments/fedapay'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Erreur de paiement')
        setSubmitting(false)
        return
      }

      if (data.payment_url) {
        window.location.href = data.payment_url
      } else if (data.approval_url) {
        window.location.href = data.approval_url
      }

    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  if (!event) {
    return (
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.5} animate="zoom">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">😕</div>
                <h2 className="text-xl font-semibold text-[#1E3A8A] mb-2">Événement non trouvé</h2>
                <Button className="mt-4 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" onClick={() => router.push('/fr/dashboard')}>
                  Retour au dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  if (event.is_premium) {
    return (
      <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35} animate="zoom">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">⭐</div>
                <h2 className="text-xl font-semibold text-[#10B981] mb-2">Déjà Premium !</h2>
                <p className="text-gray-500">Cet événement est déjà en version Premium.</p>
                <Button className="mt-4 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white" onClick={() => router.push('/fr/dashboard')}>
                  Retour au dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  const hasDiscount = promoApplied && discountPercent > 0

  return (
    <BackgroundImage src="/images/foule.webp" overlayOpacity={0.35} animate="zoom">
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
              onClick={() => router.push('/fr/dashboard')}
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
                  <span className="text-4xl">⭐</span>
                </motion.div>
                <CardTitle className="text-2xl text-[#1E3A8A] text-center font-poppins">
                  Passer en Premium
                </CardTitle>
                <CardDescription className="text-center">
                  {event.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-4 bg-[#1E3A8A]/5 rounded-lg border border-[#1E3A8A]/10">
                  {hasDiscount ? (
                    <>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-xl text-gray-400 line-through">
                          {originalPrice} {symbol}
                        </span>
                        <span className="text-3xl font-bold text-[#10B981]">
                          {price} {symbol}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1 mt-1 bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full text-xs font-medium">
                        -{discountPercent}%
                      </div>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-[#1E3A8A]">
                      {price} {symbol}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">Paiement unique</p>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium text-[#1E3A8A]">Ce que vous obtenez :</p>
                  <ul className="space-y-1.5 text-gray-600">
                    <li className="flex items-center gap-2">✅ Invités illimités</li>
                    <li className="flex items-center gap-2">✅ 50 modèles d'invitation</li>
                    <li className="flex items-center gap-2">✅ QR Code</li>
                    <li className="flex items-center gap-2">✅ PDF HD</li>
                    <li className="flex items-center gap-2">✅ Export Excel</li>
                  </ul>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    ❌ {error}
                  </div>
                )}

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
                      className="flex-1 uppercase border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
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

                <div className="space-y-3">
                  <p className="font-medium text-[#1E3A8A] text-sm">Moyen de paiement</p>

                  {(currency === 'XOF' || currency === 'XAF') ? (
                    <>
                      <button
                        className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                          paymentMethod === 'mobile_money'
                            ? 'border-[#1E3A8A] bg-[#1E3A8A]/5'
                            : 'border-gray-200 hover:border-[#1E3A8A]/50'
                        }`}
                        onClick={() => setPaymentMethod('mobile_money')}
                      >
                        <span className="font-medium">📱 Mobile Money</span>
                        <p className="text-xs text-gray-500">MTN, Orange, Moov</p>
                      </button>
                      <button
                        className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                          paymentMethod === 'card'
                            ? 'border-[#1E3A8A] bg-[#1E3A8A]/5'
                            : 'border-gray-200 hover:border-[#1E3A8A]/50'
                        }`}
                        onClick={() => setPaymentMethod('card')}
                      >
                        <span className="font-medium">💳 Carte bancaire</span>
                        <p className="text-xs text-gray-500">Visa, Mastercard</p>
                      </button>
                    </>
                  ) : (
                    <button
                      className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                        paymentMethod === 'paypal'
                          ? 'border-[#1E3A8A] bg-[#1E3A8A]/5'
                          : 'border-gray-200 hover:border-[#1E3A8A]/50'
                      }`}
                      onClick={() => setPaymentMethod('paypal')}
                    >
                      <span className="font-medium">💳 PayPal</span>
                      <p className="text-xs text-gray-500">Paiement international</p>
                    </button>
                  )}
                </div>

                <Button
                  className="w-full bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-semibold py-6 text-lg"
                  onClick={handlePayment}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    `Payer ${price} ${symbol}`
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  Paiement sécurisé. Vous serez redirigé vers la plateforme de paiement.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}