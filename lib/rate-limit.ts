// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Créer un client Redis (gratuit avec Upstash)
const redis = Redis.fromEnv()

// Limite : 5 requêtes par minute par IP
export const rateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true, // Active les stats
})