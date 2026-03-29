import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

// ─── Modelos disponibles y sus costes reales ───────────────────────────────
export const MODELOS_DISPONIBLES = {
  'claude-haiku-4-5-20251001': {
    label: 'Claude Haiku',
    creditosMsg: 1,          // 1 crédito por mensaje
    inputPer1M: 0.80,        // $ por millón de tokens input
    outputPer1M: 4.00,       // $ por millón de tokens output
  },
  'claude-sonnet-4-5': {
    label: 'Claude Sonnet',
    creditosMsg: 4,          // 4 créditos por mensaje
    inputPer1M: 3.00,
    outputPer1M: 15.00,
  },
  'claude-opus-4-5': {
    label: 'Claude Opus',
    creditosMsg: 20,         // 20 créditos por mensaje
    inputPer1M: 15.00,
    outputPer1M: 75.00,
  },
} as const

export type ModeloId = keyof typeof MODELOS_DISPONIBLES

export const MODELO_DEFAULT: ModeloId = 'claude-haiku-4-5-20251001'

// Calcula el coste en EUR dado el modelo y tokens usados
function calcularCoste(modeloId: ModeloId, tokensInput: number, tokensOutput: number): number {
  const modelo = MODELOS_DISPONIBLES[modeloId]
  const usd = (tokensInput / 1_000_000) * modelo.inputPer1M + (tokensOutput / 1_000_000) * modelo.outputPer1M
  return usd * 0.92 // USD → EUR aproximado
}

// ─── Generación de Knowledge Base (siempre Sonnet) ─────────────────────────
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

// ─── Responder chat ────────────────────────────────────────────────────────
export async function responderChat(params: {
  nombreCliente: string
  knowledgeBase: string
  systemPromptPersonalizado?: string
  historial: Array<{ role: 'user' | 'assistant'; content: string }>
  pregunta: string
  temperatura?: number
  autoLanguage?: boolean
  mensajesEspeciales?: string[]
  modeloId?: ModeloId   // si no viene, usa Haiku por defecto
}): Promise<{ respuesta: string; tokensUsados: number; costeEur: number; creditosConsumidos: number }> {

  const modeloId: ModeloId = params.modeloId && MODELOS_DISPONIBLES[params.modeloId]
    ? params.modeloId
    : MODELO_DEFAULT

  const temperatura = Math.min(1, Math.max(0, params.temperatura ?? 0.7))

  // System prompt: si viene personalizado (maestro + cliente), es el principal
  // El hardcodeado solo es fallback si no hay nada configurado
  let systemPrompt: string

  if (params.systemPromptPersonalizado?.trim()) {
    // Prompt maestro (base + formato + normas) + prompt del cliente ya ensamblados en route.ts
    systemPrompt = params.systemPromptPersonalizado

    // Añadir idioma automático si no está ya en el prompt
    if (params.autoLanguage !== false && !systemPrompt.includes('idioma')) {
      systemPrompt += `\n\nRespode SIEMPRE en el mismo idioma que usa el usuario.`
    }
  } else {
    // Fallback si no hay configuración maestra
    systemPrompt = `Eres el asistente virtual de ${params.nombreCliente}.
Tu única fuente de información es la knowledge base que te proporcionamos.
Si no sabes la respuesta, dilo honestamente y ofrece el contacto del negocio.
${params.autoLanguage !== false
      ? 'IMPORTANTE: Responde SIEMPRE en el mismo idioma que usa el usuario.'
      : 'Responde siempre en español.'
    }
Sé amable, conciso y útil.
Cuando menciones precios o servicios, incluye el link relevante si lo tienes.
No inventes información que no esté en la knowledge base.`
  }

  if (params.mensajesEspeciales?.length) {
    systemPrompt += `\n\n--- MENSAJES ESPECIALES ACTIVOS ---\n${params.mensajesEspeciales.join('\n')}`
  }

  systemPrompt += `\n\nKNOWLEDGE BASE DE ${params.nombreCliente}:\n${params.knowledgeBase}`

  const response = await anthropic.messages.create({
    model: modeloId,
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
  const costeEur = calcularCoste(modeloId, tokensInput, tokensOutput)
  const creditosConsumidos = MODELOS_DISPONIBLES[modeloId].creditosMsg
  const respuesta = response.content[0].type === 'text' ? response.content[0].text : ''

  return { respuesta, tokensUsados, costeEur, creditosConsumidos }
}
