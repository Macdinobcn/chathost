import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { nombre, email, widget_id, trial_url } = await req.json()

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .content p { margin: 15px 0; }
    .highlight { background: #f0f9ff; border-left: 4px solid #06b6d4; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .cta { display: inline-block; background: #06b6d4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .features { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .features ul { margin: 10px 0; padding-left: 20px; }
    .features li { margin: 8px 0; }
    .pricing { margin: 20px 0; text-align: center; }
    .pricing h3 { color: #06b6d4; font-size: 18px; }
    .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Tu chatbot está listo</h1>
    </div>
    <div class="content">
      <p>¡Hola ${nombre}!</p>

      <p>En <strong>ChatHost.ai</strong> creemos que cada negocio merece un asistente virtual que atienda a sus clientes 24/7.</p>

      <p>Por eso hemos creado un chatbot personalizado especialmente para ti. Hemos leído toda la información de tu web, aprendido sobre tus servicios, precios y políticas, y entrenado un asistente que responde exactamente como tú lo harías.</p>

      <div class="highlight">
        <strong>✓ Tu chatbot está listo para probar gratis</strong><br>
        15 días · 100 mensajes · Sin tarjeta de crédito · Cancela cuando quieras
      </div>

      <h3>¿Qué puede hacer tu chatbot?</h3>
      <div class="features">
        <ul>
          <li>✓ Responder preguntas sobre tus servicios y precios</li>
          <li>✓ Explicar horarios, políticas de cancelación y condiciones</li>
          <li>✓ Captar leads 24 horas al día</li>
          <li>✓ Disponible en múltiples idiomas</li>
          <li>✓ Widgets contextuales (tiempo, webcam en vivo, ocupación)</li>
        </ul>
      </div>

      <p style="text-align: center;">
        <a href="${trial_url}" class="cta">→ Prueba tu chatbot gratis (15 días)</a>
      </p>

      <h3>¿Cuánto cuesta después del trial?</h3>
      <div class="pricing">
        <p>
          <strong>Plan Starter: 19€/mes</strong><br>
          1 chatbot · 500 mensajes/mes<br>
          Soporte comunitario
        </p>
        <p>
          <strong>Plan Pro: 49€/mes</strong> ⭐ Recomendado<br>
          3 chatbots · 3.000 mensajes/mes<br>
          Widget del tiempo + Analytics<br>
          Soporte prioritario
        </p>
      </div>

      <p>Durante el trial puedes probar todas las funciones sin límite de features. Solo limitado a 100 mensajes y 15 días.</p>

      <p>Si tienes cualquier duda, escribe directamente a hola@chathost.ai. Estamos aquí para ayudarte.</p>

      <p><strong>El equipo de ChatHost.ai</strong><br>
      <em>Chatbots IA para negocios</em></p>
    </div>
    <div class="footer">
      <p>© 2026 ChatHost.ai · Hecho por Arandai.com · Madrid, España</p>
      <p><a href="https://chathost.ai" style="color: #06b6d4; text-decoration: none;">chathost.ai</a></p>
    </div>
  </div>
</body>
</html>
  `

  try {
    const response = await resend.emails.send({
      from: 'ChatHost.ai <noreply@resend.dev>',
      to: email,
      subject: `🚀 Tu chatbot ${nombre} está listo para probar`,
      html: htmlBody,
    })

    if (response.error) {
      console.error('[sales/send-email]', response.error)
      return NextResponse.json({ error: response.error.message }, { status: 500 })
    }

    return NextResponse.json({ error: null, sent_to: email, message_id: response.data?.id })
  } catch (err: any) {
    console.error('[sales/send-email]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
