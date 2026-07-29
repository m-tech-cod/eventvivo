// lib/validations/payment.ts
import { z } from 'zod'

export const paymentSchema = z.object({
  event_id: z.string().uuid(),
  amount: z.number().positive().min(0.01),
  currency: z.enum(['XOF', 'EUR', 'USD']),
  payment_method: z.enum(['mobile_money', 'card', 'paypal']),
  promo_code: z.string().optional(),
  ambassador_id: z.string().uuid().optional(),
})