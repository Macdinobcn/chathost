// app/api/widget-config/[widgetId]/route.ts
// Endpoint PÚBLICO — devuelve la config necesaria para renderizar el widget
// No expone datos sensibles (sin email, sin costes, sin KB)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ widgetId: string }> }
) {
  const { widgetId } = await params

  if (!widgetId) {
    return NextResponse.json({ error: 'widgetId requerido' }, { status: 400 })
  }

  try {
    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        widget_name,
        widget_color,
        widget_position,
        widget_window_size,
        widget_logo_url,
        widget_icon_url,
        widget_placeholder,
        initial_message,
        suggested_messages,
        name,
        active,
        widget_weather_enabled,
        widget_weather_lat,
        widget_weather_lng,
        widget_occupancy_enabled,
        widget_occupancy_pct,
        widget_occupancy_text,
        widget_webcam_enabled,
        widget_webcam_url
      `)
      .eq('widget_id', widgetId)
      .eq('active', true)
      .single()

    if (error || !client) {
      return NextResponse.json({ error: 'Widget no encontrado' }, { status: 404 })
    }

    // Caché de 5 minutos — la config del widget no cambia a menudo
    return NextResponse.json({ config: client }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' }
    })
  } catch (err) {
    console.error('Error en widget-config:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
