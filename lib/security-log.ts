// lib/security-log.ts
//
// Journalisation des événements de sécurité (tentatives de connexion,
// captcha invalide, rate limit atteint, etc.).
//
// ⚠️ Ce module doit UNIQUEMENT être importé depuis du code serveur (route
// handlers, middleware). Il utilise le client `service_role` pour écrire
// dans `security_logs` quelles que soient les policies RLS — la table peut
// donc être verrouillée côté Supabase pour interdire tout accès direct
// depuis un client anonyme ou authentifié (lecture réservée aux admins via
// une route API dédiée, écriture réservée au service_role).
import { createAdminClient } from '@/lib/supabase/admin'

export type SecurityEventType =
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | 'login_rate_limited'
  | 'login_captcha_failed'
  | 'reset_password_attempt'
  | 'reset_password_requested'
  | 'reset_password_rate_limited'
  | 'reset_password_captcha_failed'
  | 'update_password_attempt'
  | 'update_password_success'
  | 'update_password_failed'
  | 'update_password_rate_limited'
  | 'update_password_no_session'
  | 'oauth_callback_success'
  | 'oauth_callback_failed'
  | 'signup_rate_limited'
  | 'signup_captcha_failed'
  | 'invalid_promo_code'
  | 'expired_promo_code'
  | 'valid_promo_code'
  | string

export type SecuritySeverity = 'info' | 'warning' | 'critical'

export async function logSecurityEvent({
  event_type,
  user_id,
  ip_address,
  user_agent,
  severity = 'info',
  details,
}: {
  event_type: SecurityEventType
  user_id?: string | null
  ip_address?: string | null
  user_agent?: string | null
  severity?: SecuritySeverity
  details?: Record<string, unknown>
}) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('security_logs').insert({
      event_type,
      user_id: user_id ?? null,
      ip_address: ip_address ?? null,
      user_agent: user_agent ?? null,
      severity,
      details: details ?? null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      // Le logging ne doit jamais interrompre le flux applicatif (login,
      // reset password, etc.) — on trace juste l'échec côté serveur.
      console.error('[security-log] insertion échouée:', error.message)
    }
  } catch (err) {
    console.error('[security-log] exception:', err)
  }
}
