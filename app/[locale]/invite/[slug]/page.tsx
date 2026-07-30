import { createClient } from '@/lib/supabase/client'
import { Metadata } from 'next'
import { BackgroundImage } from '@/components/ui/BackgroundImage'
import InvitationClient from './InvitationClient'

// ✅ generateMetadata pour les métadonnées Open Graph
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!event) {
    return {
      title: 'Invitation non trouvée',
      description: 'Cette invitation n\'existe pas ou a été supprimée.',
    }
  }

  const coverImage = event.cover_image || '/images/og-event-default.jpg'
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
export default async function InvitationPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .single()

  // Si l'événement n'existe pas, on affiche une erreur
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
      src={event.cover_image || '/images/foule.webp'}
      animate="zoom" overlayOpacity={0.35}
       className="min-h-screen py-20"
    >
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <InvitationClient slug={params.slug} />
      </div>
    </BackgroundImage>
  )
}