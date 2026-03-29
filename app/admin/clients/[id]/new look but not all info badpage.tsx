'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useT, formatCurrency, formatNumber, IDIOMAS, type Idioma } from '@/lib/i18n'

interface Cliente {
  id: string; name: string; website_url: string; email: string; plan: string
  active: boolean; widget_id: string; widget_color: string; widget_name: string
  widget_position: string; widget_logo_url: string; widget_icon_url: string
  widget_window_size: string
  system_prompt: string; initial_message: string; suggested_messages: string[]
  widget_placeholder: string; temperature: number; auto_language: boolean
  report_emails: string[]; report_frequency: 'daily' | 'weekly' | 'monthly'
  daily_email: string; weekly_report: boolean
  created_at: string; ai_model: string; panel_language: Idioma
  recrawl_days: number | null
  // Widgets extra
  widget_weather_enabled: boolean; widget_weather_lat: number | null; widget_weather_lng: number | null
  widget_weather_place: string | null
  widget_occupancy_enabled: boolean; widget_occupancy_pct: number | null; widget_occupancy_text: string | null
  widget_webcam_enabled: boolean; widget_webcam_url: string | null
  knowledge_bases: { scraping_status: string; pages_scraped: number; words_count: number; last_scraped_at: string; content_md: string }[]
  client_costs: { month: string; messages_count: number; tokens_total: number; cost_eur: number }[]
}

interface KBSource { id: string; type: string; url: string; filename: string; file_url: string; status: string; words_count: number; created_at: string }
interface Conversation { id: string; session_id: string; started_at: string; message_count: number; language: string; confidence_score: number; first_message?: string }
interface SpecialMsg { id: string; title: string; content: string; active: boolean; start_date: string | null; end_date: string | null; show_on_open: boolean; msg_color?: string; msg_type?: string }

const TABS = ['General', 'Knowledge base', 'Chat', 'Noticias', 'Activity', 'Widget', 'Stats', 'Playground']

// Colores predefinidos para el panel de tema del admin
const THEME_PRESETS = [
  { label: 'Azul',    value: '#2563eb' },
  { label: 'Índigo',  value: '#4f46e5' },
  { label: 'Morado',  value: '#7c3aed' },
  { label: 'Verde',   value: '#059669' },
  { label: 'Cian',    value: '#0891b2' },
  { label: 'Slate',   value: '#475569' },
]

const MODELOS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku', desc: 'Rápido y económico', creditosMsg: 1, color: '#059669', badge: 'Recomendado' },
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet', desc: 'Más inteligente y preciso', creditosMsg: 4, color: '#4B7BE5', badge: '' },
  { id: 'claude-opus-4-5', label: 'Claude Opus', desc: 'El más potente', creditosMsg: 20, color: '#7c3aed', badge: 'Premium' },
]

// Créditos incluidos por plan al mes
const PLAN_CREDITOS: Record<string, number> = {
  basic: 500, starter: 500, pro: 3000, business: 10000, agency: 30000
}

