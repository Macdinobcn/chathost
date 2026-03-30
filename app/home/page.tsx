'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PlanModal from '@/components/PlanModal'

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

const THEMES = {
  dark: {
    bg: '#060914',
    bgNav: 'rgba(6,9,20,0.9)',
    bgCard: '#161b27',
    bgInput: 'rgba(255,255,255,0.05)',
    text: '#f1f5f9',
    textMuted: '#94a3b8',
    textDimmed: '#64748b',
    border: 'rgba(255,255,255,0.1)',
    borderLight: 'rgba(255,255,255,0.08)',
  },
  light: {
    bg: '#f8fafc',
    bgNav: 'rgba(248,250,252,0.95)',
    bgCard: '#ffffff',
    bgInput: 'rgba(15,23,42,0.05)',
    text: '#0f172a',
    textMuted: '#475569',
    textDimmed: '#64748b',
    border: 'rgba(15,23,42,0.1)',
    borderLight: 'rgba(15,23,42,0.08)',
  },
}

export default function HomePage() {
  const router = useRouter()
  const [bots, setBots] = useState<BotEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('trial')
  const [viewMode, setViewMode] = useState<'grande' | 'pequeño' | 'lista'>('grande')
  const [activeTab, setActiveTab] = useState('overview')
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [chatToDelete, setChatToDelete] = useState<string | null>(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')

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

  const t = THEMES[theme]

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'Outfit, -apple-system, sans-serif', color: t.text, transition: 'background-color 0.3s' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: `1px solid ${t.borderLight}`, padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: t.bgNav, backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20,
        transition: 'all 0.3s',
      }}>
        <img src="/logo.png" alt="ChatHost.ai" style={{ height: 36 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Theme Toggle */}
          <div style={{ display: 'flex', gap: 6, padding: '4px 6px', background: t.bgInput, borderRadius: 8 }}>
            <button
              onClick={() => setTheme('dark')}
              style={{
                padding: '6px 12px', borderRadius: 6, border: theme === 'dark' ? `1px solid #818cf8` : 'none',
                background: theme === 'dark' ? 'rgba(129,140,248,0.15)' : 'transparent',
                color: theme === 'dark' ? '#818cf8' : t.textDimmed,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              🌙 Noche
            </button>
            <button
              onClick={() => setTheme('light')}
              style={{
                padding: '6px 12px', borderRadius: 6, border: theme === 'light' ? `1px solid #818cf8` : 'none',
                background: theme === 'light' ? 'rgba(129,140,248,0.15)' : 'transparent',
                color: theme === 'light' ? '#818cf8' : t.textDimmed,
                fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}
            >
              ☀️ Día
            </button>
          </div>

          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/auth/login'))}
            style={{ background: 'none', border: `1px solid ${t.border}`, color: t.textDimmed, fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
            Cerrar sesión
          </button>
        </div>
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
              background: theme === 'dark' ? 'linear-gradient(135deg, rgba(129,140,248,0.1), rgba(99,102,241,0.05))' : 'linear-gradient(135deg, rgba(129,140,248,0.05), rgba(99,102,241,0.02))',
              border: `1px solid ${theme === 'dark' ? 'rgba(129,140,248,0.2)' : 'rgba(129,140,248,0.15)'}`,
              borderRadius: 16, padding: 24, position: 'sticky', top: 80, transition: 'all 0.3s',
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

              <button
                onClick={() => setShowPlanModal(true)}
                style={{
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
          <div style={{ borderBottom: `1px solid ${t.borderLight}`, marginBottom: 24, display: 'flex', gap: 24, transition: 'all 0.3s' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
              {/* LEFT: Gráfico + Listado */}
              <div>
                {/* Gráfico de Pie simple */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>Distribución de mensajes por chat</h3>
                  <svg width="200" height="200" style={{ display: 'block', margin: '0 auto' }}>
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#818cf8" strokeWidth="20" strokeDasharray="176 440" />
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="154 440" strokeDashoffset="-176" />
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#f97316" strokeWidth="20" strokeDasharray="110 440" strokeDashoffset="-330" />
                  </svg>
                  <div style={{ marginTop: 16, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#818cf8' }} />
                      <span style={{ color: '#94a3b8' }}>Zoe: 40%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                      <span style={{ color: '#94a3b8' }}>Luna: 35%</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316' }} />
                      <span style={{ color: '#94a3b8' }}>Test: 25%</span>
                    </div>
                  </div>
                </div>

                {/* Listado de chats con % */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 12 }}>Mensajes por chat</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { name: 'Zoe', msgs: 496, total: 1240, color: '#818cf8' },
                      { name: 'Luna', msgs: 434, total: 1240, color: '#22c55e' },
                      { name: 'Test', msgs: 310, total: 1240, color: '#f97316' },
                    ].map(chat => (
                      <div key={chat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, color: 'white', fontWeight: 500 }}>{chat.name}</span>
                          <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 600 }}>{chat.msgs} msgs · {Math.round((chat.msgs / chat.total) * 100)}%</span>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
                          <div style={{ background: chat.color, height: '100%', width: `${(chat.msgs / chat.total) * 100}%`, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT: Stats generales */}
              <div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20 }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>📊 Uso total</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#818cf8' }}>41%</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>de tu cuota este mes</div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Usados</span>
                        <span style={{ color: '#818cf8', fontWeight: 600 }}>1,240</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span>Disponibles</span>
                        <span style={{ color: '#22c55e', fontWeight: 600 }}>3,000</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Restantes</span>
                        <span style={{ color: '#f97316', fontWeight: 600 }}>1,760</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: '#22c55e', fontWeight: 600, marginBottom: 4 }}>✓ Chats activos</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>2 de 3</div>
                  </div>

                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ color: '#64748b' }}>Promedio/chat:</span> <span style={{ color: 'white', fontWeight: 600 }}>413 msgs</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Trending:</span> <span style={{ color: '#22c55e', fontWeight: 600 }}>↑ +120 esta semana</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'facturacion' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, marginBottom: 32 }}>
                {/* INVOICES */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>Historial de facturas</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { date: '2 abr 2026', amount: 49, status: 'Pagado', id: 'INV-2604-001' },
                      { date: '2 mar 2026', amount: 49, status: 'Pagado', id: 'INV-0203-001' },
                      { date: '2 feb 2026', amount: 49, status: 'Pagado', id: 'INV-0202-001' },
                    ].map(inv => (
                      <div key={inv.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{inv.id}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{inv.date}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>{inv.amount}€</div>
                            <div style={{ fontSize: 11, color: '#22c55e', marginTop: 2 }}>{inv.status}</div>
                          </div>
                          <a href="#" style={{ color: '#818cf8', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>📥 Descargar</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MÉTODO DE PAGO */}
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>💳 Método de pago</h3>
                  <div style={{ background: 'linear-gradient(135deg, rgba(129,140,248,0.1), rgba(99,102,241,0.05))', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, color: 'white', marginBottom: 6 }}>Visa •••• 4242</div>
                      <div>Expira: 12/27</div>
                    </div>
                    <button style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(129,140,248,0.3)', background: 'transparent', color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Actualizar
                    </button>
                  </div>
                </div>
              </div>

              {/* DOWNGRADE SUGERIDO */}
              <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ fontSize: 28 }}>💡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#22c55e', marginBottom: 4 }}>Ahorra dinero con un plan más pequeño</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 }}>
                      Actualmente tienes <strong style={{ color: 'white' }}>Business (99€)</strong> pero solo usas 6 bots y 2,500 mensajes.
                      Cambiando a <strong style={{ color: 'white' }}>Pro + 3 bots extra (79€)</strong> ahorras <strong style={{ color: '#22c55e' }}>20€ cada mes</strong>.
                    </div>
                    <button
                      onClick={() => setShowPlanModal(true)}
                      style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#22c55e', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      Ver opciones de ahorro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {/* PERFIL */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>👤 Perfil</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: t.textDimmed, display: 'block', marginBottom: 6 }}>Email</label>
                    <input type="email" disabled defaultValue="user@example.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.border}`, background: t.bgInput, color: t.textMuted, fontSize: 13, fontFamily: 'inherit', transition: 'all 0.3s' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Nombre</label>
                    <input type="text" defaultValue="Tu nombre" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Teléfono</label>
                    <input type="tel" placeholder="+34 123 456 789" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontFamily: 'inherit' }} />
                  </div>
                  <button style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#818cf8', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Guardar cambios
                  </button>
                </div>
              </div>

              {/* SEGURIDAD */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>🔐 Seguridad</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Contraseña actual</label>
                    <input type="password" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontFamily: 'inherit' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Nueva contraseña</label>
                    <input type="password" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontFamily: 'inherit' }} />
                  </div>
                  <button style={{ padding: '10px 16px', borderRadius: 8, border: 'none', background: '#818cf8', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cambiar contraseña
                  </button>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16, marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>2FA (Autenticación de dos factores)</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Protege tu cuenta con una capa extra</div>
                      </div>
                      <button style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #818cf8', background: 'transparent', color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Activar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTIFICACIONES */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>🔔 Notificaciones</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Alertas de facturación', desc: 'Recibe email cuando se cobre tu plan' },
                    { label: 'Alertas de uso', desc: 'Te aviso cuando uses el 80% de mensajes' },
                    { label: 'Reportes semanales', desc: 'Resumen de actividad cada lunes' },
                  ].map(n => (
                    <div key={n.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'white' }}>{n.label}</div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.desc}</div>
                      </div>
                      <div style={{ marginLeft: 12 }}>
                        <input type="checkbox" defaultChecked style={{ width: 20, height: 20, cursor: 'pointer' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PREFERENCIAS */}
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 16 }}>🌍 Preferencias</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Idioma</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontFamily: 'inherit' }}>
                      <option>Español</option>
                      <option>English</option>
                      <option>Français</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Zona horaria</label>
                    <select style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, fontFamily: 'inherit' }}>
                      <option>Europa/Madrid (UTC+1)</option>
                      <option>Europa/Londres (UTC+0)</option>
                      <option>América/Nueva York (UTC-5)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ZONA DE PELIGRO */}
              <div style={{ gridColumn: '1 / -1', borderTop: `2px solid rgba(239,68,68,0.2)`, paddingTop: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', marginBottom: 16 }}>⚠️ Zona de peligro</h3>

                {/* ELIMINAR CHAT */}
                <div style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Eliminar chat</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Esta acción no se puede deshacer. Se eliminarán todos los datos del chat.</div>
                  </div>

                  {!chatToDelete ? (
                    <>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Selecciona el chat a eliminar</label>
                      <select
                        onChange={(e) => setChatToDelete(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: 'white', fontSize: 13, fontFamily: 'inherit', marginBottom: 12 }}>
                        <option value="">-- Selecciona un chat --</option>
                        {bots.map(bot => {
                          const c = bot.clients as any
                          return <option key={bot.client_id} value={bot.client_id}>{c?.widget_name || c?.name}</option>
                        })}
                      </select>
                    </>
                  ) : (
                    <>
                      <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 8 }}>
                          <strong>⚠️ Confirma que deseas eliminar este chat</strong>
                        </div>
                        <div style={{ fontSize: 13, color: 'white', marginBottom: 10, fontWeight: 500 }}>
                          {bots.find(b => b.client_id === chatToDelete)?.clients?.widget_name || 'Chat seleccionado'}
                        </div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', display: 'block', marginBottom: 6 }}>Escribe el nombre exacto del chat:</label>
                        <input
                          type="text"
                          placeholder="Ej: Zoe"
                          value={deleteConfirmInput}
                          onChange={(e) => setDeleteConfirmInput(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: 'white', fontSize: 13, fontFamily: 'inherit', marginBottom: 12 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => { setChatToDelete(null); setDeleteConfirmInput('') }}
                          style={{ padding: '8px 16px', borderRadius: 6, border: `1px solid ${t.border}`, background: 'transparent', color: t.textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Cancelar
                        </button>
                        <button
                          disabled={deleteConfirmInput !== (bots.find(b => b.client_id === chatToDelete)?.clients?.widget_name || '')}
                          style={{
                            padding: '8px 16px', borderRadius: 6, border: 'none', background: '#ef4444', color: 'white', fontSize: 12, fontWeight: 600,
                            cursor: deleteConfirmInput === (bots.find(b => b.client_id === chatToDelete)?.clients?.widget_name || '') ? 'pointer' : 'not-allowed',
                            opacity: deleteConfirmInput === (bots.find(b => b.client_id === chatToDelete)?.clients?.widget_name || '') ? 1 : 0.5,
                            fontFamily: 'inherit'
                          }}>
                          🗑️ Eliminar chat
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Modal */}
      <PlanModal isOpen={showPlanModal} currentPlan={plan} onClose={() => setShowPlanModal(false)} />
    </div>
  )
}
