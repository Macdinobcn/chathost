// app/admin/clients/[id]/tabs/TabBilling.tsx
// Gestión de plan, recargas y facturación del cliente
'use client'
import { useState } from 'react'
import { S } from '@/lib/admin-styles'

interface Props {
  cliente: any
  themeColor: string
  tr: (k: string, params?: any) => string
}

const PLANS = [
  { key: 'starter',  name: 'Starter',  price: '€19/mes', msgs: '500 msgs',    bots: '1 bot',    color: '#22c55e', emoji: '🌱' },
  { key: 'pro',      name: 'Pro',      price: '€49/mes', msgs: '3.000 msgs',  bots: '3 bots',   color: '#4f46e5', emoji: '🚀' },
  { key: 'business', name: 'Business', price: '€99/mes', msgs: '10.000 msgs', bots: '10 bots',  color: '#7c3aed', emoji: '💼' },
  { key: 'agency',   name: 'Agency',   price: '€199/mes', msgs: '30.000 msgs', bots: '30 bots', color: '#fb923c', emoji: '🏢' },
]

const PACKS = [
  { key: 'pack_s',  name: 'Pack S',  price: '€5',  msgs: '625 msgs' },
  { key: 'pack_m',  name: 'Pack M',  price: '€15', msgs: '2.000 msgs' },
  { key: 'pack_l',  name: 'Pack L',  price: '€35', msgs: '5.000 msgs' },
  { key: 'pack_xl', name: 'Pack XL', price: '€60', msgs: '10.000 msgs' },
]

export default function TabBilling({ cliente, themeColor, tr }: Props) {
  const [loading, setLoading] = useState<string>('')
  const [botsExtra, setBotsExtra] = useState(1)

  async function goToCheckout(type: string, quantity?: number) {
    setLoading(type)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, clientId: cliente.id, quantity }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { alert(data.error || 'Error al crear sesión de pago'); setLoading('') }
  }

  async function openPortal() {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: cliente.id }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { alert(data.error || 'Error'); setLoading('') }
  }

  const planActual = PLANS.find(p => p.key === cliente.plan) || PLANS[0]
  const statusColor = cliente.subscription_status === 'active' ? '#22c55e'
    : cliente.subscription_status === 'trial' ? '#f59e0b' : '#ef4444'
  const statusLabel = cliente.subscription_status === 'active' ? '✓ Activo'
    : cliente.subscription_status === 'trial' ? '⏳ Trial' : cliente.subscription_status || 'Sin plan'

  const PLAN_MAX: Record<string, number> = { starter: 500, pro: 3000, business: 10000, agency: 30000 }
  const maxCredits = PLAN_MAX[cliente.plan] || 500
  const credits = cliente.credits_balance || 0
  const usedPct = Math.min(100, Math.round(((maxCredits - credits) / maxCredits) * 100))
  const barColor = credits < maxCredits * 0.2 ? '#ef4444' : credits < maxCredits * 0.5 ? '#f59e0b' : '#22c55e'

  return (
    <div style={{ display: 'grid', gap: 16 }}>

      {/* Estado actual */}
      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={S.secLabel}>Plan actual</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>{planActual.emoji}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: planActual.color }}>{planActual.name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{planActual.price} · {planActual.msgs} · {planActual.bots}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: statusColor, background: statusColor + '15', padding: '4px 12px', borderRadius: 20 }}>
              {statusLabel}
            </span>
            {cliente.stripe_customer_id && (
              <button onClick={openPortal} disabled={loading === 'portal'}
                style={S.btn('white', '#64748b')}>
                {loading === 'portal' ? '...' : '📄 Facturas'}
              </button>
            )}
          </div>
        </div>

        {/* Barra de créditos */}
        <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: '#64748b' }}>Mensajes disponibles</span>
          <span style={{ fontWeight: 700, color: barColor }}>{credits.toLocaleString()} / {maxCredits.toLocaleString()}</span>
        </div>
        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${100 - usedPct}%`, background: barColor, borderRadius: 6, transition: 'width 0.4s' }} />
        </div>
        {credits < maxCredits * 0.2 && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>⚠️ Quedan pocos mensajes — recarga ahora</div>
        )}
      </div>

      {/* Cambiar plan */}
      <div style={S.card}>
        <div style={S.secLabel}>Cambiar plan</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {PLANS.map((plan, idx) => {
            const currentIdx = PLANS.findIndex(p => p.key === cliente.plan)
            const isCurrent = plan.key === cliente.plan
            const isUpgrade = idx > currentIdx
            return (
              <div key={plan.key}
                style={{ border: `2px solid ${isCurrent ? plan.color : isUpgrade ? plan.color + '40' : '#e2e8f0'}`, borderRadius: 12, padding: '14px 12px', background: isCurrent ? plan.color + '08' : 'white', textAlign: 'center', opacity: isUpgrade || isCurrent ? 1 : 0.4 }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{plan.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, marginBottom: 2 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>{plan.price}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>{plan.msgs}</div>
                {isCurrent ? (
                  <div style={{ fontSize: 11, color: plan.color, fontWeight: 700, padding: '6px 0' }}>✓ Plan actual</div>
                ) : isUpgrade ? (
                  <button onClick={() => goToCheckout(plan.key)} disabled={!!loading}
                    style={{ ...S.btn(plan.color), padding: '6px 12px', fontSize: 11, width: '100%', fontWeight: 800 }}>
                    {loading === plan.key ? '...' : '↑ Upgrade'}
                  </button>
                ) : (
                  <div style={{ fontSize: 11, color: '#94a3b8', padding: '6px 0' }}>Plan inferior</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recargas */}
      <div style={S.card}>
        <div style={S.secLabel}>Recargar mensajes</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          Añade mensajes a tu saldo sin cambiar de plan. Los créditos no caducan.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {PACKS.map(pack => (
            <button key={pack.key} onClick={() => goToCheckout(pack.key)} disabled={!!loading}
              style={{ border: `1.5px solid #e2e8f0`, borderRadius: 10, padding: '14px 10px', background: 'white', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = themeColor)}
              onMouseOut={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: themeColor, marginBottom: 2 }}>{pack.price}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{pack.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{pack.msgs}</div>
              {loading === pack.key && <div style={{ fontSize: 11, color: themeColor, marginTop: 4 }}>...</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Bots adicionales */}
      <div style={S.card}>
        <div style={S.secLabel}>Bots adicionales</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>
          €10/mes por cada bot extra que añadas a tu plan actual.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setBotsExtra(Math.max(1, botsExtra - 1))}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>−</button>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', minWidth: 32, textAlign: 'center' }}>{botsExtra}</span>
            <button onClick={() => setBotsExtra(botsExtra + 1)}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 700 }}>+</button>
          </div>
          <div style={{ color: '#64748b', fontSize: 13 }}>
            bot{botsExtra > 1 ? 's' : ''} extra = <strong style={{ color: '#0f172a' }}>€{botsExtra * 10}/mes</strong>
          </div>
          <button onClick={() => goToCheckout('bot_extra', botsExtra)} disabled={!!loading}
            style={S.btn(themeColor)}>
            {loading === 'bot_extra' ? '...' : `Añadir ${botsExtra} bot${botsExtra > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>

    </div>
  )
}
