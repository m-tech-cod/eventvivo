'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '@/components/shared/Logo'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  
  const isAuthPage = pathname?.includes('/auth/')
  
  if (isAuthPage) {
    return null
  }
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-600 hover:text-[#1E3A8A]">Accueil</Link>
          {user && <Link href="/fr/dashboard" className="text-gray-600 hover:text-[#1E3A8A]">Dashboard</Link>}
          <Link href="/fr/pricing" className="text-gray-600 hover:text-[#1E3A8A]">Tarifs</Link>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {user.user_metadata?.first_name || user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-[#1E3A8A] hover:underline"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link href="/fr/auth/login">
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                Se connecter
              </Button>
            </Link>
          )}
        </nav>
        
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-gray-600 hover:text-[#1E3A8A]">Accueil</Link>
            {user && <Link href="/fr/dashboard" className="text-gray-600 hover:text-[#1E3A8A]">Dashboard</Link>}
            <Link href="/fr/pricing" className="text-gray-600 hover:text-[#1E3A8A]">Tarifs</Link>

            {user ? (
              <button
                onClick={() => signOut()}
                className="text-left text-[#1E3A8A] hover:underline"
              >
                Déconnexion
              </button>
            ) : (
              <Link href="/fr/auth/login">
                <Button className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white">
                  Se connecter
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}