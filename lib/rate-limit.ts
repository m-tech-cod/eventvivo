// lib/rate-limit.ts
const requestCounts = new Map<string, { count: number; resetTime: number }>()

const windowMs = 60 * 1000 // 1 minute
const maxRequests = 5 // 5 requêtes par minute

export const rateLimit = {
  limit: async (ip: string) => {
    const now = Date.now()
    const record = requestCounts.get(ip)

    // Si pas de record ou expiré, créer un nouveau
    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
      return { success: true }
    }

    // Incrémenter le compteur
    if (record.count < maxRequests) {
      record.count++
      return { success: true }
    }

    // Trop de requêtes
    return { success: false }
  }
}