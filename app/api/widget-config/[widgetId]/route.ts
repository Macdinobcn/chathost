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
    // 1. Cargar config del cliente
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
        widget_theme,
        widget_weather_enabled,
        widget_weather_lat,
        widget_weather_lng,
        widget_weather_place,
        widget_occupancy_enabled,
        widget_occupancy_pct,
        widget_occupancy_text,
        widget_webcam_enabled,
        widget_webcam_url,
        gdpr_enabled,
        gdpr_title,
        gdpr_text,
        gdpr_button_text,
        gdpr_privacy_url
      `)
      .eq('widget_id', widgetId)
      .eq('active', true)
      .single()

    if (error || !client) {
      return NextResponse.json({ error: 'Widget no encontrado' }, { status: 404 })
    }

    // 2. Si el cliente no tiene textos GDPR propios, cargar los globales de master_settings
    let gdprConfig = {
      gdpr_enabled: client.gdpr_enabled ?? true,
      gdpr_title: client.gdpr_title,
      gdpr_text: client.gdpr_text,
      gdpr_button_text: client.gdpr_button_text,
      gdpr_privacy_url: client.gdpr_privacy_url,
    }

    const needsMasterGdpr = !client.gdpr_title || !client.gdpr_text
    if (needsMasterGdpr) {
      const { data: master } = await supabase
        .from('master_settings')
        .select('gdpr_enabled, gdpr_title, gdpr_text, gdpr_button_text, gdpr_privacy_url')
        .single()

      if (master) {
        // El cliente hereda lo que no tiene definido
        gdprConfig = {
          gdpr_enabled: client.gdpr_enabled ?? master.gdpr_enabled ?? true,
          gdpr_title: client.gdpr_title || master.gdpr_title || 'Antes de continuar',
          gdpr_text: client.gdpr_text || master.gdpr_text || 'Este chat usa inteligencia artificial para responder tus preguntas.',
          gdpr_button_text: client.gdpr_button_text || master.gdpr_button_text || 'Entendido, continuar',
          gdpr_privacy_url: client.gdpr_privacy_url || master.gdpr_privacy_url || 'https://chathost.ai/privacy',
        }
      }
    }

    const config = {
      // Widget básico
      widget_name: client.widget_name,
      widget_color: client.widget_color,
      widget_position: client.widget_position,
      widget_window_size: client.widget_window_size,
      widget_logo_url: client.widget_logo_url,
      widget_icon_url: client.widget_icon_url,
      widget_placeholder: client.widget_placeholder,
      initial_message: client.initial_message,
      suggested_messages: client.suggested_messages,
      name: client.name,
      widget_theme: client.widget_theme || 'light',
      // Widgets contextuales
      widget_weather_enabled: client.widget_weather_enabled,
      widget_weather_lat: client.widget_weather_lat,
      widget_weather_lng: client.widget_weather_lng,
      widget_weather_place: client.widget_weather_place,
      widget_occupancy_enabled: client.widget_occupancy_enabled,
      widget_occupancy_pct: client.widget_occupancy_pct,
      widget_occupancy_text: client.widget_occupancy_text,
      widget_webcam_enabled: client.widget_webcam_enabled,
      widget_webcam_url: client.widget_webcam_url,
      // GDPR (resuelto con fallback a master)
      ...gdprConfig,
    }

    // Caché de 2 minutos
    return NextResponse.json({ config }, {
      headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60' }
    })
  } catch (err) {
    console.error('Error en widget-config:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
