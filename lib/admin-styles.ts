// lib/admin-styles.ts
// Sistema de temas con CSS variables — los cambios se propagan a todos los componentes

export const S = {
  wrap: { minHeight: '100vh', background: 'var(--ch-wrap-bg, #f0f4f8)', fontFamily: 'var(--ch-font, Inter,-apple-system,BlinkMacSystemFont,sans-serif)', color: 'var(--ch-text, #101828)' } as React.CSSProperties,
  topbar: { background: '#ffffff', borderBottom: '1px solid #eaecf0', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  body: { padding: '20px 24px', maxWidth: 1200, margin: '0 auto' } as React.CSSProperties,
  card: { background: 'var(--ch-card-bg, #ffffff)', border: '1px solid var(--ch-card-border, #eaecf0)', borderRadius: 10, padding: '16px 18px', marginBottom: 12 } as React.CSSProperties,
  lbl: { fontSize: 11, fontWeight: 500, color: 'var(--ch-text-muted, #98a2b3)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', display: 'block', marginBottom: 5 },
  inp: { width: '100%', padding: '8px 12px', border: '1px solid var(--ch-inp-border, #d0d5dd)', borderRadius: 8, fontSize: 13, color: 'var(--ch-text, #101828)', background: 'var(--ch-inp-bg, #ffffff)', fontFamily: 'inherit', boxSizing: 'border-box' as const },
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 } as React.CSSProperties,
  btn: (bg = '#4f46e5', color = 'white') => ({ background: bg, color, border: bg === 'white' ? '1px solid #d0d5dd' : 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit' } as React.CSSProperties),
  secLabel: { fontSize: 11, fontWeight: 600, color: 'var(--ch-text-label, #344054)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 },
  statRow: (cols: number) => ({ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, marginBottom: 16 } as React.CSSProperties),
  statBox: { background: 'var(--ch-card-bg, #ffffff)', border: '1px solid var(--ch-card-border, #eaecf0)', borderRadius: 10, padding: '14px 16px' } as React.CSSProperties,
  tag: (bg: string, col: string) => ({ fontSize: 11, padding: '2px 8px', borderRadius: 6, fontWeight: 500, background: bg, color: col, display: 'inline-block' } as React.CSSProperties),
  tgl: (on: boolean, color = '#4f46e5') => ({ width: 36, height: 20, borderRadius: 10, background: on ? color : '#e4e7ec', position: 'relative' as const, cursor: 'pointer', flexShrink: 0, display: 'inline-block' }),
  tglK: (on: boolean) => ({ position: 'absolute' as const, top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', transition: 'left 0.15s' }),
}

// ─── Temas del panel ─────────────────────────────────────────────────────────
export const PANEL_SKINS = {
  // ── Claros ────────────────────────────────────────────────────────────────
  cloud: {
    label: 'Cloud', emoji: '☁️', dark: false,
    font: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontUrl: null,
    tabBarBg: '#ffffff', tabBarBorder: '1px solid #e2e8f0',
    vars: {
      '--ch-wrap-bg':    '#f0f4f8',
      '--ch-card-bg':    '#ffffff',
      '--ch-card-border':'#e2e8f0',
      '--ch-inp-bg':     '#ffffff',
      '--ch-inp-border': '#d0d5dd',
      '--ch-text':       '#101828',
      '--ch-text-muted': '#98a2b3',
      '--ch-text-label': '#344054',
    },
  },
  warm: {
    label: 'Warm', emoji: '🌅', dark: false,
    font: "'Lora', Georgia, serif",
    fontUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
    tabBarBg: '#ede8df', tabBarBorder: '1px solid #d8ccbb',
    vars: {
      '--ch-wrap-bg':    '#f5efe5',
      '--ch-card-bg':    '#fefcf7',
      '--ch-card-border':'#e2d5c3',
      '--ch-inp-bg':     '#fefcf7',
      '--ch-inp-border': '#d8ccbb',
      '--ch-text':       '#2c1f0e',
      '--ch-text-muted': '#a08060',
      '--ch-text-label': '#6b4f30',
    },
  },
  nordic: {
    label: 'Nordic', emoji: '🔷', dark: false,
    font: "'Nunito', sans-serif",
    fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap',
    tabBarBg: '#dce6f0', tabBarBorder: '1px solid #b8cfe0',
    vars: {
      '--ch-wrap-bg':    '#edf2f7',
      '--ch-card-bg':    '#f5f9fc',
      '--ch-card-border':'#c2d5e5',
      '--ch-inp-bg':     '#f8fbfe',
      '--ch-inp-border': '#b8cfe0',
      '--ch-text':       '#1a2e3f',
      '--ch-text-muted': '#7a9ab5',
      '--ch-text-label': '#3a5f7a',
    },
  },
  forest: {
    label: 'Forest', emoji: '🌿', dark: false,
    font: "'JetBrains Mono', monospace",
    fontUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
    tabBarBg: '#deeae0', tabBarBorder: '1px solid #b8d4bc',
    vars: {
      '--ch-wrap-bg':    '#eef5ef',
      '--ch-card-bg':    '#f8fdf8',
      '--ch-card-border':'#c0d8c4',
      '--ch-inp-bg':     '#f6fbf6',
      '--ch-inp-border': '#b8d4bc',
      '--ch-text':       '#1a2e1c',
      '--ch-text-muted': '#6a9470',
      '--ch-text-label': '#2d5c32',
    },
  },
  // ── Oscuros ───────────────────────────────────────────────────────────────
  midnight: {
    label: 'Midnight', emoji: '🌙', dark: true,
    font: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', fontUrl: null,
    tabBarBg: '#1e293b', tabBarBorder: '1px solid #334155',
    vars: {
      '--ch-wrap-bg':    '#0f172a',
      '--ch-card-bg':    '#1e293b',
      '--ch-card-border':'#2d4060',
      '--ch-inp-bg':     '#162032',   // azul-gris medio, no negro puro
      '--ch-inp-border': '#3a5070',
      '--ch-text':       '#e8f0f8',   // blanco con tinte azul +15%
      '--ch-text-muted': '#8facc8',   // gris-azul claro +15%
      '--ch-text-label': '#b0c8e0',   // labels más brillantes +15%
    },
  },
  graphite: {
    label: 'Graphite', emoji: '⬛', dark: true,
    font: "'Nunito', sans-serif",
    fontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap',
    tabBarBg: '#27272a', tabBarBorder: '1px solid #3f3f46',
    vars: {
      '--ch-wrap-bg':    '#18181b',
      '--ch-card-bg':    '#27272a',
      '--ch-card-border':'#404048',
      '--ch-inp-bg':     '#22252e',   // gris azulado medio, no negro puro
      '--ch-inp-border': '#4a4f60',
      '--ch-text':       '#f0f2f8',   // blanco con tinte azul +15%
      '--ch-text-muted': '#9098b0',   // gris-azul claro +15%
      '--ch-text-label': '#b8bdd0',   // labels más brillantes +15%
    },
  },
} as const

export type PanelSkin = keyof typeof PANEL_SKINS

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function applySkinVars(skin: PanelSkin) {
  const s = PANEL_SKINS[skin]
  const root = document.documentElement
  Object.entries(s.vars).forEach(([k, v]) => root.style.setProperty(k, v))
  root.style.setProperty('--ch-font', s.font)
  if (s.fontUrl && !document.querySelector(`link[href="${s.fontUrl}"]`)) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = s.fontUrl
    document.head.appendChild(link)
  }
}

export const PLAN_CREDITOS: Record<string, number> = {
  basic: 500, starter: 500, pro: 3000, business: 10000, agency: 30000,
}

export const SPECIAL_TYPES = [
  { id: 'promo',     label: '🏷 Promo',     color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  { id: 'event',     label: '🎉 Evento',    color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', text: '#4c1d95' },
  { id: 'info',      label: 'ℹ️ Info',       color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', text: '#3730a3' },
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
  { label: 'Índigo', value: '#4f46e5' },
  { label: 'Azul',   value: '#2563eb' },
  { label: 'Morado', value: '#7c3aed' },
  { label: 'Verde',  value: '#059669' },
  { label: 'Cian',   value: '#0891b2' },
  { label: 'Slate',  value: '#475569' },
]

export function renderMd(text: string, color = '#4f46e5'): string {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, `<a href="$2" target="_blank" rel="noreferrer" style="color:${color};text-decoration:underline;">$1</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
}
