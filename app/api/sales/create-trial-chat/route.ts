import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generarKnowledgeBase } from '@/lib/claude'

function generarWidgetId(nombre: string): string {
  const base = nombre.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20)
  const random = Math.random().toString(36).slice(2, 8)
  return `trial-${base}-${random}`
}

// Helper to fetch HTML
async function fetchUrl(url: string): Promise<string> {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9',
    }
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return ''
    return await res.text()
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  const { nombre, website_url, ciudad, lat, lng } = await req.json()

  if (!nombre || !website_url) {
    return NextResponse.json({ error: 'Nombre y URL requeridos' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    // Fetch website HTML
    let url = website_url
    if (!url.startsWith('http')) url = 'https://' + url

    const htmlContent = await fetchUrl(url)
    if (!htmlContent) {
      return NextResponse.json({ error: 'No se pudo acceder a la web de la empresa' }, { status: 400 })
    }

    // Scrape web and train KB
    const kb = await generarKnowledgeBase(url, [htmlContent])

    // Create trial client
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: nombre,
        website_url: url,
        plan: 'trial',
        widget_id: generarWidgetId(nombre),
        widget_color: '#06b6d4',
        widget_name: 'Asistente',
        active: true,
        is_internal: false,
        billing_override: 'trial',
        credits_balance: 100,
        subscription_status: 'trial',
        initial_message: `¡Hola! Soy el asistente virtual de ${nombre}. ¿En qué puedo ayudarte?`,
        widget_placeholder: 'Escribe tu pregunta...',
        widget_weather_enabled: lat && lng,
        widget_weather_lat: lat,
        widget_weather_lng: lng,
        widget_weather_place: ciudad,
      })
      .select()
      .single()

    if (error) throw error

    // Create KB
    const wordsCount = kb.split(/\s+/).filter(Boolean).length
    await supabase.from('knowledge_bases').insert({
      client_id: client.id,
      content_md: kb,
      scraping_status: 'ok',
      words_count: wordsCount,
      pages_scraped: 1,
    })

    // Create trial record
    await supabase.from('trial_chats').insert({
      client_id: client.id,
      company_name: nombre,
      company_website: url,
      company_city: ciudad,
      company_lat: lat,
      company_lng: lng,
      status: 'active',
      trial_start: new Date().toISOString(),
      trial_end: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    })

    return NextResponse.json({
      error: null,
      client_id: client.id,
      widget_id: client.widget_id,
      trial_url: `${process.env.NEXT_PUBLIC_APP_URL}/trial/${client.widget_id}`
    })
  } catch (err: any) {
    console.error('[sales/create-trial-chat]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
