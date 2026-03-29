// lib/admin-styles.ts
// Estilos compartidos del panel admin

export const S = {
  wrap: { minHeight: '100vh', background: '#f8fafc', fontFamily: '-apple-system,BlinkMacSystemFont,system-ui,sans-serif' } as React.CSSProperties,
  topbar: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 28px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' } as React.CSSProperties,
  body: { padding: '24px 28px', maxWidth: 1200, margin: '0 auto' } as React.CSSProperties,
  card: { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 22px', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' } as React.CSSProperties,
  lbl: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.07em', display: 'block', marginBottom: 6 },
  inp: { width: '100%', padding: '9px 13px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, color: '#0f172a', background: 'white', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
  btn: (bg = '#2563eb', color = 'white') => ({
    background: bg, color,
    border: bg === 'white' ? '1.5px solid #e2e8f0' : 'none',
    padding: '8px 18px', borderRadius: 9, cursor: 'pointer',
    fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
    boxShadow: bg !== 'white' ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
  } as React.CSSProperties),
  secLabel: { fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 12 },
  statRow: (cols: number) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, marginBottom: 18 } as React.CSSProperties),
  statBox: { background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' } as React.CSSProperties,
  tag: (bg: string, col: string) => ({ fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600, background: bg, color: col, display: 'inline-block' } as React.CSSProperties),
  tgl: (on: boolean, color = '#2563eb') => ({ width: 38, height: 22, borderRadius: 11, background: on ? color : '#e2e8f0', position: 'relative' as const, cursor: 'pointer', flexShrink: 0, display: 'inline-block' }),
  tglK: (on: boolean) => ({ position: 'absolute' as const, top: 3, left: on ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', transition: 'left 0.15s' }),
}

export const MODELOS = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku', desc: 'Rápido y económico', creditosMsg: 1, color: '#059669', badge: 'Recomendado' },
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet', desc: 'Más inteligente y preciso', creditosMsg: 4, color: '#4B7BE5', badge: '' },
  { id: 'claude-opus-4-5', label: 'Claude Opus', desc: 'El más potente', creditosMsg: 20, color: '#7c3aed', badge: 'Premium' },
]

export const PLAN_CREDITOS: Record<string, number> = {
  basic: 500, starter: 500, pro: 3000, business: 10000, agency: 30000,
}

export const SPECIAL_TYPES = [
  { id: 'promo',     label: '🏷 Promo',     color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  { id: 'event',     label: '🎉 Evento',    color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95' },
  { id: 'info',      label: 'ℹ️ Info',       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a' },
  { id: 'warning',   label: '⚠️ Aviso',     color: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d' },
  { id: 'summer',    label: '☀️ Verano',    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', text: '#164e63' },
  { id: 'halloween', label: '🎃 Halloween', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', text: '#7c2d12' },
  { id: 'christmas', label: '🎄 Navidad',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#14532d' },
  { id: 'custom',    label: '🎨 Custom',    color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', text: '#374151' },
]

export const DEMO_COUNTRIES = [
  { country: 'España',       code: 'ES', count: 8234, flag: '🇪🇸' },
  { country: 'Francia',      code: 'FR', count: 1205, flag: '🇫🇷' },
  { country: 'Alemania',     code: 'DE', count: 834,  flag: '🇩🇪' },
  { country: 'Reino Unido',  code: 'GB', count: 621,  flag: '🇬🇧' },
  { country: 'Italia',       code: 'IT', count: 445,  flag: '🇮🇹' },
  { country: 'Países Bajos', code: 'NL', count: 312,  flag: '🇳🇱' },
  { country: 'Bélgica',      code: 'BE', count: 198,  flag: '🇧🇪' },
  { country: 'Portugal',     code: 'PT', count: 167,  flag: '🇵🇹' },
  { country: 'Suiza',        code: 'CH', count: 143,  flag: '🇨🇭' },
  { country: 'EE.UU.',       code: 'US', count: 89,   flag: '🇺🇸' },
]

export const THEME_PRESETS = [
  { label: 'Azul',   value: '#2563eb' },
  { label: 'Índigo', value: '#4f46e5' },
  { label: 'Morado', value: '#7c3aed' },
  { label: 'Verde',  value: '#059669' },
  { label: 'Cian',   value: '#0891b2' },
  { label: 'Slate',  value: '#475569' },
]

export function renderMd(text: string, color = '#2563eb'): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer" style="color:${color};text-decoration:underline;">$1</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}
