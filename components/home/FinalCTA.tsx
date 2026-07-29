'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'

export function FinalCTA() {
  return (
    <BackgroundImage
      src="/images/interieur.webp"
      animate="zoom" overlayOpacity={0.35}
      className="py-12 px-4"
    >
      <div className="container mx-auto max-w-3xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          {/* Icône */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F59E0B]/20 backdrop-blur-sm rounded-2xl mb-6">
            <Sparkles className="w-8 h-8 text-[#F59E0B]" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white font-poppins mb-4 leading-tight drop-shadow-lg">
            Votre prochain événement mérite mieux<br />
            <span className="text-[#F59E0B]">qu'une liste WhatsApp.</span>
          </h2>

          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed drop-shadow">
            Rejoignez les organisateurs qui ont simplifié leur quotidien avec Eventvivo.
            Créez votre premier événement en 5 minutes — gratuitement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/fr/auth/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-bold px-8 py-6 text-base md:text-lg rounded-xl shadow-lg shadow-[#F59E0B]/25 hover:shadow-xl transition-all duration-300 group">
                <span>Créer mon événement gratuitement</span>
                <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <p className="text-white/50 text-sm mt-5 drop-shadow">
            ✓ Sans carte bancaire &nbsp;·&nbsp; ✓ Prêt en 5 min &nbsp;·&nbsp; ✓ Annulation à tout moment
          </p>
        </motion.div>
      </div>
    </BackgroundImage>
  )
}