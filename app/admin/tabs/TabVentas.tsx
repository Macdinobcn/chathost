'use client'
// app/admin/tabs/TabVentas.tsx — Panel de prospecting y ventas automáticas

import { useEffect, useState } from 'react'
import { toast } from '@/components/Toast'

interface Company {
  nombre: string
  web: string
  ciudad: string
  lat?: number
  lng?: number
  telefono?: string
  validado?: boolean
}

interface TrialChat {
  id: string
  company_name: string
  company_website: string
  company_city: string
  status: 'active' | 'converted' | 'expired'
  trial_start: string
  activity_messages: number
  is_hot: boolean
  last_activity_at?: string
}

const s = {
  card: { background: 'white', border: '1px solid #eaecf0', borderRadius: 10, padding: 20, marginBottom: 16 },
  secLabel: { fontSize: 13, fontWeight: 700, color: '#101828', marginBottom: 14, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  btn: (bg = '#2563eb', color = 'white') => ({ background: bg, color, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' }),
}

export default function TabVentas() {
  const [sector, setSector] = useState('hoteles')
  const [region, setRegion] = useState('España')
  const [searching, setSearching] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [trials, setTrials] = useState<TrialChat[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { cargarTrials() }, [])

  async function cargarTrials() {
    const res = await fetch('/api/sales/check-activity')
    const data = await res.json()
    setTrials(data.all_activity || [])
  }

  async function buscarEmpresas() {
    if (!sector || !region) {
      toast('error', 'Error', 'Selecciona sector y región')
      return
    }

    setSearching(true)
    try {
      const res = await fetch('/api/sales/search-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, region, count: 10 }),
      })
      const data = await res.json()

      if (data.error) {
        toast('error', 'Error en búsqueda', data.error)
        setSearching(false)
        return
      }

      if (!data.empresas || data.empresas.length === 0) {
        toast('info', 'Sin resultados', 'No se encontraron empresas con esos criterios')
        setSearching(false)
        return
      }

      setCompanies(data.empresas.map((e: any) => ({ ...e, validado: false })))
      toast('success', `Encontradas ${data.empresas.length} empresas`, `Valida las que te interesen`)
    } catch (err: any) {
      toast('error', 'Error', err.message)
    } finally {
      setSearching(false)
    }
  }

  async function validarYCrear(empresa: Company) {
    if (!empresa.web.startsWith('http')) empresa.web = 'https://' + empresa.web

    setLoading(true)
    try {
      const res = await fetch('/api/sales/create-trial-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: empresa.nombre,
          website_url: empresa.web,
          ciudad: empresa.ciudad,
          lat: empresa.lat,
          lng: empresa.lng,
        }),
      })
      const data = await res.json()

      if (data.error) {
        toast('error', 'Error creando chat', data.error)
        setLoading(false)
        return
      }

      // Send email
      const emailRes = await fetch('/api/sales/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: empresa.nombre,
          email: 'info@' + empresa.web.replace('https://', '').split('/')[0],
          widget_id: data.widget_id,
          trial_url: data.trial_url,
        }),
      })

      const emailData = await emailRes.json()

      if (emailData.error) {
        toast('warning', 'Chat creado pero email falló', emailData.error)
      } else {
        toast('success', '✓ Chat creado y email enviado', `${empresa.nombre} está en trial`)
      }

      setCompanies(companies.filter(c => c.nombre !== empresa.nombre))
      await cargarTrials()
    } catch (err: any) {
      toast('error', 'Error', err.message)
    } finally {
      setLoading(false)
    }
  }

  const hotLeads = trials.filter(t => t.is_hot)

  return (
    <>
      {/* ── BÚSQUEDA DE EMPRESAS ──────────────────────────────────── */}
      <div style={s.card as React.CSSProperties}>
        <div style={s.secLabel}>🔍 Buscar empresas</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Sector</label>
            <select value={sector} onChange={e => setSector(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }}>
              <option value="hoteles">Hoteles</option>
              <option value="campings">Campings</option>
              <option value="tours">Tours & Excursiones</option>
              <option value="gastronomia">Gastronomía</option>
              <option value="museos">Museos & Cultura</option>
              <option value="resorts">Resorts</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Región</label>
            <input type="text" value={region} onChange={e => setRegion(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit' }} />
          </div>
          <button onClick={buscarEmpresas} disabled={searching} style={{ ...s.btn('#06b6d4'), opacity: searching ? 0.6 : 1 }}>
            {searching ? '...' : '🔍 Buscar'}
          </button>
        </div>
      </div>

      {/* ── EMPRESAS A VALIDAR ────────────────────────────────────── */}
      {companies.length > 0 && (
        <div style={s.card as React.CSSProperties}>
          <div style={s.secLabel}>✓ Valida estas empresas</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {companies.map(emp => (
              <div key={emp.nombre} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#101828' }}>{emp.nombre}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>📍 {emp.ciudad} · <a href={emp.web} target="_blank" rel="noreferrer" style={{ color: '#06b6d4', textDecoration: 'none' }}>{emp.web}</a></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => validarYCrear(emp)} disabled={loading} style={{ ...s.btn('#16a34a'), opacity: loading ? 0.6 : 1 }}>
                    {loading ? '...' : '✓ Crear'}
                  </button>
                  <button onClick={() => setCompanies(companies.filter(c => c.nombre !== emp.nombre))} style={{ ...s.btn('#f3f4f6', '#64748b') }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TRIALS ACTIVOS ────────────────────────────────────────── */}
      <div style={s.card as React.CSSProperties}>
        <div style={s.secLabel}>📊 Trials activos ({trials.length})</div>
        {hotLeads.length > 0 && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: 12, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, color: '#92400e', fontSize: 13 }}>🔥 {hotLeads.length} hot leads</div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 4 }}>Estos tienen actividad · considera contactarlos ya</div>
          </div>
        )}
        {trials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b', fontSize: 13 }}>Sin trials activos aún. Busca y valida empresas arriba.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {trials.map(trial => (
              <div key={trial.id} style={{ border: `2px solid ${trial.is_hot ? '#fb923c' : '#e5e7eb'}`, borderRadius: 8, padding: 12, background: trial.is_hot ? '#fffbeb' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#101828' }}>{trial.company_name} {trial.is_hot && '🔥'}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {trial.activity_messages} mensajes · Desde: {trial.trial_start ? new Date(trial.trial_start).toLocaleDateString() : 'Hoy'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ ...s.btn('#f3f4f6', '#64748b'), fontSize: 11 }}>👁 Ver chat</button>
                    {trial.is_hot && <button style={{ ...s.btn('#f59e0b'), fontSize: 11 }}>📞 Contactar</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ESTADÍSTICAS ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Trials activos', val: trials.length, color: '#06b6d4' },
          { label: 'Con actividad', val: trials.filter(t => t.activity_messages > 0).length, color: '#10b981' },
          { label: 'Hot leads', val: hotLeads.length, color: '#f59e0b' },
        ].map(st => (
          <div key={st.label} style={{ ...s.card, textAlign: 'center', padding: 16 } as React.CSSProperties}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{st.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: st.color }}>{st.val}</div>
          </div>
        ))}
      </div>
    </>
  )
}
