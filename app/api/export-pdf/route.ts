// app/api/export-pdf/route.ts
// Genera un PDF de una conversación o listado de chats usando Puppeteer

import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface Mensaje {
  role: string
  content: string
  created_at?: string
  tokens_used?: number
}

interface ConvResumen {
  id: string
  session_id: string
  started_at: string
  message_count: number
  language?: string
  confidence_score: number
  first_message?: string
}

interface ExportRequest {
  clienteName: string
  widgetColor: string
  logoUrl: string
  periodoLabel: string
  scoreLabel: string
  // Modo detalle: una conversación con mensajes completos
  convDetalle?: ConvResumen
  mensajes?: Mensaje[]
  // Modo lista: varias conversaciones resumidas
  convs?: ConvResumen[]
}

function buildHTML(data: ExportRequest): string {
  const {
    clienteName, widgetColor, logoUrl, periodoLabel, scoreLabel,
    convDetalle, mensajes, convs
  } = data

  const fechaExport = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })

  const modoDetalle = !!(convDetalle && mensajes && mensajes.length > 0)

  // Helper: color según score (escala 0-10)
  function scoreColor(sc: number) {
    if (sc <= 3) return { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
    if (sc <= 6) return { text: '#d97706', bg: '#fefce8', border: '#fde68a' }
    return { text: '#059669', bg: '#f0fdf4', border: '#bbf7d0' }
  }

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      color: #1e293b;
      background: white;
      font-size: 13px;
      line-height: 1.6;
    }
    .page { max-width: 740px; margin: 0 auto; padding: 44px 48px 64px; }

    /* Cabecera */
    .header {
      display: flex;
      align-items: center;
      gap: 18px;
      padding-bottom: 22px;
      border-bottom: 3px solid ${widgetColor};
      margin-bottom: 28px;
    }
    .logo {
      width: 52px; height: 52px;
      border-radius: 50%;
      background: ${widgetColor};
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 22px;
      flex-shrink: 0; overflow: hidden;
    }
    .logo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
    .header-info h1 { font-size: 20px; font-weight: 700; color: #111; margin-bottom: 4px; }
    .header-info p { font-size: 12px; color: #64748b; }

    /* Bloque de metadatos */
    .meta {
      display: flex; gap: 0;
      margin-bottom: 32px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      background: #f8fafc;
    }
    .meta-item {
      flex: 1;
      padding: 14px 18px;
      border-right: 1px solid #e2e8f0;
    }
    .meta-item:last-child { border-right: none; }
    .meta-label {
      font-size: 9px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .07em;
      color: #94a3b8; margin-bottom: 5px;
    }
    .meta-value { font-size: 14px; font-weight: 700; color: #1e293b; }

    /* Info de la conversación (modo detalle) */
    .conv-info {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 16px 20px;
      margin-bottom: 28px;
    }
    .conv-info-label { font-size: 10px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
    .conv-info-id { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; color: #3b82f6; margin-bottom: 5px; word-break: break-all; }
    .conv-info-meta { font-size: 12px; color: #64748b; }

    /* Chat */
    .chat-wrap { display: flex; flex-direction: column; gap: 20px; }
    .msg { display: flex; flex-direction: column; }
    .msg-user { align-items: flex-end; }
    .msg-assistant { align-items: flex-start; }

    .role-label {
      font-size: 9px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .08em;
      color: #94a3b8; margin-bottom: 6px;
      padding: 0 4px;
    }
    .bubble {
      max-width: 78%;
      padding: 13px 17px;
      font-size: 13px;
      line-height: 1.7;
      word-wrap: break-word;
    }
    .bubble-user {
      background: ${widgetColor};
      color: white;
      border-radius: 16px 16px 4px 16px;
    }
    .bubble-assistant {
      background: #f8fafc;
      color: #1e293b;
      border-radius: 4px 16px 16px 16px;
      border: 1px solid #e2e8f0;
    }
    .msg-footer {
      font-size: 10px; color: #94a3b8;
      margin-top: 6px; padding: 0 4px;
      display: flex; gap: 10px; align-items: center;
    }
    .tokens-badge {
      display: inline-flex; align-items: center; gap: 4px;
      background: #f1f5f9; border-radius: 5px;
      padding: 2px 7px; font-size: 10px; color: #64748b; font-weight: 600;
    }

    /* Lista de conversaciones (modo lista) */
    .conv-list { display: flex; flex-direction: column; gap: 10px; }
    .conv-item {
      padding: 14px 18px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      border-left: 4px solid ${widgetColor};
      background: white;
    }
    .conv-item-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 6px;
    }
    .conv-num { font-size: 12px; font-weight: 700; color: #111; }
    .conv-session { font-family: monospace; font-size: 11px; color: #64748b; margin-bottom: 4px; }
    .conv-preview { font-size: 13px; color: #1e293b; margin-bottom: 6px; line-height: 1.5; }
    .score-badge {
      font-size: 11px; font-weight: 700;
      padding: 3px 10px; border-radius: 20px;
      border: 1px solid;
    }
    .conv-meta { font-size: 11px; color: #94a3b8; }

    /* Nota ayuda */
    .tip {
      margin-top: 20px; padding: 12px 16px;
      background: #fffbeb; border: 1px solid #fde68a;
      border-radius: 8px; font-size: 11px; color: #92400e;
    }

    /* Footer */
    .footer {
      margin-top: 48px; padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex; justify-content: space-between;
      font-size: 10px; color: #94a3b8;
    }

    /* Print */
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 24px 32px; }
      @page { margin: 1.2cm; }
    }
  `

  // Contenido principal
  let contenido = ''

  if (modoDetalle && convDetalle && mensajes) {
    // MODO DETALLE
    const sc = convDetalle.confidence_score
    const scStyle = scoreColor(sc)

    contenido += `
      <div class="conv-info">
        <div class="conv-info-label">Conversación</div>
        <div class="conv-info-id">${convDetalle.session_id}</div>
        <div class="conv-info-meta">
          ${new Date(convDetalle.started_at).toLocaleString('es-ES', {
            weekday: 'long', day: 'numeric', month: 'long',
            hour: '2-digit', minute: '2-digit'
          })}
          &nbsp;·&nbsp;
          Score: <strong style="color:${scStyle.text}">${sc.toFixed(2)}</strong>
          &nbsp;·&nbsp; ${convDetalle.message_count} mensajes
          ${convDetalle.language ? '&nbsp;·&nbsp;' + convDetalle.language.toUpperCase() : ''}
        </div>
      </div>

      <div class="chat-wrap">
        ${mensajes.map(msg => {
          const isUser = msg.role === 'user'
          const timestamp = msg.created_at
            ? new Date(msg.created_at).toLocaleString('es-ES', {
                hour: '2-digit', minute: '2-digit',
                day: 'numeric', month: 'short'
              })
            : ''
          // Renderizar markdown básico: **bold**, [link](url), listas con -
          const contentHtml = (msg.content || '')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:${widgetColor};text-decoration:underline">$1</a>')
            .replace(/\n/g, '<br>')

          return `
            <div class="msg ${isUser ? 'msg-user' : 'msg-assistant'}">
              <div class="role-label">${isUser ? 'Visitante' : clienteName}</div>
              <div class="bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}">${contentHtml}</div>
              ${(timestamp || msg.tokens_used) ? `
                <div class="msg-footer">
                  ${timestamp ? `<span>${timestamp}</span>` : ''}
                  ${msg.tokens_used ? `<span class="tokens-badge">☁ ${msg.tokens_used} tokens</span>` : ''}
                </div>
              ` : ''}
            </div>
          `
        }).join('')}
      </div>
    `
  } else {
    // MODO LISTA
    const lista = convs || []
    contenido += `
      <div class="conv-list">
        ${lista.map((conv, idx) => {
          const sc = conv.confidence_score
          const scStyle = scoreColor(sc)
          // Mostrar primer mensaje si existe, si no el session_id truncado
          const preview = conv.first_message
            ? conv.first_message.slice(0, 130) + (conv.first_message.length > 130 ? '…' : '')
            : conv.session_id
          return `
            <div class="conv-item">
              <div class="conv-item-header">
                <span class="conv-num">#${idx + 1}</span>
                <span class="score-badge" style="color:${scStyle.text};background:${scStyle.bg};border-color:${scStyle.border}">
                  Score ${sc.toFixed(2)}
                </span>
              </div>
              <div class="conv-preview">${preview}</div>
              <div class="conv-meta">
                ${new Date(conv.started_at).toLocaleString('es-ES', {
                  weekday: 'short', day: 'numeric', month: 'short',
                  hour: '2-digit', minute: '2-digit'
                })}
                &nbsp;·&nbsp; ${conv.message_count} mensajes
                ${conv.language ? '&nbsp;·&nbsp; ' + conv.language.toUpperCase() : ''}
                &nbsp;·&nbsp;<span style="font-family:monospace;font-size:9px;color:#cbd5e1">${conv.session_id.slice(0, 24)}</span>
              </div>
            </div>
          `
        }).join('')}
      </div>
      <div class="tip">
        💡 Para exportar el detalle completo de una conversación, selecciónala en Activity y vuelve a exportar.
      </div>
    `
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Chat logs · ${clienteName}</title>
  <style>${css}</style>
</head>
<body>
  <div class="page">

    <div class="header">
      <div class="logo">
        ${logoUrl ? `<img src="${logoUrl}" />` : '💬'}
      </div>
      <div class="header-info">
        <h1>${clienteName}</h1>
        <p>Exportado el ${fechaExport} &nbsp;·&nbsp; Powered by ChatHost</p>
      </div>
    </div>

    <div class="meta">
      <div class="meta-item">
        <div class="meta-label">Período</div>
        <div class="meta-value">${periodoLabel}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Score</div>
        <div class="meta-value">${scoreLabel}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Conversaciones</div>
        <div class="meta-value">${modoDetalle ? 1 : (convs?.length || 0)}</div>
      </div>
      ${modoDetalle && mensajes ? `
      <div class="meta-item">
        <div class="meta-label">Mensajes</div>
        <div class="meta-value">${mensajes.length}</div>
      </div>
      ` : ''}
    </div>

    ${contenido}

    <div class="footer">
      <span>ChatHost &nbsp;·&nbsp; app.chathost.ai</span>
      <span>${modoDetalle && convDetalle ? convDetalle.id.slice(0, 32) : (convs?.length || 0) + ' conversaciones exportadas'}</span>
    </div>

  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const data: ExportRequest = await req.json()

    const html = buildHTML(data)

    // Lanzar Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    })

    const page = await browser.newPage()

    // Cargar el HTML directamente (sin URL)
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,         // incluir colores de fondo
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      displayHeaderFooter: false,
    })

    await browser.close()

    // Nombre del archivo
    const fecha = new Date().toISOString().slice(0, 10)
    const nombreCliente = (data.clienteName || 'chat').toLowerCase().replace(/\s+/g, '-')
    const filename = `chatlogs-${nombreCliente}-${fecha}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (err) {
    console.error('Error generando PDF:', err)
    return NextResponse.json({ error: 'Error generando el PDF' }, { status: 500 })
  }
}
