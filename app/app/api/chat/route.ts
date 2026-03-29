import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { responderChat } from '@/lib/claude'

// POST /api/chat
export async function POST(req: NextRequest) {
  try {
    const { widgetId, sessionId, mensaje, historial } = await req.json()

    if (!widgetId || !sessionId || !mensaje) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Buscar el cliente por widget_id — incluir system_prompt
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, active, system_prompt')
      .eq('widget_id', widgetId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Widget no encontrado' }, { status: 404 })
    }

    if (!client.active) {
      return NextResponse.json({ error: 'Widget inactivo' }, { status: 403 })
    }

    // 2. Obtener la knowledge base
    const { data: kb } = await supabase
      .from('knowledge_bases')
      .select('content_md')
      .eq('client_id', client.id)
      .eq('scraping_status', 'ok')
      .single()

    if (!kb) {
      return NextResponse.json({
        respuesta: `Hola, soy el asistente de ${client.name}. Estoy siendo configurado. Por favor, contacta directamente con nosotros.`,
        sessionId,
      })
    }

    // 3. Buscar o crear conversación
    let conversationId: string
    const { data: convExistente } = await supabase
      .from('conversations')
      .select('id, message_count')
      .eq('session_id', sessionId)
      .eq('client_id', client.id)
      .single()

    if (convExistente) {
      conversationId = convExistente.id
      await supabase.from('conversations').update({
        last_message_at: new Date().toISOString(),
        message_count: convExistente.message_count + 2,
      }).eq('id', conversationId)
    } else {
      const { data: nuevaConv } = await supabase
        .from('conversations')
        .insert({ client_id: client.id, session_id: sessionId, message_count: 2 })
        .select('id')
        .single()
      conversationId = nuevaConv!.id
    }

    // 4. Claude Haiku con KB + normas personalizadas
    const { respuesta, tokensUsados, costeEur } = await responderChat({
      nombreCliente: client.name,
      knowledgeBase: kb.content_md,
      systemPromptPersonalizado: client.system_prompt || '',
      historial: historial || [],
      pregunta: mensaje,
    })

    // 5. Guardar mensajes
    await supabase.from('messages').insert([
      { conversation_id: conversationId, role: 'user', content: mensaje },
      { conversation_id: conversationId, role: 'assistant', content: respuesta, tokens_used: tokensUsados, cost_eur: costeEur },
    ])

    // 6. Actualizar costes del mes
    const mes = new Date().toISOString().slice(0, 7)
    const { data: costes } = await supabase
      .from('client_costs')
      .select('id, messages_count, tokens_total, cost_eur')
      .eq('client_id', client.id)
      .eq('month', mes)
      .single()

    if (costes) {
      await supabase.from('client_costs').update({
        messages_count: costes.messages_count + 1,
        tokens_total: costes.tokens_total + tokensUsados,
        cost_eur: Number(costes.cost_eur) + costeEur,
      }).eq('id', costes.id)
    } else {
      await supabase.from('client_costs').insert({
        client_id: client.id, month: mes,
        messages_count: 1, tokens_total: tokensUsados, cost_eur: costeEur,
      })
    }

    return NextResponse.json({ respuesta, sessionId })
  } catch (error) {
    console.error('Error en /api/chat:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
