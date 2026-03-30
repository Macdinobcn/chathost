import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { PLAN_BOTS } from '@/lib/admin-styles'

function generarWidgetId(nombre: string): string {
  const base = nombre.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 20)
  const random = Math.random().toString(36).slice(2, 8)
  return `${base}-${random}`
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { name, website_url } = await req.json()
  if (!name?.trim() || !website_url?.trim()) {
    return NextResponse.json({ error: 'Nombre y URL son obligatorios' }, { status: 400 })
  }

  // Get existing bots + plan
  const { data: existing } = await supabase
    .from('client_users')
    .select('client_id, clients(plan)')
    .eq('email', user.email)

  const count = existing?.length || 0
  const plan = (existing?.[0]?.clients as any)?.plan || 'trial'
  const maxBots = PLAN_BOTS[plan] ?? 1

  if (count >= maxBots) {
    return NextResponse.json({
      error: `Tu plan ${plan} permite máximo ${maxBots} chatbot${maxBots > 1 ? 's' : ''}. Contacta con nosotros para ampliar.`,
    }, { status: 403 })
  }

  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      name: name.trim(),
      website_url: website_url.trim(),
      email: user.email,
      plan,
      widget_id: generarWidgetId(name),
      widget_color: '#059669',
      widget_name: 'Asistente',
      active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creando chatbot:', error)
    return NextResponse.json({ error: 'Error creando chatbot' }, { status: 500 })
  }

  await supabase.from('client_users').insert({ email: user.email, client_id: client.id })

  return NextResponse.json({ client }, { status: 201 })
}
