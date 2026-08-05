// app/api/payments/[id]/receipt/route.ts
//
// Régénère à la demande le PDF du reçu d'un paiement (Option A : seul
// `receipt_number` est conservé en base, le PDF est reconstruit ici avec les
// données déjà présentes sur payments/events/profiles — voir le webhook
// FedaPay pour la génération initiale équivalente).
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReceiptPDF } from '@/lib/pdf/receipt'

export const dynamic = 'force-dynamic'

const PLAN_NAMES: Record<string, string> = {
  free: 'Gratuit',
  standard: 'Standard — 100 invités, 5 styles, Export PDF',
  prestige: 'Prestige — 500 invités, QR Codes, Export Excel, PDF HD',
  vip: 'VIP / Illimité — Invités illimités, Support WhatsApp, Sans mention',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  // Client admin : on vérifie la propriété du paiement explicitement dans le
  // code ci-dessous plutôt que de dépendre d'une policy RLS sur `payments`
  // (même logique que les autres routes serveur écrites aujourd'hui).
  const admin = createAdminClient()

  const { data: payment } = await admin
    .from('payments')
    .select('*, events (name)')
    .eq('id', id)
    .maybeSingle()

  if (!payment || !payment.receipt_number) {
    return NextResponse.json({ error: 'Reçu introuvable' }, { status: 404 })
  }

  const { data: requesterProfile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const isOwner = payment.user_id === user.id
  const isAdmin = requesterProfile?.role === 'admin'
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { data: customer } = await admin
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('id', payment.user_id)
    .maybeSingle()

  const planName = PLAN_NAMES[payment.plan_type] || payment.plan_type

  const pdfBuffer = generateReceiptPDF({
    number: payment.receipt_number,
    date: payment.completed_at || payment.created_at,
    customerName: customer ? `${customer.first_name} ${customer.last_name}` : 'Client Eventvivo',
    customerEmail: customer?.email || '',
    eventId: payment.event_id,
    eventName: payment.events?.name || null,
    planName,
    planPrice: payment.final_amount || payment.amount,
    currency: payment.currency || 'XOF',
    paymentMethod: payment.payment_method || 'mobile_money',
    transactionId: payment.transaction_id,
  })

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recu-${payment.receipt_number}.pdf"`,
    },
  })
}
