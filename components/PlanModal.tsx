'use client'

import { useState } from 'react'

interface PlanModalProps {
  isOpen: boolean
  currentPlan: string
  onClose: () => void
}

const PLANS = [
  { id: 'starter', name: 'Starter', price: 19, bots: 1, msgs: 500, color: '#22c55e' },
  { id: 'pro', name: 'Pro', price: 49, bots: 3, msgs: 3000, color: '#818cf8', recommended: true },
  { id: 'business', name: 'Business', price: 99, bots: 10, msgs: 10000, color: '#c084fc' },
  { id: 'agency', name: 'Agency', price: 199, bots: 30, msgs: 50000, color: '#fb923c' },
]

const ADD_ONS = [
  { id: 'bots-3', name: '3 bots adicionales', price: 10, type: 'bots', qty: 3 },
  { id: 'bots-6', name: '6 bots adicionales', price: 20, type: 'bots', qty: 6 },
  { id: 'msgs-1k', name: '+1,000 mensajes', price: 5, type: 'msgs', qty: 1000 },
  { id: 'msgs-5k', name: '+5,000 mensajes', price: 20, type: 'msgs', qty: 5000 },
  { id: 'msgs-10k', name: '+10,000 mensajes', price: 35, type: 'msgs', qty: 10000 },
]

export default function PlanModal({ isOpen, currentPlan, onClose }: PlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlan)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const basePlan = PLANS.find(p => p.id === selectedPlan)
  const addOnsPrice = selectedAddOns.reduce((acc, id) => {
    const addon = ADD_ONS.find(a => a.id === id)
    return acc + (addon?.price || 0)
  }, 0)
  const totalPrice = (basePlan?.price || 0) + addOnsPrice

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, maxWidth: 1000, maxHeight: '90vh',
        overflow: 'auto', padding: 32, color: '#f1f5f9', fontFamily: 'Outfit, -apple-system, sans-serif',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Elige tu plan</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 24, cursor: 'pointer', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* PLANES */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Planes base</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {PLANS.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  background: selectedPlan === plan.id ? plan.color + '20' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${selectedPlan === plan.id ? plan.color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, padding: 20, cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
                }}
              >
                {plan.recommended && (
                  <div style={{ position: 'absolute', top: -12, left: 12, background: '#f59e0b', color: '#000', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>
                    RECOMENDADO
                  </div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: plan.color, marginBottom: 12 }}>
                  {plan.price}€<span style={{ fontSize: 12, color: '#64748b' }}>/mes</span>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.8 }}>
                  <div>• {plan.bots} bot{plan.bots > 1 ? 's' : ''}</div>
                  <div>• {plan.msgs.toLocaleString()} msgs</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADD-ONS */}
        <div style={{ marginBottom: 40 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Add-ons opcionales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {ADD_ONS.map(addon => (
              <label key={addon.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <input
                  type="checkbox"
                  checked={selectedAddOns.includes(addon.id)}
                  onChange={() => toggleAddOn(addon.id)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{addon.name}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>+{addon.price}€</div>
              </label>
            ))}
          </div>
        </div>

        {/* RESUMEN + CTA */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Precio total mensual</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#818cf8' }}>
              {totalPrice}€<span style={{ fontSize: 14, color: '#64748b' }}>/mes</span>
            </div>
            {selectedAddOns.length > 0 && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                Base: {basePlan?.price}€ + Add-ons: {addOnsPrice}€
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cancelar
            </button>
            <button
              style={{ padding: '12px 24px', borderRadius: 10, border: 'none', background: '#818cf8', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Cambiar plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
