import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const PLAN_CREDITS: Record<string, number> = {
  trial: 100, starter: 500, pro: 3000, business: 10000, agency: 30000,
}

export async function POST(_req: NextRequest) {
  const supabase = createAdminClient()
  const newIncidents: Array<{
    client_id: string
    client_name: string
    type: string
    severity: string
    status: string
    title: string
    description: string
  }> = []

  // Fetch all clients with their data
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, plan, active, credits_balance, subscription_status, knowledge_bases(scraping_status)')

  if (!clients) return NextResponse.json({ detected: 0 })

  // Fetch existing open incidents to avoid duplicates
  const { data: openIncidents } = await supabase
    .from('incidents')
    .select('client_id, type')
    .eq('status', 'open')

  const openSet = new Set((openIncidents || []).map((i) => `${i.client_id}:${i.type}`))

  for (const client of clients) {
    const kbList = client.knowledge_bases as Array<{ scraping_status: string }> | null
    const kb = kbList?.[0]
    const planCredits = PLAN_CREDITS[client.plan as string] ?? 500

    // Check scrape failed
    if (kb?.scraping_status === 'failed' && !openSet.has(`${client.id}:scrape_failed`)) {
      newIncidents.push({
        client_id: client.id,
        client_name: client.name,
        type: 'scrape_failed',
        severity: 'high',
        status: 'open',
        title: `Knowledge base sin actualizar — ${client.name}`,
        description: `El scraping falló. El chatbot puede estar respondiendo con información desactualizada.`,
      })
    }

    // Check credits
    const credits: number = (client.credits_balance as number) ?? 0
    if (credits === 0 && !openSet.has(`${client.id}:no_credits`)) {
      newIncidents.push({
        client_id: client.id,
        client_name: client.name,
        type: 'no_credits',
        severity: 'critical',
        status: 'open',
        title: `Sin créditos — ${client.name}`,
        description: `El chatbot no puede responder. Saldo: 0 créditos.`,
      })
    } else if (credits < planCredits * 0.1 && credits > 0 && !openSet.has(`${client.id}:no_credits`)) {
      newIncidents.push({
        client_id: client.id,
        client_name: client.name,
        type: 'no_credits',
        severity: 'medium',
        status: 'open',
        title: `Créditos bajos — ${client.name}`,
        description: `Quedan ${credits} créditos (${Math.round((credits / planCredits) * 100)}% del plan). Considera recargar.`,
      })
    }

    // Check payment failed
    if (client.subscription_status === 'past_due' && !openSet.has(`${client.id}:payment_failed`)) {
      newIncidents.push({
        client_id: client.id,
        client_name: client.name,
        type: 'payment_failed',
        severity: 'high',
        status: 'open',
        title: `Pago fallido — ${client.name}`,
        description: `La suscripción está en estado past_due. El cliente puede perder acceso pronto.`,
      })
    }
  }

  if (newIncidents.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    await supabase.from('incidents').insert(newIncidents.map(({ client_name: _cn, ...rest }) => rest))
  }

  return NextResponse.json({ detected: newIncidents.length, incidents: newIncidents })
}
