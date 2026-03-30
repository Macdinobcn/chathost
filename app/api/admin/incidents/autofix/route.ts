import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface Incident {
  id: string
  type: string
  client_id: string
  [key: string]: unknown
}

export async function POST(_req: NextRequest) {
  const supabase = createAdminClient()
  const results: Array<{ id: string; type: string; fixed: boolean; result: string }> = []

  const { data: incidents } = await supabase
    .from('incidents')
    .select('*')
    .eq('status', 'open')
    .eq('auto_fix_attempted', false)

  for (const incident of (incidents as Incident[]) || []) {
    let fixed = false
    let result = ''

    if (incident.type === 'scrape_failed') {
      // Trigger rescrape by calling the scraping API
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: incident.client_id }),
        })
        if (res.ok) {
          fixed = true
          result = 'Re-scraping iniciado automáticamente'
        } else {
          result = 'Error al iniciar re-scraping'
        }
      } catch {
        result = 'Error de conexión al intentar re-scraping'
      }
    } else {
      result = 'Este tipo de incidencia requiere acción manual'
    }

    await supabase
      .from('incidents')
      .update({
        auto_fix_attempted: true,
        auto_fix_result: result,
        status: fixed ? 'auto_fixed' : 'needs_human',
      })
      .eq('id', incident.id)

    results.push({ id: incident.id, type: incident.type, fixed, result })
  }

  return NextResponse.json({ processed: results.length, results })
}
