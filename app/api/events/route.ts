import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('events')
    .select('*')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true, data })
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const body = await request.json()
  
  // ✅ S'assurer que le style a une valeur par défaut
  const eventData = {
    ...body,
    style: body.style || 'classique',
  }
  
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true, data })
}