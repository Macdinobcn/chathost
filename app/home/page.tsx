'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLAN_BOTS: Record<string, number> = {
  trial: 1, basic: 1, starter: 1, pro: 3, business: 10, agency: 30,
}

const PLAN_PRICES: Record<string, number> = {
  trial: 0, basic: 19, starter: 19, pro: 49, business: 99, agency: 199,
}

const PLAN_COLOR: Record<string, string> = {
  trial: '#6366f1', starter: '#22c55e', pro: '#818cf8',
  business: '#c084fc', agency: '#fb923c',
}

interface BotEntry {
  client_id: string
  clients: {
    name: string
    plan: string
    active: boolean
    widget_color: string
    widget_name: string
    created_at: string
  }
}

const ADMIN_EMAILS = ['alexcollspeyra@gmail.com', 'chathostapp@gmail.com']

export default function HomePage() {
  const router = useRouter()
  const [bots, setBots] = useState<BotEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('trial')
  const [viewMode, setViewMode] = useState<'grande' | 'pequeño' | 'lista'>('grande')
  const [activeTab, setActiveTab] = useState('overview')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { router.push('/auth/login'); return }
      if (user.email && ADMIN_EMAILS.includes(user.email)) { router.push('/admin'); return }

      const { data } = await supabase
        .from('client_users')
        .select('client_id, clients(name, plan, active, widget_color, widget_name, created_at)')
        .eq('email', user.email)

      if (!data || data.length === 0) { router.push('/auth/login'); return }

      const entries = data as unknown as BotEntry[]
      const userPlan = (entries[0]?.clients as any)?.plan || 'trial'
      setPlan(userPlan)
      setBots(entries)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060914' }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo.png" alt="ChatHost.ai" style={{ height: 40, marginBottom: 16 }} />
        <p style={{ color: '#475569', fontSize: 14, fontFamily: 'sans-serif' }}>Cargando...</p>
      </div>
    </div>
  )

  const price = PLAN_PRICES[plan] || 0
  const planColor = PLAN_COLOR[plan] || '#6366f1'
  const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })

  return (
    <div style={{ minHeight: '100vh', background: '#060914', fontFamily: 'Outfit, -apple-system, sans-serif', color: '#f1f5f9' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(6,9,20,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20,
      }}>
        <img src="/logo.png" alt="ChatHost.ai" style={{ height: 36 }} />
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push('/auth/login'))}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cerrar sesión
        </button>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '40px 48px', maxWidth: 1400, margin: '0 auto' }}>

        {/* Header + Stats Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 40 }}>

          {/* LEFT: Chats */}
          <div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
                    Mis chats
                  </h1>
                  <p style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
                    {bots.length} de {PLAN_BOTS[plan]} chatbots disponibles
                  </p>
                </div>

                {/* View Mode Selector */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setViewMode('grande')}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: `1px solid ${viewMode === 'grande' ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                      background: viewMode === 'grande' ? 'rgba(129,140,248,0.1)' : 'transparent',
                      color: viewMode === 'grande' ? '#818cf8' : '#64748b',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                    }}
                  >
                    🔲 Grande
                  </button>
                  <button
                    onClick={() => setViewMode('pequeño')}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: `1px solid ${viewMode === 'pequeño' ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                      background: viewMode === 'pequeño' ? 'rgba(129,140,248,0.1)' : 'transparent',
                      color: viewMode === 'pequeño' ? '#818cf8' : '#64748b',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                    }}
                  >
                    ⊞ Pequeño
                  </button>
                  <button
                    onClick={() => setViewMode('lista')}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: `1px solid ${viewMode === 'lista' ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                      background: viewMode === 'lista' ? 'rgba(129,140,248,0.1)' : 'transparent',
                      color: viewMode === 'lista' ? '#818cf8' : '#64748b',
                      cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                    }}
                  >
                    ≡ Lista
                  </button>
                </div>
              </div>

              {/* Grid de Chats */}
              <div style={{
                display: viewMode === 'lista' ? 'flex' : 'grid',
                gridTemplateColumns: viewMode === 'grande' ? 'repeat(2, 1fr)' : viewMode === 'pequeño' ? 'repeat(4, 1fr)' : undefined,
                flexDirection: viewMode === 'lista' ? 'column' : undefined,
                gap: 14,
              }}>
                {bots.map(bot => {
                  const c = bot.clients as any
                  const color = c?.widget_color || PLAN_COLOR[c?.plan] || '#6366f1'
                  const planColor = PLAN_COLOR[c?.plan] || '#6366f1'
                  const createdYear = c?.created_at ? new Date(c.created_at).getFullYear() : ''

                  if (viewMode === 'lista') {
                    return (
                      <Link key={bot.client_id} href={`/admin/clients/${bot.client_id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 20px',
                          cursor: 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                          onMouseOver={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = color + '60'
                            ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(22,27,39,0.8)'
                          }}
                          onMouseOut={e => {
                            (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'
                            ;(e.currentTarget as HTMLDivElement).style.background = '#161b27'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: `0 0 20px ${color}50` }}>
                              🤖
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{c?.widget_name || c?.name}</div>
                              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{c?.name} · {createdYear}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ fontSize: 11, fontWeight: 600, color: planColor, background: planColor + '18', padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>
                              {c?.plan}
                            </span>
                            <span style={{ fontSize: 12, color: c?.active ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c?.active ? '#4ade80' : '#f87171' }} />
                              {c?.active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  }

                  return (
                    <Link key={bot.client_id} href={`/admin/clients/${bot.client_id}`} style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14,
                          padding: viewMode === 'grande' ? '22px 20px' : '14px 12px',
                          cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', minHeight: viewMode === 'grande' ? 200 : 120,
                          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        }}
                        onMouseOver={e => {
                          const el = e.currentTarget as HTMLDivElement
                          el.style.borderColor = color + '60'
                          el.style.transform = 'translateY(-2px)'
                          el.style.boxShadow = `0 8px 32px ${color}20`
                        }}
                        onMouseOut={e => {
                          const el = e.currentTarget as HTMLDivElement
                          el.style.borderColor = 'rgba(255,255,255,0.07)'
                          el.style.transform = 'translateY(0)'
                          el.style.boxShadow = 'none'
                        }}
                      >
                        <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle, ${color}30, transparent)`, pointerEvents: 'none' }} />

                        <div style={{ width: viewMode === 'grande' ? 44 : 32, height: viewMode === 'grande' ? 44 : 32, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: viewMode === 'grande' ? 22 : 16, boxShadow: `0 0 20px ${color}50`, flexShrink: 0 }}>
                          🤖
                        </div>

                        <div>
                          <div style={{ fontSize: viewMode === 'grande' ? 16 : 12, fontWeight: 600, color: 'white', marginBottom: 2 }}>
                            {c?.widget_name || c?.name}
                          </div>
                          <div style={{ fontSize: 11, color: '#475569' }}>
                            {c?.name}{createdYear ? ` · ${createdYear}` : ''}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: viewMode === 'grande' ? 12 : 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: planColor, background: planColor + '18', padding: '2px 8px', borderRadius: 16, textTransform: 'uppercase' }}>
                            {c?.plan}
                          </span>
                          <span style={{ fontSize: 11, color: c?.active ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: c?.active ? '#4ade80' : '#f87171' }} />
                            {c?.active ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}

                {/* Añadir nuevo chat */}
                {bots.length < PLAN_BOTS[plan] && (
                  <Link href="/dashboard/new" style={{ textDecoration: 'none' }}>
                    <div style={{
                      background: 'rgba(99,102,241,0.03)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 14,
                      padding: viewMode === 'grande' ? '22px 20px' : '14px 12px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      minHeight: viewMode === 'grande' ? 200 : 120,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    }}
                      onMouseOver={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.08)'}
                      onMouseOut={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.03)'}
                    >
                      <div style={{ fontSize: viewMode === 'grande' ? 28 : 20, marginBottom: viewMode === 'grande' ? 12 : 8 }}>+</div>
                      <div style={{ fontSize: viewMode === 'grande' ? 13 : 11, fontWeight: 600, color: '#818cf8' }}>Nuevo chat</div>
                      {viewMode === 'grande' && <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>Te quedan {PLAN_BOTS[plan] - bots.length} slot{PLAN_BOTS[plan] - bots.length > 1 ? 's' : ''}</div>}
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Stats Panel */}
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(129,140,248,0.1), rgba(99,102,241,0.05))',
              border: '1px solid rgba(129,140,248,0.2)',
              borderRadius: 16, padding: 24, position: 'sticky', top: 80,
            }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>📌 Plan actual</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: planColor, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                  {plan}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                  {price}€
                </div>
                <div style={{ fontSize: 12, color: '#475569' }}>/mes</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 12 }}>
                <div style={{ color: '#94a3b8', marginBottom: 8 }}>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>📅 Próx. factura:</span> {nextBillingDate}
                </div>
                <div style={{ color: '#94a3b8' }}>
                  <span style={{ color: '#818cf8', fontWeight: 600 }}>📊 Mensajes:</span> 1,240/3,000
                </div>
              </div>

              <button style={{
                width: '100%', padding: '10px 16px', borderRadius: 10, border: `1px solid ${planColor}`,
                background: 'transparent', color: planColor, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = planColor + '15'
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                Cambiar plan
              </button>
            </div>
          </div>
        </div>

        {/* Tabs: Facturación + Configuración */}
        <div style={{ marginTop: 40 }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 24, display: 'flex', gap: 24 }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '12px 0', border: 'none', background: 'none', fontSize: 13, fontWeight: activeTab === 'overview' ? 700 : 400,
                color: activeTab === 'overview' ? '#818cf8' : '#64748b', borderBottom: `2px solid ${activeTab === 'overview' ? '#818cf8' : 'transparent'}`,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('facturacion')}
              style={{
                padding: '12px 0', border: 'none', background: 'none', fontSize: 13, fontWeight: activeTab === 'facturacion' ? 700 : 400,
                color: activeTab === 'facturacion' ? '#818cf8' : '#64748b', borderBottom: `2px solid ${activeTab === 'facturacion' ? '#818cf8' : 'transparent'}`,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              💳 Facturación
            </button>
            <button
              onClick={() => setActiveTab('config')}
              style={{
                padding: '12px 0', border: 'none', background: 'none', fontSize: 13, fontWeight: activeTab === 'config' ? 700 : 400,
                color: activeTab === 'config' ? '#818cf8' : '#64748b', borderBottom: `2px solid ${activeTab === 'config' ? '#818cf8' : 'transparent'}`,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              ⚙️ Configuración
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'overview' && (
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
              <p>Resumen de tu actividad y uso. Próximamente: gráficos detallados.</p>
            </div>
          )}

          {activeTab === 'facturacion' && (
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
              <p>Historial de invoices, métodos de pago y próximas facturas. Próximamente: gestión de pagos.</p>
            </div>
          )}

          {activeTab === 'config' && (
            <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
              <p>Cambiar contraseña, datos de cuenta y preferencias. Próximamente: más opciones.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
