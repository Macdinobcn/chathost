'use client'
// app/dashboard/page.tsx
// Si el usuario tiene 1 bot → redirige directo al panel
// Si tiene varios → muestra selector de bots

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PLAN_BOTS: Record<string, number> = {
  trial: 1, basic: 1, starter: 1, pro: 3, business: 10, agency: 30,
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

const PLAN_COLOR: Record<string, string> = {
  trial: '#6366f1', starter: '#22c55e', pro: '#818cf8',
  business: '#c084fc', agency: '#fb923c',
}

const ADMIN_EMAILS = ['alexcollspeyra@gmail.com', 'chathostapp@gmail.com']

export default function DashboardPage() {
  const router = useRouter()
  const [bots, setBots] = useState<BotEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [maxBots, setMaxBots] = useState(1)
  const [activeTab, setActiveTab] = useState('chats')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { router.push('/auth/login'); return }
      if (user.email && ADMIN_EMAILS.includes(user.email)) { router.push('/admin'); return }

      // Redirigir a home en lugar de mostrar el dashboard
      router.push('/home')

      const { data } = await supabase
        .from('client_users')
        .select('client_id, clients(name, plan, active, widget_color, widget_name, created_at)')
        .eq('email', user.email)

      if (!data || data.length === 0) { router.push('/auth/login'); return }

      const entries = data as unknown as BotEntry[]
      const plan = (entries[0]?.clients as any)?.plan || 'trial'
      setMaxBots(PLAN_BOTS[plan] ?? 1)
      setBots(entries)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060914' }}>
      <div style={{ textAlign: 'center' }}>
        <img src="/logo.png" alt="ChatHost.ai" style={{ height: 40, marginBottom: 16 }} />
        <p style={{ color: '#475569', fontSize: 14, fontFamily: 'sans-serif' }}>Cargando tus chatbots...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#060914', fontFamily: 'Outfit, -apple-system, sans-serif', color: '#f1f5f9' }}>

      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(6,9,20,0.9)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <img src="/logo.png" alt="ChatHost.ai" style={{ height: 36 }} />
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push('/auth/login'))}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
          Cerrar sesión
        </button>
      </nav>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(6,9,20,0.5)', backdropFilter: 'blur(10px)', position: 'sticky', top: 64, zIndex: 9 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', display: 'flex', gap: 0 }}>
          <button
            onClick={() => setActiveTab('chats')}
            style={{
              padding: '14px 20px', border: 'none', background: 'none', fontSize: 13, fontWeight: activeTab === 'chats' ? 700 : 400,
              color: activeTab === 'chats' ? '#818cf8' : '#64748b', borderBottom: `2px solid ${activeTab === 'chats' ? '#818cf8' : 'transparent'}`,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            📌 Mis chats
          </button>
          <button
            onClick={() => setActiveTab('config')}
            style={{
              padding: '14px 20px', border: 'none', background: 'none', fontSize: 13, fontWeight: activeTab === 'config' ? 700 : 400,
              color: activeTab === 'config' ? '#818cf8' : '#64748b', borderBottom: `2px solid ${activeTab === 'config' ? '#818cf8' : 'transparent'}`,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            ⚙️ Configuración
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px' }}>

        {/* TAB: MIS CHATS */}
        {activeTab === 'chats' && (
        <>
        {/* Header */}
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✦ Dashboard
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 34, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Mis chats
            </h1>
            <p style={{ fontSize: 14, color: '#475569' }}>
              <strong style={{ color: '#94a3b8' }}>{bots.length}</strong> de <strong style={{ color: '#94a3b8' }}>{maxBots}</strong> chatbots usados en tu plan.
            </p>
          </div>
          {bots.length < maxBots && (
            <Link href="/dashboard/new" style={{ textDecoration: 'none' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nuevo chatbot
              </button>
            </Link>
          )}
        </div>

        {/* Grid de bots */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 }}>
          {bots.map(bot => {
            const c = bot.clients as any
            const color = c?.widget_color || PLAN_COLOR[c?.plan] || '#6366f1'
            const planColor = PLAN_COLOR[c?.plan] || '#6366f1'
            const createdYear = c?.created_at ? new Date(c.created_at).getFullYear() : ''

            return (
              <Link key={bot.client_id} href={`/admin/clients/${bot.client_id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '22px 20px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
                  onMouseOver={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = color + '60'
                    el.style.transform = 'translateY(-3px)'
                    el.style.boxShadow = `0 8px 32px ${color}20`
                  }}
                  onMouseOut={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = 'rgba(255,255,255,0.07)'
                    el.style.transform = 'translateY(0)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  {/* Glow top-right */}
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${color}30, transparent)`, pointerEvents: 'none' }} />

                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14, boxShadow: `0 0 20px ${color}50`, flexShrink: 0 }}>
                    🤖
                  </div>

                  <div style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 3, lineHeight: 1.3 }}>
                    {c?.widget_name || c?.name || 'Chatbot'}
                  </div>
                  <div style={{ fontSize: 12, color: '#475569', marginBottom: 16 }}>
                    {c?.name}{createdYear ? ` · ${createdYear}` : ''}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: planColor, background: planColor + '18', padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {c?.plan || 'trial'}
                    </span>
                    <span style={{ fontSize: 12, color: c?.active ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c?.active ? '#4ade80' : '#f87171', display: 'inline-block' }} />
                      {c?.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}

          {/* Tarjeta añadir / límite */}
          {bots.length < maxBots ? (
            <Link href="/dashboard/new" style={{ textDecoration: 'none' }}>
              <div
                style={{ background: 'rgba(99,102,241,0.03)', border: '1px dashed rgba(99,102,241,0.3)', borderRadius: 16, padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.08)' }}
                onMouseOut={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99,102,241,0.03)' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 10, color: '#818cf8' }}>+</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#818cf8', marginBottom: 4 }}>Nuevo chatbot</div>
                <div style={{ fontSize: 11, color: '#334155' }}>Te quedan {maxBots - bots.length} slot{maxBots - bots.length > 1 ? 's' : ''}</div>
              </div>
            </Link>
          ) : (
            <div style={{ background: 'rgba(99,102,241,0.03)', border: '1px dashed rgba(99,102,241,0.1)', borderRadius: 16, padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 160, textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.6 }}>
                Has alcanzado el límite de tu plan.<br />
                <a href="mailto:hola@chathost.ai" style={{ color: '#6366f1', textDecoration: 'none' }}>Ampliar plan</a>
              </div>
            </div>
          )}
        </div>
        </>
        )}

        {/* TAB: CONFIGURACIÓN */}
        {activeTab === 'config' && (
          <div>
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>⚙️ Configuración</h2>
              <p style={{ fontSize: 14, color: '#475569' }}>Próximamente: ajustes del dashboard, preferencias y más.</p>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
              <div style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
                Esta sección se está preparando.<br />
                Vuelve pronto para más opciones.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
