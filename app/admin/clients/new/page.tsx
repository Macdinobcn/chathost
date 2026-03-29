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
    is_internal: false,
    billing_override: null as string | null,
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
      if (!res.ok) { setError(data.error || 'Error al crear el cliente'); setCargando(false); return }
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
    { value: 'starter',  label: 'Starter',  precio: '€19/mes', desc: '500 msgs · 1 bot',     color: '#16a34a' },
    { value: 'pro',      label: 'Pro',       precio: '€49/mes', desc: '3.000 msgs · 3 bots',  color: '#2563eb' },
    { value: 'business', label: 'Business',  precio: '€99/mes', desc: '10.000 msgs · 10 bots', color: '#7c3aed' },
    { value: 'agency',   label: 'Agency',    precio: '€199/mes', desc: '30.000 msgs · 50 bots', color: '#ea580c' },
  ]

  const billingOptions = [
    { value: null,      label: 'Stripe normal',   desc: 'Paga con tarjeta',           color: '#6b7280' },
    { value: 'free',    label: 'Gratis siempre',  desc: 'Sin límite, sin cobro',       color: '#16a34a' },
    { value: 'custom',  label: 'Acuerdo manual',  desc: 'Cobro fuera de la plataforma', color: '#f59e0b' },
  ]

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' as const }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#1e293b', padding: '0 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60, gap: 12 }}>
          <Link href="/admin" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>← Admin</Link>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ color: 'white', fontSize: 14 }}>Nuevo cliente</span>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 32px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Nuevo cliente</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Al crear el cliente se lanzará el scraping automático de su web.</p>

        <form onSubmit={handleSubmit}>

          {/* Tipo de cliente */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>Tipo de cliente</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* Bot interno */}
              <div onClick={() => setForm({ ...form, is_internal: !form.is_internal })}
                style={{ padding: 18, borderRadius: 10, cursor: 'pointer', border: '2px solid', borderColor: form.is_internal ? '#818cf8' : '#e2e8f0', background: form.is_internal ? '#eef2ff' : 'white', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>🔮</span>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${form.is_internal ? '#818cf8' : '#d1d5db'}`, background: form.is_internal ? '#818cf8' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {form.is_internal && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: form.is_internal ? '#4f46e5' : '#1e293b', marginBottom: 3 }}>Bot interno</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Aparece en "Mis bots" · Créditos ilimitados · Sin Stripe</div>
              </div>

              {/* Cliente externo */}
              <div onClick={() => setForm({ ...form, is_internal: false })}
                style={{ padding: 18, borderRadius: 10, cursor: 'pointer', border: '2px solid', borderColor: !form.is_internal ? '#4f46e5' : '#e2e8f0', background: !form.is_internal ? '#eff6ff' : 'white', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>👥</span>
                  <div style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${!form.is_internal ? '#4f46e5' : '#d1d5db'}`, background: !form.is_internal ? '#4f46e5' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!form.is_internal && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: !form.is_internal ? '#4f46e5' : '#1e293b', marginBottom: 3 }}>Cliente externo</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Aparece en "Clientes" · Con plan y facturación</div>
              </div>
            </div>
          </div>

          {/* Billing override — solo si es externo */}
          {!form.is_internal && (
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Facturación</h2>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>¿Cómo gestiona el pago este cliente?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {billingOptions.map(opt => (
                  <div key={String(opt.value)} onClick={() => setForm({ ...form, billing_override: opt.value })}
                    style={{ padding: 14, borderRadius: 10, cursor: 'pointer', border: '2px solid', borderColor: form.billing_override === opt.value ? opt.color : '#e2e8f0', background: form.billing_override === opt.value ? opt.color + '10' : 'white', transition: 'all 0.15s' }}>
                    <div style={{ fontWeight: 700, color: form.billing_override === opt.value ? opt.color : '#1e293b', fontSize: 13, marginBottom: 3 }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Datos */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>Datos del negocio</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Nombre *</label>
                <input type="text" required placeholder="Camping La Siesta" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>URL de la web *</label>
                <input type="url" required placeholder="https://campinglasiesta.com" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email del cliente</label>
                <input type="email" placeholder="contacto@negocio.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inp} />
              </div>
            </div>
          </div>

          {/* Plan — solo si es externo */}
          {!form.is_internal && (
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>Plan</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {planes.map(plan => (
                  <div key={plan.value} onClick={() => setForm({ ...form, plan: plan.value })}
                    style={{ padding: 14, borderRadius: 10, cursor: 'pointer', border: '2px solid', borderColor: form.plan === plan.value ? plan.color : '#e2e8f0', background: form.plan === plan.value ? plan.color + '10' : 'white', transition: 'all 0.15s' }}>
                    <div style={{ fontWeight: 700, color: form.plan === plan.value ? plan.color : '#1e293b', fontSize: 13, marginBottom: 2 }}>{plan.label}</div>
                    <div style={{ fontSize: 13, color: plan.color, fontWeight: 600, marginBottom: 2 }}>{plan.precio}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>{plan.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Widget */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>Widget</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Nombre del asistente</label>
                <input type="text" value={form.widget_name} onChange={e => setForm({ ...form, widget_name: e.target.value })} style={inp} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Color principal</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input type="color" value={form.widget_color} onChange={e => setForm({ ...form, widget_color: e.target.value })}
                    style={{ width: 44, height: 44, border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: 2 }} />
                  <input type="text" value={form.widget_color} onChange={e => setForm({ ...form, widget_color: e.target.value })} style={{ ...inp, flex: 1, width: 'auto' }} />
                </div>
              </div>
            </div>
          </div>

          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#991b1b', marginBottom: 20, fontSize: 14 }}>{error}</div>}

          <button type="submit" disabled={cargando} style={{
            width: '100%', padding: 14,
            background: cargando ? '#94a3b8' : form.is_internal ? '#4f46e5' : '#059669',
            color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
            cursor: cargando ? 'not-allowed' : 'pointer',
          }}>
            {cargando ? 'Creando...' : form.is_internal ? '🔮 Crear bot interno' : '👥 Crear cliente'}
          </button>
        </form>
      </div>
    </div>
  )
}
