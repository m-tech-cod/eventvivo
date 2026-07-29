'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection } from '@/components/ui/animations'

interface AmbassadorFormProps {
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function AmbassadorForm({ onSubmit, isLoading = false }: AmbassadorFormProps) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    promo_code: '',
    commission_rate: 10,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <BackgroundImage
      src="/images/foule.webp"
      overlayOpacity={0.35}
      animate="zoom"
      className="min-h-screen py-12 px-4"
    >
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <AnimatedSection>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-[#1E3A8A] font-poppins text-center mb-6">
                🤝 Créer un ambassadeur
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <p className="text-xs text-gray-500">Utilisé par les clients pour bénéficier de réductions</p>
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

                <Button
                  type="submit"
                  className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer l\'ambassadeur'
                  )}
                </Button>
              </form>
            </div>
          </AnimatedSection>
        </motion.div>
      </div>
    </BackgroundImage>
  )
}