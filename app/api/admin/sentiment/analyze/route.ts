import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface SentimentParsed {
  positive_pct: number
  negative_pct: number
  neutral_pct: number
  top_topics: string[]
  top_issues: string[]
  summary: string
}

export async function POST() {
  const supabase = createAdminClient()

  // Get all active non-internal clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, widget_color')
    .eq('active', true)
    .eq('is_internal', false)

  if (!clients) return NextResponse.json({ analyzed: 0 })

  const summaries: Array<{ client_id: string } & SentimentParsed> = []

  for (const client of clients) {
    // Get last 20 conversations for this client
    const { data: convs } = await supabase
      .from('conversations')
      .select('id, message_count, language')
      .eq('client_id', client.id)
      .order('last_message_at', { ascending: false })
      .limit(20)

    if (!convs || convs.length === 0) continue

    // Get user messages from those conversations
    const convIds = convs.map((c) => c.id)
    const { data: messages } = await supabase
      .from('messages')
      .select('role, content, conversation_id')
      .in('conversation_id', convIds)
      .eq('role', 'user')
      .order('created_at', { ascending: false })
      .limit(100)

    if (!messages || messages.length === 0) continue

    const userMessages = messages
      .map((m) => m.content as string)
      .join('\n---\n')
      .slice(0, 8000)

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Analiza el sentimiento y temas de estos mensajes de usuarios del chatbot de "${client.name}".
Responde SOLO con JSON válido sin markdown:
{
  "positive_pct": número 0-100,
  "negative_pct": número 0-100,
  "neutral_pct": número 0-100,
  "top_topics": ["tema1", "tema2", "tema3"],
  "top_issues": ["problema1", "problema2"],
  "summary": "resumen breve en 1 frase"
}

Mensajes de usuarios:
${userMessages}`,
          },
        ],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
      const parsed = JSON.parse(text) as Partial<SentimentParsed>

      // Upsert into sentiment_analysis table
      await supabase.from('sentiment_analysis').upsert(
        {
          client_id: client.id,
          client_name: client.name,
          widget_color: client.widget_color,
          total_analyzed: convs.length,
          positive_pct: parsed.positive_pct ?? 0,
          negative_pct: parsed.negative_pct ?? 0,
          neutral_pct: parsed.neutral_pct ?? 0,
          top_topics: parsed.top_topics ?? [],
          top_issues: parsed.top_issues ?? [],
          summary: parsed.summary ?? '',
          last_analyzed: new Date().toISOString(),
        },
        { onConflict: 'client_id' }
      )

      summaries.push({
        client_id: client.id,
        positive_pct: parsed.positive_pct ?? 0,
        negative_pct: parsed.negative_pct ?? 0,
        neutral_pct: parsed.neutral_pct ?? 0,
        top_topics: parsed.top_topics ?? [],
        top_issues: parsed.top_issues ?? [],
        summary: parsed.summary ?? '',
      })
    } catch (e) {
      console.error(`Error analyzing ${client.name}:`, e)
    }
  }

  // Generate global insights
  if (summaries.length > 0) {
    const avgPositive = Math.round(
      summaries.reduce((a, s) => a + s.positive_pct, 0) / summaries.length
    )
    const avgNegative = Math.round(
      summaries.reduce((a, s) => a + s.negative_pct, 0) / summaries.length
    )
    const allIssues = summaries.flatMap((s) => s.top_issues).slice(0, 10)
    const allTopics = summaries.flatMap((s) => s.top_topics).slice(0, 10)

    await supabase.from('global_insights').upsert(
      {
        id: 'singleton',
        total_conversations: summaries.length,
        avg_positive: avgPositive,
        avg_negative: avgNegative,
        top_complaints: allIssues,
        top_praises: allTopics.slice(0, 5),
        improvement_suggestions: [],
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  }

  return NextResponse.json({ analyzed: summaries.length })
}
