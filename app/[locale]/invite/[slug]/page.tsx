import { createServerClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import InvitationClient from './InvitationClient'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string; locale: string }> }

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
  const supabase = await createServerClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  console.log('[generateMetadata] slug:', slug, '| event:', event, '| error:', error)

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
  const supabase = await createServerClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single()

  console.log('[InvitationPage] slug:', slug, '| event:', event, '| error:', error)

  if (!event) {
    return (
      <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35}>
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl text-center max-w-md">
            <h1 className="text-2xl font-bold text-[#1E3A8A]">Invitation non trouvée</h1>
            <p className="text-gray-600 mt-2">Cette invitation n'existe pas ou a été supprimée.</p>
          </div>
        </div>
      </BackgroundImage>
    )
  }

  return (
    <BackgroundImage
      src={getEventBackground(event)}
      animate="zoom"
      overlayOpacity={0.35}
      className="min-h-screen py-16"
    >
      <div className="flex-1 overflow-y-auto">
        <InvitationClient slug={slug} />
      </div>
    </BackgroundImage>
  )
}
