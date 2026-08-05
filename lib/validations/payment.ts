// lib/validations/payment.ts
import { z } from 'zod'

// ⚠️ Pas de champ `amount` : le montant n'est JAMAIS accepté depuis le
// client (voir api/payments/fedapay/route.ts) — il est recalculé
// côté serveur à partir de `plan_type`/`currency` via getPriceForCurrency,
// seule source de vérité sur les prix. Accepter un montant client, même
// "juste pour l'affichage", ouvrait la porte à un paiement à prix arbitraire.
export const paymentSchema = z.object({
  event_id: z.string().optional(), // peut valoir 'pending' avant la création de l'événement
  currency: z.enum(['XOF', 'XAF', 'EUR', 'USD']),
  payment_method: z.enum(['mobile_money', 'card', 'paypal']),
  promo_code: z.string().optional().nullable(),
  ambassador_id: z.string().uuid().optional().nullable(),
  plan_type: z.enum(['standard', 'prestige', 'vip']),
})

export type PaymentInput = z.infer<typeof paymentSchema>
