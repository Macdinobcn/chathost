import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Genera la knowledge base en Markdown a partir de HTML scrapeado
export async function generarKnowledgeBase(
  url: string,
  htmlContents: string[]
): Promise<string> {
  const prompt = `Eres un experto en extracción de información para chatbots de atención al cliente.
Tienes el contenido HTML de ${htmlContents.length} páginas del sitio web: ${url}

Extrae TODA la información relevante para un chatbot de atención al cliente:
- Servicios y precios
- Horarios y temporadas
- Ubicación y cómo llegar
- Instalaciones y equipamiento
- Políticas (cancelación, mascotas, etc.)
- FAQs
- Contacto
- Links importantes

Genera un documento Markdown estructurado, claro y completo.
Incluye los links originales cuando sean relevantes.
No incluyas menús de navegación, cookies, ni contenido irrelevante.

CONTENIDO HTML:
${htmlContents.join('\n\n---NUEVA PÁGINA---\n\n').slice(0, 180000)}`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

// Responde una pregunta del chat usando la knowledge base y normas del cliente
export async function responderChat(params: {
  nombreCliente: string
  knowledgeBase: string
  systemPromptPersonalizado?: string
  historial: Array<{ role: 'user' | 'assistant'; content: string }>
  pregunta: string
}): Promise<{ respuesta: string; tokensUsados: number; costeEur: number }> {

  // System prompt base
  const systemBase = `Eres el asistente virtual de ${params.nombreCliente}.
Tu única fuente de información es la knowledge base que te proporcionamos.
Si no sabes la respuesta, dilo honestamente y ofrece el contacto del negocio.
Responde siempre en el mismo idioma que el usuario.
Sé amable, conciso y útil.
Cuando menciones precios o servicios, incluye el link relevante si lo tienes.
No inventes información que no esté en la knowledge base.`

  // Añadir normas personalizadas si existen
  const systemNormas = params.systemPromptPersonalizado?.trim()
    ? `\n\n---\nNORMAS ESPECÍFICAS PARA ESTE CLIENTE:\n${params.systemPromptPersonalizado}`
    : ''

  // Knowledge base
  const systemKB = `\n\nKNOWLEDGE BASE DE ${params.nombreCliente}:\n${params.knowledgeBase}`

  const systemPrompt = systemBase + systemNormas + systemKB

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: systemPrompt,
    messages: [
      ...params.historial,
      { role: 'user', content: params.pregunta },
    ],
  })

  const tokensInput = response.usage.input_tokens
  const tokensOutput = response.usage.output_tokens
  const tokensUsados = tokensInput + tokensOutput

  // Coste Claude Haiku en EUR
  const costeEur = (tokensInput * 0.0000008 + tokensOutput * 0.000004) * 0.92

  const respuesta =
    response.content[0].type === 'text' ? response.content[0].text : ''

  return { respuesta, tokensUsados, costeEur }
}
