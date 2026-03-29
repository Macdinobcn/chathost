'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'

interface Mensaje {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface SesionAnterior {
  session_id: string
  started_at: string
  message_count: number
  mensajes: Mensaje[]
}

interface WidgetConfig {
  widget_name: string
  widget_color: string
  widget_position: string
  widget_window_size: string
  widget_logo_url: string
  widget_icon_url: string
  widget_placeholder: string
  initial_message: string
  suggested_messages: string[]
  name: string
  widget_weather_enabled: boolean
  widget_weather_lat: number | null
  widget_weather_lng: number | null
  widget_occupancy_enabled: boolean
  widget_occupancy_pct: number | null
  widget_occupancy_text: string | null
  widget_webcam_enabled: boolean
  widget_webcam_url: string | null
}

interface WeatherDay {
  date: string
  tmax: number
  tmin: number
  code: number
}

function weatherIcon(code: number): string {
  if (code === 0) return 'sun'
  if (code <= 2) return 'partly'
  if (code <= 3) return 'cloud'
  if (code <= 49) return 'fog'
  if (code <= 69) return 'rain'
  if (code <= 79) return 'snow'
  if (code <= 84) return 'sleet'
  return 'storm'
}

const WEATHER_SVG: Record<string, string> = {
  sun:    '<circle cx="12" cy="12" r="4" fill="#f59e0b"/><g stroke="#f59e0b" stroke-width="1.5"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/><line x1="19.8" y1="4.2" x2="17.7" y2="6.3"/><line x1="6.3" y1="17.7" x2="4.2" y2="19.8"/></g>',
  partly: '<circle cx="10" cy="10" r="4" fill="#f59e0b"/><path d="M6 17a4 4 0 0 1 0-8h.5A5 5 0 1 1 18 14H6z" fill="#94a3b8"/>',
  cloud:  '<path d="M4 17a4 4 0 0 1 0-8h.5A5 5 0 1 1 18 14H4z" fill="#94a3b8"/>',
  fog:    '<path d="M4 17a4 4 0 0 1 0-8h.5A5 5 0 1 1 18 14H4z" fill="#cbd5e1"/><line x1="4" y1="20" x2="20" y2="20" stroke="#cbd5e1" stroke-width="2"/><line x1="6" y1="23" x2="18" y2="23" stroke="#e2e8f0" stroke-width="2"/>',
  rain:   '<path d="M4 14a4 4 0 0 1 0-8h.5A5 5 0 1 1 18 11H4z" fill="#64748b"/><g stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"><line x1="8" y1="18" x2="6" y2="22"/><line x1="12" y1="18" x2="10" y2="22"/><line x1="16" y1="18" x2="14" y2="22"/></g>',
  snow:   '<path d="M4 14a4 4 0 0 1 0-8h.5A5 5 0 1 1 18 11H4z" fill="#94a3b8"/><g fill="#93c5fd"><circle cx="8" cy="19" r="1.5"/><circle cx="12" cy="21" r="1.5"/><circle cx="16" cy="19" r="1.5"/></g>',
  sleet:  '<path d="M4 14a4 4 0 0 1 0-8h.5A5 5 0 1 1 18 11H4z" fill="#64748b"/><g><line x1="8" y1="18" x2="6" y2="22" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/><circle cx="13" cy="20" r="1.5" fill="#93c5fd"/><line x1="16" y1="18" x2="14" y2="22" stroke="#3b82f6" stroke-width="1.5" stroke-linecap="round"/></g>',
  storm:  '<path d="M4 14a4 4 0 0 1 0-8h.5A5 5 0 1 1 18 11H4z" fill="#475569"/><path d="M13 14l-3 5h4l-3 5" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
}

function WeatherIcon({ code, size = 22 }: { code: number; size?: number }) {
  const key = weatherIcon(code)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      dangerouslySetInnerHTML={{ __html: WEATHER_SVG[key] || WEATHER_SVG.sun }} />
  )
}

