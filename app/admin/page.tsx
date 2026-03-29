'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminTopbar from '@/components/AdminTopbar'

interface ClienteResumen {
  id: string; name: string; website_url: string; plan: string; active: boolean
  widget_color: string; widget_icon_url: string; created_at: string
  is_internal: boolean; billing_override: string | null
  knowledge_bases: { scraping_status: string; pages_scraped: number; words_count: number }[]
  client_costs: { month: string; messages_count: number; cost_eur: number }[]
}

const s = {
  wrap: { minHeight: '100vh', background: '#f8f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,system-ui,sans-serif' },
  body: { padding: '24px 28px', maxWidth: 1200, margin: '0 auto' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 28 } as React.CSSProperties,
  statBox: { background: 'white', border: '1px solid #eaecf0', borderRadius: 10, padding: '16px 20px' } as React.CSSProperties,
  statLabel: { fontSize: 10, fontWeight: 700, color: '#98a2b3', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 6 },
  statVal: { fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px' },
  statSub: { fontSize: 10, color: '#d0d5dd', marginTop: 3 },
  card: { background: 'white', border: '1px solid #eaecf0', borderRadius: 10, overflow: 'hidden', marginBottom: 20 } as React.CSSProperties,
  table: { width: '100%', borderCollapse: 'collapse' as const },
  th: { padding: '9px 16px', textAlign: 'left' as const, fontSize: 10, fontWeight: 700, color: '#98a2b3', textTransform: 'uppercase' as const, letterSpacing: '0.06em', background: '#f9fafb', borderBottom: '1px solid #f0f0f0' },
  td: { padding: '14px 16px', fontSize: 13, borderBottom: '1px solid #f7f7f7' },
}

const PLAN_STYLE: Record<string, { bg: string; color: string }> = {
  starter: { bg: '#f0fdf4', color: '#16a34a' }, basic: { bg: '#f0fdf4', color: '#16a34a' },
  pro: { bg: '#eff6ff', color: '#2563eb' }, business: { bg: '#f5f3ff', color: '#7c3aed' },
  agency: { bg: '#fff7ed', color: '#ea580c' }, trial: { bg: '#fefce8', color: '#ca8a04' },
}

function ClientRow({ c, mes }: { c: ClienteResumen; mes: string }) {
  const kb = c.knowledge_bases?.[0]
  const costes = c.client_costs?.find(x => x.month === mes)
  const planStyle = PLAN_STYLE[c.plan] || { bg: '#f9fafb', color: '#6b7280' }
  return (
    <tr>
      <td style={s.td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {c.widget_icon_url
            ? <img src={c.widget_icon_url} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            : <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.widget_color, flexShrink: 0 }} />}
          <div>
            <div style={{ fontWeight: 600, color: '#101828', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              {c.name}
              {c.is_internal && <span style={{ fontSize: 9, fontWeight: 700, background: '#818cf8', color: 'white', padding: '1px 6px', borderRadius: 4 }}>INTERNO</span>}
              {c.billing_override === 'free' && <span style={{ fontSize: 9, fontWeight: 700, background: '#22c55e', color: 'white', padding: '1px 6px', borderRadius: 4 }}>FREE</span>}
              {c.billing_override === 'custom' && <span style={{ fontSize: 9, fontWeight: 700, background: '#f59e0b', color: 'white', padding: '1px 6px', borderRadius: 4 }}>CUSTOM</span>}
            </div>
            <div style={{ fontSize: 11, color: '#d0d5dd', marginTop: 1 }}>{c.website_url}</div>
          </div>
        </div>
      </td>
      <td style={s.td}><span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 600, background: planStyle.bg, color: planStyle.color }}>{c.plan}</span></td>
      <td style={s.td}>
        {kb ? <span style={{ fontSize: 12, color: kb.scraping_status === 'ok' ? '#16a34a' : '#ef4444' }}>{kb.scraping_status === 'ok' ? `${kb.pages_scraped} págs · ${kb.words_count?.toLocaleString()} palabras` : 'Error'}</span> : <span style={{ fontSize: 12, color: '#ddd' }}>—</span>}
      </td>
      <td style={{ ...s.td, color: '#4f46e5', fontWeight: 600 }}>{costes?.messages_count?.toLocaleString() || '0'}</td>
      <td style={{ ...s.td, color: '#f59e0b', fontWeight: 500 }}>{c.is_internal ? <span style={{ color: '#d0d5dd' }}>—</span> : `€${Number(costes?.cost_eur || 0).toFixed(4)}`}</td>
      <td style={s.td}><span style={{ fontSize: 11, fontWeight: 600, color: c.active ? '#16a34a' : '#98a2b3' }}>{c.active ? '● activo' : '○ inactivo'}</span></td>
      <td style={s.td}><Link href={`/admin/clients/${c.id}`} style={{ fontSize: 12, color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>Gestionar →</Link></td>
    </tr>
  )
}

function ClientTable({ title, clients, mes, accent }: { title: string; clients: ClienteResumen[]; mes: string; accent: string }) {
  if (clients.length === 0) return null
  return (
    <div style={s.card}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0f0f0', borderLeft: `3px solid ${accent}` }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>{title}</span>
        <span style={{ fontSize: 11, color: '#98a2b3', background: '#f9fafb', border: '1px solid #eaecf0', borderRadius: 20, padding: '1px 8px' }}>{clients.length}</span>
      </div>
      <table style={s.table}>
        <thead><tr>{['Cliente', 'Plan', 'Knowledge base', 'Mensajes mes', 'Coste mes', 'Estado', ''].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>{clients.map(c => <ClientRow key={c.id} c={c} mes={mes} />)}</tbody>
      </table>
    </div>
  )
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
  const internos = clientes.filter(c => c.is_internal)
  const externos = clientes.filter(c => !c.is_internal)
  const totalCoste = externos.reduce((a, c) => a + Number(c.client_costs?.find(x => x.month === mes)?.cost_eur || 0), 0)
  const totalMensajes = externos.reduce((a, c) => a + (c.client_costs?.find(x => x.month === mes)?.messages_count || 0), 0)
  const activos = externos.filter(c => c.active).length
  const PLAN_MRR: Record<string, number> = { starter: 19, pro: 49, business: 99, agency: 199 }
  const mrr = externos.reduce((a, c) => a + (PLAN_MRR[c.plan] || 0), 0)
  const margen = mrr > 0 ? Math.round(((mrr - totalCoste) / mrr) * 100) : 0

  return (
    <div style={s.wrap}>
      <AdminTopbar
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {actualizado && <span style={{ fontSize: 11, color: '#64748b' }}>Actualizado: {actualizado}</span>}
            <button onClick={cargar} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', cursor: 'pointer' }}>↺ Refresh</button>
            <Link href="/admin/clients/new" style={{ background: '#2563eb', color: 'white', padding: '7px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>+ Nuevo cliente</Link>
          </div>
        }
      />

      <div style={s.body}>
        <div style={s.statsGrid}>
          {[
            { label: 'Clientes activos', val: activos, color: '#16a34a', sub: `de ${externos.length} totales` },
            { label: 'MRR estimado', val: `€${mrr}`, color: '#4f46e5', sub: 'ingresos este mes' },
            { label: 'Coste API', val: `€${totalCoste.toFixed(3)}`, color: '#f59e0b', sub: 'Claude Haiku' },
            { label: 'Mensajes mes', val: totalMensajes.toLocaleString(), color: '#7c3aed', sub: 'todos los clientes' },
            { label: 'Margen', val: `${margen}%`, color: margen >= 75 ? '#16a34a' : '#ef4444', sub: mrr > 0 ? 'sobre MRR' : 'sin ingresos aún' },
          ].map(st => (
            <div key={st.label} style={s.statBox}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={{ ...s.statVal, color: st.color }}>{st.val}</div>
              <div style={s.statSub}>{st.sub}</div>
            </div>
          ))}
        </div>

        {cargando ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#98a2b3', fontSize: 13 }}>Cargando...</div>
        ) : (
          <>
            <ClientTable title="🔮 Mis bots" clients={internos} mes={mes} accent="#818cf8" />
            <ClientTable title="👥 Clientes" clients={externos} mes={mes} accent="#4f46e5" />
            {clientes.length === 0 && (
              <div style={{ ...s.card, padding: 56, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: '#98a2b3', marginBottom: 12 }}>No hay clientes todavía</div>
                <Link href="/admin/clients/new" style={{ background: '#4f46e5', color: 'white', padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Crear el primero</Link>
              </div>
            )}
          </>
        )}
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 11, color: '#d0d5dd' }}>Panel privado ChatHost.ai</div>
      </div>
    </div>
  )
}
