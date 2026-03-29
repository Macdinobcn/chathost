// app/api/contact/route.ts
// Envía el formulario de contacto a chathostapp@gmail.com

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, message } = await req.json()

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,   // chathostapp@gmail.com
        pass: process.env.GMAIL_PASS,   // App Password de Gmail
      },
    })

    await transporter.sendMail({
      from: `"ChatHost.ai Contacto" <${process.env.GMAIL_USER}>`,
      to: 'chathostapp@gmail.com',
      replyTo: email.trim(),
      subject: `[ChatHost.ai] Nuevo contacto de ${name.trim()}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:linear-gradient(135deg,#3b82f6,#6366f1);padding:24px 32px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:20px">Nuevo mensaje de contacto</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">ChatHost.ai</p>
          </div>
          <div style="background:#f8fafc;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px;width:120px">Nombre</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#1e293b">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;font-size:13px">Email</td><td style="padding:8px 0;font-size:14px;color:#3b82f6"><a href="mailto:${email}">${email}</a></td></tr>
              ${company ? `<tr><td style="padding:8px 0;color:#64748b;font-size:13px">Empresa</td><td style="padding:8px 0;font-size:14px;color:#1e293b">${company}</td></tr>` : ''}
            </table>
            <div style="margin-top:20px;padding:16px;background:white;border-radius:8px;border:1px solid #e2e8f0">
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em">Mensaje</p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.7;white-space:pre-wrap">${message}</p>
            </div>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('[contact] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
