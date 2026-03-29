'use client'
// app/contacto/page.tsx

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al enviar')
      }
      setSent(true)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
    border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
    color: 'white', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Outfit, -apple-system, sans-serif',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#060914 0%,#1e1b4b 100%)',
      fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, sans-serif',
      color: '#f1f5f9',
    }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6,9,20,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 48px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/logo.png" alt="ChatHost.ai" style={{ height: 36, width: 'auto' }} />
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 16px' }}>Entrar</Link>
          <Link href="/auth/register" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontSize: 14, fontWeight: 600, padding: '9px 20px', borderRadius: 8, textDecoration: 'none' }}>Empezar gratis →</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>

          {/* Izquierda — info */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a78bfa', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ✦ Contacto
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 42, fontWeight: 700, lineHeight: 1.15, color: 'white', marginBottom: 16, letterSpacing: '-0.02em' }}>
              Hablemos sobre<br /><em style={{ fontStyle: 'italic', background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>tu negocio</em>
            </h1>
            <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.75, marginBottom: 36, fontWeight: 300 }}>
              ¿Tienes dudas sobre cómo ChatHost.ai puede ayudarte? ¿Quieres una demo personalizada? Escríbenos y te respondemos en menos de 24 horas.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '📧', title: 'Email', val: 'hola@chathost.ai', href: 'mailto:hola@chathost.ai' },
                { icon: '🌐', title: 'Web', val: 'chathost.ai', href: 'https://chathost.ai' },
                { icon: '🏢', title: 'Empresa', val: 'Arandai — Madrid, España', href: 'https://arandai.com' },
              ].map(c => (
                <a key={c.title} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{c.title}</div>
                    <div style={{ fontSize: 14, color: '#94a3b8' }}>{c.val}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Derecha — formulario */}
          <div style={{ background: '#1e293b', borderRadius: 20, padding: '36px 32px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: 'white', marginBottom: 8 }}>¡Mensaje enviado!</h2>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>Te respondemos en menos de 24 horas. Revisa tu bandeja de entrada.</p>
                <Link href="/" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontSize: 14, fontWeight: 600, padding: '11px 24px', borderRadius: 10, textDecoration: 'none' }}>
                  Volver al inicio
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 24 }}>Envíanos un mensaje</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre *</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Tu nombre" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email *</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="tu@empresa.com" style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = '#6366f1')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')} />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Empresa</label>
                  <input type="text" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Nombre de tu negocio (opcional)" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#6366f1')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mensaje *</label>
                  <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Cuéntanos sobre tu negocio y qué necesitas..."
                    rows={5}
                    style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                    onFocus={e => (e.target.style.borderColor = '#6366f1')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')} />
                </div>

                {error && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                  {loading ? 'Enviando...' : 'Enviar mensaje →'}
                </button>

                <p style={{ fontSize: 11, color: '#334155', textAlign: 'center', marginTop: 12 }}>
                  Respondemos en menos de 24 horas
                </p>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Footer mínimo */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, color: '#334155' }}>© 2026 ChatHost.ai · <a href="https://arandai.com" target="_blank" rel="noreferrer" style={{ color: '#334155', textDecoration: 'none' }}>Producto creado por Arandai.com</a></p>
        <Link href="/" style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>← Volver al inicio</Link>
      </div>
    </div>
  )
}
