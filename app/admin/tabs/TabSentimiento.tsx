'use client'
import { useEffect, useState } from 'react'

interface SentimentSummary {
  client_id: string
  client_name: string
  widget_color: string
  total_analyzed: number
  positive_pct: number
  negative_pct: number
  neutral_pct: number
  top_topics: string[]
  top_issues: string[]
  last_analyzed: string
}

interface GlobalInsight {
  total_conversations: number
  avg_positive: number
  avg_negative: number
  top_complaints: string[]
  top_praises: string[]
  improvement_suggestions: string[]
  generated_at: string
}

export default function TabSentimiento() {
  const [summaries, setSummaries] = useState<SentimentSummary[]>([])
  const [global, setGlobal] = useState<GlobalInsight | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sentiment')
      if (res.ok) {
        const data = await res.json()
        setSummaries(data.summaries || [])
        setGlobal(data.global || null)
      }
    } catch (e) {
      console.error('Error loading sentiment:', e)
    } finally {
      setLoading(false)
    }
  }

  async function analyze() {
    setAnalyzing(true)
    try {
      const res = await fetch('/api/admin/sentiment/analyze', { method: 'POST' })
      if (res.ok) await load()
    } catch (e) {
      console.error('Error analyzing sentiment:', e)
    } finally {
      setAnalyzing(false)
    }
  }

  const btnBase: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, padding: '7px 16px', borderRadius: 8,
    cursor: 'pointer', border: 'none',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>Análisis de sentimiento entre clientes</div>
        <button
          onClick={analyze}
          disabled={analyzing}
          style={{ ...btnBase, background: '#4f46e5', color: 'white', opacity: analyzing ? 0.6 : 1, cursor: analyzing ? 'not-allowed' : 'pointer' }}
        >
          {analyzing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Analizando...
            </span>
          ) : '✨ Analizar ahora'}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: '#98a2b3', fontSize: 13 }}>Cargando datos de sentimiento...</div>
      ) : summaries.length === 0 && !global ? (
        <EmptyState />
      ) : (
        <>
          {/* Global stats */}
          {global && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <StatCard label="Positivo promedio" val={`${Math.round(global.avg_positive)}%`} color="#16a34a" sub={`${global.total_conversations.toLocaleString()} conversaciones analizadas`} />
                <StatCard label="Negativo promedio" val={`${Math.round(global.avg_negative)}%`} color="#ef4444" sub="Entre todos los clientes" />
                <StatCard label="Total analizadas" val={global.total_conversations.toLocaleString()} color="#4f46e5" sub={`Actualizado ${new Date(global.generated_at).toLocaleDateString('es-ES')}`} />
              </div>

              {/* Global insights card */}
              <div style={{ background: 'white', border: '1px solid #eaecf0', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#101828', marginBottom: 16 }}>💡 Insights globales</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                  <InsightList title="Quejas frecuentes" items={global.top_complaints} color="#ef4444" bullet="▸" />
                  <InsightList title="Lo que elogian" items={global.top_praises} color="#16a34a" bullet="▸" />
                  <InsightList title="Sugerencias de mejora" items={global.improvement_suggestions} color="#4f46e5" bullet="▸" />
                </div>
              </div>
            </>
          )}

          {/* Client grid */}
          {summaries.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#667085', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Por cliente — {summaries.length} analizados
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {summaries.map(s => <ClientSentimentCard key={s.client_id} summary={s} />)}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function StatCard({ label, val, color, sub }: { label: string; val: string; color: string; sub?: string }) {
  return (
    <div style={{ background: 'white', border: '1px solid #eaecf0', borderRadius: 10, padding: '16px 20px' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#98a2b3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', color }}>{val}</div>
      {sub && <div style={{ fontSize: 10, color: '#d0d5dd', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function InsightList({ title, items, color, bullet }: { title: string; items: string[]; color: string; bullet: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</div>
      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: '#d0d5dd' }}>Sin datos</div>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {items.map((item, i) => (
            <li key={i} style={{ fontSize: 12, color: '#344054', display: 'flex', gap: 6, lineHeight: 1.4 }}>
              <span style={{ color, flexShrink: 0, marginTop: 1 }}>{bullet}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ClientSentimentCard({ summary }: { summary: SentimentSummary }) {
  const pos = Math.round(summary.positive_pct)
  const neg = Math.round(summary.negative_pct)
  const neu = Math.round(summary.neutral_pct)

  return (
    <div style={{ background: 'white', border: '1px solid #eaecf0', borderRadius: 10, padding: '16px 18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: summary.widget_color, flexShrink: 0 }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: '#101828', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {summary.client_name}
        </div>
        <div style={{ fontSize: 10, color: '#98a2b3', flexShrink: 0 }}>
          {summary.total_analyzed} conv.
        </div>
      </div>

      {/* Sentiment bar */}
      <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', gap: 1, marginBottom: 8 }}>
        {pos > 0 && <div style={{ flex: pos, background: '#22c55e' }} />}
        {neu > 0 && <div style={{ flex: neu, background: '#94a3b8' }} />}
        {neg > 0 && <div style={{ flex: neg, background: '#ef4444' }} />}
      </div>

      {/* Percentages */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 11, fontWeight: 600 }}>
        <span style={{ color: '#16a34a' }}>▲ {pos}%</span>
        <span style={{ color: '#94a3b8' }}>● {neu}%</span>
        <span style={{ color: '#ef4444' }}>▼ {neg}%</span>
      </div>

      {/* Topics */}
      {summary.top_topics.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#98a2b3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Temas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {summary.top_topics.slice(0, 4).map((t, i) => (
              <span key={i} style={{ fontSize: 10, background: '#f0f4ff', color: '#4f46e5', border: '1px solid #e0e7ff', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Issues */}
      {summary.top_issues.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Problemas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {summary.top_issues.slice(0, 3).map((issue, i) => (
              <div key={i} style={{ fontSize: 11, color: '#dc2626', display: 'flex', gap: 5, lineHeight: 1.4 }}>
                <span style={{ flexShrink: 0 }}>·</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last analyzed */}
      <div style={{ fontSize: 10, color: '#d0d5dd', marginTop: 6 }}>
        Analizado {new Date(summary.last_analyzed).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ background: 'white', border: '1px solid #eaecf0', borderRadius: 10, padding: 56, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🧠</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 8 }}>Sin análisis de sentimiento</div>
      <div style={{ fontSize: 13, color: '#667085', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
        Haz click en <strong>Analizar ahora</strong> para procesar las conversaciones de todos los clientes y obtener insights sobre la satisfacción de los usuarios.
      </div>
    </div>
  )
}
