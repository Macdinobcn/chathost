import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

function generarWidgetId(nombre: string): string {
  const base = nombre.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20)
  const random = Math.random().toString(36).slice(2, 8)
  return `${base}-${random}`
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`*, knowledge_bases(scraping_status,pages_scraped,words_count,last_scraped_at), client_costs(month,messages_count,cost_eur)`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Error en GET /api/clients:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, website_url, email, plan, widget_color, widget_name, is_internal, billing_override } = await req.json()

    if (!name || !website_url) {
      return NextResponse.json({ error: 'Nombre y URL son obligatorios' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name,
        website_url,
        email: email || null,
        plan: plan || 'basic',
        widget_id: generarWidgetId(name),
        widget_color: widget_color || '#059669',
        widget_name: widget_name || 'Asistente',
        is_internal: is_internal || false,
        billing_override: billing_override || null,
        // Créditos ilimitados para internos (número muy alto)
        credits_balance: is_internal ? 999999 : 50,
        subscription_status: is_internal ? 'active' : 'trial',
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error('Error en POST /api/clients:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
