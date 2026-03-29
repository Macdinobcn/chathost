'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ClienteResumen {
  id: string
  name: string
  website_url: string
  plan: string
  active: boolean
  widget_color: string
  created_at: string
  knowledge_bases: { scraping_status: string; pages_scraped: number; words_count: number }[]
  client_costs: { month: string; messages_count: number; cost_eur: number }[]
}

const s = {
  wrap: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' },
  topbar: { background: 'white', borderBottom: '1px solid #e8e8e8', padding: '0 28px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  logo: { fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' },
  tag: { fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#f0fdf4', color: '#059669', fontWeight: 700, border: '1px solid #bbf7d0', marginLeft: 8 },
  updated: { fontSize: 11, color: '#aaa' },
  refresh: { fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', color: '#555', cursor: 'pointer' },
  body: { padding: '24px 28px', maxWidth: 1200, margin: '0 auto' },
  secLabel: { fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 12 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, background: 'white', border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden', marginBottom: 16 },
  statBox: { padding: '16px 20px', borderRight: '1px solid #f0f0f0' },
  statLabel: { fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 },
  statVal: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' },
  statSub: { fontSize: 10, color: '#bbb', marginTop: 3 },
  card: { background: 'white', border: '1px solid #e8e8e8', borderRadius: 10, padding: '18px 20px' } as React.CSSProperties,
  cardLabel: { fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 14 },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '9px 16px', textAlign: 'left' as const, fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: '#fafafa', borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: 13, borderBottom: '1px solid #f7f7f7' },
}

export default function AdminPage() {
  const [clientes, setClientes] = useState<ClienteResumen[]>([])
  const [cargando, setCargando] = useState(true)
  const [actualizado, setActualizado] = useState('')

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setCargando(true)
    const res = await fetch('/api/clients')
    const data = await res.json()
    setClientes(data.clients || [])
    setCargando(false)
    setActualizado(new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }))
  }

  const mes = new Date().toISOString().slice(0, 7)
  const totalMensajes = clientes.reduce((a, c) => a + (c.client_costs?.find(x => x.month === mes)?.messages_count || 0), 0)
  const totalCoste = clientes.reduce((a, c) => a + Number(c.client_costs?.find(x => x.month === mes)?.cost_eur || 0), 0)
  const activos = clientes.filter(c => c.active).length
  const ingresoEstimado = clientes.reduce((a, c) => a + (c.plan === 'basic' ? 49 : c.plan === 'pro' ? 99 : c.plan === 'business' ? 199 : 0), 0)
  const margen = ingresoEstimado > 0 ? Math.round(((ingresoEstimado - totalCoste) / ingresoEstimado) * 100) : 0

  return (
    <div style={s.wrap}>
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={s.logo}>Arandai Chat</span>
            <span style={s.tag}>ADMIN</span>
          </div>
          {/* Navegación admin */}
          <nav style={{ display: 'flex', gap: 4 }}>
            <Link href="/admin" style={{ fontSize: 12, fontWeight: 600, color: '#111', padding: '5px 10px', borderRadius: 6, background: '#f5f5f5', textDecoration: 'none' }}>
              Clientes
            </Link>
            <Link href="/admin/settings" style={{ fontSize: 12, fontWeight: 500, color: '#555', padding: '5px 10px', borderRadius: 6, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
              ⚙️ Configuración maestra
            </Link>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {actualizado && <span style={s.updated}>Actualizado: {actualizado}</span>}
          <button onClick={cargar} style={s.refresh}>↺ Refresh</button>
          <Link href="/admin/clients/new" style={{ background: '#059669', color: 'white', padding: '6px 14px', borderRadius: 7, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
            + Nuevo cliente
          </Link>
        </div>
      </div>

      <div style={s.body}>
        {/* Stats */}
        <div style={{ ...s.statsGrid, gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 12 }}>
          {[
            { label: 'Clientes activos', val: activos, color: '#059669', sub: `de ${clientes.length} totales` },
            { label: 'Ingreso estimado', val: `€${ingresoEstimado}`, color: '#4B7BE5', sub: 'MRR este mes' },
            { label: 'Coste API total', val: `€${totalCoste.toFixed(3)}`, color: '#f59e0b', sub: 'Claude Haiku' },
            { label: 'Mensajes este mes', val: totalMensajes.toLocaleString(), color: '#8b5cf6', sub: 'todos los clientes' },
            { label: 'Margen estimado', val: `${margen}%`, color: margen >= 75 ? '#059669' : '#ef4444', sub: ingresoEstimado > 0 ? 'sobre MRR' : 'sin ingresos aún' },
          ].map((s2, i) => (
            <div key={s2.label} style={{ ...s.statBox, borderRight: i < 4 ? '1px solid #f0f0f0' : 'none' }}>
              <div style={s.statLabel}>{s2.label}</div>
              <div style={{ ...s.statVal, color: s2.color }}>{s2.val}</div>
              <div style={s.statSub}>{s2.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabla clientes */}
        <div style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Clientes</span>
              <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8 }}>{clientes.length} en total</span>
            </div>
            <Link href="/admin/clients/new" style={{ fontSize: 12, color: '#059669', fontWeight: 600, textDecoration: 'none' }}>+ Añadir cliente</Link>
          </div>

          {cargando ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Cargando...</div>
          ) : clientes.length === 0 ? (
            <div style={{ padding: 56, textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: '#aaa', marginBottom: 12 }}>No hay clientes todavía</div>
              <Link href="/admin/clients/new" style={{ background: '#059669', color: 'white', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Crear el primero</Link>
            </div>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  {['Cliente', 'Plan', 'Knowledge base', 'Mensajes mes', 'Coste mes', 'Estado', ''].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => {
                  const kb = c.knowledge_bases?.[0]
                  const costes = c.client_costs?.find(x => x.month === mes)
                  return (
                    <tr key={c.id} style={{ background: 'white' }}>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.widget_color, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>{c.website_url}</div>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 600, background: c.plan === 'pro' ? '#eff6ff' : c.plan === 'business' ? '#f5f3ff' : '#f0fdf4', color: c.plan === 'pro' ? '#2563eb' : c.plan === 'business' ? '#7c3aed' : '#059669' }}>
                          {c.plan}
                        </span>
                      </td>
                      <td style={s.td}>
                        {kb ? (
                          <span style={{ fontSize: 12, color: kb.scraping_status === 'ok' ? '#059669' : '#ef4444' }}>
                            {kb.scraping_status === 'ok' ? `${kb.pages_scraped} págs · ${kb.words_count?.toLocaleString()} palabras` : 'Error'}
                          </span>
                        ) : <span style={{ fontSize: 12, color: '#ddd' }}>—</span>}
                      </td>
                      <td style={{ ...s.td, color: '#4B7BE5', fontWeight: 600 }}>{costes?.messages_count?.toLocaleString() || '0'}</td>
                      <td style={{ ...s.td, color: '#f59e0b', fontWeight: 500 }}>€{Number(costes?.cost_eur || 0).toFixed(4)}</td>
                      <td style={s.td}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: c.active ? '#059669' : '#aaa' }}>
                          {c.active ? '● activo' : '○ inactivo'}
                        </span>
                      </td>
                      <td style={s.td}>
                        <Link href={`/admin/clients/${c.id}`} style={{ fontSize: 12, color: '#4B7BE5', fontWeight: 500, textDecoration: 'none' }}>
                          Gestionar →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 11, color: '#ccc' }}>
          Panel privado Arandai Chat — solo visible para {process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin'}
        </div>
      </div>
    </div>
  )
}
