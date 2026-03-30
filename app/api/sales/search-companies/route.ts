import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { sector = 'hoteles', region = 'España', count = 10 } = await req.json()

    if (!sector || !region) {
      return NextResponse.json({ error: 'Sector y región son obligatorios' }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `Busca ${count} empresas REALES del sector "${sector}" en ${region}.

Necesito SOLO información verificable: nombre, web (con https://), ciudad, teléfono.

RESPONDE SOLO CON ESTE JSON (sin markdown, sin texto extra):
{"empresas": [{"nombre": "...", "web": "https://...", "ciudad": "...", "telefono": "..."}, ...]}

Verificar:
- Empresas ACTIVAS y REALES
- Sitios web accesibles
- No inventar datos
- Solo turismo: hoteles, campings, tours, museos, gastronomía, resorts`
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{"empresas": []}'

    // Parse JSON - try to extract JSON from response
    let data
    try {
      data = JSON.parse(text)
    } catch {
      // Try to extract JSON from text if wrapped in markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0])
      } else {
        data = { empresas: [] }
      }
    }

    const empresas = (data.empresas || [])
      .map((e: any) => ({
        nombre: e.nombre || '',
        web: e.web || '',
        ciudad: e.ciudad || '',
        telefono: e.telefono || '',
      }))
      .filter((e: any) => e.nombre && e.web)
      .slice(0, count)

    return NextResponse.json({ empresas })
  } catch (error) {
    console.error('[sales/search-companies]', error)
    return NextResponse.json({ error: `Error: ${error}`, empresas: [] }, { status: 500 })
  }
}
