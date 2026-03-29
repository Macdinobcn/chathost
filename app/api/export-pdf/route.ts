// app/api/export-pdf/route.ts
// Fix para Vercel: usa puppeteer-core + @sparticuz/chromium en producción
// En local sigue usando puppeteer normal

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Detecta entorno y lanza el browser correcto
async function getBrowser() {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    // En Vercel: chromium serverless
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = (await import('puppeteer-core')).default;
    
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    // En local: puppeteer normal (con Chromium incluido)
    const puppeteer = (await import('puppeteer')).default;
    return puppeteer.launch({ headless: true });
  }
}

// Convierte markdown básico a HTML para el PDF
function renderMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#2563eb">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gm, (match) => `<ul style="margin:4px 0;padding-left:20px">${match}</ul>`)
    .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientId, conversationId, mode, filters } = body;
    // mode: 'list' (todas las convs filtradas) | 'detail' (una conversación completa)

    // --- MODO DETALLE: una conversación ---
    if (mode === 'detail' && conversationId) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('*, clients(name, widget_color)')
        .eq('id', conversationId)
        .single();

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      const clientName = (conv as any)?.clients?.name || 'Cliente';
      const widgetColor = (conv as any)?.clients?.widget_color || '#2563eb';
      const startDate = new Date((conv as any)?.started_at).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const messagesHtml = (messages || []).map((msg: any) => {
        const isUser = msg.role === 'user';
        const bg = isUser ? widgetColor : '#f3f4f6';
        const color = isUser ? '#fff' : '#1f2937';
        const align = isUser ? 'right' : 'left';
        const label = isUser ? 'Usuario' : clientName;
        const content = renderMarkdown(msg.content || '');

        return `
          <div style="margin-bottom:16px;text-align:${align}">
            <div style="font-size:11px;color:#6b7280;margin-bottom:4px">${label}</div>
            <div style="display:inline-block;max-width:75%;background:${bg};color:${color};
              padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;text-align:left">
              <p style="margin:0">${content}</p>
            </div>
          </div>`;
      }).join('');

      const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
        <style>
          body { font-family: -apple-system, sans-serif; padding: 40px; color: #1f2937; }
          h1 { font-size: 20px; color: #111827; margin-bottom: 4px; }
          .meta { font-size: 12px; color: #6b7280; margin-bottom: 32px; }
          .messages { max-width: 680px; margin: 0 auto; }
          a { color: #2563eb; }
        </style></head><body>
        <h1>Conversación — ${clientName}</h1>
        <div class="meta">${startDate} · ${(messages || []).length} mensajes</div>
        <div class="messages">${messagesHtml}</div>
      </body></html>`;

      const browser = await getBrowser();
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
      await browser.close();

      return new NextResponse(Buffer.from(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="conversacion-${conversationId.slice(0, 8)}.pdf"`,
        },
      });
    }

    // --- MODO LISTA: todas las conversaciones filtradas ---
    let query = supabase
      .from('conversations')
      .select('*, messages(content, role, created_at)')
      .eq('client_id', clientId)
      .order('last_message_at', { ascending: false });

    if (filters?.dateFrom) query = query.gte('started_at', filters.dateFrom);
    if (filters?.dateTo) query = query.lte('started_at', filters.dateTo);

    const { data: convs } = await query.limit(200);

    const { data: client } = await supabase
      .from('clients')
      .select('name, widget_color')
      .eq('id', clientId)
      .single();

    const clientName = (client as any)?.name || 'Cliente';
    const widgetColor = (client as any)?.widget_color || '#2563eb';
    const exportDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

    const rowsHtml = (convs || []).map((conv: any, i: number) => {
      const firstUserMsg = (conv.messages || []).find((m: any) => m.role === 'user');
      const preview = firstUserMsg?.content?.slice(0, 100) || '(sin mensajes)';
      const date = new Date(conv.started_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const msgCount = (conv.messages || []).length;
      const bg = i % 2 === 0 ? '#fff' : '#f9fafb';

      return `<tr style="background:${bg}">
        <td style="padding:8px 12px;font-size:12px;color:#6b7280">${date}</td>
        <td style="padding:8px 12px;font-size:13px;color:#111827">${preview}${firstUserMsg?.content?.length > 100 ? '...' : ''}</td>
        <td style="padding:8px 12px;font-size:12px;color:#6b7280;text-align:center">${msgCount}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        body { font-family: -apple-system, sans-serif; padding: 40px; color: #1f2937; }
        h1 { font-size: 22px; color: #111827; }
        .meta { font-size: 13px; color: #6b7280; margin-bottom: 32px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: ${widgetColor}; color: white; padding: 10px 12px; font-size: 12px; text-align: left; }
        td { border-bottom: 1px solid #e5e7eb; }
      </style></head><body>
      <h1>Conversaciones — ${clientName}</h1>
      <div class="meta">Exportado el ${exportDate} · ${(convs || []).length} conversaciones</div>
      <table>
        <thead><tr>
          <th style="width:100px">Fecha</th>
          <th>Primera pregunta</th>
          <th style="width:80px;text-align:center">Msgs</th>
        </tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </body></html>`;

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
    await browser.close();

    const filename = `conversaciones-${clientName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('[export-pdf] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
