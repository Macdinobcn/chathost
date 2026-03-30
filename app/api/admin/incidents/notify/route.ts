import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import nodemailer from 'nodemailer'

interface IncidentRow {
  id: string
  severity: string
  title: string
  description: string
  clients: { name: string } | null
}

export async function POST() {
  const supabase = createAdminClient()

  const { data: incidents } = await supabase
    .from('incidents')
    .select('*, clients(name)')
    .in('status', ['open', 'needs_human'])
    .in('severity', ['critical', 'high'])
    .is('notified_at', null)

  if (!incidents || incidents.length === 0) {
    return NextResponse.json({ sent: false, reason: 'No hay incidencias críticas sin notificar' })
  }

  const rows = incidents as IncidentRow[]

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
  })

  const list = rows
    .map((i) => `• [${i.severity.toUpperCase()}] ${i.title}: ${i.description}`)
    .join('\n')

  const count = rows.length
  const plural = count > 1 ? 's' : ''

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: 'alexcollspeyra@gmail.com',
    subject: `ChatHost.ai — ${count} incidencia${plural} requieren atención`,
    text: `Hola Alex,\n\nHay ${count} incidencias que requieren tu atención:\n\n${list}\n\nRevísalas en: ${process.env.NEXT_PUBLIC_APP_URL}/admin\n\nChatHost.ai`,
    html: `<h2>Incidencias ChatHost.ai</h2><p>Hay <strong>${count} incidencias</strong> que requieren tu atención:</p><ul>${rows.map((i) => `<li><strong>[${i.severity.toUpperCase()}]</strong> ${i.title}<br><small style="color:#666">${i.description}</small></li>`).join('')}</ul><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin">Ver en el panel →</a></p>`,
  })

  // Mark as notified
  await supabase
    .from('incidents')
    .update({ notified_at: new Date().toISOString() })
    .in('id', rows.map((i) => i.id))

  return NextResponse.json({ sent: true, count })
}
