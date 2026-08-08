// app/[locale]/page.tsx
// Server Component : permet de déclarer une stratégie ISR explicite
// (impossible depuis un Client Component). Chaque section garde son propre
// 'use client' interne pour ses animations whileInView — aucune
// interactivité perdue en retirant la directive au niveau de la page.
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
import type { Metadata } from 'next'

// Contenu marketing statique — régénéré au plus toutes les heures plutôt que
// recalculé à chaque requête (défaut) ou jamais mis en cache.
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: {
    canonical: '/fr',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Section Hero avec image de fond — seule image LCP de la page */}
      <BackgroundImage
        src="/images/interieur.webp"
        animate="zoom" overlayOpacity={0.35}
        className="min-h-screen"
        priority
      >
        <div className="flex-1 flex items-center justify-center">
          <HeroCarousel />
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