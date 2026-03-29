'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Cliente {
  id: string
  name: string
  website_url: string
  email: string
  plan: string
  active: boolean
  widget_id: string
  widget_color: string
  widget_name: string
  system_prompt: string
  created_at: string
  knowledge_bases: {
    scraping_status: string
    pages_scraped: number
    words_count: number
    last_scraped_at: string
    content_md: string
  }[]
  client_costs: {
    month: string
    messages_count: number
    tokens_total: number
    cost_eur: number
  }[]
}

const TABS = ['General', 'Knowledge base', 'Normas del chat', 'Widget', 'Stats']

const NORMAS_EJEMPLO = `Eres el asistente virtual de {NOMBRE_CLIENTE}, un camping familiar en Salou.

TONO: Amable, cercano y profesional. Usa emojis con moderación.

IDIOMA: Responde siempre en el mismo idioma que el usuario.

PUEDES:
- Informar sobre precios, instalaciones y servicios
- Dar el horario de recepción y datos de contacto
- Ayudar con reservas redirigiendo a la web
- Responder sobre mascotas, accesibilidad, normas del camping

NO PUEDES:
- Inventar precios si no los tienes en la KB
- Hacer reservas directamente
- Hablar de otros campings o competidores

CUANDO NO SEPAS ALGO:
Dilo honestamente y ofrece el contacto: +34 977 380 852 o info@lasiestasalou.com`

