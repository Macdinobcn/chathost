'use client';
// app/auth/register/page.tsx
// Registro — mismo flujo magic link que login, copy diferente

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function RegisterPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true); setError('');
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (authError) setError(authError.message);
    else setSent(true);
  }

  async function handleGoogle() {
    setLoadingGoogle(true); setError('');
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) { setError(authError.message); setLoadingGoogle(false); }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 20, padding: '44px 40px',
        width: '100%', maxWidth: 420,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/">
            <img src="/logo.png" alt="ChatHost.ai" style={{ height: 36, width: 'auto', marginBottom: 14 }} />
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>Empieza gratis — 15 días</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Sin tarjeta de crédito · 100 mensajes incluidos</p>
        </div>

        {/* Trial badge */}
        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎁</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8' }}>TRIAL GRATUITO</div>
            <div style={{ fontSize: 11, color: '#475569' }}>Acceso completo durante 15 días</div>
          </div>
        </div>

        {!sent ? (
          <>
            {/* Google */}
            <button onClick={handleGoogle} disabled={loadingGoogle}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginBottom: 20, fontFamily: 'inherit',
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loadingGoogle ? 'Conectando...' : 'Registrarse con Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 12, color: '#475569' }}>o con tu email</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            <form onSubmit={handleMagicLink}>
              <div style={{ marginBottom: 16 }}>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="tu@empresa.com" required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10, fontSize: 14,
                    border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                    color: 'white', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                  onFocus={e => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#f87171', marginBottom: 14 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading || !email.trim()}
                style={{
                  width: '100%', padding: 13, borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
                  color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                }}>
                {loading ? 'Enviando...' : 'Crear cuenta gratis →'}
              </button>

              <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 12 }}>
                Te enviamos un link mágico. Sin contraseña.
              </p>
            </form>

            <p style={{ fontSize: 12, color: '#334155', textAlign: 'center', marginTop: 20 }}>
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" style={{ color: '#6366f1', textDecoration: 'none' }}>Entrar</Link>
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>¡Revisa tu email!</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 6 }}>Hemos enviado un link a:</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#818cf8', marginBottom: 20 }}>{email}</p>
            <p style={{ fontSize: 13, color: '#475569' }}>Haz click en el link para activar tu cuenta. Expira en 60 minutos.</p>
            <button onClick={() => { setSent(false); setEmail(''); }}
              style={{ marginTop: 16, background: 'none', border: 'none', color: '#6366f1', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
              Usar otro email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
