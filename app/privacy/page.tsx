// app/privacy/page.tsx
// Política de privacidad pública de ChatHost.ai
// Accesible en /privacy — usada como fallback para todos los widgets

export const metadata = {
  title: 'Política de Privacidad — ChatHost.ai',
  description: 'Política de privacidad y tratamiento de datos de ChatHost.ai',
}

export default function PrivacyPage() {
  const lastUpdate = '29 de marzo de 2026'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <a href="https://chathost.ai" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 32, height: 32, background: '#2563eb',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, color: '#fff', fontSize: 16,
          }}>C</div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>ChatHost.ai</span>
        </a>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>
          Política de Privacidad
        </h1>
        <p style={{ color: '#64748b', marginBottom: 40, fontSize: 14 }}>
          Última actualización: {lastUpdate}
        </p>

        {[
          {
            title: '1. Quién es el responsable del tratamiento',
            content: `ChatHost.ai es un servicio desarrollado por Arandai (en adelante, "ChatHost"). 
Para consultas relacionadas con privacidad, puedes contactarnos en: hola@chathost.ai`
          },
          {
            title: '2. Qué datos recopilamos',
            content: `Cuando interactúas con un chatbot de ChatHost, recopilamos:
            
• Los mensajes que envías al asistente virtual
• Información técnica básica: país de origen, tipo de dispositivo, navegador
• Identificador de sesión anónimo (no vinculado a tu identidad)
• Fecha y hora de la conversación

No recopilamos nombre, email, teléfono ni ningún dato de identificación personal, salvo que tú mismo lo incluyas en el chat.`
          },
          {
            title: '3. Para qué usamos tus datos',
            content: `Los datos recopilados se usan para:

• Responder tus preguntas mediante inteligencia artificial
• Guardar el historial de la conversación durante la sesión
• Permitir al negocio titular del chatbot revisar las conversaciones para mejorar el servicio
• Calcular estadísticas de uso agregadas y anónimas

No usamos tus datos para publicidad ni los vendemos a terceros.`
          },
          {
            title: '4. Base legal del tratamiento',
            content: `El tratamiento de datos se basa en el interés legítimo del negocio titular del chatbot para atender consultas de sus clientes, y en tu consentimiento explícito otorgado al aceptar este aviso antes de usar el chat.`
          },
          {
            title: '5. Proveedores de IA',
            content: `Los mensajes se procesan mediante la API de Anthropic (Claude). Anthropic actúa como encargado del tratamiento bajo un acuerdo de protección de datos. Anthropic no usa los datos enviados a través de la API para entrenar sus modelos.

Más información: https://www.anthropic.com/privacy`
          },
          {
            title: '6. Cuánto tiempo conservamos los datos',
            content: `Los mensajes del chat se conservan durante un máximo de 12 meses desde la conversación, salvo que el negocio titular solicite su eliminación antes o que tú ejerzas tu derecho de supresión.`
          },
          {
            title: '7. Tus derechos',
            content: `Tienes derecho a:

• Acceder a tus datos
• Rectificar datos incorrectos
• Solicitar la supresión ("derecho al olvido")
• Oponerte al tratamiento
• Solicitar la portabilidad de tus datos

Para ejercer cualquiera de estos derechos, contacta con el negocio cuyo chatbot usaste, o directamente con nosotros en hola@chathost.ai indicando la fecha aproximada de tu conversación.`
          },
          {
            title: '8. Cookies y almacenamiento local',
            content: `El widget de chat usa localStorage del navegador para:

• Recordar si ya aceptaste este aviso de privacidad
• Guardar el historial de conversación de tu sesión actual

No usamos cookies de seguimiento ni de publicidad.`
          },
          {
            title: '9. Transferencias internacionales',
            content: `Los datos se procesan en servidores dentro de la UE (Supabase — región EU West) y en servidores de Anthropic (EE.UU.), bajo las cláusulas contractuales estándar de la UE para garantizar un nivel de protección adecuado.`
          },
          {
            title: '10. Cambios en esta política',
            content: `Podemos actualizar esta política ocasionalmente. Los cambios relevantes se comunicarán con al menos 30 días de antelación. La fecha de última actualización aparece al inicio de este documento.`
          },
          {
            title: '11. Contacto',
            content: `Para cualquier consulta sobre privacidad:
            
Email: hola@chathost.ai
Web: https://chathost.ai`
          },
        ].map((section, i) => (
          <div key={i} style={{ marginBottom: 36 }}>
            <h2 style={{
              fontSize: 18, fontWeight: 700, color: '#f1f5f9',
              marginBottom: 12, borderBottom: '1px solid #1e293b', paddingBottom: 8,
            }}>
              {section.title}
            </h2>
            <p style={{
              color: '#94a3b8', lineHeight: 1.8, fontSize: 15,
              whiteSpace: 'pre-line',
            }}>
              {section.content}
            </p>
          </div>
        ))}

        {/* Footer */}
        <div style={{
          marginTop: 60, paddingTop: 24, borderTop: '1px solid #1e293b',
          textAlign: 'center', color: '#475569', fontSize: 13,
        }}>
          <p>© 2026 ChatHost.ai · <a href="https://chathost.ai" style={{ color: '#2563eb' }}>chathost.ai</a></p>
        </div>
      </div>
    </div>
  )
}