function diaCorto(dateStr: string): string {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  const d = new Date(dateStr + 'T12:00:00')
  const hoy = new Date()
  if (d.toDateString() === hoy.toDateString()) return 'Hoy'
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1)
  if (d.toDateString() === manana.toDateString()) return 'Mañ.'
  return dias[d.getDay()]
}

const LS_PREFIX = 'chat_arandai_widget_'

function getOrCreateSessionId(widgetId: string): string {
  if (typeof window === 'undefined') return `sess_${Date.now()}`
  const key = LS_PREFIX + widgetId + '_current'
  let id = localStorage.getItem(key)
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem(key, id)
  }
  return id
}

function getPreviousSessions(widgetId: string): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(LS_PREFIX + widgetId + '_history') || '[]') }
  catch { return [] }
}

function saveSessionToHistory(widgetId: string, sessionId: string) {
  if (typeof window === 'undefined') return
  const key = LS_PREFIX + widgetId + '_history'
  const history = getPreviousSessions(widgetId)
  if (!history.includes(sessionId))
    localStorage.setItem(key, JSON.stringify([sessionId, ...history].slice(0, 5)))
}

function renderMarkdown(text: string, colorLink: string): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
      `<a href="$2" target="_blank" rel="noreferrer" style="color:${colorLink};text-decoration:underline;word-break:break-all;">$1</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li style="margin-left:14px;margin-bottom:2px">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="padding:0;margin:4px 0;list-style:none">$&</ul>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} sem.`
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function WidgetPage() {
  const params = useParams()
  const widgetId = params.widgetId as string

  const [config, setConfig] = useState<WidgetConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [sesionesAnteriores, setSesionesAnteriores] = useState<SesionAnterior[]>([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [historialExpandido, setHistorialExpandido] = useState<string | null>(null)
  const [contextHistorico, setContextHistorico] = useState<Mensaje[]>([])
  const [weather, setWeather] = useState<WeatherDay[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  // Cargar config desde API
  useEffect(() => {
    fetch(`/api/widget-config/${widgetId}`)
      .then(r => r.json())
      .then(d => setConfig(d.config))
      .catch(() => setConfig(null))
      .finally(() => setConfigLoading(false))
  }, [widgetId])

  // Sesión + historial
  useEffect(() => {
    const sid = getOrCreateSessionId(widgetId)
    setSessionId(sid)
    const prevSessions = getPreviousSessions(widgetId).filter(s => s !== sid)
    if (prevSessions.length === 0) return
    Promise.allSettled(
      prevSessions.slice(0, 3).map(s =>
        fetch(`/api/chat/history?widgetId=${widgetId}&sessionId=${s}`)
          .then(r => r.json())
          .then(d => ({
            session_id: s,
            started_at: d.started_at || new Date().toISOString(),
            message_count: d.messages?.length || 0,
            mensajes: (d.messages || []).map((m: any) => ({ role: m.role, content: m.content, created_at: m.created_at })),
          } as SesionAnterior))
      )
    ).then(results => {
      const sesiones = results
        .filter(r => r.status === 'fulfilled' && (r as any).value?.message_count > 0)
        .map(r => (r as any).value as SesionAnterior)
      if (sesiones.length > 0) {
        setSesionesAnteriores(sesiones)
        setContextHistorico(sesiones.flatMap(s => s.mensajes).slice(-20))
      }
    })
  }, [widgetId])

  // Tiempo
  useEffect(() => {
    if (!config?.widget_weather_enabled || !config.widget_weather_lat || !config.widget_weather_lng) return
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${config.widget_weather_lat}&longitude=${config.widget_weather_lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`)
      .then(r => r.json())
      .then(d => setWeather((d.daily?.time || []).map((date: string, i: number) => ({
        date, tmax: Math.round(d.daily.temperature_2m_max[i]),
        tmin: Math.round(d.daily.temperature_2m_min[i]), code: d.daily.weathercode[i],
      }))))
      .catch(() => {})
  }, [config])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [mensajes, cargando])

  async function enviarMensaje() {
    const texto = input.trim()
    if (!texto || cargando || !sessionId) return
    if (mensajes.length === 0) saveSessionToHistory(widgetId, sessionId)
    const nuevosMensajes: Mensaje[] = [...mensajes, { role: 'user', content: texto }]
    setMensajes(nuevosMensajes)
    setInput('')
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId, sessionId, mensaje: texto,
          historial: [...contextHistorico.slice(-10), ...mensajes.slice(-10)],
        }),
      })
      const data = await res.json()
      if (!res.ok) setError('No se pudo obtener respuesta.')
      else setMensajes([...nuevosMensajes, { role: 'assistant', content: data.respuesta }])
    } catch { setError('Error de conexión.') }
    finally { setCargando(false) }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensaje() }
  }

  if (configLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
      <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!config) return null

  const color = config.widget_color || '#2563eb'
  const msgInicial = config.initial_message || `Hola, soy <strong>${config.widget_name}</strong>. ¿En qué puedo ayudarte? 👋`
  const totalHistorial = sesionesAnteriores.reduce((a, s) => a + s.message_count, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif', background: '#f8fafc' }}>

      {/* Header */}
      <div style={{ background: color, padding: '11px 15px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexShrink: 0 }}>
        {config.widget_logo_url
          ? <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }}>
              <img src={config.widget_logo_url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
            </div>
          : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {config.widget_icon_url
                ? <img src={config.widget_icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                : <span style={{ fontSize: 16 }}>💬</span>}
            </div>
        }
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{config.widget_name}</div>
          {config.name && <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11 }}>{config.name}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80' }} />
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>En línea</span>
        </div>
      </div>

      {/* Widget tiempo */}
      {config.widget_weather_enabled && weather.length > 0 && (
        <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '6px 10px', flexShrink: 0, display: 'flex', gap: 0, overflowX: 'auto' }}>
          {weather.slice(0, 7).map((day, i) => (
            <div key={i} style={{ flex: 1, minWidth: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '2px 3px', borderRight: i < 6 ? '1px solid #f5f5f5' : 'none' }}>
              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{diaCorto(day.date)}</span>
              <WeatherIcon code={day.code} size={20} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{day.tmax}°</span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>{day.tmin}°</span>
            </div>
          ))}
        </div>
      )}

      {/* Widget ocupación */}
      {config.widget_occupancy_enabled && config.widget_occupancy_pct !== null && (
        <div style={{ background: color + '0d', borderBottom: '1px solid ' + color + '1a', padding: '6px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, width: (100 - (config.widget_occupancy_pct || 0)) + '%', background: (config.widget_occupancy_pct || 0) > 80 ? '#ef4444' : (config.widget_occupancy_pct || 0) > 50 ? '#f59e0b' : color }} />
          </div>
          <span style={{ fontSize: 11, color: color, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {config.widget_occupancy_text || ((100 - (config.widget_occupancy_pct || 0)) + '% disponible')}
          </span>
        </div>
      )}

      {/* Mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '13px 13px', display: 'flex', flexDirection: 'column', gap: 9 }}>

        {/* Chip historial */}
        {totalHistorial > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => setMostrarHistorial(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, border: '1px solid ' + color + '30', background: color + '08', color, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              💬 {totalHistorial} mensajes anteriores {mostrarHistorial ? '▲' : '▼'}
            </button>
          </div>
        )}

        {/* Historial */}
        {mostrarHistorial && sesionesAnteriores.map(sesion => (
          <div key={sesion.session_id}>
            <div onClick={() => setHistorialExpandido(h => h === sesion.session_id ? null : sesion.session_id)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', padding: '4px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              <span style={{ fontSize: 10, color: '#94a3b8', whiteSpace: 'nowrap', fontWeight: 600 }}>
                {timeAgo(sesion.started_at)} · {sesion.message_count} msgs {historialExpandido === sesion.session_id ? '▲' : '▼'}
              </span>
              <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            </div>
            {historialExpandido === sesion.session_id && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, opacity: 0.68 }}>
                {sesion.mensajes.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ background: msg.role === 'user' ? color + 'bb' : '#f1f5f9', color: msg.role === 'user' ? 'white' : '#374151', borderRadius: msg.role === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px', padding: '7px 11px', maxWidth: '80%', fontSize: 13, lineHeight: 1.5 }}
                      dangerouslySetInnerHTML={{ __html: msg.role === 'assistant' ? renderMarkdown(msg.content, color) : msg.content.replace(/\n/g, '<br>') }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Separador conversación actual */}
        {mostrarHistorial && sesionesAnteriores.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ flex: 1, height: 1, background: color + '22' }} />
            <span style={{ fontSize: 10, color, fontWeight: 700, whiteSpace: 'nowrap' }}>Conversación actual</span>
            <div style={{ flex: 1, height: 1, background: color + '22' }} />
          </div>
        )}

        {/* Mensaje inicial */}
        {mensajes.length === 0 && (
          <div style={{ background: 'white', borderRadius: '12px 12px 12px 4px', padding: '11px 14px', maxWidth: '82%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontSize: 14, color: '#374151', lineHeight: 1.6 }}
            dangerouslySetInnerHTML={{ __html: msgInicial }} />
        )}

        {/* Nota contexto */}
        {contextHistorico.length > 0 && mensajes.length === 0 && (
          <div style={{ background: color + '0c', border: '1px solid ' + color + '20', borderRadius: 8, padding: '7px 11px', fontSize: 11, color, lineHeight: 1.4, maxWidth: '82%' }}>
            ✓ Recuerdo nuestra conversación anterior. Puedes continuar donde lo dejaste.
          </div>
        )}

        {/* Preguntas sugeridas */}
        {mensajes.length === 0 && (config.suggested_messages || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {(config.suggested_messages || []).slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => setInput(s)}
                style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: '1px solid ' + color + '30', background: color + '08', color, cursor: 'pointer', fontFamily: 'inherit' }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Mensajes sesión actual */}
        {mensajes.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ background: msg.role === 'user' ? color : 'white', color: msg.role === 'user' ? 'white' : '#374151', borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', padding: '10px 14px', maxWidth: '80%', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontSize: 14, lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: msg.role === 'assistant' ? renderMarkdown(msg.content, color) : msg.content.replace(/\n/g, '<br>') }} />
          </div>
        ))}

        {/* Typing */}
        {cargando && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ background: 'white', borderRadius: '12px 12px 12px 4px', padding: '11px 15px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', gap: 4, alignItems: 'center' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
            </div>
          </div>
        )}

        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 13px', fontSize: 13, color: '#991b1b' }}>{error}</div>}

        {/* Webcam */}
        {config.widget_webcam_enabled && config.widget_webcam_url && mensajes.length === 0 && (() => {
          const url = config.widget_webcam_url!
          const esIframe = url.includes('ipcamlive.com') || url.includes('embed') || url.includes('player')
          return (
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', marginTop: 4 }}>
              <div style={{ background: '#1e293b', padding: '5px 11px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
                <span style={{ color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>EN DIRECTO</span>
              </div>
              {esIframe
                ? <iframe src={url} style={{ width: '100%', height: 150, border: 'none', display: 'block' }} allow="autoplay" />
                : <img src={url} style={{ width: '100%', display: 'block', maxHeight: 150, objectFit: 'cover' }} alt="Webcam" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              }
            </div>
          )
        })()}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 13px', background: 'white', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={config.widget_placeholder || 'Escribe tu pregunta...'}
            rows={1}
            style={{ flex: 1, padding: '9px 13px', border: '1px solid #e2e8f0', borderRadius: 22, fontSize: 14, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.4, color: '#1e293b' }} />
          <button onClick={enviarMensaje} disabled={cargando || !input.trim()}
            style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', background: cargando || !input.trim() ? '#e2e8f0' : color, color: 'white', cursor: cargando || !input.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
            ↑
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 5, fontSize: 12, color: '#94a3b8' }}>
          Powered by <a href="https://chathost.ai" target="_blank" rel="noreferrer" style={{ color: color, fontWeight: 600, textDecoration: 'none' }}>ChatHost</a>
        </div>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:.5} 40%{transform:scale(1);opacity:1} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  )
}