// Tipos de noticias del chat con colores sugeridos
const SPECIAL_TYPES = [
  { id: 'promo',      label: '🏷 Promo',      color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  { id: 'event',      label: '🎉 Evento',     color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95' },
  { id: 'info',       label: 'ℹ️ Info',        color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' },
  { id: 'warning',    label: '⚠️ Aviso',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d' },
  { id: 'summer',     label: '☀️ Verano',     color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', text: '#164e63' },
  { id: 'halloween',  label: '🎃 Halloween',  color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12' },
  { id: 'christmas',  label: '🎄 Navidad',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d' },
  { id: 'custom',     label: '🎨 Custom',     color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', text: '#374151' },
]

// Convierte Markdown a HTML para el playground
function renderMd(text: string, color = '#2563eb'): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer" style="color:${color};text-decoration:underline;">${'$1'}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}

// Estilos estáticos (sin depender del tema dinámico)
const S = {
  wrap: { minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system,BlinkMacSystemFont,system-ui,sans-serif' } as React.CSSProperties,
  topbar: { background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' } as React.CSSProperties,
  body: { padding: '24px 28px', maxWidth: 1200, margin: '0 auto' } as React.CSSProperties,
  card: { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 22px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' } as React.CSSProperties,
  lbl: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.07em', display: 'block', marginBottom: 6 },
  inp: { width: '100%', padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#0f172a', background: 'white', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
  btn: (bg = '#2563eb', color = 'white') => ({ background: bg, color, border: bg === 'white' ? '1.5px solid #e2e8f0' : 'none', padding: '8px 18px', borderRadius: 9, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit', boxShadow: bg !== 'white' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none' } as React.CSSProperties),
  secLabel: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 12 },
  statRow: (cols: number) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, marginBottom: 18 } as React.CSSProperties),
  statBox: { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' } as React.CSSProperties,
  tag: (bg: string, col: string) => ({ fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: bg, color: col, display: 'inline-block' } as React.CSSProperties),
  tgl: (on: boolean, color = '#2563eb') => ({ width: 38, height: 22, borderRadius: 11, background: on ? color : '#e2e8f0', position: 'relative' as const, cursor: 'pointer', flexShrink: 0, display: 'inline-block', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)' }),
  tglK: (on: boolean) => ({ position: 'absolute' as const, top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 0.15s' }),
}

// Demo data para mapa
const DEMO_COUNTRIES = [
  { country: 'España', code: 'ES', count: 8234, flag: '🇪🇸' },
  { country: 'Francia', code: 'FR', count: 1205, flag: '🇫🇷' },
  { country: 'Alemania', code: 'DE', count: 834, flag: '🇩🇪' },
  { country: 'Reino Unido', code: 'GB', count: 621, flag: '🇬🇧' },
  { country: 'Italia', code: 'IT', count: 445, flag: '🇮🇹' },
  { country: 'Países Bajos', code: 'NL', count: 312, flag: '🇳🇱' },
  { country: 'Bélgica', code: 'BE', count: 198, flag: '🇧🇪' },
  { country: 'Portugal', code: 'PT', count: 167, flag: '🇵🇹' },
  { country: 'Suiza', code: 'CH', count: 143, flag: '🇨🇭' },
  { country: 'EE.UU.', code: 'US', count: 89, flag: '🇺🇸' },
]

export default function ClienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('General')
  const [lang, setLang] = useState<Idioma>('es')
  const tr = useT(lang)

  // -- TEMA ------------------------------------------------------------------
  // Color primario del panel admin (separado del color del widget del cliente)
  const [themeColor, setThemeColor] = useState('#2563eb')
  const [themePanelOpen, setThemePanelOpen] = useState(false)
  const [themeCustomInput, setThemeCustomInput] = useState('#2563eb')
  const themePanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Leer el tema guardado en localStorage al montar
    const saved = localStorage.getItem('arandai_theme_primary')
    if (saved) { setThemeColor(saved); setThemeCustomInput(saved) }
    // Cerrar panel al hacer clic fuera
    function handleClick(e: MouseEvent) {
      if (themePanelRef.current && !themePanelRef.current.contains(e.target as Node)) {
        setThemePanelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function aplicarTema(color: string) {
    setThemeColor(color)
    setThemeCustomInput(color)
    localStorage.setItem('arandai_theme_primary', color)
    // Actualizar CSS variable para los sliders y animaciones
    document.documentElement.style.setProperty('--color-primary', color)
  }
  // -------------------------------------------------------------------------

  const [formGeneral, setFormGeneral] = useState({ name: '', email: '', plan: '', website_url: '', active: true })
  const [formChat, setFormChat] = useState({
    system_prompt: '', temperature: 0.7, auto_language: true,
    ai_model: 'claude-haiku-4-5-20251001',
    // emails múltiples para reportes
    report_emails: [] as string[],
    report_frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
  })
  const [nuevoEmail, setNuevoEmail] = useState('')
  const [widgetForm, setWidgetForm] = useState({
    widget_name: '', widget_color: '#2563eb', widget_position: 'bottom-right',
    initial_message: '¡Hola! ¿En qué puedo ayudarte?',
    suggested_messages: [] as string[], widget_placeholder: 'Escribe tu pregunta...',
    widget_logo_url: '', widget_icon_url: '', widget_window_size: 'medium'
  })

  // KB
  const [textoKB, setTextoKB] = useState('')
  const [recrawlDays, setRecrawlDays] = useState(10)

  // Widgets extra (tiempo, ocupación, webcam)
  const [widgetsForm, setWidgetsForm] = useState({
    widget_weather_enabled: true,
    widget_weather_lat: '',
    widget_weather_lng: '',
    widget_occupancy_enabled: false,
    widget_occupancy_pct: 50,
    widget_occupancy_text: '',
    widget_webcam_enabled: false,
    widget_webcam_url: '',
  })
  const [weatherPreview, setWeatherPreview] = useState<{tmax:number,tmin:number,code:number,date:string}[]>([])
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [lugarBusqueda, setLugarBusqueda] = useState('')
  const [buscandoLugar, setBuscandoLugar] = useState(false)
  const [lugarNombre, setLugarNombre] = useState('') // nombre guardado del lugar
  const [mostrarEditorKB, setMostrarEditorKB] = useState(false)
  const [scraping, setScraping] = useState(false)
  const [msgScraping, setMsgScraping] = useState('')
  const [kbSources, setKbSources] = useState<KBSource[]>([])
  const [nuevaUrl, setNuevaUrl] = useState('')
  const [addingUrl, setAddingUrl] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Drag & drop para documentos KB
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounterRef = useRef(0) // evita flickering al pasar por hijos

  // Widget uploads con cropper
  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropperType, setCropperType] = useState<'logo' | 'icon'>('logo')
  const [cropperSrc, setCropperSrc] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)
  const cropCanvasRef = useRef<HTMLCanvasElement>(null)
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const [cropZoom, setCropZoom] = useState(1)
  const cropImgRef = useRef<HTMLImageElement | null>(null)

  // Especiales
  const [specialMsgs, setSpecialMsgs] = useState<SpecialMsg[]>([])
  const [formSpecial, setFormSpecial] = useState({ title: '', content: '', active: true, start_date: '', end_date: '', show_on_open: false, msg_type: 'promo', msg_color: '' })
  const [mostrarFormSpecial, setMostrarFormSpecial] = useState(false)
  const [previewEspecialMsg, setPreviewEspecialMsg] = useState('')

  // Activity
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filtroFecha, setFiltroFecha] = useState('')
  const [convSel, setConvSel] = useState<string | null>(null)
  const [msgsConv, setMsgsConv] = useState<any[]>([])

  // Activity — filtros rápidos
  const [filtroPeriodo, setFiltroPeriodo] = useState<'day' | 'week' | 'month'>('month')
  const [filtroScoreMax, setFiltroScoreMax] = useState<number>(10) // escala 0-10
  const [scorePanel, setScorePanel] = useState(false)

  // Widget — detectar cambios sin guardar
  const [widgetDirty, setWidgetDirty] = useState(false)
  const widgetFormRef = useRef(widgetForm)

  // Widget preview
  const [widgetPreviewMsgs, setWidgetPreviewMsgs] = useState([{ role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte? 👋' }])
  const [widgetPreviewInput, setWidgetPreviewInput] = useState('')
  const [nuevaSug, setNuevaSug] = useState('')
  const [copiado, setCopiado] = useState(false)

  // Playground
  const [pgModelo, setPgModelo] = useState('claude-haiku-4-5-20251001')
  const [pgMsgs, setPgMsgs] = useState<{ role: string; content: string; tokens?: number; coste?: number }[]>([])
  const [pgInput, setPgInput] = useState('')
  const [pgCargando, setPgCargando] = useState(false)
  const [pgSessionId] = useState(() => `playground-${Math.random().toString(36).slice(2)}`)
  const [pgTokensTotal, setPgTokensTotal] = useState(0)
  const [pgCosteTotal, setPgCosteTotal] = useState(0)
  const pgBottomRef = useRef<HTMLDivElement>(null)
  const [pgMasterSettings, setPgMasterSettings] = useState<{ master_prompt: string; master_format: string; master_rules: string } | null>(null)
  const [pgMasterTab, setPgMasterTab] = useState<'base' | 'formato' | 'normas'>('base')
  const [pgMasterGuardando, setPgMasterGuardando] = useState(false)
  const [pgMasterGuardado, setPgMasterGuardado] = useState(false)

  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, string>>({})

  useEffect(() => { if (!id || id === 'new') { setLoading(false); return }; cargar() }, [id])
  useEffect(() => { if (tab === 'Noticias') cargarSpeciales() }, [tab])
  useEffect(() => { if (tab === 'Activity') cargarConvs() }, [tab, filtroFecha])
  useEffect(() => {
    if (tab === 'Widget' && widgetsForm.widget_weather_enabled && widgetsForm.widget_weather_lat && weatherPreview.length === 0) {
      fetchWeatherPreview()
    }
  }, [tab])
  useEffect(() => { if (tab === 'Knowledge base') cargarSources() }, [tab])
  useEffect(() => {
    if (tab === 'Playground' && !pgMasterSettings) cargarPgMaster()
    if (tab === 'Playground') setPgMsgs([{ role: 'assistant', content: cliente?.initial_message || '¡Hola! ¿En qué puedo ayudarte?' }])
  }, [tab])

  // Calcula la fecha de inicio según el periodo seleccionado
  function fechaInicioPeriodo(periodo: 'day' | 'week' | 'month'): Date {
    const d = new Date()
    if (periodo === 'day') { d.setHours(0, 0, 0, 0); return d }
    if (periodo === 'week') { d.setDate(d.getDate() - 7); return d }
    d.setDate(1); d.setHours(0, 0, 0, 0); return d
  }

  // Filtra conversaciones según periodo y score
  function convsFiltradas() {
    const inicio = fechaInicioPeriodo(filtroPeriodo)
    return conversations.filter(c => {
      const dt = new Date(c.started_at)
      if (dt < inicio) return false
      if (c.confidence_score > filtroScoreMax) return false
      return true
    })
  }

  // Export PDF — llama al endpoint /api/export-pdf con Puppeteer, descarga directo
  async function exportPDF() {
    // Calcular periodoLabel aquí para evitar stale closure
    const _periodo = filtroPeriodo
    const _scoreMax = filtroScoreMax
    const periodoLabel = _periodo === 'day' ? 'Hoy' : _periodo === 'week' ? 'Esta semana' : 'Este mes'
    const scoreLabel = _scoreMax < 10 ? 'Score hasta ' + _scoreMax.toFixed(1) : 'Todos los scores'

    const exportandoDetalle = !!(convSel && msgsConv.length > 0)
    const convDetalle = exportandoDetalle ? conversations.find(c => c.id === convSel) : undefined

    const payload = {
      clienteName: cliente?.name || 'Chat',
      widgetColor: widgetForm.widget_color || '#2563eb',
      logoUrl: widgetForm.widget_icon_url || widgetForm.widget_logo_url || '',
      periodoLabel,
      scoreLabel,
      ...(exportandoDetalle && convDetalle
        ? { convDetalle, mensajes: msgsConv }
        : { convs: convsFiltradas() }
      ),
    }

    try {
      const res = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Error del servidor')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const fecha = new Date().toISOString().slice(0, 10)
      a.download = 'chatlogs-' + (cliente?.name || 'chat').toLowerCase().replace(/\s+/g, '-') + '-' + fecha + '.pdf'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Error al generar el PDF. Comprueba que el servidor está funcionando.')
      console.error(err)
    }
  }

  function setWF(updates: Partial<typeof widgetForm>) {
    setWidgetForm(prev => ({ ...prev, ...updates }))
    setWidgetDirty(true)
  }

  function cambiarTab(nuevaTab: string) {
    if (tab === 'Widget' && widgetDirty && nuevaTab !== 'Widget') {
      if (!confirm('Tienes cambios sin guardar en Widget. ¿Salir sin guardar?')) return
    }
    setTab(nuevaTab)
  }

  async function cargarPgMaster() {
    const res = await fetch('/api/master-settings')
    const data = await res.json()
    setPgMasterSettings(data.settings || { master_prompt: '', master_format: '', master_rules: '' })
  }

  async function guardarPgMaster() {
    if (!pgMasterSettings) return
    setPgMasterGuardando(true)
    await fetch('/api/master-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pgMasterSettings) })
    setPgMasterGuardando(false)
    setPgMasterGuardado(true)
    setTimeout(() => setPgMasterGuardado(false), 2500)
  }

  async function pgEnviar() {
    if (!pgInput.trim() || pgCargando || !cliente) return
    const pregunta = pgInput.trim()
    setPgInput('')
    setPgMsgs(prev => [...prev, { role: 'user', content: pregunta }])
    setPgCargando(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: cliente.widget_id,
          sessionId: pgSessionId,
          mensaje: pregunta,
          historial: pgMsgs.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
          modelOverride: pgModelo,
        }),
      })
      const data = await res.json()
      const tokEst = Math.round((pregunta.length + (data.respuesta?.length || 0)) / 4)
      const costeEst = tokEst * 0.000004
      setPgTokensTotal(t => t + tokEst)
      setPgCosteTotal(c => c + costeEst)
      setPgMsgs(prev => [...prev, { role: 'assistant', content: data.respuesta || 'Sin respuesta', tokens: tokEst, coste: costeEst }])
    } catch {
      setPgMsgs(prev => [...prev, { role: 'assistant', content: '❌ Error al conectar con la API' }])
    }
    setPgCargando(false)
    setTimeout(() => pgBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function cargar() {
    setLoading(true)
    try {
      const res = await fetch(`/api/clients/${id}`)
      if (!res.ok) { setLoading(false); return }
      const { client: c } = await res.json()
      if (!c) { setLoading(false); return }
      setCliente(c)
      setLang(c.panel_language || 'es')
      setFormGeneral({ name: c.name, email: c.email || '', plan: c.plan, website_url: c.website_url, active: c.active })
      setFormChat({
        system_prompt: c.system_prompt || '',
        temperature: c.temperature ?? 0.7,
        auto_language: c.auto_language ?? true,
        ai_model: c.ai_model || 'claude-haiku-4-5-20251001',
        report_emails: c.report_emails || (c.daily_email ? [c.daily_email] : []),
        report_frequency: c.report_frequency || (c.weekly_report ? 'weekly' : 'daily'),
      })
      const wf = {
        widget_name: c.widget_name || 'Asistente', widget_color: c.widget_color || '#2563eb',
        widget_position: c.widget_position || 'bottom-right',
        initial_message: c.initial_message || '¡Hola! ¿En qué puedo ayudarte?',
        suggested_messages: c.suggested_messages || [], widget_placeholder: c.widget_placeholder || 'Escribe tu pregunta...',
        widget_logo_url: c.widget_logo_url || '', widget_icon_url: c.widget_icon_url || '',
        widget_window_size: c.widget_window_size || 'medium',
      }
      setWidgetForm(wf)
      widgetFormRef.current = wf
      setWidgetDirty(false)
      setWidgetPreviewMsgs([{ role: 'assistant', content: wf.initial_message }])
      setWidgetsForm({
        widget_weather_enabled: c.widget_weather_enabled ?? true,
        widget_weather_lat: c.widget_weather_lat?.toString() || '',
        widget_weather_lng: c.widget_weather_lng?.toString() || '',
        widget_occupancy_enabled: c.widget_occupancy_enabled ?? false,
        widget_occupancy_pct: c.widget_occupancy_pct ?? 50,
        widget_occupancy_text: c.widget_occupancy_text || '',
        widget_webcam_enabled: c.widget_webcam_enabled ?? false,
        widget_webcam_url: c.widget_webcam_url || '',
      })
      if (c.widget_weather_place) setLugarNombre(c.widget_weather_place)
      if (c.widget_weather_place) setLugarBusqueda(c.widget_weather_place)
      setRecrawlDays(c.recrawl_days ?? 10)
      setTextoKB(c.knowledge_bases?.[0]?.content_md || '')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function cargarSources() {
    const res = await fetch(`/api/kb-sources?clientId=${id}`)
    const data = await res.json()
    setKbSources(data.sources || [])
  }

  async function cargarSpeciales() {
    const res = await fetch(`/api/special-messages?clientId=${id}`)
    const data = await res.json()
    setSpecialMsgs(data.messages || [])
  }

  async function cargarConvs() {
    const res = await fetch(`/api/conversations?clientId=${id}&include_first_message=true${filtroFecha ? `&fecha=${filtroFecha}` : ''}`)
    const data = await res.json()
    const convs: Conversation[] = data.conversations || []
    setConversations(convs)

    // Cargar first_message en paralelo para las que no lo traigan la API
    // Limitar a las primeras 30 para no saturar
    const sinMensaje = convs.filter(c => !c.first_message).slice(0, 30)
    if (sinMensaje.length > 0) {
      const results = await Promise.allSettled(
        sinMensaje.map(c =>
          fetch(`/api/conversations/${c.id}/messages`)
            .then(r => r.json())
            .then(d => {
              const primer = (d.messages || []).find((m: any) => m.role === 'user')
              return { id: c.id, first_message: primer?.content || '' }
            })
        )
      )
      const updates: Record<string, string> = {}
      results.forEach(r => {
        if (r.status === 'fulfilled' && r.value.first_message) {
          updates[r.value.id] = r.value.first_message
        }
      })
      if (Object.keys(updates).length > 0) {
        setConversations(prev => prev.map(c =>
          updates[c.id] ? { ...c, first_message: updates[c.id] } : c
        ))
      }
    }
  }

  async function cargarMsgsConv(convId: string) {
    const res = await fetch(`/api/conversations/${convId}/messages`)
    const data = await res.json()
    const msgs = data.messages || []
    setMsgsConv(msgs)
    setConvSel(convId)
    // Guardar el primer mensaje del usuario en el estado de conversations
    // para mostrarlo en el header y en el panel izquierdo
    const primerMsgUser = msgs.find((m: any) => m.role === 'user')
    if (primerMsgUser?.content) {
      setConversations(prev => prev.map(c =>
        c.id === convId ? { ...c, first_message: primerMsgUser.content } : c
      ))
    }
  }

  async function guardar(key: string, body: object) {
    setSaving(s => ({ ...s, [key]: true }))
    const res = await fetch(`/api/clients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaved(s => ({ ...s, [key]: res.ok ? '✓ Guardado' : '✗ Error' }))
    setSaving(s => ({ ...s, [key]: false }))
    setTimeout(() => setSaved(s => ({ ...s, [key]: '' })), 2500)
    cargar()
  }

  async function lanzarScraping() {
    setScraping(true); setMsgScraping('Scrapeando...')
    const res = await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: id }) })
    const data = await res.json()
    setMsgScraping(res.ok ? `✓ ${data.paginasScrapeadas} páginas · ${data.palabras?.toLocaleString()} palabras` : `✗ ${data.error}`)
    setScraping(false); cargar(); cargarSources()
  }

  async function addUrl() {
    if (!nuevaUrl.trim()) return
    setAddingUrl(true)
    await fetch('/api/kb-sources', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: id, url: nuevaUrl.trim() }) })
    setNuevaUrl('')
    setAddingUrl(false)
    cargarSources()
  }

  async function uploadKBFile(file: File) {
    // Validar tipo antes de enviar
    const ok = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'text/plain'].includes(file.type)
      || file.name.match(/\.(pdf|docx|doc|txt)$/i)
    if (!ok) { alert('Solo se admiten archivos PDF, Word (.docx) o TXT'); return }
    setUploadingFile(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('clientId', id)
    fd.append('type', 'doc')
    await fetch('/api/upload-kb', { method: 'POST', body: fd })
    setUploadingFile(false)
    cargarSources()
  }

  async function eliminarSource(sourceId: string) {
    await fetch(`/api/kb-sources/${sourceId}`, { method: 'DELETE' })
    cargarSources()
  }

  // -- DRAG & DROP para documentos KB ---------------------------------------
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation()
    dragCounterRef.current++
    if (dragCounterRef.current === 1) setIsDragOver(true)
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setIsDragOver(false)
  }
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation()
    e.dataTransfer.dropEffect = 'copy'
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    files.forEach(f => uploadKBFile(f))
  }
  // -------------------------------------------------------------------------

  // Cropper
  function abrirCropper(type: 'logo' | 'icon', file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setCropperSrc(e.target?.result as string)
      setCropperType(type)
      setCropOffset({ x: 0, y: 0 })
      setCropZoom(1)
      setCropperOpen(true)
    }
    reader.readAsDataURL(file)
  }

  function renderCrop() {
    const canvas = cropCanvasRef.current
    if (!canvas || !cropImgRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const size = 200  // tamaño visual del canvas en pantalla
    canvas.width = size; canvas.height = size
    ctx.clearRect(0, 0, size, size)
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()
    const img = cropImgRef.current
    const scale = cropZoom
    const sw = img.naturalWidth * scale
    const sh = img.naturalHeight * scale
    const dx = (size - sw) / 2 + cropOffset.x
    const dy = (size - sh) / 2 + cropOffset.y
    ctx.drawImage(img, dx, dy, sw, sh)
    ctx.restore()
  }

  useEffect(() => { if (cropperOpen) setTimeout(renderCrop, 100) }, [cropperOpen, cropOffset, cropZoom])

  async function confirmarCrop() {
    const canvas = cropCanvasRef.current
    if (!canvas) return
    const setter = cropperType === 'logo' ? setUploadingLogo : setUploadingIcon
    setter(true)

    // Exportar a alta resolución (400px) usando un canvas offscreen
    const exportSize = 400
    const offscreen = document.createElement('canvas')
    offscreen.width = exportSize; offscreen.height = exportSize
    const ctx = offscreen.getContext('2d')!
    ctx.save()
    ctx.beginPath()
    ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2)
    ctx.clip()
    const img = cropImgRef.current!
    const scale = cropZoom * (exportSize / 200)
    const sw = img.naturalWidth * scale
    const sh = img.naturalHeight * scale
    const dx = (exportSize - sw) / 2 + cropOffset.x * (exportSize / 200)
    const dy = (exportSize - sh) / 2 + cropOffset.y * (exportSize / 200)
    ctx.drawImage(img, dx, dy, sw, sh)
    ctx.restore()

    offscreen.toBlob(async (blob) => {
      if (!blob) return
      const file = new File([blob], `${cropperType}.png`, { type: 'image/png' })
      const fd = new FormData()
      fd.append('file', file)
      fd.append('clientId', id)
      fd.append('type', cropperType)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        // Actualizar estado local con cache-buster para forzar recarga del img
        const urlConCache = data.url + '?t=' + Date.now()
        setWidgetForm(wf => ({ ...wf, [`widget_${cropperType}_url`]: urlConCache }))
        // El endpoint /api/upload ya guarda en Supabase, pero hacemos un PUT
        // adicional para asegurar que la URL limpia (sin cache-buster) queda en BD
        await fetch(`/api/clients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [`widget_${cropperType}_url`]: data.url })
        })
      }
      setter(false)
      setCropperOpen(false)
    }, 'image/png')
  }

  async function buscarLugar() {
    if (!lugarBusqueda.trim()) return
    setBuscandoLugar(true)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(lugarBusqueda)}&format=json&limit=1`, {
        headers: { 'Accept-Language': 'es', 'User-Agent': 'ArandaiChat/1.0' }
      })
      const data = await res.json()
      if (data.length > 0) {
        const lat = parseFloat(data[0].lat).toFixed(6)
        const lng = parseFloat(data[0].lon).toFixed(6)
        setWidgetsForm(f => ({ ...f, widget_weather_lat: lat, widget_weather_lng: lng }))
        // Auto-cargar preview
        await fetchWeatherPreviewLatLng(parseFloat(lat), parseFloat(lng))
      } else {
        alert('No se encontró el lugar. Prueba con un nombre más específico.')
      }
    } catch { alert('Error buscando el lugar') }
    finally { setBuscandoLugar(false) }
  }

  async function fetchWeatherPreviewLatLng(lat: number, lng: number) {
    setLoadingWeather(true)
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=7`)
      const data = await res.json()
      setWeatherPreview((data.daily?.time || []).map((date: string, i: number) => ({
        date, tmax: Math.round(data.daily.temperature_2m_max[i]),
        tmin: Math.round(data.daily.temperature_2m_min[i]), code: data.daily.weathercode[i],
      })))
    } catch { alert('No se pudo cargar el tiempo para esas coordenadas') }
    finally { setLoadingWeather(false) }
  }

  async function fetchWeatherPreview() {
    const lat = parseFloat(widgetsForm.widget_weather_lat)
    const lng = parseFloat(widgetsForm.widget_weather_lng)
    if (isNaN(lat) || isNaN(lng)) return
    await fetchWeatherPreviewLatLng(lat, lng)
  }

  // Emojis del tiempo para preview en admin (sin SVG)
  function wxEmoji(code: number) {
    if (code === 0) return '☀️'
    if (code <= 2) return '⛅'
    if (code <= 3) return '☁️'
    if (code <= 49) return '🌫️'
    if (code <= 69) return '🌧️'
    if (code <= 79) return '❄️'
    return '⛈️'
  }
  function diaCorto(dateStr: string) {
    const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
    const d = new Date(dateStr + 'T12:00:00')
    const hoy = new Date()
    if (d.toDateString() === hoy.toDateString()) return 'Hoy'
    return dias[d.getDay()]
  }

  async function crearSpecial() {
    await fetch('/api/special-messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: id, ...formSpecial }) })
    setMostrarFormSpecial(false)
    setFormSpecial({ title: '', content: '', active: true, start_date: '', end_date: '', show_on_open: false, msg_type: 'promo', msg_color: '' })
    cargarSpeciales()
  }

  async function toggleSpecial(msgId: string, active: boolean) {
    await fetch(`/api/special-messages/${msgId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) })
    cargarSpeciales()
  }

  async function eliminarCliente() {
    if (!confirm(`¿Eliminar a ${cliente?.name}?`)) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/admin')
  }

  if (loading) return <div style={{ ...S.wrap, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 13 }}>Cargando...</div>
  if (!cliente) return <div style={{ padding: 48, textAlign: 'center', fontFamily: 'system-ui', fontSize: 13 }}><p style={{ color: '#ef4444', marginBottom: 12 }}>No encontrado</p><Link href="/admin" style={{ color: themeColor }}>← Admin</Link></div>

  const kb = cliente.knowledge_bases?.[0]
  const mes = new Date().toISOString().slice(0, 7)
  const costeMes = cliente.client_costs?.find(x => x.month === mes)
  const snippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://app.chathost.ai'}/widget.js" data-id="${cliente.widget_id}" data-color="${widgetForm.widget_color}" data-name="${encodeURIComponent(widgetForm.widget_name)}"><\/script>`

  const windowSizes = { small: { w: 300, h: 420 }, medium: { w: 360, h: 520 }, large: { w: 420, h: 620 } }
  const wSize = windowSizes[widgetForm.widget_window_size as keyof typeof windowSizes] || windowSizes.medium

  const fileTypes = [
    { ext: '.pdf', icon: '📄', label: 'PDF', mime: 'application/pdf' },
    { ext: '.docx,.doc', icon: '📝', label: 'Word', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { ext: '.txt', icon: '📃', label: 'TXT', mime: 'text/plain' },
  ]

  const maxCountry = DEMO_COUNTRIES[0].count

  return (
    <div style={S.wrap}>

      {/* -- CROPPER MODAL -------------------------------------------------- */}
      {cropperOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: 360, boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>Recortar imagen</div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>Mueve y ajusta el zoom. El recorte final será circular.</div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 200, height: 200 }}>
                <canvas ref={cropCanvasRef} style={{ borderRadius: '50%', border: '2px solid #e5e7eb', cursor: 'move', display: 'block' }}
                  onMouseMove={(e) => {
                    if (e.buttons !== 1) return
                    setCropOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }))
                  }}
                />
                <img ref={cropImgRef} src={cropperSrc} style={{ display: 'none' }} onLoad={renderCrop} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>Zoom</div>
              <input type="range" min="0.5" max="3" step="0.1" value={cropZoom}
                onChange={e => { setCropZoom(parseFloat(e.target.value)); setTimeout(renderCrop, 10) }}
                style={{ width: '100%', accentColor: widgetForm.widget_color }} />
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 16, textAlign: 'center' }}>Arrastra la imagen para reposicionar</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCropperOpen(false)} style={{ ...S.btn('white', '#555'), flex: 1 }}>Cancelar</button>
              <button onClick={confirmarCrop} style={{ ...S.btn(widgetForm.widget_color), flex: 1 }}>✓ Usar esta imagen</button>
            </div>
          </div>
        </div>
      )}

      {/* -- TOPBAR --------------------------------------------------------- */}
      <div style={S.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>C</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>ChatHost</span>
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>ADMIN</span>
          </Link>
          <span style={{ color: '#e2e8f0', fontSize: 18 }}>/</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {widgetForm.widget_icon_url
              ? <img src={widgetForm.widget_icon_url} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
              : <div style={{ width: 10, height: 10, borderRadius: '50%', background: widgetForm.widget_color }} />}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>{cliente.name}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: cliente.active ? '#22c55e' : '#94a3b8', background: cliente.active ? '#dcfce7' : '#f1f5f9', padding: '2px 8px', borderRadius: 20 }}>{cliente.active ? '● activo' : '○ inactivo'}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href={`/widget/${cliente.widget_id}?color=${encodeURIComponent(widgetForm.widget_color)}`} target="_blank" style={{ ...S.btn('white', themeColor), textDecoration: 'none', display: 'inline-block' }}>💬 {tr('chat')}</a>

          {/* -- PANEL DE TEMA ------------------------------------------- */}
          <div ref={themePanelRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setThemePanelOpen(p => !p)}
              title="Cambiar color del panel"
              style={{ ...S.btn('white', '#555'), display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px' }}
            >
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: themeColor, border: '2px solid #e5e7eb', flexShrink: 0 }} />
              <span style={{ fontSize: 12 }}>Tema</span>
            </button>

            {themePanelOpen && (
              <div className="theme-panel-enter" style={{
                position: 'absolute', top: 42, right: 0, zIndex: 500,
                background: 'white', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: 16, width: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>Color del panel</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 12 }}>
                  {THEME_PRESETS.map(p => (
                    <div key={p.value}
                      onClick={() => aplicarTema(p.value)}
                      title={p.label}
                      style={{
                        width: 28, height: 28, borderRadius: 8, background: p.value, cursor: 'pointer',
                        border: themeColor === p.value ? '3px solid #111' : '2px solid transparent',
                        transition: 'border 0.1s', flexShrink: 0
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>Personalizado</div>
                <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                  <input type="color" value={themeCustomInput}
                    onChange={e => setThemeCustomInput(e.target.value)}
                    onBlur={e => aplicarTema(e.target.value)}
                    style={{ width: 36, height: 32, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', padding: 2, flexShrink: 0 }}
                  />
                  <input type="text" value={themeCustomInput}
                    onChange={e => setThemeCustomInput(e.target.value)}
                    onBlur={e => { if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) aplicarTema(e.target.value) }}
                    placeholder="#2563eb"
                    style={{ ...S.inp, flex: 1, width: 'auto', fontSize: 12, padding: '6px 9px' }}
                  />
                </div>
                <div style={{ marginTop: 10, fontSize: 10, color: '#bbb' }}>Se guarda automáticamente en este navegador</div>
              </div>
            )}
          </div>

          {/* Selector de idioma del panel */}
          <select
            value={lang}
            onChange={async e => {
              const newLang = e.target.value as Idioma
              setLang(newLang)
              await fetch(`/api/clients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ panel_language: newLang }) })
            }}
            style={{ ...S.btn('white', '#555'), padding: '6px 10px', fontSize: 13 }}
          >
            {IDIOMAS.map(i => <option key={i.code} value={i.code}>{i.flag} {i.label}</option>)}
          </select>
        </div>
      </div>
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 28px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {TABS.map(t => (
      <button key={t} onClick={() => cambiarTab(t)} style={{
            padding: '13px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 13, fontFamily: 'inherit', fontWeight: tab === t ? 600 : 400,
            color: tab === t ? themeColor : '#64748b',
            borderBottom: `2px solid ${tab === t ? themeColor : 'transparent'}`,
            transition: 'all 0.15s', whiteSpace: 'nowrap'
          }}>{t}</button>
        ))}
      </div>

      <div style={S.body}>

        {/* --- GENERAL --------------------------------------------------- */}
        {tab === 'General' && (
          <>
            <div style={S.statRow(4)}>
              {[
                { lbl: 'Mensajes este mes', val: costeMes?.messages_count?.toLocaleString() || '0', color: '#4B7BE5', emoji: '💬' },
                { lbl: 'Mensajes disponibles', val: (() => { const PLAN_MSGS: Record<string,number> = {basic:500,pro:3000,business:10000,agency:30000}; const max = PLAN_MSGS[cliente.plan] || 500; const used = costeMes?.messages_count || 0; return (max - used).toLocaleString() + ' / ' + max.toLocaleString() })(), color: '#22c55e', emoji: '✅' },
                { lbl: 'Palabras en KB', val: kb?.words_count?.toLocaleString() || '0', color: themeColor, emoji: '📚' },
                { lbl: 'Plan', val: cliente.plan, color: '#8b5cf6', emoji: '📦' },
              ].map((s) => (
                <div key={s.lbl} style={S.statBox}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.lbl}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={S.g2}>
              <div style={S.card}>
                <div style={S.secLabel}>Datos del cliente</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[{ l: 'Nombre', k: 'name', t: 'text' }, { l: 'URL web', k: 'website_url', t: 'url' }, { l: 'Email', k: 'email', t: 'email' }].map(f => (
                    <div key={f.k}><label style={S.lbl}>{f.l}</label><input type={f.t} value={(formGeneral as any)[f.k]} onChange={e => setFormGeneral({ ...formGeneral, [f.k]: e.target.value })} style={S.inp} /></div>
                  ))}
                  <div><label style={S.lbl}>Plan</label>
                    <select value={formGeneral.plan} onChange={e => setFormGeneral({ ...formGeneral, plan: e.target.value })} style={{ ...S.inp, padding: '8px 12px' }}>
                      <option value="basic">Basic — €19/mes</option><option value="pro">Pro — €49/mes</option><option value="business">Business — €99/mes</option><option value="agency">Agency — €199/mes</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={formGeneral.active} id="act" onChange={e => setFormGeneral({ ...formGeneral, active: e.target.checked })} />
                    <label htmlFor="act" style={{ fontSize: 13, color: '#374151' }}>Cliente activo</label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
                  <button onClick={() => guardar('general', formGeneral)} style={S.btn(themeColor)}>{saving.general ? 'Guardando...' : 'Guardar'}</button>
                  {saved.general && <span style={{ fontSize: 12, color: '#22c55e' }}>{saved.general}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(() => {
                  const PLAN_MSGS: Record<string,number> = {basic:500,pro:3000,business:10000,agency:30000}
                  const max = PLAN_MSGS[cliente.plan] || 500
                  const used = costeMes?.messages_count || 0
                  const restantes = max - used
                  const pct = Math.min(100, Math.round(used / max * 100))
                  return [
                    { lbl: 'Mensajes este mes', val: used.toLocaleString(), color: '#4B7BE5', icon: '💬', bg: '#eff6ff' },
                    { lbl: 'Mensajes restantes', val: restantes.toLocaleString() + ' de ' + max.toLocaleString(), color: restantes < max * 0.2 ? '#ef4444' : '#22c55e', icon: restantes < max * 0.2 ? '⚠️' : '✅', bg: restantes < max * 0.2 ? '#fef2f2' : '#f0fdf4', extra: pct },
                    { lbl: 'Palabras en KB', val: kb?.words_count?.toLocaleString() || '0', color: themeColor, icon: '📚', bg: `${themeColor}12` },
                  ]
                })().map((s: any) => (
                  <div key={s.lbl} style={{ ...S.card, marginBottom: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11, color: '#aaa' }}>{s.lbl}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                      </div>
                    </div>
                    {s.extra !== undefined && (
                      <div style={{ marginTop: 8, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: s.extra + '%', borderRadius: 2, background: s.extra > 80 ? '#ef4444' : s.extra > 50 ? '#f59e0b' : '#22c55e', transition: 'width 0.3s' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* --- KNOWLEDGE BASE -------------------------------------------- */}
        {tab === 'Knowledge base' && (
          <div style={{ display: 'grid', gap: 14 }}>
            {/* Stats + scraping */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div><div style={S.secLabel}>Knowledge base</div><div style={{ fontSize: 12, color: '#888' }}>Información que usa el chatbot para responder</div></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setMostrarEditorKB(!mostrarEditorKB)} style={S.btn('white', '#555')}>✏️ Editar texto</button>
                  <button onClick={lanzarScraping} disabled={scraping} style={S.btn(scraping ? '#aaa' : '#4B7BE5')}>{scraping ? '⏳ Scrapeando...' : '↺ Re-crawl todo'}</button>
                </div>
              </div>

              {msgScraping && (
                <div style={{ background: msgScraping.startsWith('✓') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msgScraping.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: msgScraping.startsWith('✓') ? '#166534' : '#991b1b', marginBottom: 14 }}>{msgScraping}</div>
              )}

              <div style={S.statRow(4)}>
                {[
                  { lbl: 'Estado', val: kb?.scraping_status === 'ok' ? '✅ OK' : kb?.scraping_status === 'error' ? '❌ Error' : '⏳ Pendiente' },
                  { lbl: 'Páginas', val: String(kb?.pages_scraped || 0) },
                  { lbl: 'Palabras', val: kb?.words_count?.toLocaleString() || '0' },
                  { lbl: 'Actualizado', val: kb ? new Date(kb.last_scraped_at).toLocaleDateString('es-ES') : '—' },
                ].map((s, i) => (
                  <div key={s.lbl} style={{ ...S.statBox, borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{s.lbl}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {mostrarEditorKB && (
                <div style={{ marginTop: 14 }}>
                  <textarea value={textoKB} onChange={e => setTextoKB(e.target.value)} rows={12}
                    style={{ ...S.inp, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.6, fontSize: 12 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{textoKB.split(/\s+/).filter(Boolean).length} palabras</span>
                    <button onClick={async () => { setSaving(s => ({ ...s, kb: true })); await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: id, contentMd: textoKB }) }); setSaving(s => ({ ...s, kb: false })); setMostrarEditorKB(false); cargar() }} style={S.btn(themeColor)}>
                      {saving.kb ? 'Guardando...' : 'Guardar KB'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auto-recrawl */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={S.secLabel}>Re-crawl automático</div>
                  <div style={{ fontSize: 12, color: '#888' }}>El sistema actualiza la knowledge base automáticamente cada X días</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {kb?.last_scraped_at && (
                    <span style={{ fontSize: 11, color: '#aaa' }}>
                      Último: {new Date(kb.last_scraped_at).toLocaleDateString('es-ES')}
                      {' · Próximo: '}
                      {new Date(new Date(kb.last_scraped_at).getTime() + recrawlDays * 86400000).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={S.lbl}>Cada cuántos días</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <input type="range" min="1" max="30" step="1" value={recrawlDays}
                      onChange={e => setRecrawlDays(parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: themeColor }} />
                    <div style={{ minWidth: 52, textAlign: 'center', background: themeColor + '12', border: '1px solid ' + themeColor + '30', borderRadius: 8, padding: '4px 10px', fontSize: 14, fontWeight: 700, color: themeColor }}>
                      {recrawlDays}d
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa', marginTop: 4 }}>
                    <span>Cada día</span>
                    <span>Cada 15 días</span>
                    <span>Cada mes</span>
                  </div>
                </div>
              </div>
              {/* Atajos rápidos */}
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {[{ v: 3, l: 'Cada 3 días' }, { v: 7, l: 'Semanal' }, { v: 10, l: 'Cada 10 días' }, { v: 15, l: 'Quincenal' }, { v: 30, l: 'Mensual' }].map(opt => (
                  <button key={opt.v} onClick={() => setRecrawlDays(opt.v)}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: recrawlDays === opt.v ? 700 : 400, border: '1px solid ' + (recrawlDays === opt.v ? themeColor : '#e2e8f0'), background: recrawlDays === opt.v ? themeColor + '12' : 'white', color: recrawlDays === opt.v ? themeColor : '#555', cursor: 'pointer' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
                <button onClick={() => guardar('recrawl', { recrawl_days: recrawlDays })} style={S.btn(themeColor)}>
                  {saving.recrawl ? 'Guardando...' : 'Guardar frecuencia'}
                </button>
                {saved.recrawl && <span style={{ fontSize: 12, color: '#22c55e' }}>{saved.recrawl}</span>}
              </div>
            </div>

            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={S.secLabel}>URLs adicionales</div>
                  <div style={{ fontSize: 12, color: '#888' }}>Páginas extra que se scrapearan y añadirán a la KB automáticamente</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input type="url" value={nuevaUrl} onChange={e => setNuevaUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addUrl()}
                  placeholder="https://ejemplo.com/pagina-especifica"
                  style={{ ...S.inp, flex: 1, width: 'auto' }} />
                <button onClick={addUrl} disabled={addingUrl || !nuevaUrl.trim()} style={S.btn(themeColor)}>
                  {addingUrl ? '⏳' : '+ Añadir'}
                </button>
              </div>

              {kbSources.filter(s => s.type === 'url').length > 0 && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {kbSources.filter(s => s.type === 'url').map(src => (
                    <div key={src.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                      <span style={{ fontSize: 15 }}>🌐</span>
                      <a href={src.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 12, color: '#4B7BE5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.url}</a>
                      {src.words_count > 0 && <span style={S.tag('#f0fdf4', '#059669')}>{src.words_count.toLocaleString()} palabras</span>}
                      <span style={S.tag(src.status === 'ok' ? '#f0fdf4' : src.status === 'error' ? '#fef2f2' : '#fefce8', src.status === 'ok' ? '#059669' : src.status === 'error' ? '#ef4444' : '#854d0e')}>
                        {src.status === 'ok' ? '✓' : src.status === 'error' ? '✗' : '⏳'}
                      </span>
                      <button onClick={() => eliminarSource(src.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 16, padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {kbSources.filter(s => s.type === 'url').length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa', fontSize: 12 }}>Sin URLs adicionales</div>
              )}
            </div>
            <div
              style={{
                ...S.card,
                border: isDragOver ? `2px dashed ${themeColor}` : '1px solid #e8e8e8',
                background: isDragOver ? `${themeColor}06` : 'white',
                transition: 'border 0.15s, background 0.15s',
                position: 'relative',
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Overlay visible cuando se arrastra un archivo */}
              {isDragOver && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 10, zIndex: 10,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: `${themeColor}0d`, pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>Suelta aquí para subir</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>PDF, Word o TXT</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={S.secLabel}>Documentos</div>
                  <div style={{ fontSize: 12, color: '#888' }}>PDF, Word y TXT que enriquecen la knowledge base · arrastra archivos aquí</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {fileTypes.map(ft => (
                    <button key={ft.ext}
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = ft.ext
                          fileInputRef.current.click()
                        }
                      }}
                      disabled={uploadingFile}
                      style={{ ...S.btn('white', '#555'), display: 'flex', alignItems: 'center', gap: 5 }}>
                      {ft.icon} {ft.label}
                    </button>
                  ))}
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }}
                    onChange={e => { if (e.target.files?.[0]) uploadKBFile(e.target.files[0]) }} />
                </div>
              </div>
              {kbSources.filter(s => s.type !== 'url').length > 0 ? (
                <div style={{ display: 'grid', gap: 6 }}>
                  {kbSources.filter(s => s.type !== 'url').map(src => {
                    const ext = src.filename?.split('.').pop()?.toLowerCase() || ''
                    const icon = ext === 'pdf' ? '📄' : ext === 'docx' || ext === 'doc' ? '📝' : '📃'
                    const size = src.words_count > 0 ? `${src.words_count.toLocaleString()} palabras` : ''
                    return (
                      <div key={src.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.filename}</div>
                          {size && <div style={{ fontSize: 10, color: '#aaa' }}>{size}</div>}
                        </div>
                        <span style={S.tag(src.status === 'ok' ? '#f0fdf4' : src.status === 'error' ? '#fef2f2' : '#fefce8', src.status === 'ok' ? '#059669' : src.status === 'error' ? '#ef4444' : '#854d0e')}>
                          {src.status === 'ok' ? '✓ Procesado' : src.status === 'error' ? '✗ Error' : '⏳ Procesando'}
                        </span>
                        <button onClick={() => eliminarSource(src.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 16, padding: 0 }}>✕</button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#aaa', fontSize: 12 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
                  Sin documentos. Sube PDFs, Word o TXT — o arrástralos aquí directamente.
                </div>
              )}

              {uploadingFile && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#854d0e' }}>
                  ⏳ Subiendo y procesando el documento...
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- CHAT ------------------------------------------------------ */}
        {tab === 'Chat' && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={S.card}>
              <div style={S.secLabel}>Instrucciones del chatbot</div>
              <textarea value={formChat.system_prompt} onChange={e => setFormChat({ ...formChat, system_prompt: e.target.value })} rows={8}
                placeholder={`Eres el asistente de ${cliente.name}.\n\nTONO: Amable y profesional.\n\nPUEDES:\n- Informar sobre precios y servicios\n\nNO PUEDES:\n- Inventar información`}
                style={{ ...S.inp, fontFamily: 'system-ui', resize: 'vertical', lineHeight: 1.7 }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => setFormChat({ ...formChat, system_prompt: `Eres el asistente virtual de ${cliente.name}.\n\nTONO: Amable, cercano y profesional.\nIDIOMA: Responde en el idioma del usuario.\n\nPUEDES:\n- Informar sobre precios y servicios\n- Dar horarios y datos de contacto\n\nNO PUEDES:\n- Inventar información\n- Hablar de competidores` })} style={S.btn('white', '#555')}>📋 Plantilla</button>
                <button onClick={() => setFormChat({ ...formChat, system_prompt: '' })} style={{ ...S.btn('white', '#ef4444') }}>Limpiar</button>
              </div>
            </div>
            <div style={S.g2}>
              <div style={S.card}>
                <div style={S.secLabel}>{tr('temperature')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 6 }}><span>{tr('temperature_formal')}</span><span>{tr('temperature_creative')}</span></div>
                <input type="range" min="0" max="1" step="0.1" value={formChat.temperature} onChange={e => setFormChat({ ...formChat, temperature: parseFloat(e.target.value) })} style={{ width: '100%', accentColor: themeColor, marginBottom: 8 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#888' }}>{formChat.temperature <= 0.3 ? tr('temperature_formal') : formChat.temperature <= 0.7 ? 'Equilibrado' : tr('temperature_creative')}</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: themeColor }}>{formChat.temperature.toFixed(1)}</span>
                </div>
              </div>
              <div style={S.card}>
                <div style={S.secLabel}>{tr('ai_model')}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {([
                    { id: 'claude-haiku-4-5-20251001', labelKey: 'model_haiku', descKey: 'model_haiku_desc', creditos: 1, color: '#059669', badge: tr('recommended') },
                    { id: 'claude-sonnet-4-5', labelKey: 'model_sonnet', descKey: 'model_sonnet_desc', creditos: 4, color: '#4B7BE5', badge: '' },
                    { id: 'claude-opus-4-5', labelKey: 'model_opus', descKey: 'model_opus_desc', creditos: 20, color: '#7c3aed', badge: tr('premium') },
                  ] as const).map(m => {
                    const active = formChat.ai_model === m.id
                    // Mensajes reales que da este modelo con el plan del cliente
                    const planCreditos = PLAN_CREDITOS[cliente.plan] || 500
                    const msgsDisponibles = Math.floor(planCreditos / m.creditos)
                    return (
                      <div key={m.id} onClick={() => setFormChat({ ...formChat, ai_model: m.id })}
                        style={{ border: `2px solid ${active ? m.color : '#e5e7eb'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', background: active ? `${m.color}08` : 'white', transition: 'all 0.15s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: active ? m.color : '#111' }}>{tr(m.labelKey as any)}</span>
                          {m.badge && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${m.color}18`, color: m.color, fontWeight: 700 }}>{m.badge}</span>}
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{tr(m.descKey as any)}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: m.color, background: `${m.color}10`, borderRadius: 5, padding: '3px 7px', textAlign: 'center', marginBottom: 6 }}>
                          {m.creditos} {m.creditos === 1 ? tr('credits_per_msg') : tr('credits_per_msg_plural')}
                        </div>
                        <div style={{ background: '#f8fafc', border: '1px solid #f0f0f0', borderRadius: 6, padding: '5px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: '#aaa', marginBottom: 1 }}>Con tu plan {cliente.plan}</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: m.color }}>{msgsDisponibles.toLocaleString('es-ES')}</div>
                          <div style={{ fontSize: 10, color: '#888' }}>mensajes/mes</div>
                        </div>
                        {m.creditos > 1 && active && (
                          <div style={{ marginTop: 6, fontSize: 10, color: '#f59e0b', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 5, padding: '3px 7px', textAlign: 'center' }}>
                            ⚠️ {tr('model_warning' as any, { n: m.creditos })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div style={S.card}>
                <div style={S.secLabel}>{tr('auto_language')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                  <div><div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{tr('auto_language')}</div><div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{tr('auto_language_desc')}</div></div>
                  <div style={S.tgl(formChat.auto_language, themeColor)} onClick={() => setFormChat({ ...formChat, auto_language: !formChat.auto_language })}><div style={S.tglK(formChat.auto_language)} /></div>
                </div>
              </div>
            </div>
            <div style={S.card}>
              <div style={S.secLabel}>{tr('daily_email')}</div>
              <div style={{ marginBottom: 12 }}>
                <label style={S.lbl}>Emails que reciben el informe</label>
                {/* Chips de emails añadidos */}
                {formChat.report_emails.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {formChat.report_emails.map((em, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${themeColor}12`, border: `1px solid ${themeColor}30`, borderRadius: 20, padding: '4px 10px', fontSize: 12 }}>
                        <span style={{ color: themeColor }}>✉️ {em}</span>
                        <button onClick={() => setFormChat({ ...formChat, report_emails: formChat.report_emails.filter((_, j) => j !== i) })}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Input para añadir nuevo email */}
                <div style={{ display: 'flex', gap: 7 }}>
                  <input
                    type="email"
                    value={nuevoEmail}
                    onChange={e => setNuevoEmail(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && nuevoEmail.trim() && nuevoEmail.includes('@')) {
                        setFormChat({ ...formChat, report_emails: [...formChat.report_emails, nuevoEmail.trim()] })
                        setNuevoEmail('')
                      }
                    }}
                    placeholder="email@negocio.com  →  Enter para añadir"
                    style={{ ...S.inp, flex: 1, width: 'auto' }}
                  />
                  <button
                    onClick={() => {
                      if (nuevoEmail.trim() && nuevoEmail.includes('@')) {
                        setFormChat({ ...formChat, report_emails: [...formChat.report_emails, nuevoEmail.trim()] })
                        setNuevoEmail('')
                      }
                    }}
                    style={S.btn(themeColor)}>+ Añadir</button>
                </div>
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 5 }}>Puedes añadir hasta 5 destinatarios</div>
              </div>
              <div>
                <label style={S.lbl}>Frecuencia del informe</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {([
                    { v: 'daily',   l: '📅 Diario',  d: 'Cada día' },
                    { v: 'weekly',  l: '📆 Semanal', d: 'Los lunes' },
                    { v: 'monthly', l: '🗓 Mensual', d: 'Día 1 de cada mes' },
                  ] as const).map(opt => (
                    <div key={opt.v}
                      onClick={() => setFormChat({ ...formChat, report_frequency: opt.v })}
                      style={{
                        padding: '10px 8px', borderRadius: 9, cursor: 'pointer', textAlign: 'center',
                        border: `1.5px solid ${formChat.report_frequency === opt.v ? themeColor : '#e5e7eb'}`,
                        background: formChat.report_frequency === opt.v ? `${themeColor}0e` : 'white',
                      }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: formChat.report_frequency === opt.v ? themeColor : '#111' }}>{opt.l}</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{opt.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => guardar('chat', { system_prompt: formChat.system_prompt, temperature: formChat.temperature, auto_language: formChat.auto_language, report_emails: formChat.report_emails, report_frequency: formChat.report_frequency, ai_model: formChat.ai_model })} style={S.btn(themeColor)}>
                {saving.chat ? tr('saving') : tr('save')}
              </button>
              {saved.chat && <span style={{ fontSize: 12, color: '#22c55e' }}>{saved.chat}</span>}
            </div>
          </div>
        )}

        {/* --- ESPECIALES ------------------------------------------------ */}
        {tab === 'Noticias' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <div style={{ ...S.card, background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#065f46', marginBottom: 6 }}>💡 ¿Qué son los noticias del chat?</div>
                <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.6 }}>
                  Son anuncios o noticias puntuales que el chatbot menciona de forma natural cuando son relevantes. Perfectos para ofertas de temporada, eventos especiales o información importante con fecha de inicio y fin.<br /><br />
                  Ejemplo: <em>"Fiesta Pijama en la Piscina el 8 de julio — ¡plazas limitadas!"</em>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Noticias activas</div>
                <button onClick={() => setMostrarFormSpecial(!mostrarFormSpecial)} style={S.btn(themeColor)}>{mostrarFormSpecial ? '✕ Cancelar' : '+ Nuevo'}</button>
              </div>

              {mostrarFormSpecial && (
                <div style={{ ...S.card, border: `1.5px solid ${themeColor}40`, marginBottom: 14 }}>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div><label style={S.lbl}>Título (interno)</label>
                      <input type="text" value={formSpecial.title} onChange={e => setFormSpecial({ ...formSpecial, title: e.target.value })} placeholder="Ej: Fiesta Pijama en la Piscina" style={S.inp} />
                    </div>
                    <div><label style={S.lbl}>Contenido del mensaje</label>
                      <textarea value={formSpecial.content}
                        onChange={e => { setFormSpecial({ ...formSpecial, content: e.target.value }); setPreviewEspecialMsg(e.target.value) }}
                        rows={3} placeholder="Ej: El 8 de julio celebramos la Fiesta Pijama en la Piscina. ¡Ven en pijama y disfruta de una noche mágica! Más info en recepción."
                        style={{ ...S.inp, resize: 'vertical', lineHeight: 1.5 }} />
                    </div>
                    <div>
                      <label style={S.lbl}>Tipo de mensaje</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {SPECIAL_TYPES.map(t => {
                          const sel = formSpecial.msg_type === t.id
                          return (
                            <div key={t.id}
                              onClick={() => setFormSpecial({ ...formSpecial, msg_type: t.id, msg_color: t.id !== 'custom' ? '' : formSpecial.msg_color })}
                              style={{
                                padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: sel ? 700 : 400,
                                border: `1.5px solid ${sel ? t.color : '#e5e7eb'}`,
                                background: sel ? `${t.color}18` : 'white',
                                color: sel ? t.color : '#555',
                                transition: 'all 0.12s',
                              }}>
                              {t.label}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    {formSpecial.msg_type === 'custom' && (
                      <div>
                        <label style={S.lbl}>Color personalizado</label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input type="color" value={formSpecial.msg_color || '#f59e0b'}
                            onChange={e => setFormSpecial({ ...formSpecial, msg_color: e.target.value })}
                            style={{ width: 38, height: 34, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                          <input type="text" value={formSpecial.msg_color || '#f59e0b'}
                            onChange={e => setFormSpecial({ ...formSpecial, msg_color: e.target.value })}
                            style={{ ...S.inp, flex: 1, width: 'auto', fontSize: 12 }} />
                        </div>
                      </div>
                    )}

                    <div style={S.g2}>
                      <div><label style={S.lbl}>Fecha inicio</label><input type="date" value={formSpecial.start_date} onChange={e => setFormSpecial({ ...formSpecial, start_date: e.target.value })} style={S.inp} /></div>
                      <div><label style={S.lbl}>Fecha fin</label><input type="date" value={formSpecial.end_date} onChange={e => setFormSpecial({ ...formSpecial, end_date: e.target.value })} style={S.inp} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formSpecial.show_on_open} onChange={e => setFormSpecial({ ...formSpecial, show_on_open: e.target.checked })} />Mostrar al abrir el chat
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formSpecial.active} onChange={e => setFormSpecial({ ...formSpecial, active: e.target.checked })} />Activo ahora
                      </label>
                    </div>
                    <button onClick={crearSpecial} disabled={!formSpecial.title || !formSpecial.content} style={S.btn(themeColor)}>✓ Crear mensaje</button>
                  </div>
                </div>
              )}

              {specialMsgs.length === 0 ? (
                <div style={{ ...S.card, textAlign: 'center', padding: 40, color: '#aaa', fontSize: 12 }}>Sin noticias del chat todavía.</div>
              ) : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {specialMsgs.map(msg => (
                    <div key={msg.id} style={{ ...S.card, borderLeft: `3px solid ${msg.active ? themeColor : '#e5e7eb'}`, opacity: msg.active ? 1 : 0.6, marginBottom: 0, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{msg.title}</span>
                          <span style={S.tag(msg.active ? '#f0fdf4' : '#f5f5f5', msg.active ? '#059669' : '#aaa')}>{msg.active ? 'Activo' : 'Inactivo'}</span>
                          {msg.show_on_open && <span style={S.tag('#eff6ff', '#2563eb')}>Muestra al abrir</span>}
                          {msg.start_date && <span style={S.tag('#fafafa', '#888')}>{msg.start_date}{msg.end_date ? ` → ${msg.end_date}` : ''}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#777', lineHeight: 1.5 }}>{msg.content}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0 }}>
                        <div style={S.tgl(msg.active, themeColor)} onClick={() => toggleSpecial(msg.id, !msg.active)}><div style={S.tglK(msg.active)} /></div>
                        <button onClick={async () => { await fetch(`/api/special-messages/${msg.id}`, { method: 'DELETE' }); cargarSpeciales() }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 15, padding: 0 }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Preview en el chat</div>
              <div style={{ background: '#f5f5f5', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
                <div style={{ width: 300, background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                  {/* Header — igual que widget real */}
                  <div style={{ background: widgetForm.widget_color, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                      {(widgetForm.widget_logo_url || widgetForm.widget_icon_url)
                        ? <img src={widgetForm.widget_logo_url || widgetForm.widget_icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : '💬'}
                    </div>
                    <div>
                      <div style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{widgetForm.widget_name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>● En línea</div>
                    </div>
                  </div>
                  <div style={{ padding: '12px 12px 8px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 200 }}>
                    {/* Noticia PRIMERO — antes del saludo */}
                    {(previewEspecialMsg || formSpecial.content) && (() => {
                      const tipo = SPECIAL_TYPES.find(t => t.id === formSpecial.msg_type) || SPECIAL_TYPES[0]
                      const bgColor = formSpecial.msg_type === 'custom' && formSpecial.msg_color ? `${formSpecial.msg_color}18` : tipo.bg
                      const borderColor = formSpecial.msg_type === 'custom' && formSpecial.msg_color ? `${formSpecial.msg_color}40` : tipo.border
                      const textColor = formSpecial.msg_type === 'custom' && formSpecial.msg_color ? formSpecial.msg_color : tipo.text
                      const labelColor = formSpecial.msg_type === 'custom' && formSpecial.msg_color ? formSpecial.msg_color : tipo.color
                      return (
                        <div style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: '10px 10px 10px 3px', padding: '9px 12px', maxWidth: '90%', fontSize: 12, color: textColor, lineHeight: 1.5 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: labelColor, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {tipo.label.split(' ')[0]} {formSpecial.title || 'Noticia'}
                          </div>
                          {previewEspecialMsg || formSpecial.content}
                        </div>
                      )
                    })()}
                    {/* Saludo después */}
                    <div style={{ background: '#f5f5f5', borderRadius: '10px 10px 10px 3px', padding: '9px 12px', maxWidth: '85%', fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                      {widgetForm.initial_message || '¡Hola! ¿En qué puedo ayudarte?'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ background: widgetForm.widget_color, borderRadius: '10px 10px 3px 10px', padding: '9px 12px', maxWidth: '85%', fontSize: 12, color: 'white', lineHeight: 1.5 }}>
                        ¿Qué actividades hay este fin de semana?
                      </div>
                    </div>
                    <div style={{ background: '#f5f5f5', borderRadius: '10px 10px 10px 3px', padding: '9px 12px', maxWidth: '90%', fontSize: 12, color: '#374151', lineHeight: 1.5 }}>
                      {previewEspecialMsg || formSpecial.content
                        ? `Este fin de semana tenemos actividades especiales. Además, te cuento: ${previewEspecialMsg || formSpecial.content}`
                        : 'Este fin de semana tenemos varias actividades. ¿Te interesa alguna en particular?'}
                    </div>
                  </div>
                  <div style={{ padding: '8px 10px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 6 }}>
                    <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 16, padding: '7px 12px', fontSize: 11, color: '#aaa' }}>Escribe tu pregunta...</div>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: widgetForm.widget_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>↑</div>
                  </div>
                  {/* Powered by */}
                  <div style={{ textAlign: 'center', padding: '6px 0 8px', fontSize: 12, color: '#94a3b8' }}>
                    Powered by <a href="https://chathost.ai" target="_blank" rel="noreferrer" style={{ color: themeColor, fontWeight: 600, textDecoration: 'none' }}>ChatHost</a>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 9, fontSize: 12, color: '#888' }}>
                👆 El preview se actualiza en tiempo real cuando escribes el contenido de la noticia.
              </div>
            </div>
          </div>
        )}

        {/* --- ACTIVITY -------------------------------------------------- */}
        {tab === 'Activity' && (
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
                  <button onClick={() => setScorePanel(p => !p)}
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
        )}
        {/* --- WIDGET ---------------------------------------------------- */}
        {tab === 'Widget' && (
          <div style={S.g2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Logo e icono con cropper */}
              <div style={S.card}>
                <div style={S.secLabel}>Logo e icono</div>
                <div style={S.g2}>
                  <div>
                    <label style={S.lbl}>Logo del chat (junto al nombre)</label>
                    <div style={{ padding: '14px', border: '1.5px dashed #e5e7eb', borderRadius: 10, background: '#fafafa', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {widgetForm.widget_logo_url
                        ? <img src={widgetForm.widget_logo_url} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center', border: '2px solid #e5e7eb', flexShrink: 0 }} />
                        : <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏕</div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) abrirCropper('logo', e.target.files[0]); e.target.value = '' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => logoInputRef.current?.click()} style={S.btn('white', '#555')}>📁 {widgetForm.widget_logo_url ? 'Cambiar' : 'Subir'}</button>
                          {widgetForm.widget_logo_url && (
                            <button onClick={async () => { setWF({ widget_logo_url: '' }); await guardar('widget', { widget_logo_url: '' }) }} style={S.btn('white', '#ef4444')}>🗑</button>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: '#aaa' }}>PNG, JPG · 150×150px mínimo · circular</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={S.lbl}>Icono del botón flotante</label>
                    <div style={{ padding: '14px', border: '1.5px dashed #e5e7eb', borderRadius: 10, background: '#fafafa', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {widgetForm.widget_icon_url
                        ? <img src={widgetForm.widget_icon_url} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', objectPosition: 'center', border: '2px solid #e5e7eb', flexShrink: 0 }} />
                        : <div style={{ width: 52, height: 52, borderRadius: '50%', background: widgetForm.widget_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>💬</div>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <input ref={iconInputRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) abrirCropper('icon', e.target.files[0]); e.target.value = '' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => iconInputRef.current?.click()} style={S.btn('white', '#555')}>📁 {widgetForm.widget_icon_url ? 'Cambiar' : 'Subir'}</button>
                          {widgetForm.widget_icon_url && (
                            <button onClick={async () => { setWF({ widget_icon_url: '' }); await guardar('widget', { widget_icon_url: '' }) }} style={S.btn('white', '#ef4444')}>🗑</button>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: '#aaa' }}>PNG, JPG · 512×512px recomendado · circular</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.card}>
                <div style={S.secLabel}>Apariencia</div>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div><label style={S.lbl}>Nombre del asistente</label><input type="text" value={widgetForm.widget_name} onChange={e => setWF({ widget_name: e.target.value })} style={S.inp} /></div>
                  <div>
                    <label style={S.lbl}>Color principal</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                      <input type="color" value={widgetForm.widget_color} onChange={e => setWF({ widget_color: e.target.value })} style={{ width: 40, height: 40, border: '1px solid #e5e7eb', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                      <input type="text" value={widgetForm.widget_color} onChange={e => setWF({ widget_color: e.target.value })} style={{ ...S.inp, flex: 1, width: 'auto' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
                      {['#2563eb', '#4B7BE5', '#7c3aed', '#dc2626', '#f59e0b', '#0891b2', '#be185d', '#111827'].map(c => (
                        <div key={c} onClick={() => setWF({ widget_color: c })} style={{ width: 26, height: 26, borderRadius: 7, background: c, cursor: 'pointer', border: widgetForm.widget_color === c ? '2.5px solid #111' : 'none', flexShrink: 0 }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={S.lbl}>Tamaño de la ventana del chat</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 4 }}>
                      {[{ v: 'small', l: 'Pequeña', d: '300×420px' }, { v: 'medium', l: 'Mediana', d: '360×520px' }, { v: 'large', l: 'Grande', d: '420×620px' }].map(opt => (
                        <div key={opt.v} onClick={() => setWF({ widget_window_size: opt.v })}
                          style={{ padding: '10px 8px', borderRadius: 9, border: `1.5px solid ${widgetForm.widget_window_size === opt.v ? widgetForm.widget_color : '#e5e7eb'}`, cursor: 'pointer', textAlign: 'center', background: widgetForm.widget_window_size === opt.v ? `${widgetForm.widget_color}10` : 'white' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: widgetForm.widget_window_size === opt.v ? widgetForm.widget_color : '#111' }}>{opt.l}</div>
                          <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>{opt.d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={S.lbl}>Posición</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      {[{ v: 'bottom-right', l: '↘ Abajo derecha' }, { v: 'bottom-left', l: '↙ Abajo izquierda' }].map(opt => (
                        <div key={opt.v} onClick={() => setWF({ widget_position: opt.v })}
                          style={{ padding: 9, borderRadius: 8, border: `1.5px solid ${widgetForm.widget_position === opt.v ? widgetForm.widget_color : '#e5e7eb'}`, cursor: 'pointer', textAlign: 'center', fontSize: 12, fontWeight: widgetForm.widget_position === opt.v ? 600 : 400, color: widgetForm.widget_position === opt.v ? widgetForm.widget_color : '#888', background: widgetForm.widget_position === opt.v ? `${widgetForm.widget_color}10` : 'white' }}>
                          {opt.l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.card}>
                <div style={S.secLabel}>Contenido</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div><label style={S.lbl}>Mensaje inicial</label>
                    <textarea value={widgetForm.initial_message}
                      onChange={e => { setWF({ initial_message: e.target.value }); setWidgetPreviewMsgs([{ role: 'assistant', content: e.target.value }]) }}
                      rows={2} style={{ ...S.inp, resize: 'none', lineHeight: 1.5 }} />
                  </div>
                  <div><label style={S.lbl}>Placeholder del input</label>
                    <input type="text" value={widgetForm.widget_placeholder} onChange={e => setWF({ widget_placeholder: e.target.value })} style={S.inp} />
                  </div>
                  <div>
                    <label style={S.lbl}>Preguntas sugeridas</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 8 }}>
                      {widgetForm.suggested_messages.map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${widgetForm.widget_color}15`, border: `1px solid ${widgetForm.widget_color}30`, borderRadius: 20, padding: '4px 11px', fontSize: 12 }}>
                          <span style={{ color: widgetForm.widget_color, fontWeight: 500 }}>{m}</span>
                          <button onClick={() => setWF({ suggested_messages: widgetForm.suggested_messages.filter((_, j) => j !== i) })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 15, lineHeight: 1, padding: 0 }}>×</button>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <input type="text" value={nuevaSug} onChange={e => setNuevaSug(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && nuevaSug.trim()) { setWF({ suggested_messages: [...widgetForm.suggested_messages, nuevaSug.trim()] }); setNuevaSug('') } }}
                        placeholder="Añadir + Enter" style={{ ...S.inp, flex: 1, width: 'auto' }} />
                      <button onClick={() => { if (nuevaSug.trim()) { setWF({ suggested_messages: [...widgetForm.suggested_messages, nuevaSug.trim()] }); setNuevaSug('') } }} style={S.btn(themeColor)}>+</button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={S.secLabel}>Código de embed</div>
                  <button onClick={() => { navigator.clipboard.writeText(snippet); setCopiado(true); setTimeout(() => setCopiado(false), 2000) }} style={S.btn(copiado ? '#22c55e' : themeColor)}>{copiado ? '✓ Copiado' : 'Copiar'}</button>
                </div>
                <div style={{ background: '#111', borderRadius: 8, padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8', wordBreak: 'break-all', lineHeight: 1.6 }}>{snippet}</div>
              </div>

              {/* ---- SECCIÓN WIDGETS CONTEXTUALES ---- */}
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, marginTop: 4 }}>Widgets del chat</div>

                {/* Widget tiempo */}
                <div style={S.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: widgetsForm.widget_weather_enabled ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>🌤 Tiempo — 7 días</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Temperatura visible en el chat del visitante</div>
                    </div>
                    <div style={S.tgl(widgetsForm.widget_weather_enabled, themeColor)}
                      onClick={() => setWidgetsForm(f => ({ ...f, widget_weather_enabled: !f.widget_weather_enabled }))}>
                      <div style={S.tglK(widgetsForm.widget_weather_enabled)} />
                    </div>
                  </div>
                  {widgetsForm.widget_weather_enabled && (
                    <div style={{ display: 'grid', gap: 10 }}>
                      {/* Buscador por nombre */}
                      <div>
                        <label style={S.lbl}>Buscar por nombre del lugar</label>
                        <div style={{ display: 'flex', gap: 7 }}>
                          <input type="text" value={lugarBusqueda}
                            onChange={e => setLugarBusqueda(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && buscarLugar()}
                            placeholder="Salou, España · Candanchú, Huesca..."
                            style={{ ...S.inp, flex: 1, width: 'auto' }} />
                          <button onClick={buscarLugar} disabled={buscandoLugar || !lugarBusqueda.trim()} style={S.btn(themeColor)}>
                            {buscandoLugar ? '⏳' : '🔍'}
                          </button>
                        </div>
                      </div>
                      {/* Lat/lng — se rellenan solos al buscar */}
                      <div style={S.g2}>
                        <div>
                          <label style={S.lbl}>Latitud</label>
                          <input type="text" value={widgetsForm.widget_weather_lat}
                            onChange={e => setWidgetsForm(f => ({ ...f, widget_weather_lat: e.target.value }))}
                            placeholder="41.0775" style={S.inp} />
                        </div>
                        <div>
                          <label style={S.lbl}>Longitud</label>
                          <input type="text" value={widgetsForm.widget_weather_lng}
                            onChange={e => setWidgetsForm(f => ({ ...f, widget_weather_lng: e.target.value }))}
                            placeholder="1.139444" style={S.inp} />
                        </div>
                      </div>
                      {widgetsForm.widget_weather_lat && (
                        <button onClick={fetchWeatherPreview} disabled={loadingWeather} style={{ ...S.btn('white', '#555'), fontSize: 11 }}>
                          {loadingWeather ? '⏳ Cargando...' : '👁 Ver preview del tiempo'}
                        </button>
                      )}
                      {weatherPreview.length > 0 && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 6px', display: 'flex' }}>
                          {weatherPreview.slice(0, 7).map((day, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, padding: '2px 2px', borderRight: i < 6 ? '1px solid #f0f0f0' : 'none' }}>
                              <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>{diaCorto(day.date)}</span>
                              <span style={{ fontSize: 16 }}>{wxEmoji(day.code)}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: '#1e293b' }}>{day.tmax}°</span>
                              <span style={{ fontSize: 9, color: '#94a3b8' }}>{day.tmin}°</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Widget ocupación */}
                <div style={{ ...S.card, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: widgetsForm.widget_occupancy_enabled ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>📊 Ocupación</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Barra de disponibilidad en el chat</div>
                    </div>
                    <div style={S.tgl(widgetsForm.widget_occupancy_enabled, themeColor)}
                      onClick={() => setWidgetsForm(f => ({ ...f, widget_occupancy_enabled: !f.widget_occupancy_enabled }))}>
                      <div style={S.tglK(widgetsForm.widget_occupancy_enabled)} />
                    </div>
                  </div>
                  {widgetsForm.widget_occupancy_enabled && (
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div>
                        <label style={S.lbl}>Ocupación actual — {widgetsForm.widget_occupancy_pct}% ocupado · queda {100 - widgetsForm.widget_occupancy_pct}% libre</label>
                        <input type="range" min="0" max="100" value={widgetsForm.widget_occupancy_pct}
                          onChange={e => setWidgetsForm(f => ({ ...f, widget_occupancy_pct: parseInt(e.target.value) }))}
                          style={{ width: '100%', accentColor: widgetsForm.widget_occupancy_pct > 80 ? '#ef4444' : widgetsForm.widget_occupancy_pct > 50 ? '#f59e0b' : themeColor }} />
                      </div>
                      <div>
                        <label style={S.lbl}>Texto personalizado (opcional)</label>
                        <input type="text" value={widgetsForm.widget_occupancy_text}
                          onChange={e => setWidgetsForm(f => ({ ...f, widget_occupancy_text: e.target.value }))}
                          placeholder={`Queda ${100 - widgetsForm.widget_occupancy_pct}% disponible`} style={S.inp} />
                      </div>
                      <div style={{ background: themeColor + '0d', border: '1px solid ' + themeColor + '20', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: (100 - widgetsForm.widget_occupancy_pct) + '%', background: widgetsForm.widget_occupancy_pct > 80 ? '#ef4444' : widgetsForm.widget_occupancy_pct > 50 ? '#f59e0b' : themeColor }} />
                        </div>
                        <span style={{ fontSize: 11, color: themeColor, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {widgetsForm.widget_occupancy_text || ((100 - widgetsForm.widget_occupancy_pct) + '% disponible')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Widget webcam */}
                <div style={{ ...S.card, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: widgetsForm.widget_webcam_enabled ? 14 : 0 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>📷 Webcam en directo</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Ideal para estaciones de esquí</div>
                    </div>
                    <div style={S.tgl(widgetsForm.widget_webcam_enabled, themeColor)}
                      onClick={() => setWidgetsForm(f => ({ ...f, widget_webcam_enabled: !f.widget_webcam_enabled }))}>
                      <div style={S.tglK(widgetsForm.widget_webcam_enabled)} />
                    </div>
                  </div>
                  {widgetsForm.widget_webcam_enabled && (
                    <div style={{ display: 'grid', gap: 10 }}>
                      <div>
                        <label style={S.lbl}>URL de la webcam</label>
                        <input type="url" value={widgetsForm.widget_webcam_url}
                          onChange={e => setWidgetsForm(f => ({ ...f, widget_webcam_url: e.target.value }))}
                          placeholder="https://www.ipcamlive.com/player/player.php?alias=..." style={S.inp} />
                        <div style={{ fontSize: 10, color: '#aaa', marginTop: 4, lineHeight: 1.5 }}>
                          Soporta: <strong>ipcamlive</strong> (pega la URL del player), imagen estática JPG/PNG, o cualquier iframe público.<br />
                          Para ipcamlive: <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>https://www.ipcamlive.com/player/player.php?alias=TU_ALIAS</code>
                        </div>
                      </div>
                      {widgetsForm.widget_webcam_url && (() => {
                        const url = widgetsForm.widget_webcam_url
                        const esIframe = url.includes('ipcamlive.com') || url.includes('embed') || url.includes('player')
                        return (
                          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div style={{ background: '#1e293b', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                              <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>EN DIRECTO</span>
                              <span style={{ color: '#94a3b8', fontSize: 9, marginLeft: 4 }}>{esIframe ? 'stream' : 'imagen'}</span>
                            </div>
                            {esIframe
                              ? <iframe src={url} style={{ width: '100%', height: 160, border: 'none', display: 'block' }} allow="autoplay" />
                              : <div style={{ position: 'relative' }}>
                                  <img src={url} style={{ width: '100%', display: 'block', maxHeight: 160, objectFit: 'cover' }} alt=""
                                    onError={e => {
                                      const t = e.target as HTMLImageElement
                                      t.style.display = 'none'
                                      const msg = t.nextSibling as HTMLElement
                                      if (msg) msg.style.display = 'flex'
                                    }} />
                                  <div style={{ display: 'none', padding: '12px 14px', background: '#f8fafc', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}>
                                    <span style={{ fontSize: 16 }}>⚠️</span>
                                    <div>
                                      <div style={{ fontWeight: 600, color: '#374151', marginBottom: 2 }}>No se puede previsualizar aquí (CORS)</div>
                                      <div>La imagen puede funcionar en el widget real. <a href={url} target="_blank" rel="noreferrer" style={{ color: themeColor }}>Abre la URL</a> para verificar.</div>
                                    </div>
                                  </div>
                                </div>
                            }
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>

                {/* Guardar widgets */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
                  <button onClick={() => guardar('widgets', {
                    widget_weather_enabled: widgetsForm.widget_weather_enabled,
                    widget_weather_lat: widgetsForm.widget_weather_lat ? parseFloat(widgetsForm.widget_weather_lat) : null,
                    widget_weather_lng: widgetsForm.widget_weather_lng ? parseFloat(widgetsForm.widget_weather_lng) : null,
                    widget_weather_place: lugarBusqueda || null,
                    widget_occupancy_enabled: widgetsForm.widget_occupancy_enabled,
                    widget_occupancy_pct: widgetsForm.widget_occupancy_pct,
                    widget_occupancy_text: widgetsForm.widget_occupancy_text || null,
                    widget_webcam_enabled: widgetsForm.widget_webcam_enabled,
                    widget_webcam_url: widgetsForm.widget_webcam_url || null,
                  })} style={S.btn(themeColor)}>
                    {saving.widgets ? 'Guardando...' : 'Guardar widgets'}
                  </button>
                  {saved.widgets && <span style={{ fontSize: 12, color: '#22c55e' }}>{saved.widgets}</span>}
                </div>
              </div>

            </div>

            {/* Preview tamaño real — columna derecha sticky */}
            <div style={{ position: 'sticky', top: 20, height: 'fit-content' }}>

              {/* Botón guardar — siempre visible arriba del preview */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, background: widgetDirty ? '#fffbeb' : 'transparent', border: widgetDirty ? '1px solid #fde68a' : 'none', borderRadius: 9, padding: widgetDirty ? '10px 14px' : 0, transition: 'all 0.2s' }}>
                <button
                  onClick={async () => {
                    await guardar('widget', {
                      widget_name: widgetForm.widget_name,
                      widget_color: widgetForm.widget_color,
                      widget_position: widgetForm.widget_position,
                      initial_message: widgetForm.initial_message,
                      suggested_messages: widgetForm.suggested_messages,
                      widget_placeholder: widgetForm.widget_placeholder,
                      widget_window_size: widgetForm.widget_window_size,
                      widget_logo_url: widgetForm.widget_logo_url || null,
                      widget_icon_url: widgetForm.widget_icon_url || null,
                    })
                    setWidgetDirty(false)
                  }}
                  style={{ ...S.btn(widgetDirty ? '#f59e0b' : themeColor), padding: '10px 24px', fontSize: 13 }}>
                  {saving.widget ? 'Guardando...' : widgetDirty ? '💾 Guardar cambios' : 'Guardar widget'}
                </button>
                {saved.widget && <span style={{ fontSize: 12, color: '#22c55e' }}>{saved.widget}</span>}
                {widgetDirty && !saving.widget && <span style={{ fontSize: 11, color: '#854d0e' }}>Cambios sin guardar</span>}
              </div>
              <div style={{ background: '#e8e8e8', borderRadius: 14, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: wSize.h + 80 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ width: wSize.w, background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #f0f0f0' }}>
                    {/* Header */}
                    <div style={{ background: widgetForm.widget_color, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(widgetForm.widget_logo_url || widgetForm.widget_icon_url)
                          ? <img src={widgetForm.widget_logo_url || widgetForm.widget_icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                          : <span style={{ fontSize: 16 }}>💬</span>}
                      </div>
                      <div>
                        <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{widgetForm.widget_name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>● En línea</div>
                      </div>
                    </div>

                    {/* Widget tiempo — preview */}
                    {widgetsForm.widget_weather_enabled && weatherPreview.length > 0 && (
                      <div style={{ background: 'white', borderBottom: '1px solid #f5f5f5', padding: '5px 8px', display: 'flex' }}>
                        {weatherPreview.slice(0, 7).map((day, i) => (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, borderRight: i < 6 ? '1px solid #f5f5f5' : 'none' }}>
                            <span style={{ fontSize: 8, color: '#94a3b8', fontWeight: 700 }}>{diaCorto(day.date)}</span>
                            <span style={{ fontSize: 14 }}>{wxEmoji(day.code)}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: '#1e293b' }}>{day.tmax}°</span>
                            <span style={{ fontSize: 9, color: '#94a3b8' }}>{day.tmin}°</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {widgetsForm.widget_weather_enabled && weatherPreview.length === 0 && (
                      <div style={{ background: '#f8fafc', borderBottom: '1px solid #f5f5f5', padding: '6px 12px', fontSize: 10, color: '#94a3b8', textAlign: 'center' }}>
                        🌤 Widget del tiempo — configura las coordenadas para ver el preview
                      </div>
                    )}

                    {/* Widget ocupación — preview */}
                    {widgetsForm.widget_occupancy_enabled && (
                      <div style={{ background: widgetForm.widget_color + '0d', borderBottom: '1px solid ' + widgetForm.widget_color + '1a', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', borderRadius: 2, width: (100 - widgetsForm.widget_occupancy_pct) + '%', background: widgetsForm.widget_occupancy_pct > 80 ? '#ef4444' : widgetsForm.widget_occupancy_pct > 50 ? '#f59e0b' : widgetForm.widget_color }} />
                        </div>
                        <span style={{ fontSize: 10, color: widgetForm.widget_color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {widgetsForm.widget_occupancy_text || ((100 - widgetsForm.widget_occupancy_pct) + '% disponible')}
                        </span>
                      </div>
                    )}

                    {/* Mensajes */}
                    <div style={{ padding: '12px', height: wSize.h - (widgetsForm.widget_weather_enabled ? 165 : 120) - (widgetsForm.widget_occupancy_enabled ? 30 : 0), overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Webcam — al inicio si está activa */}
                      {widgetsForm.widget_webcam_enabled && widgetsForm.widget_webcam_url && (() => {
                        const url = widgetsForm.widget_webcam_url
                        const esIframe = url.includes('ipcamlive.com') || url.includes('embed') || url.includes('player')
                        return (
                          <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: 4 }}>
                            <div style={{ background: '#1e293b', padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444' }} />
                              <span style={{ color: 'white', fontSize: 9, fontWeight: 700 }}>EN DIRECTO</span>
                            </div>
                            {esIframe
                              ? <iframe src={url} style={{ width: '100%', height: 90, border: 'none', display: 'block' }} allow="autoplay" />
                              : <img src={url} style={{ width: '100%', display: 'block', maxHeight: 90, objectFit: 'cover' }} alt="Webcam" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            }
                          </div>
                        )
                      })()}
                      {widgetPreviewMsgs.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{ background: msg.role === 'user' ? widgetForm.widget_color : '#f5f5f5', color: msg.role === 'user' ? 'white' : '#374151', borderRadius: msg.role === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px', padding: '9px 12px', maxWidth: '80%', fontSize: 13, lineHeight: 1.5 }}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                    {widgetForm.suggested_messages.length > 0 && (
                      <div style={{ padding: '0 10px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {widgetForm.suggested_messages.slice(0, 3).map((s, i) => (
                          <div key={i} onClick={() => setWidgetPreviewMsgs(p => [...p, { role: 'user', content: s }, { role: 'assistant', content: 'Vista previa.' }])}
                            style={{ background: `${widgetForm.widget_color}15`, border: `1px solid ${widgetForm.widget_color}30`, color: widgetForm.widget_color, padding: '4px 10px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                            {s}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ padding: '8px 10px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 6 }}>
                      <input value={widgetPreviewInput} onChange={e => setWidgetPreviewInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && widgetPreviewInput.trim()) { setWidgetPreviewMsgs(p => [...p, { role: 'user', content: widgetPreviewInput }, { role: 'assistant', content: 'Vista previa.' }]); setWidgetPreviewInput('') } }}
                        placeholder={widgetForm.widget_placeholder}
                        style={{ flex: 1, padding: '7px 11px', border: '1px solid #e5e7eb', borderRadius: 18, fontSize: 13, color: '#111', outline: 'none' }} />
                      <button onClick={() => { if (widgetPreviewInput.trim()) { setWidgetPreviewMsgs(p => [...p, { role: 'user', content: widgetPreviewInput }, { role: 'assistant', content: 'Vista previa.' }]); setWidgetPreviewInput('') } }}
                        style={{ width: 30, height: 30, borderRadius: '50%', background: widgetForm.widget_color, border: 'none', color: 'white', cursor: 'pointer', fontSize: 14 }}>↑</button>
                    </div>
                  </div>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', background: widgetForm.widget_color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${widgetForm.widget_color}60`, cursor: 'pointer', overflow: 'hidden' }}>
                    {widgetForm.widget_icon_url
                      ? <img src={widgetForm.widget_icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                      : <span style={{ color: 'white', fontSize: 22 }}>💬</span>}
                  </div>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#aaa', marginTop: 8 }}>
                Tamaño real: {wSize.w}×{wSize.h}px · escribe para simular
              </p>
              {/* Botón abrir widget real */}
              <a href={`/widget/${cliente.widget_id}`} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8, padding: '8px 16px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none', fontSize: 12, fontWeight: 600, color: '#555' }}>
                🔗 Abrir widget real en nueva pestaña
              </a>
            </div>
          </div>
        )}


        {/* --- STATS ----------------------------------------------------- */}
        {tab === 'Stats' && (
          <>
            <div style={S.statRow(4)}>
              {[
                { lbl: 'Mensajes este mes', val: costeMes?.messages_count?.toLocaleString() || '0', color: '#4B7BE5' },
                { lbl: 'Tokens usados', val: costeMes?.tokens_total?.toLocaleString() || '0', color: '#8b5cf6' },
                { lbl: 'Coste API', val: `€${Number(costeMes?.cost_eur || 0).toFixed(4)}`, color: '#f59e0b' },
                { lbl: 'Margen estimado', val: `${Math.round(((99 - Number(costeMes?.cost_eur || 0)) / 99) * 100)}%`, color: '#059669' },
              ].map((s, i) => (
                <div key={s.lbl} style={{ ...S.statBox, borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{s.lbl}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                </div>
              ))}
            </div>

            <div style={S.g2}>
              <div style={S.card}>
                <div style={S.secLabel}>Conexiones por país <span style={{ ...S.tag('#fefce8', '#854d0e'), marginLeft: 6 }}>Demo</span></div>
                <div style={{ display: 'grid', gap: 8, marginBottom: 8 }}>
                  {DEMO_COUNTRIES.map((country, i) => {
                    const pct = country.count / maxCountry
                    const barW = Math.max(pct * 100, 2)
                    const alpha = (0.25 + pct * 0.75).toFixed(2)
                    return (
                      <div key={country.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{country.flag}</span>
                        <span style={{ fontSize: 12, color: '#555', width: 110, flexShrink: 0, fontWeight: i < 3 ? 700 : 400 }}>{country.country}</span>
                        <div style={{ flex: 1, height: 22, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: barW + '%',
                            background: 'rgba(37,99,235,' + alpha + ')',
                            borderRadius: 4,
                            transition: 'width 0.4s ease',
                          }} />
                        </div>
                        <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 700, minWidth: 44, textAlign: 'right', flexShrink: 0 }}>{country.count.toLocaleString('es-ES')}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ fontSize: 10, color: '#bbb', textAlign: 'right' }}>Datos de demo — se actualizarán con datos reales</div>
              </div>

              <div>
                <div style={S.card}>
                  <div style={S.secLabel}>Historial mensual</div>
                  {cliente.client_costs?.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#fafafa' }}>{['Mes', 'Mensajes', 'Tokens', 'Coste API'].map(h => <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #f0f0f0' }}>{h}</th>)}</tr></thead>
                      <tbody>{[...cliente.client_costs].sort((a, b) => b.month.localeCompare(a.month)).map(c => (
                        <tr key={c.month} style={{ borderTop: '1px solid #f7f7f7' }}>
                          <td style={{ padding: '10px 12px', fontSize: 13, color: '#111', fontWeight: 600 }}>{c.month}</td>
                          <td style={{ padding: '10px 12px', fontSize: 13, color: '#4B7BE5', fontWeight: 600 }}>{c.messages_count?.toLocaleString()}</td>
                          <td style={{ padding: '10px 12px', fontSize: 13, color: '#8b5cf6' }}>{c.tokens_total?.toLocaleString()}</td>
                          <td style={{ padding: '10px 12px', fontSize: 13, color: '#f59e0b' }}>€{Number(c.cost_eur).toFixed(4)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 32, color: '#aaa', fontSize: 13 }}>Sin historial todavía</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* --- PLAYGROUND ------------------------------------------------ */}
        {tab === 'Playground' && cliente && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 14, alignItems: 'start' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Selector de modelo */}
              <div style={S.card}>
                <div style={S.secLabel}>Modelo de IA</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                  {MODELOS.map(m => (
                    <div key={m.id} onClick={() => setPgModelo(m.id)}
                      style={{ border: `2px solid ${pgModelo === m.id ? m.color : '#e5e7eb'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', background: pgModelo === m.id ? `${m.color}08` : 'white', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: pgModelo === m.id ? m.color : '#111' }}>{m.label}</span>
                        {m.badge && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: `${m.color}18`, color: m.color, fontWeight: 700 }}>{m.badge}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>{m.desc}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: m.color, background: `${m.color}10`, borderRadius: 6, padding: '4px 8px', textAlign: 'center' }}>
                        {m.creditosMsg} {m.creditosMsg === 1 ? 'crédito por mensaje' : 'créditos por mensaje'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 390, background: 'white', border: '1px solid #e8e8e8', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}>
                  <div style={{ background: widgetForm.widget_color, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                        {(widgetForm.widget_logo_url || widgetForm.widget_icon_url)
                          ? <img src={widgetForm.widget_logo_url || widgetForm.widget_icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                          : '💬'}
                      </div>
                      <div>
                        <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{widgetForm.widget_name || 'Asistente'}</div>
                        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>● En línea · KB real</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => { setPgMsgs([{ role: 'assistant', content: widgetForm.initial_message || '¡Hola! ¿En qué puedo ayudarte?' }]); setPgTokensTotal(0); setPgCosteTotal(0) }}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}>↺ Reset</button>
                    </div>
                  </div>

                  <div style={{ height: 480, overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8fafc' }}>
                    {pgMsgs.map((m, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                        {m.role === 'assistant' && (
                          <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: widgetForm.widget_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, marginBottom: 2 }}>
                            {widgetForm.widget_icon_url
                              ? <img src={widgetForm.widget_icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : '💬'}
                          </div>
                        )}
                        <div style={{ maxWidth: '75%' }}>
                          <div
                            style={{ background: m.role === 'user' ? widgetForm.widget_color : 'white', color: m.role === 'user' ? 'white' : '#222', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, lineHeight: 1.6, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                            dangerouslySetInnerHTML={{ __html: m.role === 'assistant' ? renderMd(m.content, widgetForm.widget_color) : m.content.replace(/\n/g, '<br>') }}
                          />
                          {m.tokens && (
                            <div style={{ fontSize: 10, color: '#bbb', marginTop: 3, textAlign: m.role === 'user' ? 'right' : 'left' }}>
                              ~{m.tokens} tokens · €{m.coste?.toFixed(5)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {pgCargando && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: cliente.widget_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>💬</div>
                        <div style={{ background: 'white', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', display: 'flex', gap: 4, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                          {[0, 1, 2].map(d => <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#ccc', opacity: 0.4 + d * 0.2 }} />)}
                        </div>
                      </div>
                    )}
                    <div ref={pgBottomRef} />
                  </div>

                  {pgTokensTotal > 0 && (
                    <div style={{ padding: '4px 14px', background: '#f8fafc', borderTop: '1px solid #f0f0f0', fontSize: 10, color: '#bbb', textAlign: 'right' }}>
                      Sesión: ~{pgTokensTotal} tokens · {pgCosteTotal.toFixed(5)} €
                    </div>
                  )}

                  {pgMsgs.length <= 1 && cliente.suggested_messages?.length > 0 && (
                    <div style={{ padding: '8px 14px', background: '#f8fafc', display: 'flex', flexWrap: 'wrap', gap: 6, borderTop: '1px solid #f0f0f0' }}>
                      {cliente.suggested_messages.slice(0, 3).map((s: string, i: number) => (
                        <button key={i} onClick={async () => {
                          // Carga el mensaje y lo envía directamente
                          if (pgCargando) return
                          setPgMsgs(prev => [...prev, { role: 'user', content: s }])
                          setPgCargando(true)
                          try {
                            const res = await fetch('/api/chat', {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ widgetId: cliente.widget_id, sessionId: pgSessionId, mensaje: s, historial: pgMsgs.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })), modelOverride: pgModelo }),
                            })
                            const data = await res.json()
                            const tokEst = Math.round((s.length + (data.respuesta?.length || 0)) / 4)
                            const costeEst = tokEst * 0.000004
                            setPgTokensTotal(t => t + tokEst)
                            setPgCosteTotal(c => c + costeEst)
                            setPgMsgs(prev => [...prev, { role: 'assistant', content: data.respuesta || 'Sin respuesta', tokens: tokEst, coste: costeEst }])
                          } catch { setPgMsgs(prev => [...prev, { role: 'assistant', content: '❌ Error' }]) }
                          setPgCargando(false)
                          setTimeout(() => pgBottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
                        }} style={{ fontSize: 11, padding: '5px 11px', borderRadius: 20, border: `1px solid ${cliente.widget_color}40`, color: cliente.widget_color, background: `${cliente.widget_color}08`, cursor: 'pointer' }}>{s}</button>
                      ))}
                    </div>
                  )}

                  <div style={{ padding: '10px 14px', background: 'white', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                    <input value={pgInput} onChange={e => setPgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && pgEnviar()}
                      placeholder="Escribe para probar..."
                      style={{ flex: 1, padding: '9px 14px', border: '1px solid #e5e7eb', borderRadius: 24, fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                    <button onClick={pgEnviar} disabled={pgCargando || !pgInput.trim()}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: pgCargando ? '#e5e7eb' : cliente.widget_color, color: 'white', cursor: pgCargando ? 'not-allowed' : 'pointer', fontSize: 16, flexShrink: 0 }}>↑</button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={S.secLabel}>Instrucciones maestras</div>
                  <button onClick={guardarPgMaster} disabled={pgMasterGuardando}
                    style={{ ...S.btn(pgMasterGuardado ? '#22c55e' : themeColor), padding: '5px 12px', fontSize: 11 }}>
                    {pgMasterGuardado ? '✓ Guardado' : pgMasterGuardando ? '...' : 'Guardar'}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#aaa', marginBottom: 12 }}>Cambios se aplican a todos los chatbots</div>

                <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                  {([['base', '💬 Base'], ['formato', '📐 Formato'], ['normas', '⚖️ Normas']] as const).map(([k, lbl]) => (
                    <button key={k} onClick={() => setPgMasterTab(k)}
                      style={{ padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: pgMasterTab === k ? 600 : 400, border: '1px solid', borderColor: pgMasterTab === k ? themeColor : '#e5e7eb', background: pgMasterTab === k ? `${themeColor}12` : 'transparent', color: pgMasterTab === k ? themeColor : '#888', cursor: 'pointer' }}>
                      {lbl}
                    </button>
                  ))}
                </div>

                {pgMasterSettings ? (
                  <>
                    {pgMasterTab === 'base' && <textarea value={pgMasterSettings.master_prompt} onChange={e => setPgMasterSettings({ ...pgMasterSettings, master_prompt: e.target.value })} style={{ ...S.inp, fontFamily: 'ui-monospace,monospace', resize: 'vertical', minHeight: 160, fontSize: 11, lineHeight: 1.7 }} />}
                    {pgMasterTab === 'formato' && <textarea value={pgMasterSettings.master_format} onChange={e => setPgMasterSettings({ ...pgMasterSettings, master_format: e.target.value })} style={{ ...S.inp, fontFamily: 'ui-monospace,monospace', resize: 'vertical', minHeight: 200, fontSize: 11, lineHeight: 1.7 }} />}
                    {pgMasterTab === 'normas' && <textarea value={pgMasterSettings.master_rules} onChange={e => setPgMasterSettings({ ...pgMasterSettings, master_rules: e.target.value })} style={{ ...S.inp, fontFamily: 'ui-monospace,monospace', resize: 'vertical', minHeight: 180, fontSize: 11, lineHeight: 1.7 }} />}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 24, color: '#aaa', fontSize: 12 }}>Cargando...</div>
                )}
              </div>

              <div style={S.card}>
                <div style={S.secLabel}>Contexto del test</div>
                <div style={{ display: 'grid', gap: 8, fontSize: 12 }}>
                  {[
                    { lbl: 'Cliente', val: cliente.name },
                    { lbl: 'Widget ID', val: cliente.widget_id },
                    { lbl: 'KB', val: `${cliente.knowledge_bases?.[0]?.words_count?.toLocaleString() || 0} palabras` },
                    { lbl: 'Modelo activo', val: MODELOS.find(m => m.id === pgModelo)?.label || pgModelo },
                    { lbl: 'Temperatura', val: String(cliente.temperature ?? 0.7) },
                  ].map(({ lbl, val }) => (
                    <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <span style={{ color: '#888' }}>{lbl}</span>
                      <span style={{ fontWeight: 600, color: '#111', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
