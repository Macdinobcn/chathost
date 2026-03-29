// app/admin/clients/[id]/tabs/TabKnowledgeBase.tsx
import { useRef } from 'react'
import { S } from '@/lib/admin-styles'

interface Props {
  cliente: any; kb: any; kbSources: any[]
  textoKB: string; setTextoKB: (v: string) => void
  mostrarEditorKB: boolean; setMostrarEditorKB: (v: boolean) => void
  scraping: boolean; msgScraping: string
  recrawlDays: number; setRecrawlDays: (v: number) => void
  nuevaUrl: string; setNuevaUrl: (v: string) => void
  addingUrl: boolean; addUrl: () => void
  uploadingFile: boolean; uploadKBFile: (f: File) => void
  eliminarSource: (id: string) => void
  isDragOver: boolean
  handleDragEnter: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  lanzarScraping: () => void
  guardar: (key: string, body: object) => void
  saving: Record<string, boolean>; saved: Record<string, string>
  themeColor: string; id: string; cargar: () => void; cargarSources: () => void
}

export default function TabKnowledgeBase(props: Props) {
  const { cliente, kb, kbSources, textoKB, setTextoKB, mostrarEditorKB, setMostrarEditorKB,
    scraping, msgScraping, recrawlDays, setRecrawlDays, nuevaUrl, setNuevaUrl, addingUrl, addUrl,
    uploadingFile, uploadKBFile, eliminarSource, isDragOver, handleDragEnter, handleDragLeave,
    handleDragOver, handleDrop, lanzarScraping, guardar, saving, saved, themeColor, id, cargar, cargarSources } = props
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileTypes = [
    { ext: '.pdf', icon: '📄', label: 'PDF' },
    { ext: '.docx,.doc', icon: '📝', label: 'Word' },
    { ext: '.txt', icon: '📃', label: 'TXT' },
  ]
  return (
    <div style={{ display: 'grid', gap: 14 }}>
            {/* Stats + scraping */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div><div style={S.secLabel}>Knowledge base</div><div style={{ fontSize: 12, color: '#888' }}>Información que usa el chatbot para responder</div></div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setMostrarEditorKB(!mostrarEditorKB)} style={S.btn('white', '#555')}>✏️ Editar texto</button>
                  <button onClick={lanzarScraping} disabled={scraping} style={S.btn(scraping ? '#aaa' : '#4B7BE5')}>{scraping ? '⏳ Scrapeando...' : '↺ Re-crawl todo'}</button>
                </div>
              </div>

              {msgScraping && (
                <div style={{ background: msgScraping.startsWith('✓') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msgScraping.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`, borderRadius: 8, padding: '10px 14px', fontSize: 12, color: msgScraping.startsWith('✓') ? '#166534' : '#991b1b', marginBottom: 14 }}>{msgScraping}</div>
              )}

              <div style={S.statRow(4)}>
                {[
                  { lbl: 'Estado', val: kb?.scraping_status === 'ok' ? '✅ OK' : kb?.scraping_status === 'error' ? '❌ Error' : '⏳ Pendiente' },
                  { lbl: 'Páginas', val: String(kb?.pages_scraped || 0) },
                  { lbl: 'Palabras', val: kb?.words_count?.toLocaleString() || '0' },
                  { lbl: 'Actualizado', val: kb ? new Date(kb.last_scraped_at).toLocaleDateString('es-ES') : '—' },
                ].map((s, i) => (
                  <div key={s.lbl} style={{ ...S.statBox, borderRight: i < 3 ? '1px solid #f0f0f0' : 'none' }}>
                    <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>{s.lbl}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {mostrarEditorKB && (
                <div style={{ marginTop: 14 }}>
                  <textarea value={textoKB} onChange={e => setTextoKB(e.target.value)} rows={12}
                    style={{ ...S.inp, fontFamily: 'monospace', resize: 'vertical', lineHeight: 1.6, fontSize: 12 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                    <span style={{ fontSize: 11, color: '#aaa' }}>{textoKB.split(/\s+/).filter(Boolean).length} palabras</span>
                    <button onClick={async () => { setSaving(s => ({ ...s, kb: true })); await fetch('/api/knowledge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId: id, contentMd: textoKB }) }); setSaving(s => ({ ...s, kb: false })); setMostrarEditorKB(false); cargar() }} style={S.btn(themeColor)}>
                      {saving.kb ? 'Guardando...' : 'Guardar KB'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Auto-recrawl */}
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={S.secLabel}>Re-crawl automático</div>
                  <div style={{ fontSize: 12, color: '#888' }}>El sistema actualiza la knowledge base automáticamente cada X días</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {kb?.last_scraped_at && (
                    <span style={{ fontSize: 11, color: '#aaa' }}>
                      Último: {new Date(kb.last_scraped_at).toLocaleDateString('es-ES')}
                      {' · Próximo: '}
                      {new Date(new Date(kb.last_scraped_at).getTime() + recrawlDays * 86400000).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={S.lbl}>Cada cuántos días</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                    <input type="range" min="1" max="30" step="1" value={recrawlDays}
                      onChange={e => setRecrawlDays(parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: themeColor }} />
                    <div style={{ minWidth: 52, textAlign: 'center', background: themeColor + '12', border: '1px solid ' + themeColor + '30', borderRadius: 8, padding: '4px 10px', fontSize: 14, fontWeight: 700, color: themeColor }}>
                      {recrawlDays}d
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#aaa', marginTop: 4 }}>
                    <span>Cada día</span>
                    <span>Cada 15 días</span>
                    <span>Cada mes</span>
                  </div>
                </div>
              </div>
              {/* Atajos rápidos */}
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {[{ v: 3, l: 'Cada 3 días' }, { v: 7, l: 'Semanal' }, { v: 10, l: 'Cada 10 días' }, { v: 15, l: 'Quincenal' }, { v: 30, l: 'Mensual' }].map(opt => (
                  <button key={opt.v} onClick={() => setRecrawlDays(opt.v)}
                    style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: recrawlDays === opt.v ? 700 : 400, border: '1px solid ' + (recrawlDays === opt.v ? themeColor : '#e2e8f0'), background: recrawlDays === opt.v ? themeColor + '12' : 'white', color: recrawlDays === opt.v ? themeColor : '#555', cursor: 'pointer' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
                <button onClick={() => guardar('recrawl', { recrawl_days: recrawlDays })} style={S.btn(themeColor)}>
                  {saving.recrawl ? 'Guardando...' : 'Guardar frecuencia'}
                </button>
                {saved.recrawl && <span style={{ fontSize: 12, color: '#22c55e' }}>{saved.recrawl}</span>}
              </div>
            </div>

            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={S.secLabel}>URLs adicionales</div>
                  <div style={{ fontSize: 12, color: '#888' }}>Páginas extra que se scrapearan y añadirán a la KB automáticamente</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input type="url" value={nuevaUrl} onChange={e => setNuevaUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addUrl()}
                  placeholder="https://ejemplo.com/pagina-especifica"
                  style={{ ...S.inp, flex: 1, width: 'auto' }} />
                <button onClick={addUrl} disabled={addingUrl || !nuevaUrl.trim()} style={S.btn(themeColor)}>
                  {addingUrl ? '⏳' : '+ Añadir'}
                </button>
              </div>

              {kbSources.filter(s => s.type === 'url').length > 0 && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {kbSources.filter(s => s.type === 'url').map(src => (
                    <div key={src.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                      <span style={{ fontSize: 15 }}>🌐</span>
                      <a href={src.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontSize: 12, color: '#4B7BE5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.url}</a>
                      {src.words_count > 0 && <span style={S.tag('#f0fdf4', '#059669')}>{src.words_count.toLocaleString()} palabras</span>}
                      <span style={S.tag(src.status === 'ok' ? '#f0fdf4' : src.status === 'error' ? '#fef2f2' : '#fefce8', src.status === 'ok' ? '#059669' : src.status === 'error' ? '#ef4444' : '#854d0e')}>
                        {src.status === 'ok' ? '✓' : src.status === 'error' ? '✗' : '⏳'}
                      </span>
                      <button onClick={() => eliminarSource(src.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 16, padding: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {kbSources.filter(s => s.type === 'url').length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#aaa', fontSize: 12 }}>Sin URLs adicionales</div>
              )}
            </div>
            <div
              style={{
                ...S.card,
                border: isDragOver ? `2px dashed ${themeColor}` : '1px solid #e8e8e8',
                background: isDragOver ? `${themeColor}06` : 'white',
                transition: 'border 0.15s, background 0.15s',
                position: 'relative',
              }}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {/* Overlay visible cuando se arrastra un archivo */}
              {isDragOver && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 10, zIndex: 10,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  background: `${themeColor}0d`, pointerEvents: 'none',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📂</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>Suelta aquí para subir</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>PDF, Word o TXT</div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={S.secLabel}>Documentos</div>
                  <div style={{ fontSize: 12, color: '#888' }}>PDF, Word y TXT que enriquecen la knowledge base · arrastra archivos aquí</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {fileTypes.map(ft => (
                    <button key={ft.ext}
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.accept = ft.ext
                          fileInputRef.current.click()
                        }
                      }}
                      disabled={uploadingFile}
                      style={{ ...S.btn('white', '#555'), display: 'flex', alignItems: 'center', gap: 5 }}>
                      {ft.icon} {ft.label}
                    </button>
                  ))}
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{ display: 'none' }}
                    onChange={e => { if (e.target.files?.[0]) uploadKBFile(e.target.files[0]) }} />
                </div>
              </div>
              {kbSources.filter(s => s.type !== 'url').length > 0 ? (
                <div style={{ display: 'grid', gap: 6 }}>
                  {kbSources.filter(s => s.type !== 'url').map(src => {
                    const ext = src.filename?.split('.').pop()?.toLowerCase() || ''
                    const icon = ext === 'pdf' ? '📄' : ext === 'docx' || ext === 'doc' ? '📝' : '📃'
                    const size = src.words_count > 0 ? `${src.words_count.toLocaleString()} palabras` : ''
                    return (
                      <div key={src.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{src.filename}</div>
                          {size && <div style={{ fontSize: 10, color: '#aaa' }}>{size}</div>}
                        </div>
                        <span style={S.tag(src.status === 'ok' ? '#f0fdf4' : src.status === 'error' ? '#fef2f2' : '#fefce8', src.status === 'ok' ? '#059669' : src.status === 'error' ? '#ef4444' : '#854d0e')}>
                          {src.status === 'ok' ? '✓ Procesado' : src.status === 'error' ? '✗ Error' : '⏳ Procesando'}
                        </span>
                        <button onClick={() => eliminarSource(src.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', fontSize: 16, padding: 0 }}>✕</button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '28px 0', color: '#aaa', fontSize: 12 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📎</div>
                  Sin documentos. Sube PDFs, Word o TXT — o arrástralos aquí directamente.
                </div>
              )}

              {uploadingFile && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#854d0e' }}>
                  ⏳ Subiendo y procesando el documento...
                </div>
              )}
            </div>
    </div>
  )
}
