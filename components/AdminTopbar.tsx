'use client'
// components/AdminTopbar.tsx
// Topbar compartido para TODAS las páginas admin
// Cambias aquí → cambia en admin, settings y panel de clientes

import Link from 'next/link'

interface AdminTopbarProps {
  // Breadcrumb: si se pasa clienteName, muestra Admin / ClienteName
  clienteName?: string
  clienteActivo?: boolean
  clienteColor?: string
  clienteIconUrl?: string
  widgetId?: string
  // Acciones opcionales (lado derecho)
  actions?: React.ReactNode
}

const TOPBAR_BG = '#1e293b'
const TOPBAR_BORDER = '#334155'

export default function AdminTopbar({
  clienteName,
  clienteActivo,
  clienteColor,
  clienteIconUrl,
  widgetId,
  actions,
}: AdminTopbarProps) {
  return (
    <div style={{
      background: TOPBAR_BG,
      borderBottom: `1px solid ${TOPBAR_BORDER}`,
      padding: '0 28px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Izquierda — logo + breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link href="/admin" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src="/logo.png" alt="ChatHost.ai" style={{ height: 28, width: 'auto' }} />
        </Link>

        {/* Breadcrumb si estamos dentro de un cliente */}
        {clienteName && (
          <>
            <span style={{ color: '#475569', fontSize: 18, lineHeight: 1 }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {clienteIconUrl
                ? <img src={clienteIconUrl} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
                : <div style={{ width: 10, height: 10, borderRadius: '50%', background: clienteColor || '#2563eb' }} />}
              <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{clienteName}</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: clienteActivo ? '#22c55e' : '#64748b',
                background: clienteActivo ? '#052e16' : '#0f172a',
                padding: '2px 8px', borderRadius: 20,
                border: `1px solid ${clienteActivo ? '#166534' : '#334155'}`,
              }}>
                {clienteActivo ? '● activo' : '○ inactivo'}
              </span>
            </div>
          </>
        )}

        {/* Nav si estamos en nivel admin (sin cliente) */}
        {!clienteName && (
          <nav style={{ display: 'flex', gap: 4 }}>
            <Link href="/admin" style={{
              fontSize: 12, fontWeight: 500, color: '#94a3b8',
              padding: '5px 10px', borderRadius: 6, textDecoration: 'none',
            }}>
              Clientes
            </Link>
            <Link href="/admin/settings" style={{
              fontSize: 12, fontWeight: 500, color: '#94a3b8',
              padding: '5px 10px', borderRadius: 6, textDecoration: 'none',
            }}>
              ⚙️ Configuración
            </Link>
          </nav>
        )}
      </div>

      {/* Derecha — acciones */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {widgetId && (
          <a
            href={`/widget/${widgetId}`}
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: 12, fontWeight: 500, color: '#94a3b8',
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid #334155', background: '#0f172a',
              textDecoration: 'none', cursor: 'pointer',
            }}
          >
            💬 Ver widget
          </a>
        )}
        {actions}
      </div>
    </div>
  )
}
