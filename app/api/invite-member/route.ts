// app/api/invite-member/route.ts
// Invita a un miembro al equipo de un cliente
// Crea el registro en client_members y envía magic link de Supabase

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId')
  if (!clientId) return NextResponse.json({ members: [] })

  const { data } = await supabase
    .from('client_members')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  return NextResponse.json({ members: data || [] })
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, email, role } = await req.json()

    if (!clientId || !email?.trim()) {
      return NextResponse.json({ error: 'clientId y email requeridos' }, { status: 400 })
    }

    const validRoles = ['agent', 'owner']
    const memberRole = validRoles.includes(role) ? role : 'agent'

    // Verificar que no existe ya
    const { data: existing } = await supabase
      .from('client_members')
      .select('id')
      .eq('client_id', clientId)
      .eq('email', email.trim().toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Este email ya tiene acceso' }, { status: 409 })
    }

    // Crear registro en client_members
    const { data: member, error } = await supabase
      .from('client_members')
      .insert({
        client_id: clientId,
        email: email.trim().toLowerCase(),
        role: memberRole,
      })
      .select()
      .single()

    if (error) throw error

    // También insertar en client_users para que pueda hacer login
    await supabase
      .from('client_users')
      .upsert({ client_id: clientId, email: email.trim().toLowerCase() })

    return NextResponse.json({ ok: true, member })
  } catch (error: any) {
    console.error('[invite-member] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { memberId, clientId } = await req.json()

    await supabase
      .from('client_members')
      .delete()
      .eq('id', memberId)
      .eq('client_id', clientId)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