export default function ClienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [tabActual, setTabActual] = useState('General')

  // General
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', plan: '', website_url: '', widget_color: '', widget_name: '', active: true })
  const [guardandoGeneral, setGuardandoGeneral] = useState(false)

  // KB
  const [scraping, setScraping] = useState(false)
  const [mensajeScraping, setMensajeScraping] = useState('')
  const [mostrarEditorKB, setMostrarEditorKB] = useState(false)
  const [textoKB, setTextoKB] = useState('')
  const [guardandoKB, setGuardandoKB] = useState(false)
  const [mensajeKB, setMensajeKB] = useState('')

  // Normas
  const [normas, setNormas] = useState('')
  const [guardandoNormas, setGuardandoNormas] = useState(false)
  const [mensajeNormas, setMensajeNormas] = useState('')

  // Widget
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!id || id === 'new') { setCargando(false); return }
    cargarCliente()
  }, [id])

  async function cargarCliente() {
    setCargando(true)
    try {
      const res = await fetch(`/api/clients/${id}`)
      if (!res.ok) { setCargando(false); return }
      const data = await res.json()
      if (!data.client) { setCargando(false); return }
      setCliente(data.client)
      setForm({
        name: data.client.name,
        email: data.client.email || '',
        plan: data.client.plan,
        website_url: data.client.website_url,
        widget_color: data.client.widget_color,
        widget_name: data.client.widget_name,
        active: data.client.active,
      })
      const kb = data.client.knowledge_bases?.[0]
      if (kb?.content_md) setTextoKB(kb.content_md)
      setNormas(data.client.system_prompt || '')
    } catch (e) {
      console.error(e)
    } finally {
      setCargando(false)
    }
  }

  async function guardarGeneral() {
    setGuardandoGeneral(true)
    await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setGuardandoGeneral(false)
    setEditando(false)
    cargarCliente()
  }

  async function guardarNormas() {
    setGuardandoNormas(true)
    setMensajeNormas('')
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system_prompt: normas }),
    })
    if (res.ok) {
      setMensajeNormas('✓ Normas guardadas')
      cargarCliente()
    } else {
      setMensajeNormas('Error al guardar')
    }
    setGuardandoNormas(false)
    setTimeout(() => setMensajeNormas(''), 3000)
  }

  async function lanzarScraping() {
    setScraping(true)
    setMensajeScraping('Scrapeando la web...')
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: id }),
    })
    const data = await res.json()
    if (res.ok) {
      setMensajeScraping(`✓ Completado — ${data.paginasScrapeadas} páginas · ${data.palabras?.toLocaleString()} palabras`)
      cargarCliente()
    } else {
      setMensajeScraping(`Error: ${data.error || 'No se pudo scrapear'}`)
    }
    setScraping(false)
  }

  async function guardarKBManual() {
    if (!textoKB.trim()) return
    setGuardandoKB(true)
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: id, contentMd: textoKB }),
    })
    const data = await res.json()
    if (res.ok) {
      setMensajeKB(`✓ KB guardada — ${data.palabras?.toLocaleString()} palabras`)
      setMostrarEditorKB(false)
      cargarCliente()
    } else {
      setMensajeKB('Error al guardar')
    }
    setGuardandoKB(false)
  }

  async function eliminarCliente() {
    if (!confirm(`¿Eliminar a ${cliente?.name}? No se puede deshacer.`)) return
    await fetch(`/api/clients/${id}`, { method: 'DELETE' })
    router.push('/admin')
  }

  function copiarSnippet() {
    const snippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://chat.arandai.com'}/widget.js" data-id="${cliente?.widget_id}" data-color="${cliente?.widget_color}" data-name="${cliente?.widget_name}"></script>`
    navigator.clipboard.writeText(snippet)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (cargando) return <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8', fontFamily: 'system-ui' }}>Cargando...</div>
  if (!cliente) return (
    <div style={{ padding: 48, textAlign: 'center', fontFamily: 'system-ui' }}>
      <p style={{ color: '#ef4444', marginBottom: 16 }}>Cliente no encontrado</p>
      <Link href="/admin" style={{ color: '#059669' }}>← Volver al admin</Link>
    </div>
  )

  const kb = cliente.knowledge_bases?.[0]
  const mesActual = new Date().toISOString().slice(0, 7)
  const costeMes = cliente.client_costs?.find(x => x.month === mesActual)
  const snippet = `<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://chat.arandai.com'}/widget.js" data-id="${cliente.widget_id}" data-color="${cliente.widget_color}" data-name="${cliente.widget_name}"></script>`

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1e293b', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/admin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>← Admin</Link>
            <span style={{ color: '#475569' }}>/</span>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: cliente.widget_color, flexShrink: 0 }} />
            <span style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>{cliente.name}</span>
            <span style={{
              background: cliente.active ? '#064e3b' : '#450a0a',
              color: cliente.active ? '#6ee7b7' : '#fca5a5',
              fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500
            }}>
              {cliente.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={`/widget/${cliente.widget_id}`} target="_blank" style={{
              background: '#334155', color: 'white', padding: '7px 14px',
              borderRadius: 8, textDecoration: 'none', fontSize: 13
            }}>
              Probar chat
            </a>
            <button onClick={eliminarCliente} style={{
              background: '#7f1d1d', color: 'white', border: 'none',
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13
            }}>
              Eliminar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 4 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setTabActual(tab)} style={{
              background: tabActual === tab ? 'white' : 'transparent',
              color: tabActual === tab ? '#1e293b' : '#94a3b8',
              border: 'none', padding: '10px 16px', cursor: 'pointer',
              fontSize: 13, fontWeight: tabActual === tab ? 600 : 400,
              borderRadius: '8px 8px 0 0',
            }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px' }}>

        {/* ===== TAB: GENERAL ===== */}
        {tabActual === 'General' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Datos del cliente</h2>
                <button onClick={() => setEditando(!editando)} style={{
                  background: '#f1f5f9', color: '#475569', border: 'none',
                  padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13
                }}>
                  {editando ? 'Cancelar' : 'Editar'}
                </button>
              </div>
              {editando ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  {[
                    { label: 'Nombre', key: 'name', type: 'text' },
                    { label: 'URL web', key: 'website_url', type: 'url' },
                    { label: 'Email', key: 'email', type: 'email' },
                    { label: 'Nombre del asistente', key: 'widget_name', type: 'text' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>{field.label}</label>
                      <input type={field.type} value={(form as any)[field.key]}
                        onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 4 }}>Plan</label>
                    <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                      <option value="basic">Basic — €49/mes</option>
                      <option value="pro">Pro — €99/mes</option>
                      <option value="business">Business — €199/mes</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={form.active} id="activo"
                      onChange={e => setForm({ ...form, active: e.target.checked })} />
                    <label htmlFor="activo" style={{ fontSize: 14, color: '#374151' }}>Cliente activo</label>
                  </div>
                  <button onClick={guardarGeneral} disabled={guardandoGeneral} style={{
                    background: '#059669', color: 'white', border: 'none',
                    padding: '10px', borderRadius: 8, cursor: 'pointer', fontWeight: 600
                  }}>
                    {guardandoGeneral ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { label: 'Nombre', valor: cliente.name },
                    { label: 'Web', valor: cliente.website_url },
                    { label: 'Email', valor: cliente.email || '—' },
                    { label: 'Plan', valor: cliente.plan },
                    { label: 'Widget ID', valor: cliente.widget_id },
                    { label: 'Asistente', valor: cliente.widget_name },
                    { label: 'Cliente desde', valor: new Date(cliente.created_at).toLocaleDateString('es-ES') },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', gap: 16 }}>
                      <span style={{ fontSize: 13, color: '#94a3b8', width: 120, flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: 13, color: '#1e293b', fontWeight: 500 }}>{row.valor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stats rápidas */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Mensajes este mes', valor: costeMes?.messages_count?.toLocaleString() || '0', color: '#4B7BE5' },
                { label: 'Coste API este mes', valor: `€${Number(costeMes?.cost_eur || 0).toFixed(4)}`, color: '#f59e0b' },
                { label: 'Palabras en KB', valor: kb?.words_count?.toLocaleString() || '0', color: '#059669' },
              ].map(stat => (
                <div key={stat.label} style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '20px 24px' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{stat.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: stat.color }}>{stat.valor}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TAB: KNOWLEDGE BASE ===== */}
        {tabActual === 'Knowledge base' && (
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Knowledge base</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                  Información que usa el chatbot para responder preguntas
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setMostrarEditorKB(!mostrarEditorKB)} style={{
                  background: '#f1f5f9', color: '#475569', border: 'none',
                  padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13
                }}>
                  {mostrarEditorKB ? 'Cerrar editor' : '✏️ Editar manual'}
                </button>
                <button onClick={lanzarScraping} disabled={scraping} style={{
                  background: scraping ? '#94a3b8' : '#4B7BE5', color: 'white',
                  border: 'none', padding: '8px 14px', borderRadius: 8,
                  cursor: scraping ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500
                }}>
                  {scraping ? 'Scrapeando...' : '↺ Auto-scraping'}
                </button>
              </div>
            </div>

            {mensajeScraping && (
              <div style={{
                background: mensajeScraping.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${mensajeScraping.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`,
                borderRadius: 8, padding: '10px 14px', fontSize: 13,
                color: mensajeScraping.startsWith('✓') ? '#166534' : '#991b1b',
                marginBottom: 20
              }}>
                {mensajeScraping}
              </div>
            )}

            {/* Stats KB */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Estado', valor: kb?.scraping_status === 'ok' ? '✅ OK' : kb?.scraping_status === 'error' ? '❌ Error' : '⏳ Pendiente' },
                { label: 'Páginas', valor: kb?.pages_scraped || '—' },
                { label: 'Palabras', valor: kb?.words_count?.toLocaleString() || '0' },
                { label: 'Actualizado', valor: kb ? new Date(kb.last_scraped_at).toLocaleDateString('es-ES') : '—' },
              ].map(stat => (
                <div key={stat.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stat.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>{stat.valor}</div>
                </div>
              ))}
            </div>

            {/* Editor manual */}
            {mostrarEditorKB && (
              <div>
                <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e', marginBottom: 12 }}>
                  💡 Pega aquí el contenido de la web del cliente o escribe la información manualmente. Claude usará esto para responder.
                </div>
                <textarea
                  value={textoKB}
                  onChange={e => setTextoKB(e.target.value)}
                  rows={18}
                  style={{
                    width: '100%', padding: '12px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 13, fontFamily: 'monospace',
                    resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6,
                    color: '#1e293b',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{textoKB.split(/\s+/).filter(Boolean).length} palabras</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {mensajeKB && <span style={{ fontSize: 13, color: mensajeKB.startsWith('✓') ? '#059669' : '#ef4444' }}>{mensajeKB}</span>}
                    <button onClick={guardarKBManual} disabled={guardandoKB || !textoKB.trim()} style={{
                      background: '#059669', color: 'white', border: 'none',
                      padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
                    }}>
                      {guardandoKB ? 'Guardando...' : 'Guardar KB'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: NORMAS DEL CHAT ===== */}
        {tabActual === 'Normas del chat' && (
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Normas maestras del chatbot</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
                  Define el comportamiento, tono y restricciones del asistente para este cliente.
                  Se añade al system prompt base de Claude.
                </p>
              </div>

              <textarea
                value={normas}
                onChange={e => setNormas(e.target.value)}
                placeholder={NORMAS_EJEMPLO}
                rows={22}
                style={{
                  width: '100%', padding: '14px', border: '1px solid #e2e8f0',
                  borderRadius: 8, fontSize: 13, fontFamily: 'system-ui',
                  resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7,
                  color: '#1e293b',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setNormas(NORMAS_EJEMPLO.replace('{NOMBRE_CLIENTE}', cliente.name))}
                    style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                    Usar plantilla
                  </button>
                  <button onClick={() => setNormas('')}
                    style={{ background: '#fef2f2', color: '#991b1b', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
                    Limpiar
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {mensajeNormas && (
                    <span style={{ fontSize: 13, color: mensajeNormas.startsWith('✓') ? '#059669' : '#ef4444' }}>
                      {mensajeNormas}
                    </span>
                  )}
                  <button onClick={guardarNormas} disabled={guardandoNormas} style={{
                    background: guardandoNormas ? '#94a3b8' : '#059669',
                    color: 'white', border: 'none', padding: '10px 24px',
                    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
                  }}>
                    {guardandoNormas ? 'Guardando...' : 'Guardar normas'}
                  </button>
                </div>
              </div>
            </div>

            {/* Guía */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 24 }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>💡 Qué puedes definir</h3>
                {[
                  { titulo: 'Tono y personalidad', desc: 'Formal, cercano, divertido, profesional...' },
                  { titulo: 'Idioma', desc: 'Responder siempre en español, o según el usuario' },
                  { titulo: 'Lo que SÍ puede hacer', desc: 'Dar precios, horarios, hacer reservas...' },
                  { titulo: 'Lo que NO puede hacer', desc: 'Hablar de competidores, dar descuentos...' },
                  { titulo: 'Contacto de emergencia', desc: 'Si no sabe algo, a quién derivar' },
                  { titulo: 'Respuesta por defecto', desc: 'Qué decir cuando no tiene información' },
                ].map(item => (
                  <div key={item.titulo} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1e293b' }}>{item.titulo}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: '#166534' }}>✅ Estado actual</h3>
                <p style={{ margin: 0, fontSize: 13, color: '#166534' }}>
                  {normas.trim()
                    ? `Normas activas — ${normas.trim().split(/\s+/).length} palabras`
                    : 'Sin normas personalizadas. El chatbot usa el comportamiento por defecto de Chat Arandai.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: WIDGET ===== */}
        {tabActual === 'Widget' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 28 }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Snippet de embed</h2>
              <div style={{ background: '#1e293b', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', wordBreak: 'break-all', lineHeight: 1.6, marginBottom: 12 }}>
                {snippet}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Pegar antes del cierre de &lt;/body&gt;</p>
                <button onClick={copiarSnippet} style={{
                  background: copiado ? '#059669' : '#4B7BE5', color: 'white',
                  border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500
                }}>
                  {copiado ? '✓ Copiado' : 'Copiar snippet'}
                </button>
              </div>

              {/* Personalización color */}
              <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #f1f5f9' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>Personalización</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>Nombre del asistente</label>
                    <input type="text" value={form.widget_name}
                      onChange={e => setForm({ ...form, widget_name: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#64748b', marginBottom: 6 }}>Color principal</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={form.widget_color}
                        onChange={e => setForm({ ...form, widget_color: e.target.value })}
                        style={{ width: 40, height: 40, border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                      <input type="text" value={form.widget_color}
                        onChange={e => setForm({ ...form, widget_color: e.target.value })}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13 }} />
                    </div>
                  </div>
                </div>
                <button onClick={guardarGeneral} style={{
                  marginTop: 16, background: '#059669', color: 'white', border: 'none',
                  padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14
                }}>
                  Guardar cambios
                </button>
              </div>
            </div>

            {/* Preview */}
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 28 }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Preview</h2>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 32, display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                  <div style={{ background: 'white', borderRadius: '12px 12px 4px 12px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontSize: 13, color: '#1e293b', maxWidth: 180 }}>
                    ¡Hola! Soy {form.widget_name || cliente.widget_name} 👋
                  </div>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: form.widget_color || cliente.widget_color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
                  }}>
                    <span style={{ color: 'white', fontSize: 24 }}>💬</span>
                  </div>
                </div>
              </div>
              <a href={`/widget/${cliente.widget_id}`} target="_blank"
                style={{ display: 'block', textAlign: 'center', fontSize: 13, color: '#4B7BE5', textDecoration: 'none', fontWeight: 500 }}>
                Abrir chat completo →
              </a>
            </div>
          </div>
        )}

        {/* ===== TAB: STATS ===== */}
        {tabActual === 'Stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { label: 'Mensajes este mes', valor: costeMes?.messages_count?.toLocaleString() || '0', color: '#4B7BE5' },
              { label: 'Tokens usados', valor: costeMes?.tokens_total?.toLocaleString() || '0', color: '#8b5cf6' },
              { label: 'Coste API', valor: `€${Number(costeMes?.cost_eur || 0).toFixed(4)}`, color: '#f59e0b' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 28 }}>
                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>{stat.label}</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: stat.color }}>{stat.valor}</div>
              </div>
            ))}

            {/* Historial mensual */}
            <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 28 }}>
              <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#1e293b' }}>Historial mensual</h2>
              {cliente.client_costs?.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Mes', 'Mensajes', 'Tokens', 'Coste API'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...cliente.client_costs].sort((a, b) => b.month.localeCompare(a.month)).map(c => (
                      <tr key={c.month} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{c.month}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#4B7BE5', fontWeight: 500 }}>{c.messages_count?.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#8b5cf6' }}>{c.tokens_total?.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: '#f59e0b' }}>€{Number(c.cost_eur).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ color: '#94a3b8', fontSize: 14 }}>Sin historial todavía.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
