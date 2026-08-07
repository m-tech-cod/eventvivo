'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { StaggeredContainer, staggerItem } from '@/components/ui/animations'

export default function MentionsLegalesPage() {
  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
      <div className="flex-1 py-12 px-4 overflow-y-auto">
        <div className="container mx-auto max-w-3xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-white font-poppins drop-shadow-lg">
              Mentions légales
            </h1>
            <p className="text-white/60 text-sm drop-shadow mt-2">Dernière mise à jour : Août 2026</p>
          </motion.div>

          {/* Sections */}
          <StaggeredContainer className="space-y-4">
            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">Éditeur du site</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Eventvivo est un service édité par l'Établissement <strong>ALAYDE TECH</strong>,
                    immatriculé au RCCM du Bénin sous le numéro <strong>RB/PNO/26 A 126770</strong>.
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Contact : <a href="mailto:contact@alaydetech.com" className="text-[#1E3A8A] hover:underline">contact@alaydetech.com</a>
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">Hébergement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Le site est hébergé par <strong>Vercel Inc.</strong> et les données par <strong>Supabase</strong>.
                    Les paiements sont traités par <strong>FedaPay</strong>.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">Propriété intellectuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Eventvivo, son logo, son code source, son interface et son contenu sont la propriété exclusive de <strong>ALAYDE TECH</strong>.
                    Toute reproduction, modification ou utilisation sans autorisation est interdite.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Pour toute question :
                    <Link href="/fr/contact" className="text-[#1E3A8A] hover:underline ml-1">
                      Nous contacter
                    </Link>
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Voir aussi les <Link href="/fr/terms" className="text-[#1E3A8A] hover:underline">Conditions Générales d'Utilisation</Link>
                    {' '}et la <Link href="/fr/privacy" className="text-[#1E3A8A] hover:underline">Politique de Confidentialité</Link>.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </StaggeredContainer>
        </div>
      </div>
    </BackgroundImage>
  )
}
