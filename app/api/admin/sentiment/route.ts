import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createAdminClient()
  const [{ data: sentiment }, { data: global }] = await Promise.all([
    supabase.from('sentiment_analysis').select('*').order('last_analyzed', { ascending: false }),
    supabase.from('global_insights').select('*').eq('id', 'singleton').single(),
  ])
  return NextResponse.json({ sentiment: sentiment || [], global: global || null })
}
