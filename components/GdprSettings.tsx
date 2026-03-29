'use client'
// components/GdprSettings.tsx
// Componente reutilizable para configurar GDPR
// Usado en:
//   - /admin/settings (tab "Privacidad") → modo 'admin', guarda en master_settings
//   - /admin/clients/[id] (tab "Widget", sección privacidad) → modo 'client', guarda en clients
//
// Props:
//   mode: 'admin' | 'client'
//   clientId?: string (solo en modo client)
//   globalDefaults: los valores actuales de master_settings (para mostrar placeholders)

import { useState } from 'react'

export interface GdprConfig {
  gdpr_enabled: boolean | null       // null en cliente = usa global
  gdpr_title: string | null
  gdpr_text: string | null
  gdpr_button_text: string | null
  gdpr_privacy_url: string | null
}

export interface GlobalGdprDefaults {
  gdpr_enabled: boolean
  gdpr_title: string
  gdpr_text: string
  gdpr_button_text: string
  gdpr_privacy_url: string
}

interface Props {
  mode: 'admin' | 'client'
  clientId?: string
  initialConfig: GdprConfig
  globalDefaults?: GlobalGdprDefaults  // solo necesario en modo client
  onSave?: (config: GdprConfig) => void
}

export default function GdprSettings({ mode, clientId, initialConfig, globalDefaults, onSave }: Props) {
  const [config, setConfig] = useState<GdprConfig>(initialConfig)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [useCustom, setUseCustom] = useState(
    // En modo client: si tiene algún valor propio, está en modo custom
    mode === 'admin' ? true : (
      initialConfig.gdpr_text !== null ||
      initialConfig.gdpr_title !== null ||
      initialConfig.gdpr_privacy_url !== null ||
      initialConfig.gdpr_button_text !== null ||
      initialConfig.gdpr_enabled !== null
    )
  )

  // Colores del sistema (Tema B de admin-styles.ts)
  const colors = {
    bg: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    text: '#f1f5f9',
    muted: '#94a3b8',
    accent: '#2563eb',
    green: '#10b981',
    red: '#ef4444',
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Si modo client y no está en custom, guardar todos null (usa global)
      const dataToSave: GdprConfig = useCustom ? config : {
        gdpr_enabled: null,
        gdpr_title: null,
        gdpr_text: null,
        gdpr_button_text: null,
        gdpr_privacy_url: null,
      }

      const endpoint = mode === 'admin'
        ? '/api/master-settings'
        : `/api/clients/${clientId}`

      const method = 'POST'
      const body = mode === 'admin'
        ? { ...dataToSave }
        : { gdpr: dataToSave }

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Error al guardar')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      onSave?.(dataToSave)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // Valores efectivos (para el preview)
  const effective = {
    enabled: useCustom && config.gdpr_enabled !== null ? config.gdpr_enabled : (globalDefaults?.gdpr_enabled ?? true),
    title: (useCustom && config.gdpr_title) || globalDefaults?.gdpr_title || 'Antes de continuar',
    text: (useCustom && config.gdpr_text) || globalDefaults?.gdpr_text || '',
    button: (useCustom && config.gdpr_button_text) || globalDefaults?.gdpr_button_text || 'Entendido, continuar',
    url: (useCustom && config.gdpr_privacy_url) || globalDefaults?.gdpr_privacy_url || 'https://chathost.ai/privacy',
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#0f172a', border: `1px solid ${colors.border}`,
    borderRadius: 8, color: colors.text, fontSize: 14,
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block', fontSize: 13, color: colors.muted,
    marginBottom: 6, fontWeight: 500,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

      {/* Columna izquierda — formulario */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Toggle principal */}
        <div style={{
          background: colors.card, border: `1px solid ${colors.border}`,
          borderRadius: 12, padding: 20,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                Banner de privacidad
              </div>
              <div style={{ fontSize: 13, color: colors.muted }}>
                {mode === 'admin'
                  ? 'Activar el banner GDPR en todos los widgets por defecto'
                  : 'Mostrar aviso de privacidad antes del primer mensaje'}
              </div>
            </div>
            <button
              onClick={() => {
                const newEnabled = !(useCustom && config.gdpr_enabled !== null ? config.gdpr_enabled : (globalDefaults?.gdpr_enabled ?? true))
                setConfig(c => ({ ...c, gdpr_enabled: newEnabled }))
                if (mode === 'client') setUseCustom(true)
              }}
              style={{
                width: 48, height: 26, borderRadius: 13,
                background: effective.enabled ? colors.green : colors.border,
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: effective.enabled ? 25 : 3,
                width: 20, height: 20, borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>

        {/* Override de cliente */}
        {mode === 'client' && (
          <div style={{
            background: colors.card, border: `1px solid ${colors.border}`,
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: colors.text, marginBottom: 4 }}>
                  Personalizar texto para este cliente
                </div>
                <div style={{ fontSize: 13, color: colors.muted }}>
                  Si está desactivado, se usa el texto global de ChatHost
                </div>
              </div>
              <button
                onClick={() => setUseCustom(c => !c)}
                style={{
                  width: 48, height: 26, borderRadius: 13,
                  background: useCustom ? colors.accent : colors.border,
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: useCustom ? 25 : 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                }} />
              </button>
            </div>
          </div>
        )}

        {/* Campos de texto */}
        <div style={{
          background: colors.card, border: `1px solid ${colors.border}`,
          borderRadius: 12, padding: 20,
          opacity: (mode === 'client' && !useCustom) ? 0.5 : 1,
          pointerEvents: (mode === 'client' && !useCustom) ? 'none' : 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={labelStyle}>Título del banner</label>
              <input
                value={config.gdpr_title ?? ''}
                onChange={e => setConfig(c => ({ ...c, gdpr_title: e.target.value || null }))}
                placeholder={globalDefaults?.gdpr_title || 'Antes de continuar'}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Texto del aviso</label>
              <textarea
                value={config.gdpr_text ?? ''}
                onChange={e => setConfig(c => ({ ...c, gdpr_text: e.target.value || null }))}
                placeholder={globalDefaults?.gdpr_text || 'Este chat usa inteligencia artificial...'}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                Consejo: menciona que no se recopilan datos personales si es el caso.
              </div>
            </div>

            <div>
              <label style={labelStyle}>URL política de privacidad</label>
              <input
                value={config.gdpr_privacy_url ?? ''}
                onChange={e => setConfig(c => ({ ...c, gdpr_privacy_url: e.target.value || null }))}
                placeholder={globalDefaults?.gdpr_privacy_url || 'https://chathost.ai/privacy'}
                style={inputStyle}
              />
              <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                Déjalo vacío para usar la política de privacidad de ChatHost.
              </div>
            </div>

            <div>
              <label style={labelStyle}>Texto del botón de aceptar</label>
              <input
                value={config.gdpr_button_text ?? ''}
                onChange={e => setConfig(c => ({ ...c, gdpr_button_text: e.target.value || null }))}
                placeholder={globalDefaults?.gdpr_button_text || 'Entendido, continuar'}
                style={inputStyle}
              />
            </div>

          </div>
        </div>

        {/* Guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '12px 24px', borderRadius: 8, border: 'none',
            background: saved ? colors.green : colors.accent,
            color: '#fff', fontWeight: 600, fontSize: 14,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar configuración'}
        </button>
      </div>

      {/* Columna derecha — preview del banner */}
      <div style={{ position: 'sticky', top: 20 }}>
        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Preview del banner
        </div>

        {effective.enabled ? (
          <div style={{
            background: '#1e293b', border: '1px solid #334155',
            borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            width: '100%',
          }}>
            {/* Simulación de ventana del chat */}
            <div style={{
              background: '#2563eb', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>🤖</div>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Asistente</div>
            </div>

            {/* Banner de consentimiento */}
            <div style={{
              padding: 20, background: '#0f172a',
            }}>
              <div style={{
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 12, padding: 16,
              }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: '#f1f5f9',
                  marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  🔒 {effective.title}
                </div>
                <p style={{
                  fontSize: 12, color: '#94a3b8', lineHeight: 1.6,
                  marginBottom: 12,
                }}>
                  {effective.text.length > 150
                    ? effective.text.slice(0, 150) + '...'
                    : effective.text}
                </p>
                <a href="#" onClick={e => e.preventDefault()} style={{
                  display: 'block', fontSize: 11, color: '#2563eb',
                  marginBottom: 14, textDecoration: 'underline',
                }}>
                  Leer política de privacidad
                </a>
                <button style={{
                  width: '100%', padding: '10px 0',
                  background: '#2563eb', border: 'none',
                  borderRadius: 8, color: '#fff',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  {effective.button}
                </button>
              </div>

              {/* Input bloqueado */}
              <div style={{
                marginTop: 12, padding: '10px 14px',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 8, color: '#475569', fontSize: 13,
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span>Acepta para continuar</span>
                <span>↑</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: colors.card, border: `1px dashed ${colors.border}`,
            borderRadius: 12, padding: 24, textAlign: 'center',
            color: colors.muted, fontSize: 13,
          }}>
            Banner desactivado
          </div>
        )}
      </div>
    </div>
  )
}
