'use client'
// components/Toast.tsx — Sistema de notificaciones elegante para el admin

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastData {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; iconBg: string }> = {
  success: { bg: '#ffffff', border: '#bbf7d0', icon: '#16a34a', iconBg: '#f0fdf4' },
  error:   { bg: '#ffffff', border: '#fecaca', icon: '#dc2626', iconBg: '#fef2f2' },
  info:    { bg: '#ffffff', border: '#bfdbfe', icon: '#2563eb', iconBg: '#eff6ff' },
  warning: { bg: '#ffffff', border: '#fde68a', icon: '#d97706', iconBg: '#fffbeb' },
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)
  const c = COLORS[toast.type]
  const duration = toast.duration ?? 4000

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      background: c.bg,
      border: `1.5px solid ${c.border}`,
      borderRadius: 14,
      padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      minWidth: 300, maxWidth: 400,
      transform: visible ? 'translateX(0) scale(1)' : 'translateX(120%) scale(0.95)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'pointer',
      fontFamily: '-apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    }} onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }}>

      {/* Icono */}
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: c.iconBg, border: `1.5px solid ${c.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: c.icon, flexShrink: 0,
      }}>
        {ICONS[toast.type]}
      </div>

      {/* Texto */}
      <div style={{ flex: 1, paddingTop: 2 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: toast.message ? 3 : 0 }}>
          {toast.title}
        </div>
        {toast.message && (
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
            {toast.message}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 3, borderRadius: '0 0 12px 12px', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: c.icon, opacity: 0.4,
          animation: `shrink ${duration}ms linear forwards`,
        }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shrink { from { width: 100% } to { width: 0% } }
      `}} />
    </div>
  )
}

// ── Contexto global ──────────────────────────────────────────────────────────
let _addToast: ((toast: Omit<ToastData, 'id'>) => void) | null = null

export function toast(type: ToastType, title: string, message?: string, duration?: number) {
  _addToast?.({ type, title, message, duration })
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    _addToast = (t) => {
      const id = Math.random().toString(36).slice(2)
      setToasts(prev => [...prev, { ...t, id }])
    }
    return () => { _addToast = null }
  }, [])

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto', position: 'relative' }}>
          <ToastItem toast={t} onRemove={remove} />
        </div>
      ))}
    </div>
  )
}
