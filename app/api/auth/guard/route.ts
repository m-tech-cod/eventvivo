// app/api/auth/guard/route.ts
//
// Pré-vérification appelée par les pages d'authentification (login,
// reset-password, update-password) AVANT d'appeler supabase-js. Applique
// la limitation de taux (par IP et par identifiant ciblé) et la
// vérification serveur du captcha, et journalise la tentative.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { verifyCaptcha } from '@/lib/hcaptcha'
import { logSecurityEvent } from '@/lib/security-log'

export const dynamic = 'force-dynamic'

const guardSchema = z.object({
  action: z.enum(['login', 'signup', 'reset_password', 'update_password']),
  identifier: z.string().min(1).max(255),
  captchaToken: z.string().optional(),
})

const CAPTCHA_REQUIRED_ACTIONS = new Set(['login', 'signup', 'reset_password'])

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const userAgent = request.headers.get('user-agent') || undefined

  const body = await request.json().catch(() => null)
  const parsed = guardSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ allowed: false, error: 'invalid_request' }, { status: 400 })
  }

  const { action, identifier, captchaToken } = parsed.data
  const normalizedIdentifier = identifier.trim().toLowerCase()

  const [ipLimit, identifierLimit] = await Promise.all([
    rateLimit.limit(ip, `${action}:ip`),
    rateLimit.limit(normalizedIdentifier, `${action}:identifier`),
  ])

  if (!ipLimit.success || !identifierLimit.success) {
    await logSecurityEvent({
      event_type: `${action}_rate_limited`,
      ip_address: ip,
      user_agent: userAgent,
      severity: 'warning',
      details: { identifier: normalizedIdentifier },
    })
    return NextResponse.json(
      { allowed: false, error: 'rate_limited' },
      { status: 429 }
    )
  }

  if (CAPTCHA_REQUIRED_ACTIONS.has(action)) {
    const captchaResult = await verifyCaptcha(captchaToken, ip)
    if (!captchaResult.success) {
      await logSecurityEvent({
        event_type: `${action}_captcha_failed`,
        ip_address: ip,
        user_agent: userAgent,
        severity: 'warning',
        details: { identifier: normalizedIdentifier, reason: captchaResult.error },
      })
      return NextResponse.json({ allowed: false, error: 'captcha_failed' }, { status: 400 })
    }
  }

  await logSecurityEvent({
    event_type: `${action}_attempt`,
    ip_address: ip,
    user_agent: userAgent,
    details: { identifier: normalizedIdentifier },
  })

  return NextResponse.json({ allowed: true })
}
