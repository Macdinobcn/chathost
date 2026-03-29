// app/admin/clients/[id]/tabs/TabChat.tsx
import { S, PLAN_CREDITOS } from '@/lib/admin-styles'

interface Props {
  cliente: any
  formChat: any
  setFormChat: (f: any) => void
  nuevoEmail: string
  setNuevoEmail: (v: string) => void
  guardar: (key: string, body: object) => void
  saving: Record<string, boolean>
  saved: Record<string, string>
  themeColor: string
  tr: (k: string, params?: any) => string
}

export default function TabChat({ cliente, formChat, setFormChat, nuevoEmail, setNuevoEmail, guardar, saving, saved, themeColor, tr }: Props) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

      {/* Columna izquierda — Reglas Maestras en formato A4 */}
      <div style={{ flex: '0 0 auto', width: 'min(520px, 55%)' }}>
        <div style={{ ...S.card, padding: '16px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={S.secLabel}>Reglas Maestras</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setFormChat({ ...formChat, system_prompt: `Eres el asistente virtual de ${cliente.name}.\n\nTONO: Amable, cercano y profesional.\nIDIOMA: Responde en el idioma del usuario.\n\nPUEDES:\n- Informar sobre precios y servicios\n- Dar horarios y datos de contacto\n\nNO PUEDES:\n- Inventar información\n- Hablar de competidores` })} style={{ ...S.btn('white', '#555'), fontSize: 11, padding: '4px 10px' }}>📋 Plantilla</button>
              <button onClick={() => setFormChat({ ...formChat, system_prompt: '' })} style={{ ...S.btn('white', '#ef4444'), fontSize: 11, padding: '4px 10px' }}>Limpiar</button>
            </div>
          </div>
          {/* Ratio A4: 1 / 1.4142 ≈ 70.7% — si ancho ~520px → alto ~735px */}
          <textarea
            value={formChat.system_prompt}
            onChange={e => setFormChat({ ...formChat, system_prompt: e.target.value })}
            placeholder={`Eres el asistente de ${cliente.name}.\n\nTONO: Amable y profesional.\n\nPUEDES:\n- Informar sobre precios y servicios\n\nNO PUEDES:\n- Inventar información`}
            style={{ ...S.inp, fontFamily: 'system-ui', resize: 'vertical', lineHeight: 1.7, width: '100%', aspectRatio: '1 / 1.4142', minHeight: 400, boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
          <button onClick={() => guardar('chat', { system_prompt: formChat.system_prompt, temperature: formChat.temperature, auto_language: formChat.auto_language, report_emails: formChat.report_emails, report_frequency: formChat.report_frequency, ai_model: formChat.ai_model })} style={S.btn(themeColor)}>
            {saving.chat ? tr('saving') : tr('save')}
          </button>
          {saved.chat && <span style={{ fontSize: 12, color: '#22c55e' }}>{saved.chat}</span>}
        </div>
      </div>

      {/* Columna derecha — configuración */}
      <div style={{ flex: 1, display: 'grid', gap: 10 }}>

        {/* Temperatura */}
        <div style={{ ...S.card, padding: '12px 14px' }}>
          <div style={{ ...S.secLabel, fontSize: 11, marginBottom: 6 }}>{tr('temperature')}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>
            <span>{tr('temperature_formal')}</span><span>{tr('temperature_creative')}</span>
          </div>
          <input type="range" min="0" max="1" step="0.1" value={formChat.temperature}
            onChange={e => setFormChat({ ...formChat, temperature: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: themeColor, marginBottom: 4 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>{formChat.temperature <= 0.3 ? tr('temperature_formal') : formChat.temperature <= 0.7 ? 'Equilibrado' : tr('temperature_creative')}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: themeColor }}>{formChat.temperature.toFixed(1)}</span>
          </div>
        </div>

        {/* Modelo IA — solo Haiku y Sonnet */}
        <div style={{ ...S.card, padding: '12px 14px' }}>
          <div style={{ ...S.secLabel, fontSize: 11, marginBottom: 8 }}>{tr('ai_model')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
            {([
              { id: 'claude-haiku-4-5-20251001', labelKey: 'model_haiku', descKey: 'model_haiku_desc', creditos: 1, color: '#059669', badge: tr('recommended') },
              { id: 'claude-sonnet-4-5', labelKey: 'model_sonnet', descKey: 'model_sonnet_desc', creditos: 4, color: '#4B7BE5', badge: '' },
            ] as const).map(m => {
              const active = formChat.ai_model === m.id
              const planCreditos = PLAN_CREDITOS[cliente.plan] || 500
              const msgsDisponibles = Math.floor(planCreditos / m.creditos)
              return (
                <div key={m.id} onClick={() => setFormChat({ ...formChat, ai_model: m.id })}
                  style={{ border: `2px solid ${active ? m.color : '#e2e8f0'}`, borderRadius: 9, padding: '8px 10px', cursor: 'pointer', background: active ? `${m.color}08` : 'white', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: active ? m.color : '#0f172a' }}>{tr(m.labelKey as any)}</span>
                    {m.badge && <span style={{ fontSize: 8, padding: '1px 5px', borderRadius: 4, background: `${m.color}18`, color: m.color, fontWeight: 700 }}>{m.badge}</span>}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 5 }}>{tr(m.descKey as any)}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: m.color, background: `${m.color}10`, borderRadius: 5, padding: '2px 6px', textAlign: 'center', marginBottom: 4 }}>
                    {m.creditos} {m.creditos === 1 ? tr('credits_per_msg') : tr('credits_per_msg_plural')}
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '4px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 1 }}>Plan {cliente.plan}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{msgsDisponibles.toLocaleString('es-ES')}</div>
                    <div style={{ fontSize: 9, color: '#64748b' }}>msgs/mes</div>
                  </div>
                  {m.creditos > 1 && active && (
                    <div style={{ marginTop: 4, fontSize: 9, color: '#f59e0b', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 5, padding: '2px 6px', textAlign: 'center' }}>
                      ⚠️ {tr('model_warning' as any, { n: m.creditos })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Idioma automático */}
        <div style={{ ...S.card, padding: '10px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#0f172a' }}>{tr('auto_language')}</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{tr('auto_language_desc')}</div>
            </div>
            <div style={S.tgl(formChat.auto_language, themeColor)} onClick={() => setFormChat({ ...formChat, auto_language: !formChat.auto_language })}>
              <div style={S.tglK(formChat.auto_language)} />
            </div>
          </div>
        </div>

        {/* Emails de informe */}
        <div style={{ ...S.card, padding: '12px 14px' }}>
          <div style={{ ...S.secLabel, fontSize: 11, marginBottom: 8 }}>{tr('daily_email')}</div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ ...S.lbl, fontSize: 11 }}>Emails que reciben el informe</label>
            {formChat.report_emails.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 6 }}>
                {formChat.report_emails.map((em: string, i: number) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: `${themeColor}12`, border: `1px solid ${themeColor}30`, borderRadius: 20, padding: '3px 8px', fontSize: 11 }}>
                    <span style={{ color: themeColor }}>✉️ {em}</span>
                    <button onClick={() => setFormChat({ ...formChat, report_emails: formChat.report_emails.filter((_: any, j: number) => j !== i) })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <input type="email" value={nuevoEmail} onChange={e => setNuevoEmail(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && nuevoEmail.trim() && nuevoEmail.includes('@')) { setFormChat({ ...formChat, report_emails: [...formChat.report_emails, nuevoEmail.trim()] }); setNuevoEmail('') } }}
                placeholder="email@negocio.com  →  Enter"
                style={{ ...S.inp, flex: 1, width: 'auto', fontSize: 12, padding: '6px 10px' }} />
              <button onClick={() => { if (nuevoEmail.trim() && nuevoEmail.includes('@')) { setFormChat({ ...formChat, report_emails: [...formChat.report_emails, nuevoEmail.trim()] }); setNuevoEmail('') } }}
                style={{ ...S.btn(themeColor), fontSize: 12, padding: '6px 12px' }}>+</button>
            </div>
          </div>
          <div>
            <label style={{ ...S.lbl, fontSize: 11 }}>Frecuencia</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {([
                { v: 'daily', l: '📅 Diario', d: 'Cada día' },
                { v: 'weekly', l: '📆 Semanal', d: 'Los lunes' },
                { v: 'monthly', l: '🗓 Mensual', d: 'Día 1' },
              ] as const).map(opt => (
                <div key={opt.v} onClick={() => setFormChat({ ...formChat, report_frequency: opt.v })}
                  style={{ padding: '7px 6px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', border: `1.5px solid ${formChat.report_frequency === opt.v ? themeColor : '#e2e8f0'}`, background: formChat.report_frequency === opt.v ? `${themeColor}0e` : 'white' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: formChat.report_frequency === opt.v ? themeColor : '#0f172a' }}>{opt.l}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 1 }}>{opt.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
