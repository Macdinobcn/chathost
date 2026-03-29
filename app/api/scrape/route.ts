import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generarKnowledgeBase } from '@/lib/claude'

// POST /api/scrape
export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json()
    if (!clientId) return NextResponse.json({ error: 'Falta clientId' }, { status: 400 })

    const supabase = createAdminClient()

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, website_url')
      .eq('id', clientId)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Marcar como pendiente
    const { data: kbExistente } = await supabase
      .from('knowledge_bases')
      .select('id')
      .eq('client_id', clientId)
      .single()

    if (kbExistente) {
      await supabase.from('knowledge_bases').update({ scraping_status: 'pending' }).eq('client_id', clientId)
    } else {
      await supabase.from('knowledge_bases').insert({ client_id: clientId, content_md: '', scraping_status: 'pending' })
    }

    // Normalizar URL base
    let baseUrl: string
    try {
      const urlObj = new URL(client.website_url)
      baseUrl = `${urlObj.protocol}//${urlObj.hostname}`
    } catch {
      await supabase.from('knowledge_bases').update({ scraping_status: 'error' }).eq('client_id', clientId)
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    const headers = {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9',
    }

    // Fetch con manejo de SSL
    async function fetchUrl(url: string): Promise<string> {
      try {
        const res = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(12000),
          // @ts-ignore — deshabilitar SSL en Node
          ...(url.startsWith('https') ? { dispatcher: undefined } : {}),
        })
        if (!res.ok) return ''
        return await res.text()
      } catch {
        // Reintentar con http si https falla
        if (url.startsWith('https://')) {
          try {
            const httpUrl = url.replace('https://', 'http://')
            const res = await fetch(httpUrl, { headers, signal: AbortSignal.timeout(10000) })
            if (!res.ok) return ''
            return await res.text()
          } catch { return '' }
        }
        return ''
      }
    }

    // 1. Intentar obtener URLs del sitemap
    async function obtenerUrlsDesdesSitemap(base: string): Promise<string[]> {
      const urlsSitemap: string[] = []

      // Sitemap locations a probar
      const sitemapUrls = [
        `${base}/sitemap.xml`,
        `${base}/sitemap_index.xml`,
        `${base}/sitemap/sitemap.xml`,
        `${base}/wp-sitemap.xml`,
      ]

      for (const sitemapUrl of sitemapUrls) {
        console.log(`Probando sitemap: ${sitemapUrl}`)
        const xml = await fetchUrl(sitemapUrl)
        if (!xml || !xml.includes('<url') && !xml.includes('<sitemap')) continue

        // Extraer URLs de sitemap index (sitemaps anidados)
        const sitemapRefs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
          .map(m => m[1].trim())
          .filter(u => u.includes('sitemap') && u.endsWith('.xml'))

        if (sitemapRefs.length > 0) {
          // Es un sitemap index — procesar cada sub-sitemap
          for (const subSitemapUrl of sitemapRefs.slice(0, 5)) {
            const subXml = await fetchUrl(subSitemapUrl)
            if (!subXml) continue
            const urls = [...subXml.matchAll(/<loc>(.*?)<\/loc>/g)]
              .map(m => m[1].trim())
              .filter(u => u.startsWith(base) && !u.includes('sitemap'))
            urlsSitemap.push(...urls)
          }
        } else {
          // Sitemap normal
          const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
            .map(m => m[1].trim())
            .filter(u => u.startsWith(base))
          urlsSitemap.push(...urls)
        }

        if (urlsSitemap.length > 0) {
          console.log(`Sitemap encontrado: ${urlsSitemap.length} URLs en ${sitemapUrl}`)
          break
        }
      }

      return [...new Set(urlsSitemap)]
    }

    // 2. Fallback: descubrir links desde HTML
    function extraerLinksDeHTML(html: string, base: string): string[] {
      const links: string[] = []
      const regex = /href=["']([^"'#?]+)["']/gi
      let match
      while ((match = regex.exec(html)) !== null) {
        const href = match[1].trim()
        if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue
        if (href.startsWith('/') && !href.startsWith('//')) links.push(`${base}${href}`)
        else if (href.startsWith(base)) links.push(href)
      }
      return links.filter(l => !l.match(/\.(pdf|jpg|jpeg|png|gif|css|js|xml|zip|mp4|mp3|svg|ico|woff)$/i))
    }

    // Filtrar páginas relevantes (no imágenes, no admin, no duplicadas)
    function filtrarPaginas(urls: string[]): string[] {
      const excluir = ['/wp-admin', '/wp-login', '/cart', '/checkout', '/mi-cuenta', '/my-account', '/tag/', '/author/', '/feed']
      return urls
        .filter(u => !excluir.some(ex => u.includes(ex)))
        .filter(u => !u.match(/\.(pdf|jpg|jpeg|png|gif|css|js|xml|zip|mp4)$/i))
        .slice(0, 30) // máximo 30 páginas
    }

    // --- INICIO SCRAPING ---
    console.log(`\n=== Scraping de ${client.name} (${client.website_url}) ===`)

    const htmlContents: string[] = []
    const paginasVisitadas = new Set<string>()

    // Intentar sitemap primero
    let urlsAScrapear = await obtenerUrlsDesdesSitemap(baseUrl)

    if (urlsAScrapear.length === 0) {
      // Fallback: scrapear página principal y extraer links
      console.log('Sin sitemap — usando crawling básico')
      const htmlPrincipal = await fetchUrl(client.website_url)
      if (htmlPrincipal) {
        htmlContents.push(htmlPrincipal)
        paginasVisitadas.add(client.website_url)
        const links = extraerLinksDeHTML(htmlPrincipal, baseUrl)
        urlsAScrapear = [...new Set(links)]
      }
    } else {
      // Siempre incluir la página principal
      urlsAScrapear = [client.website_url, ...urlsAScrapear.filter(u => u !== client.website_url)]
    }

    // Filtrar y priorizar páginas más relevantes
    const paginas = filtrarPaginas(urlsAScrapear)
    console.log(`Páginas a scrapear: ${paginas.length}`)

    // Scrapear en paralelo (en grupos de 5)
    const chunkSize = 5
    for (let i = 0; i < paginas.length; i += chunkSize) {
      const chunk = paginas.slice(i, i + chunkSize)
      const results = await Promise.all(
        chunk.map(async (url) => {
          if (paginasVisitadas.has(url)) return null
          const html = await fetchUrl(url)
          if (html) {
            paginasVisitadas.add(url)
            console.log(`✓ ${url}`)
            return html
          }
          return null
        })
      )
      htmlContents.push(...results.filter(Boolean) as string[])
      // Pausa entre grupos
      if (i + chunkSize < paginas.length) await new Promise(r => setTimeout(r, 500))
    }

    console.log(`\nTotal páginas scrapeadas: ${htmlContents.length}`)

    if (htmlContents.length === 0) {
      await supabase.from('knowledge_bases').update({ scraping_status: 'error' }).eq('client_id', clientId)
      return NextResponse.json({ error: 'No se pudo acceder a ninguna página de la web' }, { status: 500 })
    }

    // Generar KB con Claude
    console.log('Generando knowledge base con Claude Sonnet...')
    const contentMd = await generarKnowledgeBase(client.website_url, htmlContents)
    const wordsCount = contentMd.split(/\s+/).filter(Boolean).length
    console.log(`KB generada: ${wordsCount} palabras`)

    // Guardar en Supabase
    await supabase.from('knowledge_bases').update({
      content_md: contentMd,
      pages_scraped: paginasVisitadas.size,
      words_count: wordsCount,
      last_scraped_at: new Date().toISOString(),
      scraping_status: 'ok',
    }).eq('client_id', clientId)

    return NextResponse.json({ ok: true, paginasScrapeadas: paginasVisitadas.size, palabras: wordsCount })

  } catch (error) {
    console.error('Error en /api/scrape:', error)
    return NextResponse.json({ error: `Error: ${error}` }, { status: 500 })
  }
}
