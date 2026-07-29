'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, User, Plus, LayoutDashboard } from 'lucide-react'

export function MobileNavigation() {
  const pathname = usePathname()
  
  const isActive = (path: string) => pathname === path
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 text-xs ${
            isActive('/dashboard') ? 'text-[#1E3A8A]' : 'text-gray-500'
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        
        <Link
          href="/events"
          className={`flex flex-col items-center gap-1 text-xs ${
            isActive('/events') ? 'text-[#1E3A8A]' : 'text-gray-500'
          }`}
        >
          <Calendar size={20} />
          <span>Événements</span>
        </Link>
        
        <Link
          href="/events/create"
          className="flex flex-col items-center gap-1 text-xs text-white bg-[#F59E0B] rounded-full p-3 -mt-6 shadow-lg"
        >
          <Plus size={24} />
          <span className="sr-only">Créer</span>
        </Link>
        
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 text-xs ${
            isActive('/profile') ? 'text-[#1E3A8A]' : 'text-gray-500'
          }`}
        >
          <User size={20} />
          <span>Profil</span>
        </Link>
      </div>
    </nav>
  )
}