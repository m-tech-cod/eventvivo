// lib/validations/payment.ts
import { z } from 'zod'

export const paymentSchema = z.object({
  event_id: z.string().optional(), // peut valoir 'pending' avant la création de l'événement
  amount: z.number().positive().min(0.01),
  currency: z.enum(['XOF', 'XAF', 'EUR', 'USD']),
  payment_method: z.enum(['mobile_money', 'card', 'paypal']),
  promo_code: z.string().optional().nullable(),
  ambassador_id: z.string().uuid().optional().nullable(),
  plan_type: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>
