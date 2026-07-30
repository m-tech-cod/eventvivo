'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Sparkles, Crown, Users, ArrowLeft } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'

const PLANS = {
  free: { label: 'Gratuit', maxGuests: 10, styles: 1, priceFcfa: 0, priceEur: 0, priceUsd: 0, color: 'text-gray-500', bg: 'bg-gray-100' },
  standard: { label: 'Standard', maxGuests: 100, styles: 5, priceFcfa: 2000, priceEur: 9.99, priceUsd: 9.99, color: 'text-[#1E3A8A]', bg: 'bg-[#1E3A8A]/10' },
  prestige: { label: 'Prestige', maxGuests: 500, styles: 5, priceFcfa: 5000, priceEur: 19.99, priceUsd: 19.99, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  vip: { label: 'VIP / Illimité', maxGuests: Infinity, styles: 5, priceFcfa: 10000, priceEur: 39.99, priceUsd: 39.99, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
}

const ALL_STYLES = [
  { value: 'classique', label: 'Classique', icon: '🎨' },
  { value: 'moderne', label: 'Moderne', icon: '✨' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'elegant', label: 'Élégant', icon: '💎' },
  { value: 'luxe', label: 'Luxe', icon: '👑' },
]

export default function CreateEventPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const planType = searchParams.get('plan') || 'free'

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'mariage',
    date: '',
    time: '',
    location: '',
    description: '',
    style: 'classique',
    is_qr_active: false,
  })

  const [coverFile, setCoverFile] = useState<File | null>(null)

  const selectedPlan = PLANS[planType as keyof typeof PLANS] || PLANS.free
  const isFreePlan = planType === 'free'
  const isStandardPlan = planType === 'standard'
  const isPrestigePlan = planType === 'prestige'
  const isVipPlan = planType === 'vip'

  const availableStyles = isFreePlan ? ALL_STYLES.slice(0, 1) : ALL_STYLES

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
    setLoading(true)
    setUploading(false)

    if (!formData.date) {
      setError('Veuillez sélectionner une date')
      setLoading(false)
      return
    }

    if (!user) {
      setError('Vous devez être connecté')
      setLoading(false)
      return
    }

    try {
      const { data: existingEvent } = await supabase
        .from('events')
        .select('id')
        .eq('organizer_id', user.id)
        .single()

      if (existingEvent) {
        setError('Vous avez déjà créé un événement. Un seul événement est autorisé dans cette version.')
        setLoading(false)
        return
      }

      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      let coverImageUrl = null
      if (coverFile) {
        setUploading(true)
        const fileExt = coverFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `events/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(filePath, coverFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('event-covers')
          .getPublicUrl(filePath)

        coverImageUrl = publicUrl
        setUploading(false)
      }

      // 1️⃣ Créer l'événement
      const { data, error } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          name: formData.name,
          type: formData.type,
          date: formData.date,
          time: formData.time || null,
          location: formData.location || null,
          description: formData.description || null,
          slug: slug,
          cover_image: coverImageUrl,
          style: formData.style,
          is_qr_active: formData.is_qr_active,
          plan_type: planType,
          max_guests: selectedPlan.maxGuests,
          plan_price_fcfa: selectedPlan.priceFcfa,
          plan_price_eur: selectedPlan.priceEur,
          is_premium: !isFreePlan,
          payment_status: 'paid',
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erreur insertion:', error.message)
        setError('Erreur: ' + error.message)
        setLoading(false)
        return
      }

      // 2️⃣ Créer l'invitation générique
      if (data) {
        const { error: invError } = await supabase
          .from('invitations')
          .insert({
            event_id: data.id,
            recipient_name: 'Invité',
            unique_link: `inv-${data.slug}`,
            status: 'sent',
          })

        if (invError) {
          console.error('❌ Erreur création invitation:', invError)
        }
      }

      // 3️⃣ Rediriger vers le dashboard
      router.push(`/fr/dashboard`)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-4"
          >
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => router.push('/fr/events')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </motion.div>

          <AnimatedSection>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl text-[#1E3A8A] font-poppins text-center">
                  ✨ Créer votre événement
                </CardTitle>
                <CardDescription className="text-center">
                  Remplissez les informations et personnalisez votre invitation
                </CardDescription>
                
                <div className={`mt-4 p-4 rounded-lg border ${selectedPlan.bg} border-gray-200`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Forfait choisi</p>
                      <p className={`font-semibold ${selectedPlan.color}`}>
                        {selectedPlan.label}
                        {isVipPlan && ' 👑'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedPlan.maxGuests === Infinity 
                          ? '♾️ Invités illimités' 
                          : `👥 ${selectedPlan.maxGuests} invités maximum`}
                        {' • '}
                        {isFreePlan ? 'Gratuit' : `${selectedPlan.priceFcfa} FCFA`}
                      </p>
                    </div>
                    {isVipPlan && <Users className="w-8 h-8 text-[#10B981]" />}
                    {isPrestigePlan && <Crown className="w-8 h-8 text-[#F59E0B]" />}
                    {isStandardPlan && <Sparkles className="w-8 h-8 text-[#1E3A8A]" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nom */}
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

                  {/* Type */}
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

                  {/* Date et Heure */}
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

                  {/* Lieu */}
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

                  {/* Description */}
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

                  {/* Photo de couverture */}
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
                        <Image src={previewUrl} alt="Aperçu" fill className="object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Styles */}
                  <div className="space-y-2">
                    <Label>Style d'invitation</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {availableStyles.map((style) => (
                        <button
                          key={style.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, style: style.value })}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            formData.style === style.value
                              ? 'border-[#1E3A8A] bg-[#1E3A8A]/5'
                              : 'border-gray-200 hover:border-[#1E3A8A]/50'
                          } cursor-pointer`}
                        >
                          <div className="text-2xl">{style.icon}</div>
                          <div className="text-xs font-medium text-[#1E3A8A]">{style.label}</div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {isFreePlan ? '1 style inclus avec le forfait Gratuit' : `${availableStyles.length} styles disponibles`}
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        id="is_qr_active"
                        name="is_qr_active"
                        type="checkbox"
                        checked={formData.is_qr_active}
                        onChange={(e) => setFormData({ ...formData, is_qr_active: e.target.checked })}
                        className="w-5 h-5 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A] cursor-pointer"
                        disabled={isFreePlan || isStandardPlan}
                      />
                      <Label htmlFor="is_qr_active" className={`cursor-pointer font-normal ${(isFreePlan || isStandardPlan) ? 'opacity-50' : ''}`}>
                        <span className="font-medium text-[#1E3A8A]">Activer le contrôle par QR Code</span>
                        <p className="text-xs text-gray-500 font-normal">
                          {isPrestigePlan || isVipPlan
                            ? 'QR Code activé pour tous vos invités'
                            : 'Disponible à partir du forfait Prestige'}
                        </p>
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                    disabled={loading || uploading}
                  >
                    {loading ? 'Création en cours...' : uploading ? 'Upload de l\'image...' : 'Créer mon événement'}
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