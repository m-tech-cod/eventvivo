'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setChecking(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        setIsAdmin(false)
      } else {
        setIsAdmin(data.role === 'admin')
      }
      setChecking(false)
    }

    if (!loading) {
      checkAdmin()
    }
  }, [user, loading, supabase])

  useEffect(() => {
    if (!loading && !checking) {
      if (!user) {
        router.push('/fr/auth/login')
      } else if (!isAdmin) {
        router.push('/fr/dashboard')
      }
    }
  }, [user, loading, checking, isAdmin, router])

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF8]">
        <div className="text-[#1E3A8A]">Chargement...</div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return <>{children}</>
}