import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = createAdminClient()
  const body = await req.json() as { status: string }

  await supabase
    .from('incidents')
    .update({
      status: body.status,
      resolved_at: body.status === 'resolved' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  return NextResponse.json({ ok: true })
}
