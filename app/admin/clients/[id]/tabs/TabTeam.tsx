// app/admin/clients/[id]/tabs/TabTeam.tsx
// Gestión del equipo — invitar agentes, ver miembros, revocar acceso
'use client'
import { useEffect, useState } from 'react'
import { S } from '@/lib/admin-styles'

interface Member {
  id: string
  email: string
  role: 'owner' | 'agent'
  created_at: string
}

interface Props {
  cliente: any
  themeColor: string
  tr: (k: string) => string
}

const ROLE_LABELS: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  owner: { label: 'Owner',   desc: 'Acceso total',              color: '#7c3aed', bg: '#f5f3ff' },
  agent: { label: 'Agente',  desc: 'Ve chats, puede responder', color: '#2563eb', bg: '#eff6ff' },
}

export default function TabTeam({ cliente, themeColor, tr }: Props) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'agent' | 'owner'>('agent')
  const [inviting, setInviting] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { loadMembers() }, [])

  async function loadMembers() {
    setLoading(true)
    const res = await fetch(`/api/invite-member?clientId=${cliente.id}`)
    const data = await res.json()
    setMembers(data.members || [])
    setLoading(false)
  }

  async function handleInvite() {
    if (!email.trim() || !email.includes('@')) return
    setInviting(true); setMsg(''); setError('')
    const res = await fetch('/api/invite-member', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: cliente.id, email: email.trim(), role }),
    })
    const data = await res.json()
    if (res.ok) {
      setMsg(`✓ ${email} ha sido añadido como ${ROLE_LABELS[role].label}`)
      setEmail('')
      loadMembers()
    } else {
      setError(data.error || 'Error al invitar')
    }
    setInviting(false)
  }

  async function handleRemove(memberId: string, memberEmail: string) {
    if (!confirm(`¿Revocar acceso a ${memberEmail}?`)) return
    await fetch('/api/invite-member', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, clientId: cliente.id }),
    })
    loadMembers()
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>

      {/* Info */}
      <div style={{ ...S.card, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1d4ed8', marginBottom: 6 }}>
          👥 Acceso al panel
        </div>
        <div style={{ fontSize: 13, color: '#3b82f6', lineHeight: 1.6 }}>
          Invita a tu equipo para que puedan ver conversaciones y responder directamente desde el panel.
          Cada miembro entra con su propio email — sin compartir contraseñas.
        </div>
      </div>

      {/* Invitar */}
      <div style={S.card}>
        <div style={S.secLabel}>Invitar miembro</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleInvite()}
            placeholder="email@empresa.com"
            style={{ ...S.inp, flex: 1, width: 'auto' }}
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'agent' | 'owner')}
            style={{ ...S.inp, width: 130 }}
          >
            <option value="agent">Agente</option>
            <option value="owner">Owner</option>
          </select>
          <button
            onClick={handleInvite}
            disabled={inviting || !email.trim()}
            style={S.btn(inviting ? '#aaa' : themeColor)}
          >
            {inviting ? '...' : '+ Invitar'}
          </button>
        </div>

        {/* Roles explicados */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {Object.entries(ROLE_LABELS).map(([key, r]) => (
            <div key={key} style={{ background: r.bg, border: `1px solid ${r.color}20`, borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: r.color, marginBottom: 2 }}>{r.label}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{r.desc}</div>
            </div>
          ))}
        </div>

        {msg && <div style={{ marginTop: 10, fontSize: 12, color: '#059669', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '8px 12px' }}>{msg}</div>}
        {error && <div style={{ marginTop: 10, fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px' }}>{error}</div>}
      </div>

      {/* Lista de miembros */}
      <div style={S.card}>
        <div style={S.secLabel}>Miembros con acceso</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>Cargando...</div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#94a3b8', fontSize: 13 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
            Aún no hay miembros. Invita a tu equipo arriba.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map(m => {
              const r = ROLE_LABELS[m.role] || ROLE_LABELS.agent
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: r.color, flexShrink: 0 }}>
                    {m.email[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{m.email}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      Desde {new Date(m.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.color, background: r.bg, padding: '3px 10px', borderRadius: 20 }}>
                    {r.label}
                  </span>
                  {m.role !== 'owner' && (
                    <button
                      onClick={() => handleRemove(m.id, m.email)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 18, padding: '0 4px', lineHeight: 1 }}
                      title="Revocar acceso"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Nota */}
      <div style={{ ...S.card, background: '#fffbeb', border: '1px solid #fde68a' }}>
        <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.6 }}>
          💡 <strong>¿Cómo entra tu equipo?</strong> Cada miembro va a <strong>app.chathost.ai/auth/login</strong>, pone su email y recibe un link de acceso. Sin contraseña. Solo ven los datos de <strong>{cliente.name}</strong>.
        </div>
      </div>

    </div>
  )
}
