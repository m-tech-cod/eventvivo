'use client'

import { motion } from 'framer-motion'
import { Calendar, Users, QrCode, FileText, BarChart3, Zap } from 'lucide-react'
import { AnimatedSection } from '@/components/ui/animations'

const features = [
  {
    icon: <Calendar className="w-6 h-6" />,
    color: '#1E3A8A',
    badge: null,
    title: 'Invitations qui impressionnent',
    description: 'Des modèles élégants adaptés à chaque type d\'événement. Partagez en un lien, vos invités s\'inscrivent sans application.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    color: '#10B981',
    badge: '⚡ Temps réel',
    title: 'Sachez exactement qui vient',
    description: 'Confirmations instantanées, tableau de présence mis à jour en direct. Fini les listes sur papier ou les relances WhatsApp.',
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    color: '#F59E0B',
    badge: '🔒 Sécurisé',
    title: 'Contrôle d\'accès en 2 secondes',
    description: 'Chaque invité reçoit un QR Code unique. À l\'entrée, un scan suffit. Zéro faux billet, zéro confusion.',
  },
  {
    icon: <FileText className="w-6 h-6" />,
    color: '#6B7FCC',
    badge: null,
    title: 'Invitations prêtes à imprimer',
    description: 'Téléchargez vos cartons en PDF haute définition — 1, 4 ou 10 par page. Pour ceux qui préfèrent le papier.',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: '#1E3A8A',
    badge: '📊 Live',
    title: 'Tableau de bord en direct',
    description: 'Statistiques de présence, taux de confirmation. Tout visible depuis votre téléphone.',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    color: '#10B981',
    badge: '🚀 Populaire',
    title: 'Opérationnel en 5 minutes',
    description: 'Créez votre événement, choisissez votre style et partagez. Aucune compétence technique requise.',
  },
]

export function Features() {
  return (
    <AnimatedSection className="py-20 px-4 bg-[#FAFAF8]">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-3"
          >
            Fonctionnalités
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-[#1E3A8A] font-poppins mb-4"
          >
            Tout ce dont vous avez besoin
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-500 max-w-xl mx-auto"
          >
            Gérez vos événements de A à Z — invitations, confirmations, accueil des invités.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100 group cursor-default"
            >
              {/* Icône + badge */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${feature.color}15`, color: feature.color }}
                >
                  {feature.icon}
                </div>
                {feature.badge && (
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${feature.color}12`, color: feature.color }}
                  >
                    {feature.badge}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-[#1E3A8A] text-base mb-2 leading-snug">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Ligne accent au hover */}
              <div
                className="mt-4 h-0.5 w-0 group-hover:w-full rounded-full transition-all duration-500"
                style={{ backgroundColor: `${feature.color}40` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
