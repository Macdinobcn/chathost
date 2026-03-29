import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/special-messages?clientId=xxx
export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId')
    if (!clientId) return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('special_messages')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ messages: data })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/special-messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { client_id, title, content, active, start_date, end_date, show_on_open } = body
    if (!client_id || !title || !content) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('special_messages')
      .insert({ client_id, title, content, active: active ?? true, start_date: start_date || null, end_date: end_date || null, show_on_open: show_on_open ?? false })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ message: data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
