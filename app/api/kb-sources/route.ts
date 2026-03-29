import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generarKnowledgeBase } from '@/lib/claude'

// GET /api/kb-sources?clientId=xxx
export async function GET(req: NextRequest) {
  try {
    const clientId = req.nextUrl.searchParams.get('clientId')
    if (!clientId) return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('kb_sources')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ sources: data || [] })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// POST /api/kb-sources — añadir URL extra
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { client_id, url } = body
    if (!client_id || !url) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 })

    const supabase = createAdminClient()

    // Crear registro
    const { data: source, error } = await supabase
      .from('kb_sources')
      .insert({ client_id, type: 'url', url, status: 'pending' })
      .select()
      .single()
    if (error) throw error

    // Scrapear la URL en background
    scrapeUrlAndUpdate(source.id, url, client_id, supabase)

    return NextResponse.json({ source }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function scrapeUrlAndUpdate(sourceId: string, url: string, clientId: string, supabase: any) {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)',
      'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
    }
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()

    // Generar fragmento de KB
    const fragmento = await generarKnowledgeBase(url, [html])
    const words = fragmento.split(/\s+/).filter(Boolean).length

    // Actualizar fuente
    await supabase.from('kb_sources').update({ status: 'ok', words_count: words }).eq('id', sourceId)

    // Añadir al KB del cliente
    const { data: kb } = await supabase.from('knowledge_bases').select('content_md').eq('client_id', clientId).single()
    if (kb) {
      const nuevoMd = kb.content_md + `\n\n---\n\n## Fuente adicional: ${url}\n\n${fragmento}`
      const totalWords = nuevoMd.split(/\s+/).filter(Boolean).length
      await supabase.from('knowledge_bases').update({ content_md: nuevoMd, words_count: totalWords }).eq('client_id', clientId)
    }
  } catch (e) {
    await supabase.from('kb_sources').update({ status: 'error' }).eq('id', sourceId)
  }
}
