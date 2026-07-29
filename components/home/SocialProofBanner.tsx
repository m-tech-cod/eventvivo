'use client'

import { motion } from 'framer-motion'
import { Shield, Globe2, Star } from 'lucide-react'

const stats = [
  { icon: <Star className="w-4 h-4 text-[#F59E0B]" />, value: '4.9/5', label: 'Note moyenne' },
  { icon: <Globe2 className="w-4 h-4 text-[#10B981]" />, value: '10+ pays', label: 'Afrique & Europe' },
  { icon: <Shield className="w-4 h-4 text-[#1E3A8A]" />, value: '100%', label: 'Paiement sécurisé' },
]

const countries = [
  // Afrique
  '🇧🇯 Bénin',
  '🇨🇮 Côte d\'Ivoire',
  '🇨🇲 Cameroun',
  '🇸🇳 Sénégal',
  '🇹🇬 Togo',
  '🇧🇫 Burkina Faso',
  '🇲🇱 Mali',
  '🇬🇦 Gabon',
  '🇨🇩 Congo RDC',
  '🇬🇳 Guinée',
  '🇲🇬 Madagascar',
  '🇳🇬 Nigeria',
  // Europe
  '🇫🇷 France',
  '🇧🇪 Belgique',
  '🇨🇭 Suisse',
  '🇱🇺 Luxembourg',
  '🇩🇪 Allemagne',
  '🇮🇹 Italie',
  '🇪🇸 Espagne',
  '🇵🇹 Portugal',
  '🇳🇱 Pays-Bas',
  '🇸🇪 Suède',
  '🇳🇴 Norvège',
  '🇩🇰 Danemark',
  '🇫🇮 Finlande',
  '🇦🇹 Autriche',
  '🇵🇱 Pologne',
  '🇬🇧 Royaume-Uni',
  '🇮🇪 Irlande',
  '🇬🇷 Grèce',
]

export function SocialProofBanner() {
  return (
    <section className="bg-white border-y border-gray-100 py-6 px-4 overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="font-bold text-[#1E3A8A] text-sm leading-none">{stat.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Countries marquee */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10" />
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="flex gap-6 w-max"
          >
            {[...countries, ...countries].map((country, i) => (
              <span
                key={i}
                className="text-sm text-gray-500 font-medium whitespace-nowrap px-3 py-1 bg-gray-50 rounded-full"
              >
                {country}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
