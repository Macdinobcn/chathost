import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createAdminClient()
  const { data: incidents } = await supabase
    .from('incidents')
    .select('*, clients(name, widget_color)')
    .order('created_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ incidents: incidents || [] })
}
