'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, ArrowLeft, Loader2, Calendar } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

export default function AdminAmbassadorsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ambassadors, setAmbassadors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    promo_code: '',
    commission_rate: 10,
    expires_at: '',
  })

  useEffect(() => {
    const fetchAmbassadors = async () => {
      const { data } = await supabase
        .from('ambassadors')
        .select('*')
        .order('created_at', { ascending: false })

      setAmbassadors(data || [])
      setLoading(false)
    }

    fetchAmbassadors()
  }, [supabase])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const insertData = {
      ...formData,
      status: 'active',
      expires_at: formData.expires_at || null,
    }

    const { error } = await supabase
      .from('ambassadors')
      .insert(insertData)

    if (!error) {
      setShowForm(false)
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        promo_code: '',
        commission_rate: 10,
        expires_at: '',
      })
      const { data: newData } = await supabase
        .from('ambassadors')
        .select('*')
        .order('created_at', { ascending: false })
      setAmbassadors(newData || [])
    }
    setSubmitting(false)
  }

  const formatExpiration = (date: string) => {
    if (!date) return 'Sans expiration'
    const d = new Date(date)
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    )
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="parallax" overlayOpacity={0.35}>
      <div className="flex-1 py-8 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              className="mb-4 text-white hover:bg-white/10 backdrop-blur-sm"
              onClick={() => router.push('/fr/admin')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </motion.div>

          <AnimatedSection>
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-2xl text-[#1E3A8A] font-poppins">
                  🤝 Programme Ambassadeurs
                </CardTitle>
                <Button
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                  onClick={() => setShowForm(!showForm)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showForm ? 'Fermer' : 'Ajouter'}
                </Button>
              </CardHeader>
              <CardContent>
                {showForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <form onSubmit={handleCreate} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name" className="text-[#1E3A8A]">Prénom *</Label>
                          <Input
                            id="first_name"
                            placeholder="Jean"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                            className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name" className="text-[#1E3A8A]">Nom *</Label>
                          <Input
                            id="last_name"
                            placeholder="Kouassi"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                            className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#1E3A8A]">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="ambassadeur@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[#1E3A8A]">Téléphone</Label>
                        <Input
                          id="phone"
                          placeholder="+225 07 01 01 01 01"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="promo_code" className="text-[#1E3A8A]">Code promo *</Label>
                        <Input
                          id="promo_code"
                          placeholder="EX: KOUASSI2026"
                          value={formData.promo_code}
                          onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                          required
                          className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="commission_rate" className="text-[#1E3A8A]">Commission (%)</Label>
                        <Input
                          id="commission_rate"
                          type="number"
                          min="0"
                          max="100"
                          value={formData.commission_rate}
                          onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                          className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expires_at" className="text-[#1E3A8A]">Date d'expiration</Label>
                        <Input
                          id="expires_at"
                          type="date"
                          value={formData.expires_at}
                          onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                          className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                        />
                        <p className="text-xs text-gray-500">
                          Laissez vide pour une durée illimitée.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Création...
                          </>
                        ) : (
                          'Créer l\'ambassadeur'
                        )}
                      </Button>
                    </form>
                  </motion.div>
                )}

                {ambassadors.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    Aucun ambassadeur pour le moment
                  </p>
                ) : (
                  <StaggeredContainer className="space-y-3">
                    {ambassadors.map((ambassador) => (
                      <motion.div key={ambassador.id} variants={staggerItem}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all">
                          <div>
                            <p className="font-semibold text-[#1E3A8A]">
                              {ambassador.first_name} {ambassador.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{ambassador.email}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Code: {ambassador.promo_code}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {ambassador.commission_rate}% commission
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                ambassador.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {ambassador.status === 'active' ? 'Actif' : 'Inactif'}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatExpiration(ambassador.expires_at)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right mt-2 sm:mt-0">
                            <p className="text-sm font-medium text-[#1E3A8A]">
                              Total généré
                            </p>
                            <p className="text-sm text-gray-500">
                              {ambassador.total_earned || 0} FCFA
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </StaggeredContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </BackgroundImage>
  )
}