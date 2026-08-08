import Link from 'next/link'
import { BackgroundImage } from '@/components/ui/BackgroundImage'

export default function NotFound() {
  return (
    <BackgroundImage src="/images/foule.webp" animate="zoom" overlayOpacity={0.35} priority>
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#1E3A8A]">Page introuvable</h1>
          <p className="text-gray-600 mt-2">
            Cette page n'existe pas, a été supprimée, ou l'invitation que vous cherchez est arrivée à expiration.
          </p>
          <Link href="/fr" className="inline-block mt-6 text-[#1E3A8A] hover:underline font-medium">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </BackgroundImage>
  )
}
