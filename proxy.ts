// proxy.ts
//
// Point d'entrée réel exécuté par Next.js sur chaque requête (convention
// "proxy" depuis Next.js 16 — anciennement `middleware.ts`, renommé par le
// framework : voir https://nextjs.org/docs/messages/middleware-to-proxy).
// La fonction exportée DOIT s'appeler `proxy` (pas `middleware`), sans quoi
// Next.js n'exécute rien.
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { applySecurityHeaders } from '@/lib/security-headers'

// Préfixes nécessitant une session valide. Le contrôle de rôle (admin) reste
// vérifié plus finement côté page/API — ceci bloque l'accès non authentifié
// au niveau serveur, avant même le premier rendu (contrairement aux gardes
// actuelles, purement côté client, qui laissent passer un flash de contenu).
const PROTECTED_PREFIXES = ['/fr/dashboard', '/fr/admin']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // getUser() (et non getSession()) car il revalide le token auprès de
  // Supabase plutôt que de faire confiance à un cookie potentiellement
  // périmé/forgé.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

  if (isProtected && !user) {
    const loginUrl = new URL('/fr/auth/login', request.url)
    loginUrl.searchParams.set('redirectedFrom', pathname)
    return applySecurityHeaders(NextResponse.redirect(loginUrl))
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
