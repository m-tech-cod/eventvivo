'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, Clock, Users, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface InvitationClientProps {
  slug: string
  // Déjà chargé côté serveur par page.tsx (une seule requête Supabase
  // partagée avec generateMetadata via React cache()) — évite un fetch
  // client + spinner redondants au premier rendu.
  initialEvent: any
}

export default function InvitationClient({ slug, initialEvent }: InvitationClientProps) {
  const [event] = useState(initialEvent)
  const [existingRSVP, setExistingRSVP] = useState<any>(null)
  const [invitationId, setInvitationId] = useState<string | null>(null)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [infoCertified, setInfoCertified] = useState(false)
  const [guests, setGuests] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [lookupNotFound, setLookupNotFound] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const styleClasses: Record<string, string> = {
    classique: 'bg-white/95 backdrop-blur-sm border-2 border-[#1E3A8A] rounded-lg shadow-xl',
    moderne: 'bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl border border-gray-100',
    nature: 'bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-emerald-100',
    elegant: 'bg-white/90 backdrop-blur-sm border border-[#D4A017] rounded-xl shadow-2xl',
    luxe: 'bg-white/90 backdrop-blur-sm border-2 border-[#F59E0B] rounded-xl shadow-2xl',
  }

  const applyQrIfNeeded = (inv: { id: string; qr_code_token: string | null }) => {
    if (inv.qr_code_token) {
      const qrData = `${window.location.origin}/fr/rsvp/scan/${slug}/${inv.id}`
      const encodedData = encodeURIComponent(qrData)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}&bgcolor=FFFFFF&color=1E3A8A&margin=10`
      setQrImageUrl(qrUrl)
    }
  }

  // Retrouve une réponse déjà envoyée, sans en créer une nouvelle.
  const handleLookup = async () => {
    if (!guestName.trim() || !guestPhone.trim()) {
      setError('Merci de renseigner votre nom et votre téléphone.')
      return
    }

    setLookingUp(true)
    setError(null)
    setLookupNotFound(false)

    try {
      const res = await fetch('/api/invitations/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: event.id, phone: guestPhone }),
      })
      const result = await res.json()

      if (!res.ok || !result.found) {
        setLookupNotFound(true) // pas d'invitation, ou pas encore de réponse
        return
      }

      setInvitationId(result.invitation_id)
      applyQrIfNeeded({ id: result.invitation_id, qr_code_token: result.qr_code_token })
      setExistingRSVP(result.rsvp)
    } catch (err: any) {
      console.error('[InvitationClient] lookup error:', err)
      setError('Impossible de retrouver votre réponse pour le moment.')
    } finally {
      setLookingUp(false)
    }
  }

  const handleRSVP = async (status: string) => {
    if (!guestName.trim() || !guestPhone.trim()) {
      setError('Merci de renseigner votre nom et votre téléphone avant de répondre.')
      return
    }

    if (!infoCertified) {
      setError('Merci de confirmer l\'exactitude de vos informations avant de répondre.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/invitations/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          guest_name: guestName,
          guest_phone: guestPhone,
          status,
          guests,
        }),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        throw new Error("Une erreur est survenue lors de l'envoi de votre réponse.")
      }

      setInvitationId(result.invitation_id)

      if (status === 'attending' && result.qr_code_token) {
        applyQrIfNeeded({ id: result.invitation_id, qr_code_token: result.qr_code_token })
      }

      setSuccess(status === 'attending' ? 'Merci pour votre confirmation !' : 'Nous avons bien pris en compte votre réponse.')
      setExistingRSVP({ status, number_of_guests: status === 'attending' ? guests : 0 })
    } catch (err: any) {
      console.error('[InvitationClient] RSVP submission error:', err)
      setError(err.message || "Une erreur est survenue lors de l'envoi de votre réponse.")
    } finally {
      setSubmitting(false)
    }
  }

  const styleClass = styleClasses[event.style] || styleClasses.classique

  // Pas de BackgroundImage ici : page.tsx (Server Component) fournit déjà le
  // fond plein écran de la page avec la même logique de couverture — un
  // second calque de fond identique doublerait inutilement le poids image
  // et l'animation de zoom pour un résultat visuellement identique.
  return (
    <div className="flex-1 overflow-y-auto py-8 px-4">
      <div className="container mx-auto max-w-2xl">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <div className="flex justify-center mb-4">
              <div className="flex items-center">
                <span className="text-white font-bold text-3xl font-poppins drop-shadow-lg">Event</span>
                <span className="text-[#F59E0B] font-bold text-3xl font-poppins drop-shadow-lg">vivo</span>
              </div>
            </div>

            <div className="text-sm text-white/70 mb-2 drop-shadow">
              {event.type === 'mariage' && '💍 Mariage'}
              {event.type === 'anniversaire' && '🎂 Anniversaire'}
              {event.type === 'bapteme' && '🕊️ Baptême'}
              {event.type === 'dots' && '💎 Dots'}
              {event.type === 'ceremonie' && '🎉 Cérémonie'}
              {event.type === 'autre' && '📌 Événement'}
              {event.type === 'picnic' && '🧺 Picnic'}
              {event.type === 'ago' && '🥁 Agô'}
              {event.type === 'formation' && '📚 Formation'}
              {event.type === 'lancement' && '🚀 Lancement de produit'}
              {event.type === 'conference' && '🎤 Conférence'}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white font-poppins mb-3 drop-shadow-lg">
              {event.name}
            </h1>
            {event.description && (
              <p className="text-white/80 text-lg max-w-xl mx-auto drop-shadow">
                {event.description}
              </p>
            )}
          </motion.div>

          {/* Carte d'information avec style appliqué */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={styleClass}
          >
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-[#1E3A8A]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1E3A8A] text-sm">Date</p>
                      <p className="text-gray-700">
                        {new Date(event.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {event.time && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-[#1E3A8A]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1E3A8A] text-sm">Heure</p>
                        <p className="text-gray-700">{event.time}</p>
                      </div>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#1E3A8A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-4 h-4 text-[#1E3A8A]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#1E3A8A] text-sm">Lieu</p>
                        <p className="text-gray-700">{event.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                      Style : <span className="font-medium capitalize text-[#1E3A8A]">{event.style || 'Classique'}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Alert className="mt-4 bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <AlertDescription className="text-green-700">
                    {success}
                  </AlertDescription>
                </div>
              </Alert>
            </motion.div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* QR CODE INDIVIDUEL */}
          {existingRSVP && existingRSVP.status === 'attending' && event.is_qr_active && qrImageUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mt-4 border-2 border-[#1E3A8A] bg-white/95 backdrop-blur-sm">
                <CardContent className="text-center py-6">
                  <p className="text-sm font-medium text-[#1E3A8A] mb-3">
                    🎫 Votre QR Code pour l'entrée
                  </p>
                  <div className="flex justify-center">
                    <img
                      src={qrImageUrl}
                      alt="QR Code individuel"
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Présentez ce QR Code à l'entrée de l'événement
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* IDENTIFICATION + RSVP */}
          {!existingRSVP && !success && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="mt-6 border-2 border-[#F59E0B] relative overflow-hidden bg-white/95 backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#F59E0B] to-[#10B981] h-1 animate-pulse" />

                <CardHeader>
                  <CardTitle className="text-center text-[#1E3A8A] text-xl flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                    Répondez à l'invitation
                    <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Émargement */}
                  <p className="text-sm font-medium text-[#1E3A8A] mb-3">
                    ✍️ Signez votre présence
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="space-y-1">
                      <Label htmlFor="guestName" className="text-sm text-gray-700">Nom et prénom *</Label>
                      <Input
                        id="guestName"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Ex: Awa Koffi"
                        className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="guestPhone" className="text-sm text-gray-700">Votre téléphone *</Label>
                      <Input
                        id="guestPhone"
                        type="tel"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="Ex: 97 00 00 00"
                        className="border-gray-300 focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLookup}
                    disabled={lookingUp}
                    className="text-xs text-[#1E3A8A] underline underline-offset-2 mb-4 hover:text-[#1E3A8A]/80"
                  >
                    {lookingUp ? 'Recherche en cours...' : 'Déjà répondu ? Retrouver ma réponse'}
                  </button>

                  {lookupNotFound && (
                    <p className="text-xs text-gray-500 mb-4">
                      Aucune réponse trouvée avec ce numéro. Répondez ci-dessous pour la première fois.
                    </p>
                  )}

                  <label className="flex items-start gap-2 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={infoCertified}
                      onChange={(e) => setInfoCertified(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A] cursor-pointer"
                    />
                    <span className="text-xs text-gray-600">
                      Je certifie ces informations exactes
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        className="w-full bg-[#10B981] hover:bg-[#10B981]/90 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                        onClick={() => handleRSVP('attending')}
                        disabled={submitting || !infoCertified}
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <Users className="w-5 h-5 mr-2" />
                        ✅ Je participe
                      </Button>
                    </motion.div>

                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                        onClick={() => handleRSVP('declined')}
                        disabled={submitting || !infoCertified}
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        <XCircle className="w-5 h-5 mr-2" />
                        ❌ Je ne participe pas
                      </Button>
                    </motion.div>
                  </div>

                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      👥 Nombre d'accompagnateurs
                    </label>
                    <select
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#1E3A8A] focus:ring-[#1E3A8A]"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.p
                    className="text-xs text-gray-400 text-center mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    💡 Votre réponse nous aide à mieux organiser l'événement
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {existingRSVP && !success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="mt-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="text-center py-8">
                  {existingRSVP.status === 'attending' ? (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="text-4xl mb-3"
                      >
                        🎉
                      </motion.div>
                      <p className="font-semibold text-[#10B981] text-lg">
                        Vous avez confirmé votre participation !
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {existingRSVP.number_of_guests > 0
                          ? `Avec ${existingRSVP.number_of_guests} accompagnateur${existingRSVP.number_of_guests > 1 ? 's' : ''}`
                          : 'Seul(e)'}
                      </p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="text-4xl mb-3"
                      >
                        😔
                      </motion.div>
                      <p className="font-semibold text-red-500 text-lg">
                        Vous avez décliné l'invitation
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {existingRSVP && !success && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <Card className="mt-4 bg-white/90 backdrop-blur-sm border border-[#F59E0B]/30 shadow-md">
                <CardContent className="text-center py-5">
                  <p className="text-sm text-gray-700">
                    ✨ Vous aussi, vous organisez un événement ?
                  </p>
                  <p className="text-xs text-gray-500 mt-1 mb-3">
                    Créez vos invitations et suivez vos RSVP en temps réel avec Eventvivo.
                  </p>
                  <a
                    href="https://eventvivo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    Créer mon événement gratuitement
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center py-6"
          >
            <div className="flex justify-center mb-2">
              <div className="flex items-center">
                <span className="text-white font-bold text-xl font-poppins drop-shadow">Event</span>
                <span className="text-[#F59E0B] font-bold text-xl font-poppins drop-shadow">vivo</span>
              </div>
            </div>
            <p className="text-xs text-white/40 drop-shadow">
              Propulsé par Eventvivo
            </p>
          </motion.div>
      </div>
    </div>
  )
}
