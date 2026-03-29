// app/admin/clients/[id]/tabs/TabGeneral.tsx
import { S, PLAN_CREDITOS } from '@/lib/admin-styles'

interface Props {
  cliente: any
  kb: any
  costeMes: any
  formGeneral: any
  setFormGeneral: (f: any) => void
  guardar: (key: string, body: object) => void
  eliminarCliente: () => void
  saving: Record<string, boolean>
  saved: Record<string, string>
  themeColor: string
  tr: (k: string) => string
}

export default function TabGeneral({ cliente, kb, costeMes, formGeneral, setFormGeneral, guardar, eliminarCliente, saving, saved, themeColor, tr }: Props) {
  const PLAN_MSGS: Record<string, number> = PLAN_CREDITOS
  const max = PLAN_MSGS[cliente.plan] || 500
  const used = costeMes?.messages_count || 0
  const restantes = max - used
  const pct = Math.min(100, Math.round(used / max * 100))

  return (
    <>
      <div style={S.statRow(4)}>
        {[
          { lbl: 'Mensajes este mes', val: used.toLocaleString(), color: '#4B7BE5', emoji: '💬' },
          { lbl: 'Mensajes disponibles', val: restantes.toLocaleString() + ' / ' + max.toLocaleString(), color: '#22c55e', emoji: '✅' },
          { lbl: 'Palabras en KB', val: kb?.words_count?.toLocaleString() || '0', color: themeColor, emoji: '📚' },
          { lbl: 'Plan', val: cliente.plan, color: '#8b5cf6', emoji: '📦' },
        ].map((s) => (
          <div key={s.lbl} style={S.statBox}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{s.lbl}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={S.g2}>
        <div style={S.card}>
          <div style={S.secLabel}>Datos del cliente</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[{ l: 'Nombre', k: 'name', t: 'text' }, { l: 'URL web', k: 'website_url', t: 'url' }, { l: 'Email', k: 'email', t: 'email' }].map(f => (
              <div key={f.k}>
                <label style={S.lbl}>{f.l}</label>
                <input type={f.t} value={(formGeneral as any)[f.k]} onChange={e => setFormGeneral({ ...formGeneral, [f.k]: e.target.value })} style={S.inp} />
              </div>
            ))}
            <div>
              <label style={S.lbl}>Plan</label>
              <select value={formGeneral.plan} onChange={e => setFormGeneral({ ...formGeneral, plan: e.target.value })} style={{ ...S.inp, padding: '9px 13px' }}>
                <option value="basic">Basic — €19/mes</option>
                <option value="pro">Pro — €49/mes</option>
                <option value="business">Business — €99/mes</option>
                <option value="agency">Agency — €199/mes</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={formGeneral.active} id="act" onChange={e => setFormGeneral({ ...formGeneral, active: e.target.checked })} />
              <label htmlFor="act" style={{ fontSize: 13, color: '#374151' }}>Cliente activo</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 16 }}>
            <button onClick={() => guardar('general', formGeneral)} style={S.btn(themeColor)}>
              {saving.general ? 'Guardando...' : 'Guardar'}
            </button>
            {saved.general && <span style={{ fontSize: 12, color: '#22c55e' }}>{saved.general}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { lbl: 'Mensajes este mes', val: used.toLocaleString(), color: '#4B7BE5', icon: '💬', bg: '#eff6ff', extra: undefined as number | undefined },
            { lbl: 'Mensajes restantes', val: restantes.toLocaleString() + ' de ' + max.toLocaleString(), color: restantes < max * 0.2 ? '#ef4444' : '#22c55e', icon: restantes < max * 0.2 ? '⚠️' : '✅', bg: restantes < max * 0.2 ? '#fef2f2' : '#f0fdf4', extra: pct },
            { lbl: 'Palabras en KB', val: kb?.words_count?.toLocaleString() || '0', color: themeColor, icon: '📚', bg: `${themeColor}12`, extra: undefined as number | undefined },
          ].map((s) => (
            <div key={s.lbl} style={{ ...S.card, marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{s.lbl}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
                </div>
              </div>
              {s.extra !== undefined && (
                <div style={{ marginTop: 10, height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: s.extra + '%', borderRadius: 3, background: s.extra > 80 ? '#ef4444' : s.extra > 50 ? '#f59e0b' : '#22c55e', transition: 'width 0.3s' }} />
                </div>
              )}
            </div>
          ))}

          <div style={{ ...S.card, marginBottom: 0 }}>
            <div style={S.secLabel}>Zona de peligro</div>
            <button onClick={eliminarCliente} style={{ ...S.btn('#fef2f2', '#dc2626'), border: '1.5px solid #fecaca' }}>
              🗑 Eliminar cliente
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
