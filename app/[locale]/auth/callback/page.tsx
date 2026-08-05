// app/[locale]/auth/callback/page.tsx
'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

async function logOutcome(event_type: string, user_id?: string, details?: Record<string, unknown>) {
  try {
    await fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type, user_id, details }),
    })
  } catch {
    // La journalisation ne doit jamais bloquer le parcours utilisateur.
  }
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase ajoute ces paramètres à l'URL de retour quand l'échange
      // OAuth/magic-link échoue (lien expiré, accès refusé, etc.).
      const oauthError = searchParams.get('error') || searchParams.get('error_description')

      if (oauthError) {
        await logOutcome('oauth_callback_failed', undefined, { reason: oauthError })
        setError('La connexion a échoué ou le lien a expiré. Merci de réessayer.')
        setTimeout(() => router.push('/fr/auth/login'), 2500)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        await logOutcome('oauth_callback_success', session.user.id)
        router.push('/fr/dashboard')
      } else {
        await logOutcome('oauth_callback_failed', undefined, { reason: 'no_session' })
        router.push('/fr/auth/login')
      }
    }

    handleCallback()
  }, [router, supabase, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A] mx-auto"></div>
        <p className="mt-4 text-gray-600">{error || 'Connexion en cours...'}</p>
      </div>
    </div>
  )
}