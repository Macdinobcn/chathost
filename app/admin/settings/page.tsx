'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminTopbar from '@/components/AdminTopbar'

interface MasterSettings {
  id?: string
  master_prompt: string
  master_format: string
  master_rules: string
  allow_emojis: boolean
  allow_bold: boolean
  allow_lists: boolean
  allow_links: boolean
  default_tone: 'formal' | 'equilibrado' | 'cercano'
  default_length: 'corta' | 'media' | 'detallada'
  default_temperature: number
  clients_can_change_tone: boolean
  clients_can_change_prompt: boolean
  clients_can_change_language: boolean
  clients_max_temperature: number
  force_auto_language: boolean
  // GDPR
  gdpr_enabled: boolean
  gdpr_title: string
  gdpr_text: string
  gdpr_button_text: string
  gdpr_privacy_url: string
}

const DEFAULT_SETTINGS: MasterSettings = {
  master_prompt: `Eres un asistente virtual amable y útil.
Responde siempre en el idioma del usuario.
Si no sabes algo, dilo honestamente y ofrece el contacto del negocio.
No inventes información que no esté en la knowledge base.`,

  master_format: `FORMATO OBLIGATORIO — sigue estas reglas sin excepción:
- NUNCA uses # ## ### para títulos
- NUNCA uses ** para negritas
- NUNCA uses --- como separadores
- NUNCA pongas 🥇 🥈 🥉 ni trofeos en listas
- Usa numeración simple (1. 2. 3.) y sublistas con * para agrupar
- Máximo 1-2 emojis por respuesta, solo si aportan algo

LINKS — regla de oro:
- Cuando menciones cualquier alojamiento o servicio, inclúyelo como link clicable en esa misma línea
- Formato: [Nombre](URL)
- No esperes a que el usuario pida los links — inclúyelos directamente
- Ejemplo: "* [Caribe Club](https://...) — el más completo, con barbacoa y salida a las 12h"

LONGITUD:
- En listas, una línea por item con lo más relevante, no todos los detalles
- Si quieren más info de uno concreto, que pregunten`,

  master_rules: `NORMAS Y LÍMITES:
- Nunca hagas comparaciones negativas con otros establecimientos o competidores
- No menciones precios sin añadir "consulta disponibilidad en [enlace reservas]"
- Si preguntan algo que no está en la knowledge base, di: "no tengo esa información, contacta con nosotros en [email/teléfono del negocio]"
- No hagas promesas sobre disponibilidad — siempre redirige al motor de reservas
- No compartas datos personales de clientes ni información interna del negocio
- Si detectas una queja o incidencia grave, ofrece el contacto directo inmediatamente
- Nunca hables mal del negocio ni de sus servicios, aunque el usuario lo haga`,

  allow_emojis: true,
  allow_bold: false,
  allow_lists: true,
  allow_links: true,
  default_tone: 'equilibrado',
  default_length: 'media',
  default_temperature: 0.3,
  clients_can_change_tone: true,
  clients_can_change_prompt: true,
  clients_can_change_language: true,
  clients_max_temperature: 0.7,
  force_auto_language: true,
  // GDPR defaults
  gdpr_enabled: true,
  gdpr_title: 'Antes de continuar',
  gdpr_text: 'Este chat usa inteligencia artificial para responder tus preguntas. Tus mensajes se procesan para ofrecerte asistencia y pueden guardarse para mejorar el servicio. No recopilamos datos personales salvo los que tú compartas voluntariamente.',
  gdpr_button_text: 'Entendido, continuar',
  gdpr_privacy_url: 'https://chathost.ai/privacy',
}

