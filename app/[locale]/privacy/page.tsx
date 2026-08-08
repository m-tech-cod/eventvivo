'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import { StaggeredContainer, staggerItem } from '@/components/ui/animations'

export default function PrivacyPage() {
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
              Politique de Confidentialité
            </h1>
            <p className="text-white/60 text-sm drop-shadow mt-2">Dernière mise à jour : 8 août 2026</p>
          </motion.div>

          {/* Sections */}
          <StaggeredContainer className="space-y-4">
            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">Responsable du traitement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Le responsable du traitement des données est <strong>ALAYDE TECH</strong>, éditeur d'Eventvivo
                    (voir <Link href="/fr/mentions-legales" className="text-[#1E3A8A] hover:underline">Mentions légales</Link> pour les informations d'identification complètes).
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">1. Collecte des données</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Eventvivo collecte les informations suivantes :
                  </p>
                  <ul className="text-gray-600 text-sm space-y-2 list-disc pl-4 mt-2">
                    <li><strong>Données d'inscription :</strong> nom, prénom, adresse email, numéro de téléphone (optionnel)</li>
                    <li><strong>Données d'événement :</strong> nom, date, lieu, description, type d'événement, photo de couverture</li>
                    <li><strong>Données d'invitation :</strong> noms des invités, leurs réponses (RSVP), nombre d'accompagnateurs</li>
                    <li><strong>Données de paiement :</strong> montant, devise, moyen de paiement (les données bancaires sont traitées par <strong>FedaPay</strong>)</li>
                    <li><strong>Données techniques :</strong> adresse IP, type d'appareil, navigateur</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">2. Utilisation des données</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Les données collectées sont utilisées pour :
                  </p>
                  <ul className="text-gray-600 text-sm space-y-2 list-disc pl-4 mt-2">
                    <li>Gérer les événements et les invitations</li>
                    <li>Permettre le RSVP et le suivi des confirmations</li>
                    <li>Envoyer des notifications (confirmation de paiement, mises à jour)</li>
                    <li>Améliorer la plateforme (analytique)</li>
                    <li>Gérer les paiements via FedaPay</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">3. Hébergement des données</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Les données sont hébergées par <strong>Supabase</strong> (hébergeur sécurisé) et <strong>Vercel</strong> pour le frontend. 
                    Les données de paiement sont traitées par <strong>FedaPay</strong>.
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    <strong>Supabase :</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] hover:underline">Politique de confidentialité</a>
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>FedaPay :</strong> <a href="https://fedapay.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] hover:underline">Politique de confidentialité</a>
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">4. Cookies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Eventvivo utilise des cookies techniques (session, authentification) pour assurer le bon fonctionnement du service. 
                    Ces cookies sont strictement nécessaires et ne nécessitent pas de consentement explicite.
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Vous pouvez gérer les cookies dans les paramètres de votre navigateur.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">5. Vos droits (RGPD)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Conformément au RGPD, vous disposez des droits suivants :
                  </p>
                  <ul className="text-gray-600 text-sm space-y-2 list-disc pl-4 mt-2">
                    <li><strong>Droit d'accès :</strong> consulter vos données</li>
                    <li><strong>Droit de rectification :</strong> modifier vos données</li>
                    <li><strong>Droit à l'effacement :</strong> supprimer vos données ("droit à l'oubli")</li>
                    <li><strong>Droit à la portabilité :</strong> récupérer vos données en format lisible</li>
                    <li><strong>Droit d'opposition :</strong> refuser le traitement de vos données</li>
                  </ul>
                  <p className="text-gray-600 text-sm mt-2">
                    Pour exercer ces droits : 
                    <Link href="/fr/contact" className="text-[#1E3A8A] hover:underline ml-1">
                      Contactez-nous
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">6. Conservation des données</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Vos données sont conservées aussi longtemps que votre compte est actif. 
                    En cas de suppression de compte, les données sont supprimées dans un délai de 30 jours.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">7. Sécurité</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Nous mettons en œuvre des mesures de sécurité conformes aux standards de l'industrie : 
                    chiffrement HTTPS, authentification sécurisée, stockage crypté. 
                    Les mots de passe sont hashés et salés.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={staggerItem}>
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#1E3A8A]">8. Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Pour toute question concernant cette politique : 
                    <Link href="/fr/contact" className="text-[#1E3A8A] hover:underline ml-1">
                      Contactez-nous
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