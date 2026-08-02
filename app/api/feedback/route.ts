// app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const feedbackSchema = z.object({
  type: z.enum(['rating', 'suggestion', 'bug_report', 'compliment']),
  rating: z.number().min(1).max(5).optional().nullable(),
  content: z.string().min(1).max(2000),
})

// POST : un utilisateur connecté envoie un feedback
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await rateLimit.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de tentatives, réessaye dans 1 minute' },
      { status: 429 }
    )
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const validation = feedbackSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: validation.error.issues },
      { status: 400 }
    )
  }

  const { type, rating, content } = validation.data

  // La note n'a de sens que pour un feedback de type "rating"
  const finalRating = type === 'rating' ? rating : null

  const { data, error } = await supabase
    .from('feedbacks')
    .insert({
      user_id: user.id,
      type,
      rating: finalRating,
      content,
      status: 'new',
    })
    .select()
    .single()

  if (error) {
    console.error('Erreur création feedback:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du feedback' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}

// GET : liste des feedbacks (admin uniquement)
export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const type = searchParams.get('type')

  let query = supabase
    .from('feedbacks')
    .select('*, profiles(first_name, last_name, email)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (type) query = query.eq('type', type)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}