const s = {
  wrap: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'system-ui, -apple-system, sans-serif' },
  topbar: { background: 'white', borderBottom: '1px solid #e8e8e8', padding: '0 28px', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  logo: { fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' },
  tag: { fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#f0fdf4', color: '#059669', fontWeight: 700, border: '1px solid #bbf7d0', marginLeft: 8 },
  body: { padding: '24px 28px', maxWidth: 1200, margin: '0 auto' },
  card: { background: 'white', border: '1px solid #e8e8e8', borderRadius: 10, padding: '20px 24px', marginBottom: 16 } as React.CSSProperties,
  cardTitle: { fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#aaa', marginBottom: 14 },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f5f5f5' } as React.CSSProperties,
  rowLast: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' } as React.CSSProperties,
  rowLabel: { fontSize: 13, color: '#222', fontWeight: 500 },
  rowSub: { fontSize: 11, color: '#aaa', marginTop: 2 },
  lockBadge: { fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#fef3c7', color: '#92400e', fontWeight: 600, marginLeft: 8 },
  clientBadge: { fontSize: 10, padding: '2px 7px', borderRadius: 4, background: '#dbeafe', color: '#1e40af', fontWeight: 600, marginLeft: 8 },
  textarea: { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', fontSize: 12, fontFamily: 'ui-monospace, monospace', color: '#222', background: '#fafafa', resize: 'vertical' as const, lineHeight: 1.7, boxSizing: 'border-box' as const },
  input: { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#222', background: '#fafafa', boxSizing: 'border-box' as const, outline: 'none' },
  segGroup: { display: 'flex', gap: 4, background: '#f5f5f5', borderRadius: 8, padding: 3 },
  segBtn: (active: boolean) => ({ padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: active ? 600 : 400, border: active ? '1px solid #e5e7eb' : 'none', background: active ? 'white' : 'transparent', color: active ? '#111' : '#888', cursor: 'pointer' }),
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
  tab: (active: boolean) => ({ padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: active ? 600 : 400, border: '1px solid', borderColor: active ? '#2563eb' : '#e5e7eb', background: active ? '#eff6ff' : 'transparent', color: active ? '#2563eb' : '#888', cursor: 'pointer' }),
  mainTab: (active: boolean) => ({ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 500, border: '1px solid', borderColor: active ? '#2563eb' : '#e5e7eb', background: active ? '#2563eb' : 'white', color: active ? 'white' : '#555', cursor: 'pointer' }),
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ width: 40, height: 22, borderRadius: 11, background: value ? '#2563eb' : '#d1d5db', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: 'white', top: 3, left: value ? 21 : 3, transition: 'left 0.15s' }} />
    </button>
  )
}

function SegControl({ options, value, onChange }: { options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={s.segGroup}>
      {options.map(o => (
        <button key={o.value} style={s.segBtn(value === o.value)} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<MasterSettings>(DEFAULT_SETTINGS)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [promptTab, setPromptTab] = useState<'base' | 'formato' | 'normas'>('base')
  const [mainTab, setMainTab] = useState<'instrucciones' | 'gdpr'>('instrucciones')

  useEffect(() => { cargarSettings() }, [])

  async function cargarSettings() {
    setCargando(true)
    const res = await fetch('/api/master-settings')
    const data = await res.json()
    if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
    setCargando(false)
  }

  function set<K extends keyof MasterSettings>(key: K, val: MasterSettings[K]) {
    setSettings(prev => ({ ...prev, [key]: val }))
  }

  async function guardar() {
    setGuardando(true)
    await fetch('/api/master-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  function getPreview() {
    const { allow_emojis, allow_links, default_length } = settings
    let msg = ''
    if (default_length === 'corta') {
      msg = `Parcela caravana agosto: €28/noche con electricidad.`
      if (allow_links) msg += ` <span style="color:#2563eb">Ver tarifas →</span>`
    } else if (default_length === 'detallada') {
      msg = `En agosto disponemos de parcelas a €28/noche con electricidad incluida y €24/noche sin. El precio incluye 2 adultos; niños menores de 12 años tienen descuento del 30%.`
      if (allow_links) msg += `<br><br><span style="color:#2563eb">Ver tarifas completas →</span>`
    } else {
      msg = `En agosto, una parcela para caravana cuesta €28/noche con electricidad incluida.`
      if (allow_links) msg += `<br><br>Reservas: <span style="color:#2563eb">info@camping.com</span>`
    }
    if (allow_emojis) msg = '🏕️ ' + msg
    return msg
  }

  const promptFinal = [settings.master_prompt, settings.master_format, settings.master_rules]
    .filter(Boolean).join('\n\n---\n\n')

  if (cargando) {
    return (
      <div style={s.wrap}>
        <div style={{ padding: 80, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Cargando configuración...</div>
      </div>
    )
  }

  return (
    <div style={s.wrap}>
      <AdminTopbar
        actions={
          <button
            onClick={guardar} disabled={guardando}
            style={{ background: guardado ? '#059669' : '#2563eb', color: 'white', padding: '7px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {guardado ? '✓ Guardado' : guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      />

      <div style={s.body}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4 }}>Configuración maestra</h1>
          <p style={{ fontSize: 13, color: '#888' }}>
            Se aplica a <strong>todos los chatbots</strong>. Los clientes solo pueden ajustar lo que tú les permitas.&nbsp;
            <span style={s.lockBadge}>🔒 Solo tú</span>
            <span style={{ ...s.clientBadge, marginLeft: 6 }}>Cliente puede ajustar</span>
          </p>
        </div>

        {/* Tabs principales */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button style={s.mainTab(mainTab === 'instrucciones')} onClick={() => setMainTab('instrucciones')}>
            💬 Instrucciones IA
          </button>
          <button style={s.mainTab(mainTab === 'gdpr')} onClick={() => setMainTab('gdpr')}>
            🔒 Privacidad y GDPR
          </button>
        </div>

        {/* ── TAB: INSTRUCCIONES ── */}
        {mainTab === 'instrucciones' && (
          <div style={s.grid}>
            {/* Columna izquierda */}
            <div>
              <div style={s.card}>
                <div style={s.cardTitle}>
                  Instrucciones maestras <span style={s.lockBadge}>🔒 Solo tú</span>
                </div>
                <div style={s.cardSub}>
                  Se inyectan antes del prompt de cada cliente en este orden: Base → Formato → Normas. El cliente no puede ver ni editar nada de esto.
                </div>

                <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                  <button style={s.tab(promptTab === 'base')} onClick={() => setPromptTab('base')}>💬 Comportamiento</button>
                  <button style={s.tab(promptTab === 'formato')} onClick={() => setPromptTab('formato')}>📐 Formato</button>
                  <button style={s.tab(promptTab === 'normas')} onClick={() => setPromptTab('normas')}>⚖️ Normas</button>
                </div>

                {promptTab === 'base' && (
                  <>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>Tono, personalidad y comportamiento general del asistente.</div>
                    <textarea style={{ ...s.textarea, minHeight: 130 }} value={settings.master_prompt} onChange={e => set('master_prompt', e.target.value)} />
                  </>
                )}
                {promptTab === 'formato' && (
                  <>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>Cómo se presentan las respuestas: markdown, emojis, links, longitud...</div>
                    <textarea style={{ ...s.textarea, minHeight: 180 }} value={settings.master_format} onChange={e => set('master_format', e.target.value)} />
                  </>
                )}
                {promptTab === 'normas' && (
                  <>
                    <div style={{ fontSize: 11, color: '#aaa', marginBottom: 8 }}>Lo que el chatbot NUNCA debe hacer: compromisos, comparaciones, datos sensibles...</div>
                    <textarea style={{ ...s.textarea, minHeight: 160 }} value={settings.master_rules} onChange={e => set('master_rules', e.target.value)} />
                  </>
                )}

                <details style={{ marginTop: 14 }}>
                  <summary style={{ fontSize: 11, color: '#bbb', cursor: 'pointer', userSelect: 'none' }}>Ver prompt completo que recibe Claude ▾</summary>
                  <pre style={{ marginTop: 8, background: '#f5f5f5', borderRadius: 6, padding: '10px 12px', fontSize: 11, color: '#666', whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 200, overflowY: 'auto' }}>
                    {promptFinal}
                  </pre>
                </details>

                <div style={{ fontSize: 11, color: '#bbb', marginTop: 10 }}>
                  Variables: <code style={{ background: '#f5f5f5', padding: '1px 5px', borderRadius: 3 }}>{'{NOMBRE_CLIENTE}'}</code>
                  <code style={{ background: '#f5f5f5', padding: '1px 5px', borderRadius: 3, marginLeft: 6 }}>{'{EMAIL_CLIENTE}'}</code>
                  <code style={{ background: '#f5f5f5', padding: '1px 5px', borderRadius: 3, marginLeft: 6 }}>{'{TELEFONO_CLIENTE}'}</code>
                </div>
              </div>

              {/* Toggles de formato rápido */}
              <div style={s.card}>
                <div style={s.cardTitle}>Formato rápido</div>
                <div style={s.cardSub}>Añaden reglas automáticamente al bloque de Formato al guardar.</div>
                {[
                  { key: 'allow_emojis' as const, label: 'Emojis permitidos', sub: 'El asistente puede usar emojis', lock: true },
                  { key: 'allow_bold' as const, label: 'Negritas', sub: 'Resaltar precios y términos clave', lock: false },
                  { key: 'allow_lists' as const, label: 'Listas con puntos', sub: 'Bullet points para enumerar', lock: false },
                  { key: 'allow_links' as const, label: 'Links en respuestas', sub: 'Incluir URLs de la knowledge base', lock: true },
                ].map((item, i, arr) => (
                  <div key={item.key} style={i < arr.length - 1 ? s.row : s.rowLast}>
                    <div>
                      <div style={s.rowLabel}>{item.label}{item.lock ? <span style={s.lockBadge}>🔒 Solo tú</span> : <span style={s.clientBadge}>Cliente</span>}</div>
                      <div style={s.rowSub}>{item.sub}</div>
                    </div>
                    <Toggle value={settings[item.key] as boolean} onChange={v => set(item.key, v)} />
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha */}
            <div>
              <div style={s.card}>
                <div style={s.cardTitle}>Tono y longitud <span style={s.clientBadge}>Cliente puede ajustar</span></div>
                <div style={s.cardSub}>El cliente puede cambiar esto si le das permiso abajo.</div>
                <div style={s.row}>
                  <div><div style={s.rowLabel}>Estilo de respuesta</div><div style={s.rowSub}>Tono general del asistente</div></div>
                  <SegControl options={[{ label: 'Formal', value: 'formal' }, { label: 'Equilibrado', value: 'equilibrado' }, { label: 'Cercano', value: 'cercano' }]} value={settings.default_tone} onChange={v => set('default_tone', v as any)} />
                </div>
                <div style={s.row}>
                  <div><div style={s.rowLabel}>Longitud de respuesta</div><div style={s.rowSub}>Por defecto para todos los chats</div></div>
                  <SegControl options={[{ label: 'Corta', value: 'corta' }, { label: 'Media', value: 'media' }, { label: 'Detallada', value: 'detallada' }]} value={settings.default_length} onChange={v => set('default_length', v as any)} />
                </div>
                <div style={s.rowLast}>
                  <div><div style={s.rowLabel}>Temperatura por defecto</div><div style={s.rowSub}>0 = preciso · 1 = creativo</div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 160 }}>
                    <input type="range" min={0} max={10} step={1} value={Math.round(settings.default_temperature * 10)} onChange={e => set('default_temperature', parseInt(e.target.value) / 10)} style={{ flex: 1 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111', minWidth: 28, textAlign: 'right' }}>{settings.default_temperature.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div style={s.card}>
                <div style={s.cardTitle}>Límites para clientes <span style={s.lockBadge}>🔒 Solo tú</span></div>
                <div style={s.cardSub}>Qué pueden y no pueden tocar tus clientes en su panel.</div>
                {[
                  { key: 'clients_can_change_tone' as const, label: '¿Pueden cambiar el tono?', sub: 'Formal / Equilibrado / Cercano' },
                  { key: 'clients_can_change_prompt' as const, label: '¿Pueden editar su system prompt?', sub: 'El suyo propio, no el maestro' },
                  { key: 'clients_can_change_language' as const, label: '¿Pueden cambiar el idioma automático?', sub: 'Detectar idioma del visitante' },
                ].map((item, i, arr) => (
                  <div key={item.key} style={i < arr.length - 1 ? s.row : s.rowLast}>
                    <div><div style={s.rowLabel}>{item.label}</div><div style={s.rowSub}>{item.sub}</div></div>
                    <Toggle value={settings[item.key] as boolean} onChange={v => set(item.key, v)} />
                  </div>
                ))}
                <div style={{ ...s.rowLast, borderTop: '1px solid #f5f5f5', marginTop: 4, paddingTop: 16 }}>
                  <div><div style={s.rowLabel}>Temperatura máxima para clientes</div><div style={s.rowSub}>No pueden subir más de este valor</div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 160 }}>
                    <input type="range" min={0} max={10} step={1} value={Math.round(settings.clients_max_temperature * 10)} onChange={e => set('clients_max_temperature', parseInt(e.target.value) / 10)} style={{ flex: 1 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111', minWidth: 28, textAlign: 'right' }}>{settings.clients_max_temperature.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div style={s.card}>
                <div style={s.cardTitle}>Preview</div>
                <div style={s.cardSub}>Ejemplo de respuesta con la configuración actual:</div>
                <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>Visitante pregunta:</div>
                  <div style={{ background: '#2563eb', color: 'white', borderRadius: '12px 12px 4px 12px', padding: '8px 12px', fontSize: 12, display: 'inline-block' }}>¿Cuánto cuesta una parcela en agosto?</div>
                </div>
                <div style={{ background: 'white', border: '1px solid #e8e8e8', borderRadius: '4px 12px 12px 12px', padding: '10px 14px', fontSize: 13, color: '#222', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: getPreview() }} />
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: GDPR ── */}
        {mainTab === 'gdpr' && (
          <div style={s.grid}>
            {/* Columna izquierda — formulario */}
            <div>

              {/* Toggle activar/desactivar */}
              <div style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={s.cardTitle}>Banner de privacidad activo <span style={s.lockBadge}>🔒 Solo tú</span></div>
                    <div style={s.cardSub}>Si está activo, todos los widgets muestran el aviso la primera vez que el usuario abre el chat. Se acepta una sola vez y no vuelve a aparecer.</div>
                  </div>
                  <Toggle value={settings.gdpr_enabled} onChange={v => set('gdpr_enabled', v)} />
                </div>
              </div>

              {/* Textos */}
              <div style={{ ...s.card, opacity: settings.gdpr_enabled ? 1 : 0.5, pointerEvents: settings.gdpr_enabled ? 'auto' : 'none' }}>
                <div style={s.cardTitle}>Textos del banner</div>
                <div style={s.cardSub}>Se aplican a todos los widgets. Cada cliente puede personalizar el suyo en su tab Widget.</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 500 }}>Título del banner</div>
                    <input
                      value={settings.gdpr_title}
                      onChange={e => set('gdpr_title', e.target.value)}
                      placeholder="Antes de continuar"
                      style={s.input}
                    />
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 500 }}>Texto del aviso</div>
                    <textarea
                      value={settings.gdpr_text}
                      onChange={e => set('gdpr_text', e.target.value)}
                      rows={5}
                      style={{ ...s.textarea, minHeight: 110 }}
                    />
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                      Menciona que se usa IA, que los mensajes pueden guardarse, y que no se recogen datos personales si es el caso.
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 500 }}>URL política de privacidad (fallback global)</div>
                    <input
                      value={settings.gdpr_privacy_url}
                      onChange={e => set('gdpr_privacy_url', e.target.value)}
                      placeholder="https://chathost.ai/privacy"
                      style={s.input}
                    />
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>
                      Cada cliente puede poner la URL de su propia política. Si no la tienen, usarán esta.{' '}
                      <a href="/privacy" target="_blank" style={{ color: '#2563eb' }}>Ver la de ChatHost →</a>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 500 }}>Texto del botón de aceptar</div>
                    <input
                      value={settings.gdpr_button_text}
                      onChange={e => set('gdpr_button_text', e.target.value)}
                      placeholder="Entendido, continuar"
                      style={s.input}
                    />
                  </div>
                </div>
              </div>

              {/* Info GDPR */}
              <div style={{ ...s.card, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#065f46', marginBottom: 6 }}>ℹ️ ¿Por qué es obligatorio?</div>
                <div style={{ fontSize: 12, color: '#047857', lineHeight: 1.7 }}>
                  El Reglamento General de Protección de Datos (GDPR) de la UE exige informar a los usuarios antes de procesar sus datos.
                  Los mensajes de chat se procesan mediante la API de Anthropic (Claude), lo que constituye un tratamiento de datos que requiere consentimiento.
                  <br /><br />
                  ChatHost guarda automáticamente el consentimiento en el navegador del usuario — no en ningún servidor.
                  Cumplir con esto protege a tus clientes de posibles multas (hasta el 4% del volumen de negocio anual).
                </div>
              </div>
            </div>

            {/* Columna derecha — preview */}
            <div style={{ position: 'sticky', top: 20 }}>
              <div style={s.card}>
                <div style={s.cardTitle}>Preview del banner en el widget</div>
                <div style={s.cardSub}>Así verá el usuario el aviso antes de escribir su primera pregunta.</div>

                {settings.gdpr_enabled ? (
                  <div style={{
                    background: '#0f172a', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  }}>
                    {/* Header simulado */}
                    <div style={{ background: '#2563eb', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤖</div>
                      <div style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>Asistente</div>
                    </div>

                    {/* Banner */}
                    <div style={{ padding: 16 }}>
                      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                          🔒 {settings.gdpr_title || 'Antes de continuar'}
                        </div>
                        <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.7, marginBottom: 12 }}>
                          {(settings.gdpr_text || '').length > 160
                            ? settings.gdpr_text.slice(0, 160) + '...'
                            : settings.gdpr_text}
                        </p>
                        <div style={{ fontSize: 11, color: '#2563eb', marginBottom: 14, textDecoration: 'underline' }}>
                          Leer política de privacidad →
                        </div>
                        <div style={{
                          background: '#2563eb', borderRadius: 8, padding: '10px 0',
                          textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 600,
                        }}>
                          {settings.gdpr_button_text || 'Entendido, continuar'}
                        </div>
                      </div>

                      {/* Input bloqueado */}
                      <div style={{
                        marginTop: 10, background: '#1e293b', border: '1px solid #334155',
                        borderRadius: 8, padding: '10px 14px', display: 'flex',
                        justifyContent: 'space-between', color: '#475569', fontSize: 12,
                      }}>
                        <span>Acepta para escribir...</span>
                        <span>↑</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    background: '#f9fafb', border: '1px dashed #e5e7eb',
                    borderRadius: 12, padding: 32, textAlign: 'center',
                    color: '#bbb', fontSize: 13,
                  }}>
                    Banner desactivado —<br />los usuarios entran directamente al chat
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 11, color: '#ccc' }}>
          Los cambios se aplican a todos los chatbots en tiempo real al guardar.
        </div>
      </div>
    </div>
  )
}
