'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewChatbotPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function crear() {
    if (!name.trim() || !url.trim()) { setError('Completa todos los campos'); return }
    setLoading(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth/login'); return }

    const res = await fetch('/api/my/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ name: name.trim(), website_url: url.trim() }),
    })
    const data = await res.json()

    if (!res.ok) { setError(data.error || 'Error creando chatbot'); setLoading(false); return }

    router.push(`/admin/clients/${data.client.id}`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060914', fontFamily: 'Outfit, -apple-system, sans-serif', color: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(6,9,20,0.9)', backdropFilter: 'blur(20px)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <img src="/logo.png" alt="ChatHost.ai" style={{ height: 36 }} />
        </Link>
        <Link href="/dashboard" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: 13, padding: '7px 16px', borderRadius: 8, cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit' }}>
          ← Volver
        </Link>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 20px' }}>
              🤖
            </div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Nuevo chatbot
            </h1>
            <p style={{ fontSize: 14, color: '#475569' }}>
              Empieza con el nombre y la URL de tu negocio.<br />El resto lo configuras dentro.
            </p>
          </div>

          {/* Form */}
          <div style={{ background: '#161b27', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Nombre del negocio
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Camping La Siesta"
                style={{ width: '100%', background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                onKeyDown={e => e.key === 'Enter' && crear()}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                URL de tu web
              </label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://tucamping.com"
                style={{ width: '100%', background: '#0f1420', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', fontSize: 14, color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }}
                onKeyDown={e => e.key === 'Enter' && crear()}
              />
              <p style={{ fontSize: 11, color: '#334155', marginTop: 6 }}>
                Usaremos esta URL para entrenar automáticamente tu chatbot.
              </p>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 20 }}>
                {error}
              </div>
            )}

            <button
              onClick={crear}
              disabled={loading}
              style={{ width: '100%', background: loading ? '#1e293b' : 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, color: loading ? '#475569' : 'white', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            >
              {loading ? 'Creando chatbot...' : 'Crear chatbot →'}
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#1e293b', marginTop: 20 }}>
            Podrás personalizar el nombre, colores e instrucciones dentro del panel.
          </p>
        </div>
      </div>
    </div>
  )
}
