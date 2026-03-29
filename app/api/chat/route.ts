import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { responderChat } from '@/lib/claude'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { widgetId, sessionId, mensaje, historial, language } = body

    if (!widgetId || !sessionId || !mensaje) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Obtener cliente
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, active, system_prompt, temperature, auto_language')
      .eq('widget_id', widgetId)
      .single()

    if (clientError || !client) return NextResponse.json({ error: 'Widget no encontrado' }, { status: 404 })
    if (!client.active) return NextResponse.json({ error: 'Widget inactivo' }, { status: 403 })

    // 2. Knowledge base
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

    // 3. Configuración maestra global (Alex)
    const { data: masterSettings } = await supabase
      .from('master_settings')
      .select('*')
      .single()

    // 4. Construir system prompt en 4 capas:
    //    [comportamiento base] + [formato] + [normas] + [prompt del cliente]
    const bloques = [
      masterSettings?.master_prompt || '',
      masterSettings?.master_format || '',
      masterSettings?.master_rules || '',
      client.system_prompt || '',
    ].filter(Boolean)

    const systemPromptFinal = bloques.join('\n\n---\n\n')

    // 5. Mensajes especiales activos hoy
    const hoy = new Date().toISOString().split('T')[0]
    const { data: specialMsgs } = await supabase
      .from('special_messages')
      .select('title, content')
      .eq('client_id', client.id)
      .eq('active', true)
      .or(`start_date.is.null,start_date.lte.${hoy}`)
      .or(`end_date.is.null,end_date.gte.${hoy}`)

    const mensajesEspeciales = specialMsgs?.map(m => `${m.title}: ${m.content}`) || []

    // 6. Conversación
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
        language: language || '',
      }).eq('id', conversationId)
    } else {
      const { data: nuevaConv } = await supabase
        .from('conversations')
        .insert({ client_id: client.id, session_id: sessionId, message_count: 2, language: language || '' })
        .select('id')
        .single()
      conversationId = nuevaConv!.id
    }

    // 7. Temperatura: usa la del cliente respetando el máximo que Alex permite
    const tempCliente = client.temperature ?? 0.7
    const tempMaxima = masterSettings?.clients_max_temperature ?? 1.0
    const temperaturaFinal = Math.min(tempCliente, tempMaxima)

    // 8. Llamar a Claude
    const { respuesta, tokensUsados, costeEur, creditosConsumidos } = await responderChat({
      nombreCliente: client.name,
      knowledgeBase: kb.content_md,
      systemPromptPersonalizado: systemPromptFinal,
      historial: historial || [],
      pregunta: mensaje,
      temperatura: temperaturaFinal,
      autoLanguage: masterSettings?.clients_can_change_language
        ? (client.auto_language ?? true)
        : (masterSettings?.force_auto_language ?? true),
      mensajesEspeciales,
      modeloId: (body?.modelOverride || 'claude-haiku-4-5-20251001') as any,
    })

    // 9. Guardar mensajes
    await supabase.from('messages').insert([
      { conversation_id: conversationId, role: 'user', content: mensaje },
      { conversation_id: conversationId, role: 'assistant', content: respuesta, tokens_used: tokensUsados, cost_eur: costeEur },
    ])

    // 10. Costes
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

    return NextResponse.json({ respuesta, sessionId, creditosConsumidos })
  } catch (error) {
    console.error('Error en /api/chat:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
