'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronLeft, ChevronRight, Calendar, Users, QrCode, BarChart3, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const slides = [
  {
    id: 1,
    title: 'Invitation numérique',
    description: 'Créez et personnalisez vos invitations en quelques clics',
    icon: <Calendar className="w-10 h-10" />,
    gradient: 'from-[#1E3A8A] via-[#1E3A8A]/90 to-[#1E3A8A]/70',
    accent: '#F59E0B',
  },
  {
    id: 2,
    title: 'RSVP en temps réel',
    description: 'Recevez les confirmations de présence instantanément',
    icon: <Users className="w-10 h-10" />,
    gradient: 'from-[#10B981] via-[#10B981]/90 to-[#10B981]/70',
    accent: '#ffffff',
  },
  {
    id: 3,
    title: 'QR Code sécurisé',
    description: 'Contrôlez l\'accès à votre événement en scannant les QR Codes',
    icon: <QrCode className="w-10 h-10" />,
    gradient: 'from-[#F59E0B] via-[#F59E0B]/90 to-[#F59E0B]/70',
    accent: '#1E3A8A',
  },
  {
    id: 4,
    title: 'Tableau de bord live',
    description: 'Suivez les statistiques de votre événement en direct',
    icon: <BarChart3 className="w-10 h-10" />,
    gradient: 'from-[#6B7FCC] via-[#6B7FCC]/90 to-[#1E3A8A]/70',
    accent: '#F59E0B',
  },
]

const slideVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
}

export function HeroCarousel() {
  const { user } = useAuth()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused])

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)

  return (
    <section className="relative overflow-hidden text-white py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/15">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-sm font-medium text-white/90">Plateforme événementielle tout-en-un</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Texte principal */}
          <div className="flex-1 text-center lg:text-left">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6 leading-tight drop-shadow-lg"
            >
              Organisez vos événements{' '}
              <span className="relative inline-block">
                <span className="text-[#F59E0B]">sans stress</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="absolute -bottom-1 left-0 w-full h-1 bg-[#F59E0B]/40 rounded-full origin-left"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-lg md:text-xl text-white/85 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed drop-shadow"
            >
              Invitations numériques, RSVP, QR Codes et suivi des invités en temps réel.
              Du mariage au baptême — tout en un seul endroit.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex justify-center lg:justify-start mb-8"
            >
              <Link href={user ? '/fr/dashboard' : '/fr/auth/register'}>
                <Button className="group bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#1E3A8A] font-bold px-8 py-6 text-lg shadow-lg shadow-[#F59E0B]/25 hover:shadow-xl hover:shadow-[#F59E0B]/35 transition-all duration-300 rounded-xl">
                  {user ? 'Accéder au dashboard' : "Créer mon événement — c'est gratuit"}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            {/* Micro social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 justify-center lg:justify-start text-sm text-white/70"
            >
              <span className="flex items-center gap-1">
                <span className="text-[#F59E0B]">★★★★★</span> 4.9/5
              </span>
              <span className="w-px h-4 bg-white/20" />
              <span>✓ Gratuit pour commencer</span>
              <span className="w-px h-4 bg-white/20" />
              <span>✓ Sans carte bancaire</span>
            </motion.div>
          </div>

          {/* Carousel card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-xs mx-auto lg:mx-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-3 shadow-2xl border border-white/15">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} flex flex-col items-center justify-center p-8 text-center`}
                  >
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-sm"
                      style={{ backgroundColor: `${slides[currentSlide].accent}20`, color: slides[currentSlide].accent }}
                    >
                      {slides[currentSlide].icon}
                    </div>

                    <h3 className="text-xl font-bold font-poppins mb-2 text-white">
                      {slides[currentSlide].title}
                    </h3>
                    <p className="text-white/70 text-sm max-w-[200px] leading-relaxed">
                      {slides[currentSlide].description}
                    </p>

                    <div
                      className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${slides[currentSlide].accent}30`, color: slides[currentSlide].accent }}
                    >
                      {currentSlide + 1}/{slides.length}
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-400 ${
                        index === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 backdrop-blur-sm rounded-full p-2 text-white transition-all hover:scale-110"
                aria-label="Précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/25 hover:bg-black/45 backdrop-blur-sm rounded-full p-2 text-white transition-all hover:scale-110"
                aria-label="Suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-white/50 text-xs mt-3 drop-shadow">
              Mariage · Anniversaire · Baptême · Dot · Fête privée
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}