// lib/security-log.ts
import { createClient } from '@/lib/supabase/client'

export async function logSecurityEvent({
  event_type,
  user_id,
  ip_address,
  details,
}: {
  event_type: string
  user_id?: string
  ip_address?: string
  details?: any
}) {
  const supabase = createClient()
  
  await supabase.from('security_logs').insert({
    event_type,
    user_id,
    ip_address,
    details,
    created_at: new Date().toISOString(),
  })
}