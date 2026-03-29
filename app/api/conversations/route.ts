import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// GET /api/conversations?clientId=xxx&fecha=2026-03
export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId')
    const fecha = req.nextUrl.searchParams.get('fecha')
    if (!clientId) return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })

    const supabase = createAdminClient()
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('client_id', clientId)
      .order('started_at', { ascending: false })
      .limit(100)

    if (fecha) {
      query = query.gte('started_at', `${fecha}-01`).lte('started_at', `${fecha}-31`)
    }

    const { data, error } = await query
    if (error) throw error

    // Calcular confidence score basado en message_count y resolved
    const conversations = (data || []).map(conv => ({
      ...conv,
      confidence_score: conv.confidence_score || Math.min(10, Math.max(1, Math.round(conv.message_count / 2)))
    }))

    return NextResponse.json({ conversations })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
