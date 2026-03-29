'use client'
// app/widget/[widgetId]/page.tsx

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

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
  widget_theme: 'light' | 'dark'
  // Widgets contextuales
  widget_weather_enabled: boolean
  widget_weather_lat: number | null
  widget_weather_lng: number | null
  widget_weather_place: string | null
  widget_occupancy_enabled: boolean
  widget_occupancy_pct: number | null
  widget_occupancy_text: string | null
  widget_webcam_enabled: boolean
  widget_webcam_url: string | null
  // GDPR
  gdpr_enabled: boolean
  gdpr_title: string
  gdpr_text: string
  gdpr_button_text: string
  gdpr_privacy_url: string
}

interface Mensaje {
  role: 'user' | 'assistant' | 'operator'
  content: string
  timestamp?: string
}

interface SesionAnterior {
  sessionId: string
  fecha: string
  mensajes: Mensaje[]
  preview: string
}

interface WeatherDay {
  date: string
  label: string
  icon: string
  min: number
  max: number
  code: number
}

// Temas
function getTheme(theme: 'light' | 'dark', color: string) {
  if (theme === 'dark') {
    return {
      bg: '#0f172a',
      card: '#1e293b',
      border: '#334155',
      text: '#f1f5f9',
      textMuted: '#94a3b8',
      textFaint: '#94a3b8',
      msgBot: '#1e293b',
      msgBotText: '#cbd5e1',
      input: '#0f172a',
      inputBorder: '#334155',
      inputText: '#f1f5f9',
      inputBar: '#1e293b',
      poweredBy: '#334155',
      histBar: '#1e293b',
      histBorder: '#0f172a',
      sugBg: '#1e293b',
      sugBorder: `${color}33`,
    }
  }
  return {
    bg: '#ffffff',
    card: '#f8fafc',
    border: '#e2e8f0',
    text: '#111827',
    textMuted: '#6b7280',
    textFaint: '#9ca3af',
    msgBot: '#f3f4f6',
    msgBotText: '#374151',
    input: '#ffffff',
    inputBorder: '#e5e7eb',
    inputText: '#111827',
    inputBar: '#ffffff',
    poweredBy: '#f3f4f6',
    histBar: '#f8fafc',
    histBorder: '#e5e7eb',
    sugBg: '#f3f4f6',
    sugBorder: `${color}33`,
  }
}

