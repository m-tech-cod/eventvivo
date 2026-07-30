import { createClient } from '@/lib/supabase/client'
import { BackgroundImage } from '@/components/ui/BackgroundImage'

export default async function InvitationPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600">Invitation non trouvée</h1>
          <p className="text-gray-600 mt-2">Cette invitation n'existe pas ou a été supprimée.</p>
        </div>
      </div>
    )
  }

  return (
    <BackgroundImage src={event.cover_image || '/images/foule.webp'} overlayOpacity={0.35}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center text-[#1E3A8A]">{event.name}</h1>
          <p className="text-center text-gray-600 mt-2">{event.description}</p>
          <div className="mt-6 space-y-2">
            <p><strong>Date :</strong> {new Date(event.date).toLocaleDateString('fr-FR')}</p>
            {event.location && <p><strong>Lieu :</strong> {event.location}</p>}
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Pour confirmer votre présence, contactez l'organisateur.</p>
          </div>
        </div>
      </div>
    </BackgroundImage>
  )
}