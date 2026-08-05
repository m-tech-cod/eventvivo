// app/api/auth/log-event/route.ts
//
// Journalise le RÉSULTAT d'une opération d'authentification (succès/échec)
// depuis le navigateur, une fois l'appel supabase-js résolu. L'IP et le
// user-agent sont capturés côté serveur (jamais fournis par le client).
// L'event_type est strictement whitelisté pour empêcher un client
// d'injecter des entrées arbitraires dans security_logs.
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { logSecurityEvent } from '@/lib/security-log'

export const dynamic = 'force-dynamic'

const ALLOWED_EVENT_TYPES = new Set([
  'login_success',
  'login_failed',
  'signup_success',
  'signup_failed',
  'reset_password_requested',
  'update_password_success',
  'update_password_failed',
  'update_password_no_session',
  'oauth_callback_success',
  'oauth_callback_failed',
])

const logEventSchema = z.object({
  event_type: z.string().min(1).max(100),
  user_id: z.string().uuid().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
})

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  const { success } = await rateLimit.limit(ip, 'log_event:ip')
  if (!success) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const parsed = logEventSchema.safeParse(body)

  if (!parsed.success || !ALLOWED_EVENT_TYPES.has(parsed.data.event_type)) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 })
  }

  const { event_type, user_id, details } = parsed.data
  const userAgent = request.headers.get('user-agent') || undefined

  await logSecurityEvent({
    event_type,
    user_id,
    ip_address: ip,
    user_agent: userAgent,
    severity: event_type.endsWith('failed') || event_type.endsWith('no_session') ? 'warning' : 'info',
    details,
  })

  return NextResponse.json({ success: true })
}
