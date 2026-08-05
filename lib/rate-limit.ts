// lib/rate-limit.ts
//
// Limitation du taux de requêtes.
//
// - Si UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN sont configurées :
//   backend Redis (Upstash), partagé entre toutes les instances serverless —
//   seule option réellement fiable en production multi-instances.
// - Sinon : repli sur une Map en mémoire (utile en dev local), avec purge
//   périodique pour éviter une fuite mémoire non bornée.
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type LimitConfig = { windowMs: number; max: number }

// Limites par action. `default` préserve le comportement historique
// (5 req/min) pour les appels existants qui ne précisent pas d'action.
const LIMIT_CONFIGS: Record<string, LimitConfig> = {
  default: { windowMs: 60_000, max: 5 },
  'login:ip': { windowMs: 60_000, max: 10 },
  'login:identifier': { windowMs: 15 * 60_000, max: 5 },
  'signup:ip': { windowMs: 60_000, max: 5 },
  'signup:identifier': { windowMs: 15 * 60_000, max: 3 },
  'reset_password:ip': { windowMs: 60_000, max: 5 },
  'reset_password:identifier': { windowMs: 15 * 60_000, max: 3 },
  'update_password:ip': { windowMs: 60_000, max: 10 },
  'update_password:identifier': { windowMs: 15 * 60_000, max: 5 },
  'log_event:ip': { windowMs: 60_000, max: 20 },
  'invitation_lookup:ip': { windowMs: 60_000, max: 20 },
  'invitation_rsvp:ip': { windowMs: 60_000, max: 10 },
}

function windowLabel(ms: number): `${number} ms` {
  return `${ms} ms`
}

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const redis = UPSTASH_URL && UPSTASH_TOKEN ? new Redis({ url: UPSTASH_URL, token: UPSTASH_TOKEN }) : null

const upstashLimiters = new Map<string, Ratelimit>()

function getUpstashLimiter(action: string, config: LimitConfig): Ratelimit {
  let limiter = upstashLimiters.get(action)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(config.max, windowLabel(config.windowMs)),
      prefix: `eventvivo:ratelimit:${action}`,
      analytics: false,
    })
    upstashLimiters.set(action, limiter)
  }
  return limiter
}

// --- Repli mémoire (dev local / Upstash non configuré) ---------------------

const memoryStore = new Map<string, { count: number; resetTime: number }>()

const MEMORY_SWEEP_INTERVAL_MS = 5 * 60_000
let lastSweep = Date.now()

function sweepExpired(now: number) {
  if (now - lastSweep < MEMORY_SWEEP_INTERVAL_MS) return
  lastSweep = now
  for (const [key, record] of memoryStore) {
    if (now > record.resetTime) memoryStore.delete(key)
  }
}

function memoryLimit(key: string, config: LimitConfig): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  sweepExpired(now)

  const record = memoryStore.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + config.windowMs
    memoryStore.set(key, { count: 1, resetTime })
    return { success: true, remaining: config.max - 1, resetAt: resetTime }
  }

  if (record.count < config.max) {
    record.count++
    return { success: true, remaining: config.max - record.count, resetAt: record.resetTime }
  }

  return { success: false, remaining: 0, resetAt: record.resetTime }
}

// --- API publique ------------------------------------------------------------

export const rateLimit = {
  /**
   * @param identifier clé à limiter (IP, email, "action:email", ...)
   * @param action nom logique de l'action (voir LIMIT_CONFIGS) — détermine
   *   la fenêtre/le plafond appliqués. Par défaut : 5 req/min (comportement
   *   historique, utilisé par les routes API existantes).
   */
  limit: async (
    identifier: string,
    action: keyof typeof LIMIT_CONFIGS | (string & {}) = 'default'
  ): Promise<{ success: boolean; remaining?: number; resetAt?: number }> => {
    const config = LIMIT_CONFIGS[action] ?? LIMIT_CONFIGS.default
    const key = `${action}:${identifier}`

    if (redis) {
      const limiter = getUpstashLimiter(action, config)
      const result = await limiter.limit(identifier)
      return { success: result.success, remaining: result.remaining, resetAt: result.reset }
    }

    return memoryLimit(key, config)
  },
}
