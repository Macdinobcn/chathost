'use client'
import { useEffect, useState } from 'react'

interface Incident {
  id: string
  client_id: string
  client_name: string
  type: 'scrape_failed' | 'no_credits' | 'payment_failed' | 'bot_inactive' | 'high_error_rate'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'auto_fixed' | 'needs_human' | 'resolved'
  title: string
  description: string
  auto_fix_attempted: boolean
  auto_fix_result: string | null
  created_at: string
  resolved_at: string | null
}

const SEVERITY_COLOR: Record<Incident['severity'], string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#94a3b8',
}

const SEVERITY_BG: Record<Incident['severity'], string> = {
  critical: '#fef2f2',
  high: '#fff7ed',
  medium: '#fffbeb',
  low: '#f8fafc',
}

const TYPE_ICON: Record<Incident['type'], string> = {
  scrape_failed: '🔄',
  no_credits: '💳',
  payment_failed: '💸',
  bot_inactive: '😴',
  high_error_rate: '⚠️',
}

type Filter = 'all' | 'open' | 'critical' | 'auto_fixed' | 'needs_human'

export default function TabIncidencias() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)
  const [autofixing, setAutofixing] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/incidents')
      if (res.ok) {
        const data = await res.json()
        setIncidents(data.incidents || [])
      }
    } catch (e) {
      console.error('Error loading incidents:', e)
    } finally {
      setLoading(false)
    }
  }

  async function detect() {
    setDetecting(true)
    try {
      const res = await fetch('/api/admin/incidents/detect', { method: 'POST' })
      if (res.ok) await load()
    } catch (e) {
      console.error('Error detecting incidents:', e)
    } finally {
      setDetecting(false)
    }
  }

  async function autofix() {
    setAutofixing(true)
    try {
      const res = await fetch('/api/admin/incidents/autofix', { method: 'POST' })
      if (res.ok) await load()
    } catch (e) {
      console.error('Error autofixing:', e)
    } finally {
      setAutofixing(false)
    }
  }

  async function resolve(id: string) {
    setResolvingId(id)
    try {
      const res = await fetch(`/api/admin/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      })
      if (res.ok) {
        setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: 'resolved', resolved_at: new Date().toISOString() } : i))
      }
    } catch (e) {
      console.error('Error resolving incident:', e)
    } finally {
      setResolvingId(null)
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const open = incidents.filter(i => i.status === 'open' || i.status === 'needs_human')
  const critical = incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved')
  const autoFixedToday = incidents.filter(i => i.status === 'auto_fixed' && i.resolved_at?.startsWith(today))
  const needsHuman = incidents.filter(i => i.status === 'needs_human')

  const filtered = incidents.filter(i => {
    if (filter === 'open') return i.status === 'open'
    if (filter === 'critical') return i.severity === 'critical'
    if (filter === 'auto_fixed') return i.status === 'auto_fixed'
    if (filter === 'needs_human') return i.status === 'needs_human'
    return true
  })

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: 'all', label: 'Todas', count: incidents.length },
    { key: 'open', label: 'Abiertas', count: open.length },
    { key: 'critical', label: 'Críticas', count: critical.length },
    { key: 'auto_fixed', label: 'Auto-arregladas', count: autoFixedToday.length },
    { key: 'needs_human', label: 'Necesitan ayuda', count: needsHuman.length },
  ]

  const btnBase: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: 8,
    cursor: 'pointer', border: 'none', transition: 'opacity 0.15s',
  }

  return (
    <div>
      {/* Header actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>Monitoreo de incidencias</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={autofix}
            disabled={autofixing}
            style={{ ...btnBase, background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', opacity: autofixing ? 0.6 : 1 }}
          >
            {autofixing ? 'Arreglando...' : '🔧 Resolver automáticamente'}
          </button>
          <button
            onClick={detect}
            disabled={detecting}
            style={{ ...btnBase, background: '#4f46e5', color: 'white', opacity: detecting ? 0.6 : 1 }}
          >
            {detecting ? 'Detectando...' : '🔍 Detectar incidencias ahora'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total abiertas', val: open.length, color: '#f59e0b' },
          { label: 'Críticas', val: critical.length, color: '#ef4444' },
          { label: 'Auto-arregladas hoy', val: autoFixedToday.length, color: '#16a34a' },
          { label: 'Necesitan ayuda', val: needsHuman.length, color: '#7c3aed' },
        ].map(st => (
          <div key={st.label} style={{ background: 'white', border: '1px solid #eaecf0', borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#98a2b3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{st.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color: st.color }}>{st.val}</div>
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
              border: filter === f.key ? '1px solid #4f46e5' : '1px solid #eaecf0',
              background: filter === f.key ? '#4f46e5' : 'white',
              color: filter === f.key ? 'white' : '#667085',
            }}
          >
            {f.label}
            {f.count !== undefined && (
              <span style={{
                marginLeft: 6, fontSize: 10, fontWeight: 700,
                background: filter === f.key ? 'rgba(255,255,255,0.25)' : '#f2f4f7',
                color: filter === f.key ? 'white' : '#98a2b3',
                padding: '1px 6px', borderRadius: 10,
              }}>{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Incident list */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#98a2b3', fontSize: 13 }}>Cargando incidencias...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'white', border: '1px solid #eaecf0', borderRadius: 10, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#16a34a' }}>Sin incidencias abiertas</div>
          <div style={{ fontSize: 12, color: '#98a2b3', marginTop: 4 }}>Todo funciona correctamente</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(incident => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onResolve={resolve}
              resolving={resolvingId === incident.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function IncidentCard({ incident, onResolve, resolving }: {
  incident: Incident
  onResolve: (id: string) => void
  resolving: boolean
}) {
  const sevColor = SEVERITY_COLOR[incident.severity]
  const sevBg = SEVERITY_BG[incident.severity]
  const icon = TYPE_ICON[incident.type]
  const isResolved = incident.status === 'resolved'

  const statusLabel: Record<Incident['status'], string> = {
    open: 'Abierta',
    auto_fixed: 'Auto-arreglada',
    needs_human: 'Necesita ayuda',
    resolved: 'Resuelta',
  }

  const statusColor: Record<Incident['status'], string> = {
    open: '#f59e0b',
    auto_fixed: '#16a34a',
    needs_human: '#ef4444',
    resolved: '#94a3b8',
  }

  return (
    <div style={{
      background: 'white',
      border: `1px solid #eaecf0`,
      borderLeft: `4px solid ${sevColor}`,
      borderRadius: 10,
      padding: '16px 20px',
      opacity: isResolved ? 0.65 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Severity + icon */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 48 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
            background: sevBg, color: sevColor, padding: '2px 7px', borderRadius: 20,
            border: `1px solid ${sevColor}33`,
          }}>{incident.severity}</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>{incident.title}</span>
            <span style={{
              fontSize: 10, fontWeight: 600, background: statusColor[incident.status] + '1a',
              color: statusColor[incident.status], padding: '1px 8px', borderRadius: 20,
            }}>{statusLabel[incident.status]}</span>
          </div>
          <div style={{ fontSize: 12, color: '#667085', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: '#344054' }}>{incident.client_name}</span>
            {' · '}
            <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#98a2b3' }}>{incident.type}</span>
          </div>
          <div style={{ fontSize: 12, color: '#667085', lineHeight: 1.5, marginBottom: incident.auto_fix_result ? 8 : 0 }}>
            {incident.description}
          </div>
          {incident.auto_fix_result && (
            <div style={{
              marginTop: 8, fontSize: 11, color: '#16a34a',
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 6, padding: '5px 10px',
            }}>
              🔧 Auto-fix: {incident.auto_fix_result}
            </div>
          )}
        </div>

        {/* Right side: date + resolve button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#98a2b3' }}>
            {new Date(incident.created_at).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
          {!isResolved && (
            <button
              onClick={() => onResolve(incident.id)}
              disabled={resolving}
              style={{
                fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 6,
                border: '1px solid #d0d5dd', background: 'white', color: '#344054',
                cursor: resolving ? 'not-allowed' : 'pointer', opacity: resolving ? 0.6 : 1,
              }}
            >
              {resolving ? '...' : '✓ Marcar resuelta'}
            </button>
          )}
          {isResolved && incident.resolved_at && (
            <div style={{ fontSize: 10, color: '#16a34a' }}>
              Resuelta {new Date(incident.resolved_at).toLocaleString('es-ES', { day: '2-digit', month: 'short' })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
