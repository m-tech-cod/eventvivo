'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

const faqs = [
  {
    question: 'Comment créer un événement sur Eventvivo ?',
    answer: 'Connectez-vous à votre compte, cliquez sur "Créer un événement", choisissez votre forfait (Gratuit, Standard, Prestige ou VIP), puis remplissez les informations de votre événement (nom, date, lieu) et choisissez votre style d\'invitation.'
  },
  {
    question: 'Quels sont les différents forfaits disponibles ?',
    answer: 'Eventvivo propose 4 forfaits :\n• Gratuit : 10 invités, 1 style, RSVP basique\n• Standard (2 000 FCFA / 4,99 €) : 100 invités, 5 styles, Export PDF\n• Prestige (5 000 FCFA / 9,99 €) : 500 invités, QR Codes, Export Excel\n• VIP (10 000 FCFA / 16,99 €) : Invités illimités, support WhatsApp, sans mention "Propulsé par"'
  },
  {
    question: 'Puis-je inviter des personnes sans limite ?',
    answer: 'Oui, avec le forfait VIP vous pouvez inviter un nombre illimité de personnes.'
  },
  {
    question: 'Comment fonctionne le QR Code sur Eventvivo ?',
    answer: 'Le QR Code permet à vos invités de confirmer leur présence en scannant le code à l\'entrée de votre événement. Cette fonctionnalité est disponible à partir du forfait Prestige.'
  },
  {
    question: 'Puis-je télécharger les invitations en PDF ?',
    answer: 'Oui, vous pouvez télécharger vos invitations en PDF au format 1, 4 ou 10 cartes par page. Le format HD est disponible à partir du forfait Prestige.'
  },
  {
    question: 'Quels moyens de paiement sont acceptés ?',
    answer: 'Nous acceptons les paiements par Mobile Money (MTN, Orange, Moov) et carte bancaire (Visa, Mastercard) via FedaPay. Les transactions sont sécurisées et cryptées.'
  },
  {
    question: 'Puis-je changer de forfait après la création de mon événement ?',
    answer: 'Oui, vous pouvez passer à un forfait supérieur à tout moment depuis votre tableau de bord. Vous ne payez que la différence entre les deux forfaits.'
  },
  {
    question: 'Eventvivo est-il disponible en Afrique ?',
    answer: 'Oui, Eventvivo est conçu pour les pays d\'Afrique francophone (Bénin, Togo, Côte d\'Ivoire, Sénégal, Cameroun, Burkina Faso, Gabon, Mali) et accessible partout dans le monde.'
  },
  {
    question: 'Puis-je utiliser Eventvivo en dehors de l\'Afrique ?',
    answer: 'Oui, Eventvivo est accessible dans le monde entier. Les prix sont affichés en FCFA pour l\'Afrique et en Euro pour l\'international.'
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 py-12 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-white font-poppins mb-4 drop-shadow-lg">
              Foire aux questions
            </h1>
            <p className="text-white/80 drop-shadow">
              Trouvez rapidement des réponses à vos questions sur Eventvivo
            </p>
          </motion.div>

          {/* FAQ List */}
          <StaggeredContainer className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={staggerItem}>
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/95 backdrop-blur-sm border-0 hover:bg-white"
                  onClick={() => toggle(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center gap-4">
                      <h3 className="font-semibold text-[#1E3A8A] text-base md:text-lg">
                        {faq.question}
                      </h3>
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-[#F59E0B] flex-shrink-0 transition-transform duration-300" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#1E3A8A] flex-shrink-0 transition-transform duration-300" />
                      )}
                    </div>
                    {openIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-100"
                      >
                        <p className="text-gray-600 text-sm whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </StaggeredContainer>

          {/* Section contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-white/70 drop-shadow">
              Vous n'avez pas trouvé votre réponse ?{' '}
              <Link href="/fr/contact" className="text-[#F59E0B] hover:underline font-medium">
                Contactez-nous
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </BackgroundImage>
  )
}