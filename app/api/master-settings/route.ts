import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET — leer configuración maestra
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('master_settings')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ settings: data || null })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST — guardar configuración maestra
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const { data: existing } = await supabase
      .from('master_settings')
      .select('id')
      .single()

    if (existing?.id) {
      await supabase
        .from('master_settings')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('master_settings')
        .insert({ ...body })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