function renderMarkdown(text: string, colorLink: string): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
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
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function weatherIcon(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 2) return '⛅'
  if (code <= 3) return '☁️'
  if (code <= 48) return '🌫️'
  if (code <= 57) return '🌦️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌦️'
  return '⛈️'
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

  // GDPR
  const [gdprAccepted, setGdprAccepted] = useState(false)
  const [gdprLoaded, setGdprLoaded] = useState(false)

  // Historial
  const [sesionesAnteriores, setSesionesAnteriores] = useState<SesionAnterior[]>([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [historialExpandido, setHistorialExpandido] = useState<string | null>(null)
  const [contextHistorico, setContextHistorico] = useState<Mensaje[]>([])

  // Tiempo
  const [weather, setWeather] = useState<WeatherDay[]>([])
  const [weatherLoaded, setWeatherLoaded] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 1. Cargar config
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch(`/api/widget-config/${widgetId}`)
        if (!res.ok) throw new Error('Config no encontrada')
        const data = await res.json()
        setConfig(data.config)
      } catch {
        setConfig({
          widget_name: 'Asistente', widget_color: '#2563eb',
          widget_position: 'bottom-right', widget_window_size: 'medium',
          widget_logo_url: '', widget_icon_url: '',
          widget_placeholder: 'Escribe tu pregunta...',
          initial_message: '¡Hola! ¿En qué puedo ayudarte? 👋',
          suggested_messages: [], name: '',
          widget_theme: 'light',
          widget_weather_enabled: false, widget_weather_lat: null,
          widget_weather_lng: null, widget_weather_place: null,
          widget_occupancy_enabled: false, widget_occupancy_pct: null,
          widget_occupancy_text: null,
          widget_webcam_enabled: false, widget_webcam_url: null,
          gdpr_enabled: true,
          gdpr_title: 'Antes de continuar',
          gdpr_text: 'Este chat usa inteligencia artificial para responder tus preguntas.',
          gdpr_button_text: 'Entendido, continuar',
          gdpr_privacy_url: 'https://chathost.ai/privacy',
        })
      } finally {
        setConfigLoading(false)
      }
    }
    loadConfig()
  }, [widgetId])

  // 2. Comprobar GDPR en localStorage
  useEffect(() => {
    if (!config) return
    const key = `chathost_gdpr_${widgetId}`
    const accepted = localStorage.getItem(key) === 'accepted'
    setGdprAccepted(accepted || !config.gdpr_enabled)
    setGdprLoaded(true)
  }, [config, widgetId])

  // 3. Inicializar sesión e historial
  useEffect(() => {
    if (!gdprAccepted) return
    const key = `chathost_session_${widgetId}`
    let sid = localStorage.getItem(key)
    if (!sid) {
      sid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      localStorage.setItem(key, sid)
    }
    setSessionId(sid)
    const histKey = `chathost_history_${widgetId}`
    const stored = localStorage.getItem(histKey)
    if (stored) {
      try { setSesionesAnteriores(JSON.parse(stored)) } catch {}
    }
  }, [gdprAccepted, widgetId])

  // 4. Mensaje inicial
  useEffect(() => {
    if (!config || !gdprAccepted || mensajes.length > 0) return
    if (config.initial_message) {
      setMensajes([{
        role: 'assistant',
        content: config.initial_message,
        timestamp: new Date().toISOString(),
      }])
    }
  }, [config, gdprAccepted, mensajes.length])

  // 5. Tiempo
  useEffect(() => {
    if (!config?.widget_weather_enabled || !config.widget_weather_lat || weatherLoaded) return
    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${config!.widget_weather_lat}&longitude=${config!.widget_weather_lng}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
        const res = await fetch(url)
        const data = await res.json()
        const days: WeatherDay[] = data.daily.time.map((d: string, i: number) => ({
          date: d,
          label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }),
          icon: weatherIcon(data.daily.weather_code[i]),
          min: Math.round(data.daily.temperature_2m_min[i]),
          max: Math.round(data.daily.temperature_2m_max[i]),
          code: data.daily.weather_code[i],
        }))
        setWeather(days)
        setWeatherLoaded(true)
      } catch {}
    }
    fetchWeather()
  }, [config, weatherLoaded])

  // 6. Scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  function acceptGdpr() {
    localStorage.setItem(`chathost_gdpr_${widgetId}`, 'accepted')
    setGdprAccepted(true)
  }

  async function enviar(textoOverride?: string) {
    const texto = (textoOverride ?? input).trim()
    if (!texto || cargando || !gdprAccepted) return
    setInput('')
    setError('')

    const nuevoMensaje: Mensaje = { role: 'user', content: texto, timestamp: new Date().toISOString() }
    const nuevos = [...mensajes, nuevoMensaje]
    setMensajes(nuevos)
    setCargando(true)

    try {
      const historial = [...contextHistorico, ...nuevos.filter(m => m.role !== 'operator')]
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ widgetId, sessionId, messages: historial }),
      })
      if (!res.ok) throw new Error('Error')
      const data = await res.json()
      const respuesta: Mensaje = {
        role: 'assistant',
        content: data.message || data.respuesta || 'Lo siento, no pude procesar tu pregunta.',
        timestamp: new Date().toISOString(),
      }
      const final = [...nuevos, respuesta]
      setMensajes(final)

      // Guardar historial local
      const sesionActual: SesionAnterior = {
        sessionId, fecha: new Date().toISOString(),
        mensajes: final, preview: texto.slice(0, 80),
      }
      const prevSesiones = sesionesAnteriores.filter(s => s.sessionId !== sessionId)
      const nuevasSesiones = [sesionActual, ...prevSesiones].slice(0, 10)
      setSesionesAnteriores(nuevasSesiones)
      localStorage.setItem(`chathost_history_${widgetId}`, JSON.stringify(nuevasSesiones))
    } catch {
      setError('Error al conectar. Inténtalo de nuevo.')
    } finally {
      setCargando(false)
      inputRef.current?.focus()
    }
  }

  if (configLoading || !config) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>Cargando...</div>
      </div>
    )
  }

  if (!gdprLoaded) return null

  const theme = getTheme(config.widget_theme || 'light', config.widget_color)
  const color = config.widget_color || '#2563eb'
  const sizes: Record<string, { w: number; h: number }> = {
    small: { w: 300, h: 420 },
    medium: { w: 360, h: 520 },
    large: { w: 420, h: 620 },
  }
  const { w, h } = sizes[config.widget_window_size] || sizes.medium

  return (
    <div style={{
      width: w, height: h, maxWidth: '100vw', maxHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      background: theme.bg,
      borderRadius: 16, overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      margin: '0 auto',
    }}>

      {/* Header */}
      <div style={{
        background: color, padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
      }}>
        {config.widget_logo_url ? (
          <img src={config.widget_logo_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
            🤖
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{config.widget_name}</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>{config.name}</div>
        </div>
        {sesionesAnteriores.length > 0 && (
          <button
            onClick={() => setMostrarHistorial(h => !h)}
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#fff', fontSize: 12 }}
          >
            🕐 {sesionesAnteriores.length}
          </button>
        )}
      </div>

      {/* GDPR Banner */}
      {!gdprAccepted ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 16px', background: theme.bg }}>
          <div style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '20px 16px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              🔒 {config.gdpr_title || 'Antes de continuar'}
            </div>
            <p style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
              {config.gdpr_text}
            </p>
            <a
              href={config.gdpr_privacy_url || 'https://chathost.ai/privacy'}
              target="_blank" rel="noreferrer"
              style={{ display: 'block', fontSize: 12, color: color, marginBottom: 16, textDecoration: 'underline' }}
            >
              Leer política de privacidad →
            </a>
            <button
              onClick={acceptGdpr}
              style={{ width: '100%', padding: '12px 0', background: color, border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              {config.gdpr_button_text || 'Entendido, continuar'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: theme.textFaint }}>
            Powered by <a href="https://chathost.ai" target="_blank" rel="noreferrer" style={{ color, textDecoration: 'none' }}>ChatHost.ai</a>
          </div>
        </div>

      ) : (
        <>
          {/* Historial */}
          {mostrarHistorial && (
            <div style={{ background: theme.histBar, borderBottom: `1px solid ${theme.border}`, maxHeight: 200, overflowY: 'auto', flexShrink: 0 }}>
              <div style={{ padding: '8px 12px', fontSize: 11, color: theme.textFaint, fontWeight: 600, textTransform: 'uppercase' }}>Conversaciones anteriores</div>
              {sesionesAnteriores.map(s => (
                <div key={s.sessionId}>
                  <div
                    onClick={() => setHistorialExpandido(historialExpandido === s.sessionId ? null : s.sessionId)}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderTop: `1px solid ${theme.histBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <div>
                      <div style={{ fontSize: 12, color: theme.text }}>{s.preview}</div>
                      <div style={{ fontSize: 10, color: theme.textFaint }}>{timeAgo(s.fecha)}</div>
                    </div>
                    <span style={{ color: theme.textFaint, fontSize: 12 }}>{historialExpandido === s.sessionId ? '▲' : '▼'}</span>
                  </div>
                  {historialExpandido === s.sessionId && (
                    <div style={{ padding: '0 12px 12px' }}>
                      <button
                        onClick={() => { setContextHistorico(s.mensajes.filter(m => m.role !== 'operator').slice(-6)); setMostrarHistorial(false) }}
                        style={{ fontSize: 11, padding: '4px 10px', background: color, border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}
                      >
                        Continuar esta conversación
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Widget tiempo */}
          {config.widget_weather_enabled && weather.length > 0 && (
            <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: '8px 12px', flexShrink: 0 }}>
              {config.widget_weather_place && (
                <div style={{ fontSize: 10, color: theme.textFaint, marginBottom: 5, fontWeight: 600 }}>{config.widget_weather_place}</div>
              )}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
                {weather.map((d, i) => (
                  <div key={i} style={{ flex: '0 0 auto', textAlign: 'center', background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '6px 10px', minWidth: 52 }}>
                    <div style={{ fontSize: 10, color: theme.textFaint, marginBottom: 2 }}>{d.label}</div>
                    <div style={{ fontSize: 18 }}>{d.icon}</div>
                    <div style={{ fontSize: 10, color: theme.text }}>{d.max}°/{d.min}°</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Widget ocupación */}
          {config.widget_occupancy_enabled && config.widget_occupancy_pct !== null && (
            <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, padding: '8px 12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div style={{ fontSize: 11, color: theme.textMuted }}>{config.widget_occupancy_text || 'Ocupación actual'}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: config.widget_occupancy_pct > 80 ? '#ef4444' : config.widget_occupancy_pct > 50 ? '#f59e0b' : '#10b981' }}>
                  {config.widget_occupancy_pct}%
                </div>
              </div>
              <div style={{ background: theme.bg, borderRadius: 4, height: 5 }}>
                <div style={{ height: '100%', borderRadius: 4, width: `${config.widget_occupancy_pct}%`, background: config.widget_occupancy_pct > 80 ? '#ef4444' : config.widget_occupancy_pct > 50 ? '#f59e0b' : '#10b981' }} />
              </div>
            </div>
          )}

          {/* Widget webcam */}
          {config.widget_webcam_enabled && config.widget_webcam_url && (
            <div style={{ background: theme.card, borderBottom: `1px solid ${theme.border}`, flexShrink: 0, maxHeight: 150, overflow: 'hidden' }}>
              {config.widget_webcam_url.includes('jpg') || config.widget_webcam_url.includes('png') ? (
                <img src={`${config.widget_webcam_url}?t=${Math.floor(Date.now() / 30000)}`} alt="Webcam" style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <iframe src={config.widget_webcam_url} style={{ width: '100%', height: 150, border: 'none', display: 'block' }} allowFullScreen />
              )}
            </div>
          )}

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mensajes.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'operator' ? (
                  <div style={{ width: '100%', background: '#1e3a5f', border: '1px solid #2563eb', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#93c5fd', lineHeight: 1.5 }}>
                    <div style={{ fontSize: 10, color: '#60a5fa', marginBottom: 4, fontWeight: 600 }}>💬 Mensaje del equipo</div>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content, '#60a5fa') }} />
                  </div>
                ) : (
                  <div style={{
                    maxWidth: '82%',
                    background: m.role === 'user' ? color : theme.msgBot,
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                    fontSize: 13,
                    color: m.role === 'user' ? '#fff' : theme.msgBotText,
                    lineHeight: 1.6,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content, m.role === 'user' ? 'rgba(255,255,255,0.9)' : color) }} />
                  </div>
                )}
              </div>
            ))}

            {cargando && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: theme.msgBot, borderRadius: '16px 16px 16px 4px', padding: '12px 16px', display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: theme.textMuted, animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626' }}>
                {error}
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Sugerencias */}
          {config.suggested_messages?.length > 0 && mensajes.length <= 2 && (
            <div style={{ padding: '4px 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 6, flexShrink: 0, background: theme.bg }}>
              {config.suggested_messages.map((s, i) => (
                <button key={i} onClick={() => enviar(s)} style={{ background: theme.sugBg, border: `1px solid ${theme.sugBorder}`, borderRadius: 20, padding: '5px 12px', fontSize: 12, color, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', background: theme.inputBar, borderTop: `1px solid ${theme.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }}
                placeholder={config.widget_placeholder || 'Escribe tu pregunta...'}
                disabled={cargando}
                style={{ flex: 1, padding: '10px 14px', background: theme.input, border: `1px solid ${theme.inputBorder}`, borderRadius: 24, color: theme.inputText, fontSize: 13, outline: 'none' }}
              />
              <button
                onClick={() => enviar()}
                disabled={cargando || !input.trim()}
                style={{ width: 38, height: 38, borderRadius: '50%', background: input.trim() && !cargando ? color : theme.border, border: 'none', cursor: input.trim() && !cargando ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, flexShrink: 0, transition: 'background 0.2s' }}
              >
                ↑
              </button>
            </div>
          </div>

          {/* Powered by */}
          <div style={{ textAlign: 'center', padding: '5px', fontSize: 11, color: theme.textFaint, background: theme.poweredBy, flexShrink: 0 }}>
            Powered by <a href="https://chathost.ai" target="_blank" rel="noreferrer" style={{ color, textDecoration: 'none' }}>ChatHost.ai</a>
          </div>
        </>
      )}

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:${theme.border};border-radius:2px}
        *{box-sizing:border-box}
      `}</style>
    </div>
  )
}
