// app/api/admin/setup-chathost-bot/route.ts
// Crea o actualiza el bot interno de ChatHost.ai con su knowledge base completa
// Llama una sola vez desde el panel admin

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { readFileSync } from 'fs'
import { join } from 'path'

const WIDGET_ID = 'chathost-ai-official'

const SYSTEM_PROMPT = `Eres el asistente virtual de ChatHost.ai, una plataforma SaaS para crear chatbots con IA.

Tu misión es ayudar a los visitantes a entender cómo funciona ChatHost.ai, qué planes hay disponibles, cómo instalarlo y responder cualquier duda sobre la plataforma.

Reglas importantes:
- Sé entusiasta y orientado a mostrar el valor del producto
- No menciones costes internos, márgenes, ni información operacional
- No menciones datos de otros clientes
- Si alguien quiere contratar, dirígele al botón de la web o a hola@chathost.ai
- Para soporte técnico urgente: hola@chathost.ai
- Siempre en el idioma del usuario`

export async function POST() {
  try {
    const supabase = createAdminClient()

    // Leer la knowledge base del archivo
    const kbPath = join(process.cwd(), 'lib', 'chathost-kb.md')
    const kbContent = readFileSync(kbPath, 'utf-8')
    const wordCount = kbContent.split(/\s+/).length

    // Buscar si ya existe
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('widget_id', WIDGET_ID)
      .single()

    let clientId: string

    if (existing) {
      // Actualizar
      clientId = existing.id
      await supabase.from('clients').update({
        system_prompt: SYSTEM_PROMPT,
        active: true,
        credits_balance: 999999,
      }).eq('id', clientId)

      await supabase.from('knowledge_bases').update({
        content_md: kbContent,
        scraping_status: 'ok',
        words_count: wordCount,
        pages_scraped: 1,
        last_scraped_at: new Date().toISOString(),
      }).eq('client_id', clientId)

      return NextResponse.json({ action: 'updated', clientId, wordCount })
    }

    // Crear nuevo
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name: 'ChatHost.ai',
        website_url: 'https://chathost.ai',
        email: 'chathostapp@gmail.com',
        plan: 'agency',
        widget_id: WIDGET_ID,
        widget_color: '#6366f1',
        widget_name: 'Asistente ChatHost',
        active: true,
        is_internal: true,
        billing_override: 'free',
        credits_balance: 999999,
        subscription_status: 'active',
        system_prompt: SYSTEM_PROMPT,
        initial_message: '¡Hola! Soy el asistente de ChatHost.ai 👋 ¿En qué puedo ayudarte?',
        widget_placeholder: '¿Tienes alguna pregunta sobre ChatHost.ai?',
        suggested_messages: [
          '¿Cómo funciona el chatbot?',
          '¿Qué planes hay?',
          '¿Cómo instalo el widget?',
          '¿Es gratis probarlo?',
        ],
      })
      .select()
      .single()

    if (error) throw error
    clientId = client.id

    await supabase.from('knowledge_bases').insert({
      client_id: clientId,
      content_md: kbContent,
      scraping_status: 'ok',
      words_count: wordCount,
      pages_scraped: 1,
      last_scraped_at: new Date().toISOString(),
    })

    return NextResponse.json({ action: 'created', clientId, widgetId: WIDGET_ID, wordCount })
  } catch (error: any) {
    console.error('[setup-chathost-bot]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
