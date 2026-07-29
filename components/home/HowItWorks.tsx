'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { AnimatedSection } from '@/components/ui/animations'
import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    emoji: '📝',
    title: "Créez votre événement",
    description: 'Nom, date, lieu, photo, style. Votre événement est prêt en moins de 5 minutes.',
    time: '~2 min',
    color: '#1E3A8A',
  },
  {
    number: '02',
    emoji: '📤',
    title: 'Envoyez les invitations',
    description: 'Partagez le lien d\'invitation par WhatsApp, SMS, Facebook ou email en un seul clic.',
    time: '~1 min',
    color: '#10B981',
  },
  {
    number: '03',
    emoji: '📊',
    title: 'Suivez les confirmations',
    description: 'Visualisez en temps réel qui participe, qui a décliné, et scannez les QR Codes à l\'entrée.',
    time: 'En direct',
    color: '#F59E0B',
  },
  {
    number: '04',
    emoji: '🎉',
    title: 'Vivez votre événement',
    description: 'Accueil fluide, zéro chaos. Concentrez-vous sur l\'essentiel : profiter de votre fête.',
    time: 'Le jour J',
    color: '#6B7FCC',
  },
]

export function HowItWorks() {
  return (
    <AnimatedSection className="py-20 px-4 bg-white scroll-mt-16">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold uppercase tracking-widest text-[#10B981] mb-3"
          >
            Simple comme bonjour
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1E3A8A] font-poppins mb-4"
          >
            Comment ça marche ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-500 max-w-xl mx-auto"
          >
            De la création à l'accueil de vos invités — tout se passe sur Eventvivo.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Ligne de connexion desktop */}
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#1E3A8A]/20 via-[#10B981]/40 to-[#F59E0B]/20 z-0" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.12 }}
              viewport={{ once: true }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Numéro / emoji */}
              <div
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center mb-5 shadow-md group-hover:shadow-lg transition-shadow duration-300"
                style={{ backgroundColor: `${step.color}15`, border: `2px solid ${step.color}25` }}
              >
                <span className="text-2xl">{step.emoji}</span>
              </div>

              {/* Badge temps */}
              <span
                className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
                style={{ backgroundColor: `${step.color}15`, color: step.color }}
              >
                {step.time}
              </span>

              <h3 className="font-bold text-[#1E3A8A] text-base mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mini CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/fr/auth/register">
            <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white px-8 py-5 text-base rounded-xl group transition-all duration-300 hover:shadow-lg hover:shadow-[#1E3A8A]/20">
              Prêt ? C'est parti
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-gray-400 text-xs mt-3">Gratuit · Sans carte bancaire · Prêt en 5 min</p>
        </motion.div>
      </div>
    </AnimatedSection>
  )
}
