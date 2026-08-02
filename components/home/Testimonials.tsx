'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    name: 'Jeannine AGUEMON',
    event: 'Mariage traditionnel',
    text: 'Eventvivo a facilité mon mariage. Invitations et QR Code, tout le monde a kiffé ! Je recommande fort, wô !',
    rating: 5,
    image: '/images/testimonials/jeanine.webp',
  },
  {
    name: 'Hassan Amadou',
    event: 'Anniversaire 19 ans',
    text: 'Le suivi des invités en temps réel m\'a permis de gérer mon anniversaire sans stress. Mes invités ont adoré l\'invitation personnalisée !',
    rating: 5,
    image: '/images/testimonials/hassan.webp',
  },
  {
    name: 'Hawa',
    event: 'Mariage traditionnel',
    text: 'Eventvivo a simplifié l\'organisation de mon mariage. Les invitations numériques ont été un vrai succès !',
    rating: 5,
    image: '/images/testimonials/hawa.webp',
  },
  {
    name: 'Sabrina',
    event: 'Mariage religieux',
    text: 'Eventvivo a drôlement simplifié l\'organisation de mon mariage. Les invitations numériques, c\'était une vraie réussite !',
    rating: 5,
    image: '/images/testimonials/sabrina.webp',
  },
  {
    name: 'Fatima Mimche',
    event: 'Picnic',
    text: 'Le suivi des invités en temps réel, c\'était la sauce secrète de mon picnic. Zéro stress, tout sous contrôle ! Je vous dis pas comment j\'ai kiffé. Je recommande à mort !',
    rating: 5,
    image: '/images/testimonials/fatima.webp',
  },
  {
    name: 'Nazif OWOLABI',
    event: 'Baptême de mon fils',
    text: 'Les QR Codes ont rendu le contrôle à l\'entrée très facile. Mes invités ont adoré !',
    rating: 4,
    image: '/images/testimonials/nazif.webp',
  },
  {
    name: 'Halid',
    event: 'Anniversaire 22 ans',
    text: 'Le lien RSVP et les QR Codes ont rendu l\'accès à mon événement tellement simple. Mes invités ont adoré la fluidité du processus !',
    rating: 4,
    image: '/images/testimonials/halid.webp',
  },
]

export function Testimonials() {
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    let animationId: number
    let position = 0
    const speed = 0.5

    const content = scroller.innerHTML
    scroller.innerHTML = content + content

    const animate = () => {
      position -= speed
      if (Math.abs(position) >= scroller.scrollWidth / 2) {
        position = 0
      }
      scroller.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <section className="py-16 px-4 bg-white overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A8A] font-poppins mb-4">
            Ce que nos utilisateurs disent
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez les retours de ceux qui ont déjà organisé leurs événements avec Eventvivo
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div
            ref={scrollerRef}
            className="flex gap-6 whitespace-nowrap will-change-transform"
            style={{ width: 'max-content' }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="inline-block w-72 md:w-80 flex-shrink-0"
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-2 hover:border-[#1E3A8A]/20">
                  <CardContent className="p-6">
                    {/* ✅ AVATAR AVEC PHOTO */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={testimonial.image}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1E3A8A] truncate">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {testimonial.event}
                        </p>
                      </div>
                    </div>

                    {/* Étoiles */}
                    <div className="flex text-[#F59E0B] mb-2">
                      {'★'.repeat(testimonial.rating)}
                      {'☆'.repeat(5 - testimonial.rating)}
                    </div>

                    {/* Texte */}
                    <p className="text-sm text-gray-600 italic line-clamp-4 whitespace-normal">
                      "{testimonial.text}"
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}