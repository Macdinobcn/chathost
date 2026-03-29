'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NuevoClientePage() {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    website_url: '',
    email: '',
    plan: 'basic',
    widget_color: '#059669',
    widget_name: 'Asistente',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setCargando(true)
    setError('')

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear el cliente')
        setCargando(false)
        return
      }

      // Lanzar scraping en background sin bloquear
      fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: data.client.id }),
      }).catch(err => console.error('Error scraping:', err))

      router.push(`/admin/clients/${data.client.id}`)
    } catch {
      setError('Error de conexión')
      setCargando(false)
    }
  }

  const planes = [
    { value: 'basic', label: 'Basic', precio: '€49/mes', desc: '500 mensajes · 1 web' },
    { value: 'pro', label: 'Pro', precio: '€99/mes', desc: '5.000 mensajes · 3 webs' },
    { value: 'business', label: 'Business', precio: '€199/mes', desc: 'Ilimitado · webs ilimitadas' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#1e293b', padding: '0 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60, gap: 12 }}>
          <Link href="/admin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>← Admin</Link>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ color: 'white', fontSize: 14 }}>Nuevo cliente</span>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Nuevo cliente</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Al crear el cliente se lanzará el scraping automático de su web en segundo plano.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 24 }}>Datos del negocio</h2>
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Nombre del negocio *</label>
                <input type="text" required placeholder="Camping La Siesta"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>URL de su web *</label>
                <input type="url" required placeholder="https://campinglasiesta.com"
                  value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email del cliente</label>
                <input type="email" placeholder="contacto@campinglasiesta.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 24 }}>Plan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {planes.map(plan => (
                <div key={plan.value} onClick={() => setForm({ ...form, plan: plan.value })}
                  style={{ padding: 16, borderRadius: 10, cursor: 'pointer', border: '2px solid',
                    borderColor: form.plan === plan.value ? '#059669' : '#e2e8f0',
                    background: form.plan === plan.value ? '#f0fdf4' : 'white' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{plan.label}</div>
                  <div style={{ fontSize: 14, color: '#059669', fontWeight: 600, marginBottom: 4 }}>{plan.precio}</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{plan.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 32, marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 24 }}>Widget</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Nombre del asistente</label>
                <input type="text" value={form.widget_name} onChange={e => setForm({ ...form, widget_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Color principal</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={form.widget_color} onChange={e => setForm({ ...form, widget_color: e.target.value })}
                    style={{ width: 44, height: 44, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                  <input type="text" value={form.widget_color} onChange={e => setForm({ ...form, widget_color: e.target.value })}
                    style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }} />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#991b1b', marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={cargando} style={{
            width: '100%', padding: '14px', background: cargando ? '#94a3b8' : '#059669',
            color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
            cursor: cargando ? 'not-allowed' : 'pointer'
          }}>
            {cargando ? 'Creando cliente...' : 'Crear cliente'}
          </button>
        </form>
      </div>
    </div>
  )
}
