import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// POST /api/knowledge — guardar KB manual
export async function POST(req: NextRequest) {
  try {
    const { clientId, contentMd } = await req.json()

    if (!clientId || !contentMd) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const wordsCount = contentMd.split(/\s+/).filter(Boolean).length

    // Buscar si ya existe KB
    const { data: kbExistente } = await supabase
      .from('knowledge_bases')
      .select('id')
      .eq('client_id', clientId)
      .single()

    if (kbExistente) {
      await supabase
        .from('knowledge_bases')
        .update({
          content_md: contentMd,
          words_count: wordsCount,
          pages_scraped: 0,
          last_scraped_at: new Date().toISOString(),
          scraping_status: 'ok',
        })
        .eq('client_id', clientId)
    } else {
      await supabase.from('knowledge_bases').insert({
        client_id: clientId,
        content_md: contentMd,
        words_count: wordsCount,
        pages_scraped: 0,
        scraping_status: 'ok',
      })
    }

    return NextResponse.json({ ok: true, palabras: wordsCount })
  } catch (error) {
    console.error('Error en /api/knowledge:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// GET /api/knowledge?clientId=xxx — obtener KB
export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId')
    if (!clientId) {
      return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: kb } = await supabase
      .from('knowledge_bases')
      .select('content_md, words_count, scraping_status, last_scraped_at')
      .eq('client_id', clientId)
      .single()

    return NextResponse.json({ kb })
  } catch (error) {
    console.error('Error en GET /api/knowledge:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
