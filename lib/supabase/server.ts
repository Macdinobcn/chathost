import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cliente Supabase con service role para usar en el servidor (API routes)
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
