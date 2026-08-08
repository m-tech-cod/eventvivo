'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { AnimatedSection, staggerItem, StaggeredContainer } from '@/components/ui/animations'

export default function TermsPage() {
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
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-white/60 text-sm drop-shadow mt-2">Dernière mise à jour : 8 août 2026</p>
          </motion.div>

          {/* Sections */}
          <StaggeredContainer className="space-y-4">
            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">1. Présentation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Eventvivo est une plateforme SaaS de gestion d'événements éditée par <strong>ALAYDE TECH</strong>.
                    Les présentes conditions générales d'utilisation (CGU) régissent l'utilisation de la plateforme Eventvivo.
                    Les informations d'identification de l'éditeur figurent dans les{' '}
                    <Link href="/fr/mentions-legales" className="text-[#1E3A8A] hover:underline">Mentions légales</Link>.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">2. Acceptation des conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    En créant un compte et en utilisant Eventvivo, vous acceptez pleinement et sans réserve les présentes conditions générales. 
                    Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser nos services.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">3. Création de compte</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    L'utilisateur doit être âgé d'au moins 18 ans pour créer un compte. 
                    Il s'engage à fournir des informations exactes et à jour. 
                    Toute activité effectuée depuis son compte est de sa responsabilité.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">4. Services proposés</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-gray-600 text-sm space-y-2 list-disc pl-4">
                    <li>Création d'événements (mariages, anniversaires, baptêmes, dots, cérémonies)</li>
                    <li>Invitations numériques personnalisées avec plusieurs styles</li>
                    <li>Gestion des RSVP (confirmations de présence)</li>
                    <li>Génération de QR Codes individuels (selon forfait)</li>
                    <li>Téléchargement de PDF imprimables (1, 4, 10 cartes par page)</li>
                    <li>Tableau de bord avec statistiques en temps réel</li>
                    <li>Export Excel des données (forfaits Prestige et VIP)</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">5. Offres et paiements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm text-gray-600">

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-[#1E3A8A]">Gratuit</h4>
                      <p className="text-xs text-gray-500">0 FCFA / 0 € / 0 $</p>
                      <ul className="mt-2 space-y-1 list-disc pl-4">
                        <li>10 invités maximum</li>
                        <li>1 style d'invitation</li>
                        <li>Lien RSVP avec miniature</li>
                        <li>Tableau de bord basique</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-[#1E3A8A]">Standard</h4>
                      <p className="text-xs text-gray-500">2 000 FCFA / 9,99 € / 9,99 $</p>
                      <ul className="mt-2 space-y-1 list-disc pl-4">
                        <li>100 invités maximum</li>
                        <li>5 styles d'invitation</li>
                        <li>Tableau statistique complet</li>
                        <li>Export PDF</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]">
                      <h4 className="font-bold text-[#1E3A8A]">Prestige</h4>
                      <p className="text-xs text-gray-500">5 000 FCFA / 19,99 € / 19,99 $</p>
                      <ul className="mt-2 space-y-1 list-disc pl-4">
                        <li>500 invités maximum</li>
                        <li>50 styles d'invitation premium</li>
                        <li>QR Codes uniques</li>
                        <li>Export PDF HD + Excel</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-[#10B981]/10 rounded-lg border border-[#10B981]">
                      <h4 className="font-bold text-[#1E3A8A]">VIP / Illimité</h4>
                      <p className="text-xs text-gray-500">10 000 FCFA / 39,99 € / 39,99 $</p>
                      <ul className="mt-2 space-y-1 list-disc pl-4">
                        <li>Invités illimités</li>
                        <li>50 styles d'invitation premium</li>
                        <li>QR Codes uniques</li>
                        <li>Export PDF HD + Excel</li>
                        <li>Support prioritaire WhatsApp</li>
                        <li>Sans mention "Propulsé par"</li>
                      </ul>
                    </div>

                    <p className="mt-4 text-xs text-gray-500">
                      Les tarifs à jour sont affichés sur la page{' '}
                      <Link href="/fr/pricing" className="text-[#1E3A8A] hover:underline">Tarifs</Link>, qui fait foi en cas de différence.
                      Les paiements sont traités par <strong>FedaPay</strong> (Mobile Money, carte bancaire, Visa, Mastercard).
                      Les transactions sont sécurisées et cryptées.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">6. Propriété intellectuelle et données personnelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Les droits de propriété intellectuelle sur Eventvivo (logo, code source, interface, contenu) sont détaillés dans les{' '}
                    <Link href="/fr/mentions-legales" className="text-[#1E3A8A] hover:underline">Mentions légales</Link>.
                    Les modalités de collecte, d'utilisation et de protection de vos données personnelles sont détaillées dans la{' '}
                    <Link href="/fr/privacy" className="text-[#1E3A8A] hover:underline">Politique de Confidentialité</Link>.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">7. Responsabilité</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Eventvivo est fourni "en l'état". Nous nous efforçons d'assurer un service continu, mais ne garantissons pas une disponibilité ininterrompue. 
                    L'utilisateur est responsable de l'utilisation qu'il fait de la plateforme et des informations qu'il y publie.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">8. Modification des conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Eventvivo se réserve le droit de modifier les présentes conditions à tout moment.
                    Les utilisateurs seront informés des modifications par email ou via la plateforme.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">9. Droit applicable et litiges</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Les présentes CGU sont régies par le droit béninois. En cas de litige, une solution amiable sera recherchée en priorité via notre service{' '}
                    <Link href="/fr/contact" className="text-[#1E3A8A] hover:underline">Contact</Link>{' '}
                    avant toute action judiciaire.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">10. Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Pour toute question : 
                    <Link href="/fr/contact" className="text-[#1E3A8A] hover:underline ml-1">
                      Nous contacter
                    </Link>
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