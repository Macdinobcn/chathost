// app/api/operator-message/route.ts
// Guarda un mensaje del operador (camping, hotel...) en una conversación
// El visitante lo verá la próxima vez que abra el chat

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { conversationId, content, clientId } = await req.json()

    if (!conversationId || !content?.trim()) {
      return NextResponse.json({ error: 'conversationId y content requeridos' }, { status: 400 })
    }

    // Verificar que la conversación pertenece al cliente
    const { data: conv } = await supabase
      .from('conversations')
      .select('id, client_id')
      .eq('id', conversationId)
      .single()

    if (!conv || (clientId && conv.client_id !== clientId)) {
      return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 })
    }

    // Guardar mensaje del operador
    const { data: msg, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'operator',
        content: content.trim(),
        tokens_used: 0,
        cost_eur: 0,
      })
      .select()
      .single()

    if (error) throw error

    // Actualizar last_message_at de la conversación
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return NextResponse.json({ ok: true, message: msg })
  } catch (error: any) {
    console.error('[operator-message] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
