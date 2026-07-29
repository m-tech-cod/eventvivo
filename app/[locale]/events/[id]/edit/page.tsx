'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'

const PLANS = {
  free: { label: 'Gratuit', maxGuests: 10, styles: 1, priceFcfa: 0, priceEur: 0, priceUsd: 0 },
  standard: { label: 'Standard', maxGuests: 100, styles: 5, priceFcfa: 2000, priceEur: 9.99, priceUsd: 9.99 },
  prestige: { label: 'Prestige', maxGuests: 500, styles: 50, priceFcfa: 5000, priceEur: 19.99, priceUsd: 19.99 },
  vip: { label: 'VIP / Illimité', maxGuests: Infinity, styles: 50, priceFcfa: 10000, priceEur: 39.99, priceUsd: 39.99 },
}

const ALL_STYLES = [
  { value: 'classique', label: 'Classique', icon: '🎨', premium: false },
  { value: 'moderne', label: 'Moderne', icon: '✨', premium: false },
  { value: 'nature', label: 'Nature', icon: '🌿', premium: true },
  { value: 'elegant', label: 'Élégant', icon: '💎', premium: true },
  { value: 'luxe', label: 'Luxe', icon: '👑', premium: true },
]

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const eventId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'mariage',
    date: '',
    time: '',
    location: '',
    description: '',
    style: 'classique',
    plan_type: 'free',
    is_qr_active: false,
  })

  useEffect(() => {
    const fetchEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error || !data) {
        setError('Événement non trouvé')
        setLoading(false)
        return
      }

      setEvent(data)
      
      let allowedStyle = data.style || 'classique'
      if (data.plan_type === 'free' && data.style !== 'classique') {
        allowedStyle = 'classique'
      }

      setFormData({
        name: data.name || '',
        type: data.type || 'mariage',
        date: data.date || '',
        time: data.time || '',
        location: data.location || '',
        description: data.description || '',
        style: allowedStyle,
        plan_type: data.plan_type || 'free',
        is_qr_active: data.is_qr_active || false,
      })
      if (data.cover_image) {
        setPreviewUrl(data.cover_image)
      }
      setLoading(false)
    }

    fetchEvent()
  }, [eventId, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      setError('Le fichier doit être une image')
      return
    }
    
    setCoverFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSaving(true)

    try {
      let coverImageUrl = event?.cover_image || null

      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`
        const filePath = `events/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(filePath, coverFile)

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('event-covers')
            .getPublicUrl(filePath)
          coverImageUrl = publicUrl
        }
      }

      // ✅ Vérifier si le plan change vers un plan payant
      const oldPlanType = event?.plan_type
      const newPlanType = formData.plan_type
      const isUpgradeToPaid = oldPlanType !== newPlanType && newPlanType !== 'free'

      const plan = PLANS[formData.plan_type as keyof typeof PLANS]
      const isFreePlan = formData.plan_type === 'free'

      // 1. Mettre à jour l'événement
      const { error: updateError } = await supabase
        .from('events')
        .update({
          name: formData.name,
          type: formData.type,
          date: formData.date,
          time: formData.time || null,
          location: formData.location || null,
          description: formData.description || null,
          cover_image: coverImageUrl,
          style: formData.style,
          plan_type: formData.plan_type,
          is_qr_active: formData.is_qr_active || false,
          is_premium: !isFreePlan,
          max_guests: plan.maxGuests,
          plan_price_fcfa: plan.priceFcfa,
          plan_price_eur: plan.priceEur,
          payment_status: isUpgradeToPaid ? 'pending' : 'paid',
        })
        .eq('id', eventId)

      if (updateError) throw updateError

      // 2. Si upgrade vers un plan payant → rediriger vers paiement
      if (isUpgradeToPaid) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/fr/events/checkout?plan=${newPlanType}&upgrade=${eventId}`)
        }, 1000)
        return
      }

      // 3. Sinon, succès et retour au dashboard
      setSuccess(true)
      setTimeout(() => router.push('/fr/dashboard'), 1500)

    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  const currentPlan = PLANS[formData.plan_type as keyof typeof PLANS] || PLANS.free
  const isFreePlan = formData.plan_type === 'free'
  const isVipPlan = formData.plan_type === 'vip'
  const availableStyles = isFreePlan 
    ? ALL_STYLES.filter(s => !s.premium) 
    : ALL_STYLES

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E3A8A]" />
      </div>
    )
  }

  if (error && !event) {
    return (
      <BackgroundImage src="/images/edit-event-bg.jpg" overlayOpacity={0.3}>
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md"
          >
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-semibold text-white mb-2 drop-shadow">Événement non trouvé</h2>
            <Button className="mt-4 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-semibold" onClick={() => router.push('/fr/dashboard')}>
              Retour au dashboard
            </Button>
          </motion.div>
        </div>
      </BackgroundImage>
    )
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-2xl">
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
                <CardTitle className="text-2xl text-[#1E3A8A] text-center font-poppins">
                  ✏️ Modifier l'événement
                </CardTitle>
                <CardDescription className="text-center">
                  Modifiez les informations de votre événement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className={`mb-4 ${formData.plan_type !== event?.plan_type && formData.plan_type !== 'free' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
                    <AlertDescription className={formData.plan_type !== event?.plan_type && formData.plan_type !== 'free' ? 'text-blue-700' : 'text-green-700'}>
                      {formData.plan_type !== event?.plan_type && formData.plan_type !== 'free' 
                        ? '🔄 Événement mis à jour ! Redirection vers la page de paiement...' 
                        : '✅ Événement modifié avec succès ! Redirection...'}
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Forfait actuel</p>
                      <p className="font-semibold text-[#1E3A8A]">
                        {currentPlan.label}
                        {isVipPlan && ' 👑'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {currentPlan.maxGuests === Infinity 
                          ? '♾️ Invités illimités' 
                          : `👥 ${currentPlan.maxGuests} invités maximum`}
                      </p>
                    </div>
                    {!isVipPlan && (
                      <Link href={`/fr/events/choose-plan?upgrade=${eventId}`}>
                        <Button size="sm" className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A]">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Upgrader
                        </Button>
                      </Link>
                    )}
                    {isVipPlan && (
                      <span className="text-sm font-semibold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full">
                        ✅ Meilleur forfait
                      </span>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom de l'événement *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ex: Mariage de Jean et Marie"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type d'événement *</Label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      required
                    >
                      <option value="mariage">💍 Mariage</option>
                      <option value="anniversaire">🎂 Anniversaire</option>
                      <option value="bapteme">🕊️ Baptême</option>
                      <option value="dots">💎 Dots</option>
                      <option value="ceremonie">🎉 Cérémonie</option>
                      <option value="picnic">🧺 Picnic</option>
                      <option value="ago">🥁 Agô</option>
                      <option value="formation">📚 Formation</option>
                      <option value="lancement">🚀 Lancement de produit</option>
                      <option value="conference">🎤 Conférence</option> 
                      <option value="autre">📌 Autre</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        min="1800-01-01"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Heure</Label>
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Lieu</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Ex: Abidjan, Côte d'Ivoire"
                      value={formData.location}
                      onChange={handleChange}
                      className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={3}
                      placeholder="Décrivez votre événement..."
                      value={formData.description}
                      onChange={handleChange}
                      className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Photo de couverture</Label>
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    />
                    <p className="text-xs text-gray-500">Format recommandé : 1200×630px (16:9) - Max 5 Mo</p>
                    {previewUrl && (
                      <div className="mt-2 relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={previewUrl} 
                          alt="Aperçu" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Style d'invitation</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {availableStyles.map((style) => {
                        const isLocked = style.premium && isFreePlan
                        return (
                          <button
                            key={style.value}
                            type="button"
                            disabled={isLocked}
                            onClick={() => setFormData({ ...formData, style: style.value })}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              formData.style === style.value
                                ? 'border-[#1E3A8A] bg-[#1E3A8A]/5'
                                : 'border-gray-200 hover:border-[#1E3A8A]/50'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="text-2xl">{style.icon}</div>
                            <div className="text-xs font-medium text-[#1E3A8A]">{style.label}</div>
                            {style.premium && (
                              <div className="text-[10px] text-[#F59E0B] font-semibold">
                                {!isFreePlan ? '⭐' : '🔒 Premium'}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-500">
                      {isFreePlan 
                        ? 'Passez à Standard, Prestige ou VIP pour débloquer plus de styles' 
                        : `${availableStyles.length} styles disponibles`}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        id="is_qr_active"
                        name="is_qr_active"
                        type="checkbox"
                        checked={formData.is_qr_active}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setFormData({ 
                            ...formData, 
                            is_qr_active: checked,
                            plan_type: checked && isFreePlan ? 'standard' : formData.plan_type
                          })
                        }}
                        className="w-5 h-5 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A] cursor-pointer"
                        disabled={isFreePlan}
                      />
                      <Label htmlFor="is_qr_active" className={`cursor-pointer font-normal ${isFreePlan ? 'opacity-50' : ''}`}>
                        <span className="font-medium text-[#1E3A8A]">Activer le contrôle par QR Code</span>
                        <p className="text-xs text-gray-500 font-normal">
                          {isFreePlan 
                            ? 'Disponible à partir du forfait Standard' 
                            : 'QR Code activé pour tous vos invités'}
                        </p>
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan_type">Changer de forfait</Label>
                    <select
                      id="plan_type"
                      name="plan_type"
                      value={formData.plan_type}
                      onChange={(e) => {
                        const newPlan = e.target.value
                        const oldPlan = formData.plan_type
                        
                        // ✅ Confirmation avant upgrade payant
                        if (oldPlan !== newPlan && newPlan !== 'free') {
                          if (!confirm(`Passer au forfait ${PLANS[newPlan as keyof typeof PLANS].label} entraînera un paiement. Continuer ?`)) {
                            return
                          }
                        }
                        handleChange(e)
                      }}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    >
                      <option value="free">Gratuit - 10 invités, 1 style</option>
                      <option value="standard">Standard - 2 000 FCFA / 9.99 € (100 invités, 5 styles)</option>
                      <option value="prestige">Prestige - 5 000 FCFA / 19.99 € (500 invités, QR Code)</option>
                      <option value="vip">VIP - 10 000 FCFA / 39.99 € (Illimité, Support WhatsApp)</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      {formData.plan_type !== event?.plan_type && formData.plan_type !== 'free'
                        ? '⚠️ Le passage à un forfait payant nécessite un paiement.'
                        : formData.plan_type !== event?.plan_type 
                        ? '⚠️ Le changement de forfait sera appliqué après sauvegarde.'
                        : ''}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                    disabled={saving}
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}