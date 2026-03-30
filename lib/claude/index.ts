import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function generarKnowledgeBase(url: string, htmlContents: string[]): Promise<string> {
  const prompt = `Eres un experto en extracción de información para chatbots de atención al cliente.
Tienes el contenido HTML de ${htmlContents.length} páginas del sitio web: ${url}

Extrae TODA la información relevante:
- Servicios y precios
- Horarios y temporadas
- Ubicación y cómo llegar
- Instalaciones y equipamiento
- Políticas (cancelación, mascotas, etc.)
- FAQs
- Contacto y links importantes

Genera un documento Markdown estructurado, claro y completo.
No incluyas menús de navegación, cookies ni contenido irrelevante.

CONTENIDO HTML:
${htmlContents.join('\n\n---NUEVA PÁGINA---\n\n').slice(0, 180000)}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })
  return response.content[0].type === 'text' ? response.content[0].text : ''
}

export async function responderChat(params: {
  nombreCliente: string
  knowledgeBase: string
  systemPromptPersonalizado?: string
  historial: Array<{ role: 'user' | 'assistant'; content: string }>
  pregunta: string
  temperatura?: number
  autoLanguage?: boolean
  allowedLanguages?: string[]
  mensajesEspeciales?: string[]
}): Promise<{ respuesta: string; tokensUsados: number; costeEur: number }> {

  const temperatura = Math.min(1, Math.max(0, (params.temperatura ?? 0.7)))

  const LANG_NAMES: Record<string, string> = {
    es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch',
    it: 'Italiano', pt: 'Português', nl: 'Nederlands', ca: 'Català',
    zh: '中文', ja: '日本語', ru: 'Русский', ar: 'العربية',
  }

  const hasLangRestriction = params.allowedLanguages && params.allowedLanguages.length > 0
  const allowedNames = hasLangRestriction
    ? params.allowedLanguages!.map(c => LANG_NAMES[c] || c).join(', ')
    : ''
  const defaultLang = hasLangRestriction ? (LANG_NAMES[params.allowedLanguages![0]] || params.allowedLanguages![0]) : 'Español'

  const langInstruction = hasLangRestriction
    ? `IMPORTANTE: Solo puedes responder en estos idiomas: ${allowedNames}. Si el usuario escribe en otro idioma, respóndele en ${defaultLang} e indícale amablemente en qué idiomas está disponible el servicio.`
    : params.autoLanguage !== false
      ? 'IMPORTANTE: Responde SIEMPRE en el mismo idioma que usa el usuario. Si escribe en inglés, responde en inglés. Si escribe en francés, responde en francés. Nunca cambies de idioma.'
      : 'Responde siempre en español.'

  // System prompt base
  let systemPrompt = `Eres el asistente virtual de ${params.nombreCliente}.
Tu única fuente de información es la knowledge base que te proporcionamos.
Si no sabes la respuesta, dilo honestamente y ofrece el contacto del negocio.
${langInstruction}
Sé amable, conciso y útil.
Cuando menciones precios o servicios, incluye el link relevante si lo tienes.
No inventes información que no esté en la knowledge base.`

  // Normas personalizadas
  if (params.systemPromptPersonalizado?.trim()) {
    systemPrompt += `\n\n--- INSTRUCCIONES ESPECÍFICAS ---\n${params.systemPromptPersonalizado}`
  }

  // Mensajes especiales activos
  if (params.mensajesEspeciales?.length) {
    systemPrompt += `\n\n--- MENSAJES ESPECIALES ACTIVOS (menciónalos cuando sea relevante) ---\n${params.mensajesEspeciales.join('\n')}`
  }

  systemPrompt += `\n\nKNOWLEDGE BASE DE ${params.nombreCliente}:\n${params.knowledgeBase}`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    temperature: temperatura,
    system: systemPrompt,
    messages: [
      ...params.historial,
      { role: 'user', content: params.pregunta },
    ],
  })

  const tokensInput = response.usage.input_tokens
  const tokensOutput = response.usage.output_tokens
  const tokensUsados = tokensInput + tokensOutput
  const costeEur = (tokensInput * 0.0000008 + tokensOutput * 0.000004) * 0.92
  const respuesta = response.content[0].type === 'text' ? response.content[0].text : ''

  return { respuesta, tokensUsados, costeEur }
}
