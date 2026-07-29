'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronDown, Mail, ArrowRight } from 'lucide-react'
import Script from 'next/script'

const faqs = [
  {
    question: 'Est-ce que c\'est gratuit pour commencer ?',
    answer: 'Oui, le forfait Gratuit vous permet de créer un événement avec jusqu\'à 10 invités, sans carte bancaire. Passez à Standard, Prestige ou VIP quand vous en avez besoin.',
  },
  {
    question: 'Comment mes invités reçoivent-ils leur invitation ?',
    answer: 'Vous partagez un lien unique par WhatsApp, SMS, Facebook ou email. Vos invités cliquent, confirment leur présence et reçoivent leur QR Code. Aucune application à installer.',
  },
  {
    question: 'Eventvivo est-il disponible en Afrique ?',
    answer: 'Oui, Eventvivo est conçu pour l\'Afrique francophone : Bénin, Togo, Côte d\'Ivoire, Sénégal, Cameroun, Burkina Faso, Gabon, Mali. Les paiements Mobile Money (MTN, Orange, Moov) sont acceptés via FedaPay.',
  },
  {
    question: 'Comment fonctionne le QR Code ?',
    answer: 'Chaque invité qui confirme sa présence reçoit un QR Code unique. Le jour J, scannez le code à l\'entrée pour valider l\'accès instantanément. Disponible à partir du forfait Prestige.',
  },
  {
    question: 'Puis-je télécharger les invitations en PDF ?',
    answer: 'Oui. Téléchargez vos cartons d\'invitation en PDF haute définition — 1, 4 ou 10 cartes par page — pour les imprimer. La version HD est disponible à partir du forfait Prestige.',
  },
  {
    question: 'Puis-je changer de forfait après avoir créé mon événement ?',
    answer: 'Oui, vous pouvez passer à un forfait supérieur à tout moment depuis votre tableau de bord, sans tout recommencer.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer: 'Vos données sont hébergées sur Supabase avec chiffrement, accès contrôlé par RLS (Row Level Security), et les paiements sont traités par FedaPay avec cryptage SSL.',
  },
  {
    question: 'Eventvivo fonctionne-t-il en dehors de l\'Afrique ?',
    answer: 'Oui, Eventvivo est accessible partout dans le monde. Les prix sont affichés en FCFA pour l\'Afrique et en Euro ou USD pour l\'international.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <section className="py-20 px-4 bg-[#FAFAF8]">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold uppercase tracking-widest text-[#1E3A8A] mb-3"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1E3A8A] font-poppins mb-4"
          >
            Vos questions, nos réponses
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-500"
          >
            Tout ce que vous devez savoir avant de commencer.
          </motion.p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              viewport={{ once: true }}
              className={`bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
                openIndex === index
                  ? 'border-[#1E3A8A]/30 shadow-md'
                  : 'border-gray-100 hover:border-[#1E3A8A]/15 hover:shadow-sm'
              }`}
            >
              <button
                className="w-full flex justify-between items-center gap-4 px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <h3 className="font-semibold text-[#1E3A8A] text-sm md:text-base leading-snug">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown
                    className={`w-5 h-5 transition-colors ${
                      openIndex === index ? 'text-[#F59E0B]' : 'text-gray-400'
                    }`}
                  />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 border-t border-gray-50">
                      <p className="text-gray-500 text-sm leading-relaxed pt-4 whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA contact */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-10 text-center p-8 bg-white rounded-2xl border-2 border-gray-100"
        >
          <p className="text-gray-600 font-medium mb-1">Vous avez d'autres questions ?</p>
          <p className="text-gray-400 text-sm mb-5">Notre équipe répond sous 24h.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <a href="mailto:contact@alaydetech.com" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full inline-flex items-center justify-center gap-2 border-2 border-[#1E3A8A]/20 text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white rounded-xl px-6 py-4 transition-all duration-300"
              >
                <Mail className="w-4 h-4 flex-shrink-0" />
                contact@alaydetech.com
              </Button>
            </a>
            <Link href="/fr/auth/register" className="w-full sm:w-auto">
              <Button className="w-full inline-flex items-center justify-center gap-2 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-bold rounded-xl px-6 py-4 transition-all group">
                Essayer gratuitement
                <ArrowRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
