// app/api/feedback/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']),
  admin_note: z.string().max(2000).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const body = await request.json()
  const validation = updateSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { status, admin_note } = validation.data

  const updateData: Record<string, any> = { status }
  if (admin_note !== undefined) updateData.admin_note = admin_note
  if (status === 'resolved' || status === 'closed') {
    updateData.resolved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('feedbacks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erreur mise à jour feedback:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}