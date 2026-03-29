import Link from 'next/link'

export const metadata = {
  title: 'ChatHost.ai — Chatbot IA para tu negocio',
  description: 'ChatHost.ai lee tu web, aprende sobre tu negocio y atiende a tus clientes con respuestas precisas. Sin código. Sin complicaciones.',
}

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --blue: #3b82f6; --blue-light: #60a5fa; --indigo: #6366f1;
          --dark: #060914; --dark2: #0d1117; --dark3: #161b27; --dark4: #1e2636;
          --border: rgba(255,255,255,0.08); --text: #f1f5f9; --text2: #94a3b8; --text3: #475569;
          --grad: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          --grad-text: linear-gradient(135deg, #60a5fa, #a78bfa);
        }
        html { scroll-behavior: smooth; }
        body { font-family: 'Outfit', sans-serif; background: var(--dark); color: var(--text); line-height: 1.6; -webkit-font-smoothing: antialiased; }
        nav { position: sticky; top: 0; z-index: 100; background: rgba(6,9,20,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); padding: 0 48px; height: 64px; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .logo-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--grad); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; color: white; box-shadow: 0 0 20px rgba(99,102,241,0.4); }
        .logo-text { font-size: 18px; font-weight: 700; color: white; letter-spacing: -0.02em; }
        .nav-links { display: flex; gap: 36px; }
        .nav-links a { text-decoration: none; color: var(--text2); font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .nav-links a:hover { color: white; }
        .nav-right { display: flex; align-items: center; gap: 12px; }
        .btn-ghost-dark { text-decoration: none; color: var(--text2); font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 8px; transition: all 0.2s; border: 1px solid transparent; }
        .btn-ghost-dark:hover { color: white; border-color: var(--border); }
        .btn-grad { text-decoration: none; background: var(--grad); color: white; font-size: 14px; font-weight: 600; padding: 9px 20px; border-radius: 8px; border: none; cursor: pointer; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 0 24px rgba(99,102,241,0.35); }
        .btn-grad:hover { opacity: 0.9; transform: translateY(-1px); }
        .hero { padding: 100px 48px 80px; max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
        .hero-pill { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.3); color: #a78bfa; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; margin-bottom: 28px; letter-spacing: 0.05em; text-transform: uppercase; animation: fadeUp 0.5s ease both; }
        .hero-pill span { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; display: inline-block; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        .hero h1 { font-family: 'Playfair Display', serif; font-size: 58px; line-height: 1.1; font-weight: 700; margin-bottom: 24px; color: white; letter-spacing: -0.02em; animation: fadeUp 0.5s 0.1s ease both; }
        .hero h1 em { font-style: italic; background: var(--grad-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 18px; color: var(--text2); line-height: 1.75; margin-bottom: 36px; font-weight: 300; animation: fadeUp 0.5s 0.2s ease both; }
        .hero-actions { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; animation: fadeUp 0.5s 0.3s ease both; }
        .btn-large-grad { text-decoration: none; background: var(--grad); color: white; font-size: 15px; font-weight: 600; padding: 15px 30px; border-radius: 10px; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 0 40px rgba(99,102,241,0.4); }
        .btn-large-grad:hover { opacity: 0.9; transform: translateY(-2px); box-shadow: 0 8px 40px rgba(99,102,241,0.5); }
        .btn-large-outline { text-decoration: none; color: var(--text2); font-size: 15px; font-weight: 500; padding: 15px 30px; border-radius: 10px; border: 1px solid var(--border); display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-large-outline:hover { border-color: rgba(255,255,255,0.2); color: white; }
        .widget-wrap { position: relative; animation: fadeUp 0.6s 0.15s ease both; }
        .widget-dark { background: var(--dark3); border: 1px solid var(--border); border-radius: 20px; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04); max-width: 340px; margin-left: auto; }
        .widget-dark-header { background: var(--grad); padding: 16px 18px; display: flex; align-items: center; gap: 10px; }
        .widget-dark-avatar { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .widget-dark-name { color: white; font-weight: 600; font-size: 14px; }
        .widget-dark-status { color: rgba(255,255,255,0.7); font-size: 12px; display: flex; align-items: center; gap: 4px; }
        .widget-dark-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; }
        .widget-dark-msgs { padding: 16px; display: flex; flex-direction: column; gap: 12px; background: var(--dark3); }
        .dmsg-bot { background: var(--dark4); border: 1px solid var(--border); border-radius: 4px 14px 14px 14px; padding: 10px 14px; font-size: 13px; color: var(--text); max-width: 85%; line-height: 1.5; }
        .dmsg-user { background: var(--grad); border-radius: 14px 4px 14px 14px; padding: 10px 14px; font-size: 13px; color: white; max-width: 85%; align-self: flex-end; line-height: 1.5; }
        .widget-dark-input { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; align-items: center; background: var(--dark3); }
        .widget-dark-field { flex: 1; background: var(--dark4); border: 1px solid var(--border); border-radius: 20px; padding: 8px 14px; font-size: 13px; color: var(--text2); font-family: 'Outfit', sans-serif; outline: none; }
        .widget-dark-send { width: 32px; height: 32px; border-radius: 50%; background: var(--grad); border: none; cursor: pointer; color: white; font-size: 14px; display: flex; align-items: center; justify-content: center; }
        .widget-dark-powered { text-align: center; padding: 8px; font-size: 11px; color: var(--text3); background: var(--dark3); }
        .widget-dark-powered a { color: var(--blue-light); text-decoration: none; }
        .glow-ball { position: absolute; width: 300px; height: 300px; border-radius: 50%; filter: blur(80px); opacity: 0.15; pointer-events: none; z-index: -1; }
        .glow-blue { background: #3b82f6; top: -50px; right: -50px; }
        .glow-purple { background: #8b5cf6; bottom: -50px; left: -50px; }
        .float-stat { position: absolute; bottom: -20px; left: -30px; background: var(--dark3); border: 1px solid var(--border); border-radius: 12px; padding: 12px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 10px; }
        .float-stat-num { font-size: 20px; font-weight: 800; color: white; }
        .float-stat-label { font-size: 11px; color: var(--text2); }
        .clients-strip { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 24px 48px; background: var(--dark2); }
        .clients-strip p { text-align: center; font-size: 11px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 16px; }
        .clients-logos { display: flex; align-items: center; justify-content: center; gap: 48px; flex-wrap: wrap; }
        .client-chip { font-size: 13px; font-weight: 600; color: var(--text3); letter-spacing: 0.04em; }
        .section { padding: 80px 48px; max-width: 1100px; margin: 0 auto; }
        .section-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); color: #a78bfa; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.08em; }
        .section-title { font-family: 'Playfair Display', serif; font-size: 44px; font-weight: 700; line-height: 1.15; margin-bottom: 16px; color: white; letter-spacing: -0.02em; }
        .section-title em { font-style: italic; background: var(--grad-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .section-sub { font-size: 17px; color: var(--text2); font-weight: 300; max-width: 520px; line-height: 1.7; }
        .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-top: 52px; }
        .step-dark { background: var(--dark3); border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; transition: border-color 0.2s; }
        .step-dark:hover { border-color: rgba(99,102,241,0.4); }
        .step-num-dark { width: 44px; height: 44px; border-radius: 12px; background: var(--grad); color: white; font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: 0 0 20px rgba(99,102,241,0.3); }
        .step-dark h3 { font-size: 17px; font-weight: 700; color: white; margin-bottom: 10px; }
        .step-dark p { font-size: 14px; color: var(--text2); line-height: 1.7; }
        .features-dark { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 52px; }
        .feature-dark { background: var(--dark3); border: 1px solid var(--border); border-radius: 14px; padding: 26px 22px; transition: border-color 0.2s, transform 0.2s; }
        .feature-dark:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
        .feature-icon-dark { width: 44px; height: 44px; border-radius: 10px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; }
        .feature-dark h3 { font-size: 15px; font-weight: 700; color: white; margin-bottom: 8px; }
        .feature-dark p { font-size: 13px; color: var(--text2); line-height: 1.7; }
        .pricing-wrap { background: var(--dark2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 80px 48px; }
        .pricing-inner { max-width: 1100px; margin: 0 auto; }
        .plan-dark { background: var(--dark3); border: 1px solid var(--border); border-radius: 16px; padding: 28px 22px; position: relative; transition: border-color 0.2s, transform 0.2s; }
        .plan-dark:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
        .plan-dark.hot { border-color: rgba(99,102,241,0.5); box-shadow: 0 0 40px rgba(99,102,241,0.15); }
        .plan-hot-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--grad); color: white; font-size: 11px; font-weight: 700; padding: 3px 14px; border-radius: 20px; white-space: nowrap; }
        .plan-icon-dark { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 14px; }
        .plan-name-dark { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
        .plan-price-dark { display: flex; align-items: baseline; gap: 3px; margin-bottom: 4px; }
        .plan-price-num-dark { font-family: 'Playfair Display', serif; font-size: 44px; color: white; line-height: 1; }
        .plan-price-per-dark { font-size: 13px; color: var(--text3); }
        .plan-msgs-dark { font-size: 13px; color: var(--text2); margin-bottom: 24px; }
        .plan-divider-dark { height: 1px; background: var(--border); margin-bottom: 18px; }
        .plan-features-dark { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
        .plan-features-dark li { font-size: 13px; color: var(--text2); display: flex; align-items: flex-start; gap: 8px; }
        .plan-features-dark li .ck { flex-shrink: 0; margin-top: 1px; font-weight: 700; }
        .plan-features-dark li .nx { flex-shrink: 0; margin-top: 1px; color: var(--text3); }
        .plan-cta-dark { display: block; text-align: center; text-decoration: none; padding: 11px; border-radius: 9px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
        .plan-cta-border { border: 1px solid var(--border); color: var(--text2); }
        .plan-cta-border:hover { border-color: rgba(255,255,255,0.2); color: white; }
        .plan-cta-grad { background: var(--grad); color: white; box-shadow: 0 0 20px rgba(99,102,241,0.3); }
        .plan-cta-grad:hover { opacity: 0.9; }
        .plan-extra-dark { margin-top: 10px; text-align: center; font-size: 12px; color: var(--text3); }
        .pricing-footer { margin-top: 28px; padding: 16px 24px; background: var(--dark3); border: 1px solid var(--border); border-radius: 10px; font-size: 13px; color: var(--text2); text-align: center; }
        .pricing-footer strong { color: white; }
        .testi-wrap { padding: 80px 48px; max-width: 860px; margin: 0 auto; text-align: center; }
        .stars-dark { color: #fbbf24; font-size: 20px; margin-bottom: 28px; letter-spacing: 4px; }
        .testi-quote { font-family: 'Playfair Display', serif; font-size: 26px; line-height: 1.6; color: white; font-style: italic; margin-bottom: 32px; }
        .testi-author { display: flex; align-items: center; justify-content: center; gap: 14px; }
        .testi-avatar { width: 46px; height: 46px; border-radius: 50%; background: var(--grad); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 18px; box-shadow: 0 0 20px rgba(99,102,241,0.3); }
        .testi-name { font-size: 14px; font-weight: 700; color: white; }
        .testi-role { font-size: 13px; color: var(--text2); }
        .cta-wrap { padding: 100px 48px; text-align: center; background: var(--dark2); border-top: 1px solid var(--border); position: relative; overflow: hidden; }
        .cta-glow { position: absolute; width: 600px; height: 400px; background: radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; }
        .cta-wrap h2 { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 700; color: white; line-height: 1.15; margin-bottom: 16px; position: relative; }
        .cta-wrap h2 em { font-style: italic; background: var(--grad-text); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .cta-wrap > p { font-size: 18px; color: var(--text2); margin-bottom: 40px; font-weight: 300; position: relative; }
        .cta-note { font-size: 13px; color: var(--text3); margin-top: 16px; position: relative; }
        footer { background: var(--dark); border-top: 1px solid var(--border); padding: 48px 48px 32px; }
        .footer-inner { max-width: 1100px; margin: 0 auto; }
        .footer-top { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 48px; }
        .footer-brand p { font-size: 13px; color: var(--text3); line-height: 1.7; margin-top: 12px; max-width: 240px; }
        .footer-col h4 { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px; }
        .footer-col a { display: block; font-size: 13px; color: var(--text3); text-decoration: none; margin-bottom: 10px; transition: color 0.2s; }
        .footer-col a:hover { color: var(--text2); }
        .footer-bottom { border-top: 1px solid var(--border); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; }
        .footer-bottom p { font-size: 12px; color: var(--text3); }
        @media (max-width: 900px) {
          .hero { grid-template-columns: 1fr; gap: 48px; padding: 60px 24px; }
          .hero h1 { font-size: 40px; }
          .widget-wrap { display: none; }
          .steps, .features-dark { grid-template-columns: 1fr; }
          .footer-top { grid-template-columns: 1fr 1fr; }
          nav { padding: 0 24px; }
          .nav-links { display: none; }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}} />

      {/* NAV */}
      <nav>
        <Link href="/" className="logo">
          <img src="/logo.png" alt="ChatHost.ai" style={{ height: 36, width: 'auto' }} />
        </Link>
        <div className="nav-links">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#precios">Precios</a>
          <a href="#clientes">Clientes</a>
        </div>
        <div className="nav-right">
          <Link href="/auth/login" className="btn-ghost-dark">Entrar</Link>
          <Link href="/auth/register" className="btn-grad">Empezar gratis →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="hero">
          <div className="hero-left">
            <div className="hero-pill"><span></span> IA para negocios locales</div>
            <h1>Tu negocio responde<br /><em>24 horas</em><br />sin que estés</h1>
            <p>ChatHost.ai lee tu web, aprende sobre tu negocio y atiende a tus clientes con respuestas precisas. Sin código. Sin complicaciones.</p>
            <div className="hero-actions">
              <Link href="/auth/register" className="btn-large-grad">Crear mi chatbot gratis →</Link>
              <a href="#como-funciona" className="btn-large-outline">Ver demo ↓</a>
            </div>

            {/* Trial pack */}
            <div style={{ marginTop: 28, background: 'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.15))', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 20, padding: '24px 28px', maxWidth: 460 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
                <div style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', borderRadius: 14, padding: '12px 18px', textAlign: 'center', flexShrink: 0, boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.02em' }}>0€</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 700, letterSpacing: '0.08em', marginTop: 2 }}>GRATIS</div>
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 6 }}>15 días de prueba</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span> 100 mensajes incluidos</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span> Sin tarjeta de crédito</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span> Cancela cuando quieras</div>
                  </div>
                </div>
              </div>
              <Link href="/auth/register" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', color: 'white', fontSize: 15, fontWeight: 700, padding: 14, borderRadius: 12, textDecoration: 'none', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                Empezar gratis ahora →
              </Link>
            </div>

            {/* Clientes reales */}
            <div style={{ marginTop: 28 }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Ya confían en ChatHost.ai</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <a href="https://astun.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', textDecoration: 'none' }}>
                  <span style={{ fontSize: 18 }}>⛷️</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Astún</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>astun.com</div>
                  </div>
                </a>
                <a href="https://candanchu.com" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 14px', textDecoration: 'none' }}>
                  <span style={{ fontSize: 18 }}>🏔️</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Candanchú</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>candanchu.com</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="widget-wrap">
            <div className="glow-ball glow-blue"></div>
            <div className="glow-ball glow-purple"></div>
            <div className="widget-dark">
              <div className="widget-dark-header">
                <div className="widget-dark-avatar">⛷️</div>
                <div>
                  <div className="widget-dark-name">Astún Candanchú</div>
                  <div className="widget-dark-status">En línea ahora</div>
                </div>
              </div>
              <div className="widget-dark-msgs">
                <div className="dmsg-bot">¡Hola! Soy el asistente de Astún. ¿En qué puedo ayudarte? 👋</div>
                <div className="dmsg-user">¿Cuánto cuesta el forfait de un día?</div>
                <div className="dmsg-bot">El forfait adulto cuesta <strong>42€</strong> en ventanilla o <strong>38€</strong> comprándolo online. ¿Te paso el enlace? 🎿</div>
              </div>
              <div className="widget-dark-input">
                <input className="widget-dark-field" placeholder="Escribe tu pregunta..." readOnly />
                <button className="widget-dark-send">↑</button>
              </div>
              <div className="widget-dark-powered">Powered by <a href="/">ChatHost.ai</a></div>
            </div>
            <div className="float-stat">
              <span style={{ fontSize: 22 }}>💬</span>
              <div>
                <div className="float-stat-num">7.400+</div>
                <div className="float-stat-label">conversaciones/año</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENTS STRIP */}
      <div className="clients-strip">
        <p>Empresas que ya usan ChatHost.ai</p>
        <div className="clients-logos">
          <span className="client-chip">⛷️ ASTÚN CANDANCHÚ</span>
          <span className="client-chip">🏕️ CAMPING LA SIESTA</span>
          <span className="client-chip">🎾 MENTAL PADEL</span>
          <span className="client-chip">🦷 CLÍNICA DENTAL ···</span>
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <div id="como-funciona">
        <div className="section">
          <div className="section-pill">✦ Cómo funciona</div>
          <h2 className="section-title">En 5 minutos tienes<br />un chatbot <em>que sabe todo</em></h2>
          <p className="section-sub">Sin código, sin configuraciones complicadas. Solo tu web y listo.</p>
          <div className="steps">
            <div className="step-dark">
              <div className="step-num-dark">1</div>
              <h3>Pega tu URL</h3>
              <p>Introduce la dirección de tu web. ChatHost.ai la lee entera y extrae toda la información relevante para tus clientes.</p>
            </div>
            <div className="step-dark">
              <div className="step-num-dark">2</div>
              <h3>IA genera tu base</h3>
              <p>En segundos, nuestra IA organiza precios, horarios, servicios y FAQs en una base de conocimiento inteligente.</p>
            </div>
            <div className="step-dark">
              <div className="step-num-dark">3</div>
              <h3>Pega el código</h3>
              <p>Copia una línea de código y pégala en tu web. El chatbot aparece al instante, listo para atender 24/7.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: 'var(--dark2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="section">
          <div className="section-pill">✦ Funcionalidades</div>
          <h2 className="section-title">Diseñado para negocios<br />que no tienen <em>tiempo que perder</em></h2>
          <div className="features-dark">
            {[
              { icon: '🔄', title: 'Siempre actualizado', desc: 'Re-scrapea tu web automáticamente. Cuando cambias precios o añades servicios, el chatbot lo sabe al día siguiente.' },
              { icon: '🌍', title: 'Multiidioma automático', desc: 'Detecta el idioma del visitante y responde en español, inglés, francés, alemán u holandés sin configuración.' },
              { icon: '📊', title: 'Analytics de conversaciones', desc: 'Ve qué preguntan tus clientes, detecta dudas frecuentes y mejora tu web con datos reales.' },
              { icon: '🎨', title: 'Tu marca, tu estilo', desc: 'Personaliza colores, logo y nombre del asistente. El widget se adapta perfectamente a tu web.' },
              { icon: '☀️', title: 'Widgets contextuales', desc: 'Muestra el tiempo en tiempo real, webcams de tus instalaciones o el nivel de ocupación del día.' },
              { icon: '🔒', title: 'Datos en Europa', desc: 'Todos los datos se guardan en servidores europeos. Cumplimiento GDPR garantizado.' },
            ].map(f => (
              <div key={f.title} className="feature-dark">
                <div className="feature-icon-dark">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div id="precios" className="pricing-wrap">
        <div className="pricing-inner">
          <div className="section-pill">✦ Precios</div>
          <h2 className="section-title">Simple. Sin sorpresas.<br /><em>Sin letra pequeña.</em></h2>
          <p className="section-sub">1 crédito = 1 mensaje. Siempre. Sin trampas de tokens ni modelos que consumen 20 créditos por mensaje.</p>

          {/* Fila 1: Trial + Starter */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 52, marginBottom: 16 }}>
            {/* TRIAL */}
            <div className="plan-dark" style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(99,102,241,0.12))', borderColor: 'rgba(99,102,241,0.4)', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: 'radial-gradient(circle,rgba(99,102,241,0.2),transparent)', pointerEvents: 'none' }}></div>
              <div className="plan-icon-dark" style={{ background: 'rgba(99,102,241,0.15)' }}>🎁</div>
              <div className="plan-name-dark" style={{ color: '#818cf8' }}>Trial</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark" style={{ background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0€</span>
                <span className="plan-price-per-dark">/ 15 días</span>
              </div>
              <div className="plan-msgs-dark">100 mensajes · 1 chatbot</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                {['1 chatbot completo','100 mensajes de prueba','Scraping de tu web','Widget embebible','Sin tarjeta de crédito','Cancela cuando quieras'].map(f => (
                  <li key={f}><span className="ck" style={{ color: '#818cf8' }}>✓</span> {f}</li>
                ))}
              </ul>
              <Link href="/auth/register" className="plan-cta-dark plan-cta-grad" style={{ fontSize: 15, padding: 13, fontWeight: 700 }}>Empezar gratis →</Link>
              <div className="plan-extra-dark" style={{ color: '#6366f1' }}>Sin compromisos</div>
            </div>

            {/* STARTER */}
            <div className="plan-dark">
              <div className="plan-icon-dark" style={{ background: 'rgba(34,197,94,0.1)' }}>🌱</div>
              <div className="plan-name-dark" style={{ color: '#22c55e' }}>Starter</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark">19€</span>
                <span className="plan-price-per-dark">/mes</span>
              </div>
              <div className="plan-msgs-dark">500 mensajes · 1 chatbot</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                <li><span className="ck" style={{ color: '#22c55e' }}>✓</span> 1 chatbot</li>
                <li><span className="ck" style={{ color: '#22c55e' }}>✓</span> 500 mensajes/mes</li>
                <li><span className="ck" style={{ color: '#22c55e' }}>✓</span> Re-crawl semanal</li>
                <li><span className="ck" style={{ color: '#22c55e' }}>✓</span> Multiidioma</li>
                <li><span className="nx">✗</span> <span style={{ color: 'var(--text3)' }}>Widgets contextuales</span></li>
                <li><span className="nx">✗</span> <span style={{ color: 'var(--text3)' }}>Analytics avanzado</span></li>
              </ul>
              <Link href="/auth/register" className="plan-cta-dark plan-cta-border" style={{ borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }}>Contratar</Link>
              <div className="plan-extra-dark">+€10/mes por bot extra</div>
            </div>
          </div>

          {/* Fila 2: Pro + Business + Agency */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {/* PRO */}
            <div className="plan-dark hot">
              <div className="plan-hot-badge">⭐ Más popular</div>
              <div className="plan-icon-dark" style={{ background: 'rgba(99,102,241,0.12)' }}>🚀</div>
              <div className="plan-name-dark" style={{ color: '#818cf8' }}>Pro</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark">49€</span>
                <span className="plan-price-per-dark">/mes</span>
              </div>
              <div className="plan-msgs-dark">3.000 mensajes · 3 chatbots</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> 3 chatbots</li>
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> 3.000 mensajes/mes</li>
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> Re-crawl diario</li>
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> Widget del tiempo ☀️</li>
                <li><span className="ck" style={{ color: '#818cf8' }}>✓</span> Analytics avanzado</li>
                <li><span className="nx">✗</span> <span style={{ color: 'var(--text3)' }}>Webcam y ocupación</span></li>
              </ul>
              <Link href="/auth/register" className="plan-cta-dark plan-cta-grad">Contratar</Link>
              <div className="plan-extra-dark">+€10/mes por bot extra</div>
            </div>

            {/* BUSINESS */}
            <div className="plan-dark">
              <div className="plan-icon-dark" style={{ background: 'rgba(168,85,247,0.1)' }}>💼</div>
              <div className="plan-name-dark" style={{ color: '#c084fc' }}>Business</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark">99€</span>
                <span className="plan-price-per-dark">/mes</span>
              </div>
              <div className="plan-msgs-dark">10.000 mensajes · 10 chatbots</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> 10 chatbots</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> 10.000 mensajes/mes</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> Todo lo de Pro</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> Webcam y ocupación 📷</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> Informes semanales</li>
                <li><span className="ck" style={{ color: '#c084fc' }}>✓</span> Soporte prioritario</li>
              </ul>
              <Link href="/auth/register" className="plan-cta-dark plan-cta-border" style={{ borderColor: 'rgba(168,85,247,0.3)', color: '#c084fc' }}>Contratar</Link>
              <div className="plan-extra-dark">+€10/mes por bot extra</div>
            </div>

            {/* AGENCY */}
            <div className="plan-dark" style={{ borderColor: 'rgba(251,146,60,0.35)' }}>
              <div className="plan-icon-dark" style={{ background: 'rgba(251,146,60,0.1)' }}>🏢</div>
              <div className="plan-name-dark" style={{ color: '#fb923c' }}>Agency</div>
              <div className="plan-price-dark">
                <span className="plan-price-num-dark">199€</span>
                <span className="plan-price-per-dark">/mes</span>
              </div>
              <div className="plan-msgs-dark">30.000 mensajes · hasta 50 bots</div>
              <div className="plan-divider-dark"></div>
              <ul className="plan-features-dark">
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> Hasta 50 chatbots</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> 30.000 mensajes/mes</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> Todo lo de Business</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> White-label</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> API Access</li>
                <li><span className="ck" style={{ color: '#fb923c' }}>✓</span> Gestor de cuenta</li>
              </ul>
              <a href="mailto:hola@chathost.ai" className="plan-cta-dark plan-cta-border" style={{ borderColor: 'rgba(251,146,60,0.4)', color: '#fb923c' }}>Hablar con ventas</a>
              <div className="plan-extra-dark">+€10/mes por bot extra</div>
            </div>
          </div>

          <div className="pricing-footer">
            <strong>Bots adicionales:</strong> €10/mes por bot extra en cualquier plan &nbsp;·&nbsp;
            <strong>Recargas:</strong> desde €5 si te quedas sin mensajes
          </div>
        </div>
      </div>

      {/* TESTIMONIAL */}
      <div id="clientes">
        <div className="testi-wrap">
          <div className="stars-dark">★★★★★</div>
          <p className="testi-quote">&ldquo;Teníamos recepción respondiendo las mismas 20 preguntas todos los días. Ahora el chatbot lo hace solo, en 4 idiomas, a las 3 de la mañana.&rdquo;</p>
          <div className="testi-author">
            <div className="testi-avatar">A</div>
            <div style={{ textAlign: 'left' }}>
              <div className="testi-name">Estación de Astún — Candanchú</div>
              <div className="testi-role">7.400 conversaciones atendidas el primer año</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA FINAL */}
      <div className="cta-wrap">
        <div className="cta-glow"></div>
        <h2>Empieza hoy.<br /><em>Es gratis.</em></h2>
        <p>50 mensajes de prueba. Sin tarjeta de crédito. Sin compromisos.</p>
        <Link href="/auth/register" className="btn-large-grad" style={{ fontSize: 16, padding: '17px 40px' }}>
          Crear mi chatbot gratis →
        </Link>
        <p className="cta-note">¿Preguntas? Escríbenos a <a href="mailto:hola@chathost.ai" style={{ color: 'inherit' }}>hola@chathost.ai</a></p>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="logo">
                <div className="logo-icon">C</div>
                <span className="logo-text">
                  <span style={{ background: 'linear-gradient(135deg,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>Chat</span>
                  <span style={{ color: 'white', fontWeight: 700 }}>Host</span>
                  <span style={{ background: 'linear-gradient(135deg,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>.ai</span>
                </span>
              </Link>
              <p>Chatbots IA para negocios locales. Campings, hoteles, estaciones de esquí, clínicas y más.</p>
            </div>
            <div className="footer-col">
              <h4>Producto</h4>
              <a href="#como-funciona">Cómo funciona</a>
              <a href="#precios">Precios</a>
              <Link href="/auth/register">Registro</Link>
              <Link href="/auth/login">Entrar</Link>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <a href="https://arandai.com" target="_blank" rel="noreferrer">Arandai</a>
              <a href="mailto:hola@chathost.ai">Contacto</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <Link href="/privacy">Privacidad</Link>
              <a href="#">Términos</a>
              <a href="#">Cookies</a>
              <a href="#">GDPR</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 ChatHost.ai · Producto de <a href="https://arandai.com" target="_blank" rel="noreferrer" style={{ color: 'var(--text3)', textDecoration: 'none' }}>Arandai</a></p>
            <p>Hecho en España 🇪🇸 · Datos en Europa 🇪🇺</p>
          </div>
        </div>
      </footer>
    </>
  )
}
