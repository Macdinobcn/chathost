// app/api/chat/history/route.ts
// Devuelve los mensajes de una sesión anterior dado widgetId + sessionId

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const widgetId = searchParams.get('widgetId')
  const sessionId = searchParams.get('sessionId')

  if (!widgetId || !sessionId) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
  }

  try {
    // Buscar el cliente por widget_id
    const { data: cliente } = await supabase
      .from('clients')
      .select('id')
      .eq('widget_id', widgetId)
      .single()

    if (!cliente) {
      return NextResponse.json({ messages: [] })
    }

    // Buscar la conversación por session_id y client_id
    const { data: conv } = await supabase
      .from('conversations')
      .select('id, started_at, message_count')
      .eq('client_id', cliente.id)
      .eq('session_id', sessionId)
      .single()

    if (!conv) {
      return NextResponse.json({ messages: [] })
    }

    // Cargar los mensajes — máximo 40 para no sobrecargar el contexto
    const { data: mensajes } = await supabase
      .from('messages')
      .select('role, content, created_at, tokens_used')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true })
      .limit(40)

    return NextResponse.json({
      started_at: conv.started_at,
      message_count: conv.message_count,
      messages: mensajes || [],
    })
  } catch (err) {
    console.error('Error en /api/chat/history:', err)
    return NextResponse.json({ messages: [] })
  }
}
