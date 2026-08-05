// app/api/payments/mine/route.ts
//
// Liste les paiements complétés (avec reçu disponible) de l'utilisateur
// connecté, pour la section "Mes reçus" du dashboard organisateur. Passe par
// le client admin + filtre explicite sur user_id — même logique que
// api/payments/[id]/receipt : on ne dépend pas d'une policy RLS `payments`
// non vérifiée pour une table aussi sensible.
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: payments } = await admin
    .from('payments')
    .select('id, plan_type, final_amount, currency, completed_at, receipt_number, events (name)')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .not('receipt_number', 'is', null)
    .order('completed_at', { ascending: false })

  return NextResponse.json({ payments: payments || [] })
}
