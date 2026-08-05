// lib/security-headers.ts
//
// Construction des en-têtes de sécurité HTTP. Helper pur (aucun effet de
// bord réseau) importé par `proxy.ts` — le point d'entrée que Next.js
// exécute réellement (voir proxy.ts).
//
// ⚠️ Ce fichier ne doit JAMAIS s'appeler `middleware.ts` ou `proxy.ts` : ce
// sont des noms réservés par la convention de fichiers de Next.js (16+
// détecte `proxy.ts`/`proxy.js` à la racine et exige qu'il exporte une
// fonction nommée `proxy`) — les réutiliser comme simple module utilitaire
// provoque une erreur de démarrage ("Both middleware file and proxy file
// are detected").
import { NextResponse } from 'next/server'

const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline'/'unsafe-eval' restent nécessaires pour le runtime Next.js
  // et certaines libs tierces (framer-motion, hCaptcha). hCaptcha et Google
  // (OAuth) sont explicitement whitelistés, rien d'autre.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com https://accounts.google.com",
  "style-src 'self' 'unsafe-inline' https://hcaptcha.com",
  "img-src 'self' data: blob: https://*.supabase.co https://hcaptcha.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://hcaptcha.com https://*.hcaptcha.com",
  "frame-src https://hcaptcha.com https://*.hcaptcha.com https://accounts.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

export function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  response.headers.set('Content-Security-Policy', CSP_DIRECTIVES)
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')

  return response
}
