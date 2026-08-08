import { cache } from 'react'
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import Script from 'next/script'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import InvitationClient from './InvitationClient'

// ISR : ces pages sont partagées en masse (WhatsApp/SMS) et consultées par
// de nombreux invités pour un même événement sur une courte période. Le
// contenu (nom, date, lieu, style) change rarement une fois publié — le
// servir depuis le cache pendant 60s réduit drastiquement le temps de
// réponse par rapport à une requête Supabase à chaque visite.
export const revalidate = 60

type Params = { params: Promise<{ slug: string; locale: string }> }

const EVENT_COLUMNS = 'id, slug, name, description, date, time, location, type, style, cover_image, is_qr_active'

// Dédup : generateMetadata() et le composant de page sont tous deux
// invoqués par Next.js pour la même requête — cache() garantit qu'une seule
// requête Supabase réelle est exécutée pour les deux, au lieu de deux.
const getEventBySlug = cache(async (slug: string) => {
  const supabase = await createServerClient()
  const { data: event } = await supabase
    .from('events')
    .select(EVENT_COLUMNS)
    .eq('slug', slug)
    .single()

  return event
})

// Image de secours par style, utilisée quand l'organisateur n'a pas
// uploadé de photo de couverture personnalisée. Chaque style doit
// avoir un fichier correspondant dans /public/images/styles/.
const STYLE_BACKGROUNDS: Record<string, string> = {
  classique: '/images/styles/classique.jpg',
  moderne: '/images/styles/moderne.jpg',
  nature: '/images/styles/nature.jpg',
  elegant: '/images/styles/elegant.jpg',
  luxe: '/images/styles/luxe.jpg',
}

const DEFAULT_BACKGROUND = '/images/foule.webp'

function getEventBackground(event: { cover_image?: string | null; style?: string | null }) {
  return event.cover_image || STYLE_BACKGROUNDS[event.style || ''] || DEFAULT_BACKGROUND
}

// ✅ generateMetadata pour les métadonnées Open Graph
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    return {
      title: 'Invitation non trouvée',
      description: 'Cette invitation n\'existe pas ou a été supprimée.',
    }
  }

  // Priorité : photo uploadée par l'organisateur > image par défaut du style choisi
  const coverImage = getEventBackground(event)
  const eventUrl = `https://eventvivo.com/fr/invite/${event.slug}`

  return {
    title: event.name,
    description: event.description || `Rejoignez-nous pour ${event.name}`,
    openGraph: {
      title: event.name,
      description: event.description || `Rejoignez-nous pour ${event.name}`,
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
      type: 'website',
      url: eventUrl,
      siteName: 'Eventvivo',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description: event.description || `Rejoignez-nous pour ${event.name}`,
      images: [coverImage],
    },
    alternates: {
      canonical: eventUrl,
    },
  }
}

// ✅ Composant serveur avec BackgroundImage
export default async function InvitationPage({ params }: Params) {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  const eventSchema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description || `Rejoignez-nous pour ${event.name}`,
    startDate: event.time ? `${event.date}T${event.time}` : event.date,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    ...(event.location && {
      location: {
        '@type': 'Place',
        name: event.location,
        address: event.location,
      },
    }),
    image: [getEventBackground(event)],
    organizer: {
      '@type': 'Organization',
      name: 'Eventvivo',
      url: 'https://eventvivo.com',
    },
  }

  return (
    <BackgroundImage
      src={getEventBackground(event)}
      animate="zoom"
      overlayOpacity={0.35}
      className="min-h-screen py-16"
      priority
    >
      <Script
        id="event-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <div className="flex-1 overflow-y-auto">
        <InvitationClient slug={slug} initialEvent={event} />
      </div>
    </BackgroundImage>
  )
}
