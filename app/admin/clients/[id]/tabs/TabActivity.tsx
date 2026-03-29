// app/admin/clients/[id]/tabs/TabActivity.tsx
'use client'
import { useState } from 'react'
import { S } from '@/lib/admin-styles'

interface Props {
  cliente: any; widgetForm: any
  conversations: any[]; convSel: string | null; msgsConv: any[]
  filtroPeriodo: 'day'|'week'|'month'; setFiltroPeriodo: (v: any) => void
  filtroScoreMax: number; setFiltroScoreMax: (v: number) => void
  scorePanel: boolean; setScorePanel: (v: boolean) => void
  convsFiltradas: () => any[]
  cargarMsgsConv: (id: string) => void
  setConvSel: (id: string | null) => void
  setMsgsConv: (msgs: any[]) => void
  exportPDF: () => void
  themeColor: string
}

export default function TabActivity(props: Props) {
  const { cliente, widgetForm, conversations, convSel, msgsConv,
    filtroPeriodo, setFiltroPeriodo, filtroScoreMax, setFiltroScoreMax,
    scorePanel, setScorePanel, convsFiltradas, cargarMsgsConv, setConvSel,
    setMsgsConv, exportPDF, themeColor } = props

  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replyOk, setReplyOk] = useState('')

  async function sendOperatorMessage() {
    if (!replyText.trim() || !convSel) return
    setSending(true)
    const res = await fetch('/api/operator-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: convSel, content: replyText, clientId: cliente.id }),
    })
    if (res.ok) {
      setReplyText('')
      setReplyOk('✓ Mensaje enviado — el visitante lo verá la próxima vez que abra el chat')
      setTimeout(() => setReplyOk(''), 4000)
      // Recargar mensajes de esta conversación
      cargarMsgsConv(convSel)
    }
    setSending(false)
  }

  return (
    <div style={{ display: 'flex', gap: 0, height: 'calc(100vh - 130px)', background: 'white', border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>

            {/* -- COLUMNA IZQUIERDA — lista -- */}
            <div style={{ width: 360, flexShrink: 0, borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>

              {/* Cabecera */}
              <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Chat logs</span>
                  {/* Botón PDF — amarillo, directo sin menú */}
                  <button
                    onClick={exportPDF}
                    title="Exportar PDF"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 7, border: 'none', background: '#f59e0b', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'white' }}>
                    <span style={{ fontSize: 14 }}>📄</span> Exportar PDF
                  </button>
                </div>

                {/* Filtro de periodo — 3 botones */}
                <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
                  {([
                    { v: 'day',   l: 'Hoy' },
                    { v: 'week',  l: 'Esta semana' },
                    { v: 'month', l: 'Este mes' },
                  ] as const).map(opt => (
                    <button key={opt.v} onClick={() => setFiltroPeriodo(opt.v)}
                      style={{
                        flex: 1, padding: '6px 0', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                        border: '1.5px solid ' + (filtroPeriodo === opt.v ? themeColor : '#e5e7eb'),
                        background: filtroPeriodo === opt.v ? themeColor : 'white',
                        color: filtroPeriodo === opt.v ? 'white' : '#555',
                        transition: 'all 0.12s',
                      }}>
                      {opt.l}
                    </button>
                  ))}
                </div>

                {/* Filtro de score — botón que despliega panel inline */}
                <div>
                  <button onClick={() => setScorePanel((p: boolean) => !p)}
                    style={{
                      width: '100%', padding: '7px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                      border: '1.5px solid ' + (filtroScoreMax < 10 ? themeColor : '#e5e7eb'),
                      background: filtroScoreMax < 10 ? themeColor + '0e' : 'white',
                      color: filtroScoreMax < 10 ? themeColor : '#555',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'all 0.12s',
                    }}>
                    <span>
                      {filtroScoreMax < 10
                        ? 'Chats con score hasta ' + filtroScoreMax.toFixed(1)
                        : 'Filtrar por score de calidad'}
                    </span>
                    <span style={{ fontSize: 10, opacity: 0.6 }}>{scorePanel ? '▲' : '▼'}</span>
                  </button>

                  {scorePanel && (
                    <div style={{ background: '#f8fafc', border: '1px solid #f0f0f0', borderRadius: 8, padding: '14px 14px 10px', marginTop: 6 }}>
                      {/* Atajos rápidos */}
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Atajos rápidos</div>
                      <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
                        {[
                          { v: 3,  l: 'Problemáticos', sub: 'hasta 3' },
                          { v: 5,  l: 'Revisar',        sub: 'hasta 5' },
                          { v: 10, l: 'Todos',          sub: '' },
                        ].map(opt => (
                          <button key={opt.v} onClick={() => setFiltroScoreMax(opt.v)}
                            style={{
                              flex: 1, padding: '7px 4px', borderRadius: 7, cursor: 'pointer', textAlign: 'center',
                              border: '1.5px solid ' + (filtroScoreMax === opt.v ? themeColor : '#e5e7eb'),
                              background: filtroScoreMax === opt.v ? themeColor + '12' : 'white',
                            }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: filtroScoreMax === opt.v ? themeColor : '#111' }}>{opt.l}</div>
                            {opt.sub && <div style={{ fontSize: 9, color: '#aaa', marginTop: 1 }}>{opt.sub}</div>}
                          </button>
                        ))}
                      </div>
                      {/* Slider fino */}
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Personalizado</div>
                      <input type="range" min="0" max="10" step="0.5" value={filtroScoreMax}
                        onChange={e => setFiltroScoreMax(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: themeColor, marginBottom: 4 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa' }}>
                        <span>Peor calidad (0)</span>
                        <span style={{ fontWeight: 700, color: themeColor }}>Hasta {filtroScoreMax.toFixed(1)}</span>
                        <span>Mejor calidad (10)</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contador de resultados */}
                <div style={{ marginTop: 8, fontSize: 11, color: '#aaa' }}>
                  {convsFiltradas().length} conversaciones
                  {(filtroScoreMax < 10) && <span style={{ color: themeColor, fontWeight: 600 }}> · score hasta {filtroScoreMax.toFixed(1)}</span>}
                </div>
              </div>

              {/* Lista conversaciones filtradas */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {convsFiltradas().length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                    Sin conversaciones con estos filtros
                  </div>
                ) : (
                  convsFiltradas().map(conv => {
                    const sel = convSel === conv.id
                    const dt = new Date(conv.started_at)
                    const now = new Date()
                    const diffDays = Math.floor((now.getTime() - dt.getTime()) / 86400000)
                    const timeLabel = diffDays === 0 ? 'Hoy' : diffDays === 1 ? 'Ayer' : 'Hace ' + diffDays + ' días'
                    // Color del score: rojo si bajo, amarillo si medio, verde si alto
                    const scoreColor = conv.confidence_score <= 3 ? '#dc2626' : conv.confidence_score <= 6 ? '#d97706' : '#059669'
                    return (
                      <div key={conv.id} onClick={() => cargarMsgsConv(conv.id)}
                        style={{ padding: '12px 14px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: sel ? themeColor + '08' : 'white', borderLeft: '3px solid ' + (sel ? themeColor : 'transparent'), transition: 'all 0.1s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {/* Score badge */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: scoreColor + '12', borderRadius: 6, padding: '2px 7px', border: '1px solid ' + scoreColor + '30' }}>
                              <span style={{ fontSize: 10 }}>📊</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor }}>{conv.confidence_score.toFixed(2)}</span>
                            </div>
                            {conv.language && <span style={{ fontSize: 10, color: '#aaa', background: '#f5f5f5', padding: '2px 5px', borderRadius: 4 }}>{conv.language.toUpperCase()}</span>}
                          </div>
                          <span style={{ fontSize: 10, color: '#aaa' }}>{timeLabel}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                          {conv.first_message
                            ? conv.first_message.slice(0, 60) + (conv.first_message.length > 60 ? '…' : '')
                            : conv.session_id.slice(0, 34)}
                        </div>
                        <div style={{ fontSize: 10, color: '#aaa' }}>{conv.message_count} mensajes · {dt.toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* -- COLUMNA DERECHA — detalle -- */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {!convSel ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa', gap: 10 }}>
                  <div style={{ fontSize: 36 }}>💬</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#555' }}>Selecciona una conversación</div>
                  <div style={{ fontSize: 12 }}>Haz click en cualquier chat de la izquierda</div>
                </div>
              ) : (
                <>
                  {/* Header detalle conversación */}
                  <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 2 }}>Conversación</div>
                      <div style={{ fontSize: 11, color: '#aaa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(() => {
                          const conv = conversations.find(c => c.id === convSel)
                          return conv?.first_message
                            ? conv.first_message.slice(0, 60) + (conv.first_message.length > 60 ? '…' : '')
                            : conv?.session_id?.slice(0, 40)
                        })()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      {(() => {
                        const conv = conversations.find(c => c.id === convSel)
                        if (!conv) return null
                        const sc = conv.confidence_score
                        const scColor = sc <= 3 ? '#dc2626' : sc <= 6 ? '#d97706' : '#059669'
                        return (
                          <>
                            <span style={S.tag(scColor + '12', scColor)}>📊 {sc.toFixed(2)}</span>
                            <span style={S.tag('#f5f5f5', '#888')}>{conv.message_count} msgs</span>
                          </>
                        )
                      })()}
                      <button onClick={() => { setConvSel(null); setMsgsConv([]) }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 18, lineHeight: 1 }}>✕</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', padding: '0 20px', borderBottom: '1px solid #f0f0f0', background: 'white' }}>
                    {['Chat', 'Details'].map(t => (
                      <div key={t} style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, color: t === 'Chat' ? themeColor : '#aaa', borderBottom: '2px solid ' + (t === 'Chat' ? themeColor : 'transparent'), cursor: 'pointer' }}>{t}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, background: '#fafafa' }}>
                    {msgsConv.map((msg: any, i: number) => (
                      <div key={msg.id || i}>
                        {/* Etiqueta de rol */}
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, paddingLeft: msg.role === 'user' ? 0 : 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                          {msg.role === 'user' ? 'Visitante' : (cliente?.name || 'Asistente')}
                        </div>
                        <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            background: msg.role === 'user' ? widgetForm.widget_color : 'white',
                            color: msg.role === 'user' ? 'white' : '#374151',
                            borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                            padding: '12px 16px', maxWidth: '75%', fontSize: 13, lineHeight: 1.7,
                            boxShadow: msg.role === 'assistant' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                          }}
                            dangerouslySetInnerHTML={{
                              __html: msg.role === 'assistant'
                                // Renderizar markdown: bold, links, listas, saltos de línea
                                ? (msg.content || '')
                                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                                    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" style="color:' + themeColor + ';text-decoration:underline;word-break:break-all">$1</a>')
                                    .replace(/^- (.+)$/gm, '<li style="margin-left:16px;margin-bottom:2px">$1</li>')
                                    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding:0;margin:6px 0;list-style:none">$&</ul>')
                                    .replace(/\n\n/g, '<br><br>')
                                    .replace(/\n/g, '<br>')
                                : (msg.content || '').replace(/\n/g, '<br>')
                            }}
                          />
                        </div>
                        {/* Footer del mensaje: timestamp + tokens */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', paddingLeft: msg.role === 'user' ? 0 : 4 }}>
                          {msg.created_at && (
                            <span style={{ fontSize: 10, color: '#aaa' }}>
                              {new Date(msg.created_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          {msg.role === 'assistant' && msg.tokens_used && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#f1f5f9', borderRadius: 5, padding: '2px 7px' }}>
                              <span style={{ fontSize: 10 }}>☁️</span>
                              <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>{msg.tokens_used} tokens</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
    </div>
  )
}
