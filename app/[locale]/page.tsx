// app/[locale]/page.tsx
'use client'

import { motion } from 'framer-motion'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { Features } from '@/components/home/Features'
import { HowItWorks } from '@/components/home/HowItWorks'
import { PricingSection } from '@/components/home/PricingSection'
import { Testimonials } from '@/components/home/Testimonials'
import { FAQSection } from '@/components/home/FAQSection'
import { SocialProofBanner } from '@/components/home/SocialProofBanner'
import { FinalCTA } from '@/components/home/FinalCTA'
import { AnimatedSection } from '@/components/ui/animations'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Section Hero avec image de fond */}
      <BackgroundImage
        src="/images/interieur.webp"
        animate="zoom" overlayOpacity={0.35}
        className="min-h-screen"
      >
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full"
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </BackgroundImage>

      {/* Sections suivantes (sans image de fond) */}
      <div className="bg-[#FAFAF8]">
        <SocialProofBanner />
        
        <AnimatedSection delay={0.1}>
          <HowItWorks />
        </AnimatedSection>

        <AnimatedSection delay={0.2}>
          <Features />
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <Testimonials />
        </AnimatedSection>

        <AnimatedSection delay={0.4}>
          <PricingSection />
        </AnimatedSection>

        <AnimatedSection delay={0.45}>
          <FinalCTA />
        </AnimatedSection>

        <AnimatedSection delay={0.5}>
          <FAQSection />
        </AnimatedSection>
      </div>
    </main>
  )
}