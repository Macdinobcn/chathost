// app/api/cron/recrawl/route.ts
// Cron job que revisa qué clientes necesitan re-crawl según su intervalo configurado
// Se ejecuta diariamente desde Vercel Cron (ver vercel.json)
// Protegido por CRON_SECRET

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Llama al endpoint de scraping interno
async function triggerScrape(clientId: string, websiteUrl: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.chathost.ai';
    const res = await fetch(`${baseUrl}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ clientId, url: websiteUrl }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

export async function GET(req: NextRequest) {
  // Verificar autenticación del cron
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Vercel envía el header 'authorization: Bearer CRON_SECRET' automáticamente
  // También aceptamos la URL con ?secret= para testing manual
  const urlSecret = req.nextUrl.searchParams.get('secret');

  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    urlSecret === cronSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  console.log(`[cron/recrawl] Iniciando a las ${now.toISOString()}`);

  // Obtener todos los clientes activos con su KB y config de re-crawl
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      id,
      name,
      website_url,
      recrawl_days,
      knowledge_bases(last_scraped_at, scraping_status)
    `)
    .eq('active', true);

  if (error) {
    console.error('[cron/recrawl] Error al obtener clientes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = {
    checked: 0,
    crawled: 0,
    skipped: 0,
    errors: 0,
    details: [] as Array<{ client: string; action: string; reason?: string }>,
  };

  for (const client of clients || []) {
    results.checked++;

    const recrawlDays = (client as any).recrawl_days || 10;
    const kb = (client as any).knowledge_bases?.[0];

    // Si no tiene KB, siempre crawlear
    if (!kb) {
      console.log(`[cron/recrawl] ${client.name}: sin KB, crawleando`);
      const result = await triggerScrape(client.id, client.website_url);

      if (result.ok) {
        results.crawled++;
        results.details.push({ client: client.name, action: 'crawled', reason: 'Sin KB previa' });
      } else {
        results.errors++;
        results.details.push({ client: client.name, action: 'error', reason: result.error });
      }
      continue;
    }

    // Calcular si toca crawl
    const lastScraped = new Date(kb.last_scraped_at);
    const diffMs = now.getTime() - lastScraped.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffDays < recrawlDays) {
      // No toca aún
      const nextCrawl = new Date(lastScraped.getTime() + recrawlDays * 24 * 60 * 60 * 1000);
      const daysLeft = Math.ceil((nextCrawl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      results.skipped++;
      results.details.push({
        client: client.name,
        action: 'skipped',
        reason: `Faltan ${daysLeft} días (intervalo: ${recrawlDays}d)`,
      });
      continue;
    }

    // Toca crawlear
    console.log(`[cron/recrawl] ${client.name}: han pasado ${Math.round(diffDays)}d (intervalo: ${recrawlDays}d), crawleando`);

    // Marcar como pending antes de empezar
    await supabase
      .from('knowledge_bases')
      .update({ scraping_status: 'pending' })
      .eq('client_id', client.id);

    const result = await triggerScrape(client.id, client.website_url);

    if (result.ok) {
      results.crawled++;
      results.details.push({
        client: client.name,
        action: 'crawled',
        reason: `${Math.round(diffDays)}d desde último crawl`,
      });
    } else {
      results.errors++;
      // Revertir status a error
      await supabase
        .from('knowledge_bases')
        .update({ scraping_status: 'error' })
        .eq('client_id', client.id);

      results.details.push({ client: client.name, action: 'error', reason: result.error });
    }

    // Pausa entre clientes para no saturar la API
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log('[cron/recrawl] Completado:', results);

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    ...results,
  });
}

// También acepta POST (por si se llama manualmente desde el panel)
export async function POST(req: NextRequest) {
  return GET(req);
}
