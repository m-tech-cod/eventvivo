'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Calendar, User, Plus, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuth()
  
  const isActive = (path: string) => pathname === path

  // ✅ Fonction pour gérer le clic sur "Créer"
  const handleCreateClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      router.push('/fr/auth/login')
    }
  }

  // ✅ Fonction pour gérer les liens protégés
  const handleProtectedClick = (e: React.MouseEvent, href: string) => {
    if (!user) {
      e.preventDefault()
      router.push('/fr/auth/login')
    }
  }
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {/* Dashboard - Protégé, masqué si déconnecté (évite qu'il soit indexé) */}
        {user && (
          <Link
            href="/fr/dashboard"
            onClick={(e) => handleProtectedClick(e, '/fr/dashboard')}
            className={`flex flex-col items-center gap-1 text-xs ${
              isActive('/fr/dashboard') ? 'text-[#1E3A8A]' : 'text-gray-500'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
        )}

        {/* Événements - Protégé */}
        <Link
          href="/fr/events"
          onClick={(e) => handleProtectedClick(e, '/fr/events')}
          className={`flex flex-col items-center gap-1 text-xs ${
            isActive('/fr/events') ? 'text-[#1E3A8A]' : 'text-gray-500'
          }`}
        >
          <Calendar size={20} />
          <span>Événements</span>
        </Link>
        
        {/* Créer - Protégé */}
        <Link
          href="/fr/events/create"
          onClick={handleCreateClick}
          className="flex flex-col items-center gap-1 text-xs text-white bg-[#F59E0B] rounded-full p-3 -mt-6 shadow-lg"
        >
          <Plus size={24} />
          <span className="sr-only">Créer</span>
        </Link>
      </div>
    </nav>
  )
}