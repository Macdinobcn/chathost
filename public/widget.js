(function () {
  // Obtener el script actual y sus atributos
  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script')
    return scripts[scripts.length - 1]
  })()

  var widgetId   = script.getAttribute('data-id')
  var color      = script.getAttribute('data-color') || '#059669'
  var name       = script.getAttribute('data-name') || 'Asistente'
  var position   = script.getAttribute('data-position') || 'bottom-right'
  var baseUrl    = script.src.replace('/widget.js', '')

  if (!widgetId) {
    console.error('Chat Arandai: falta data-id en el script')
    return
  }

  // Estado del widget
  var isOpen = false
  var hasOpened = false

  // Estilos base
  var positionStyle = position === 'bottom-left'
    ? 'bottom:24px;left:24px;'
    : 'bottom:24px;right:24px;'

  // Crear contenedor principal
  var container = document.createElement('div')
  container.id = 'chat-arandai-widget'
  container.style.cssText = 'position:fixed;' + positionStyle + 'z-index:999999;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font-family:system-ui,sans-serif;'

  // Burbuja de bienvenida
  var bubble = document.createElement('div')
  bubble.style.cssText = 'background:white;border-radius:12px;padding:10px 14px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-size:14px;color:#374151;max-width:200px;cursor:pointer;transition:opacity 0.3s;'
  bubble.textContent = '¡Hola! ¿Tienes alguna pregunta? 👋'
  bubble.onclick = toggleWidget

  // Botón principal
  var btn = document.createElement('div')
  btn.style.cssText = 'width:56px;height:56px;border-radius:50%;background:' + color + ';display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.25);transition:transform 0.2s;'
  btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
  btn.onclick = toggleWidget
  btn.onmouseenter = function () { btn.style.transform = 'scale(1.1)' }
  btn.onmouseleave = function () { btn.style.transform = 'scale(1)' }

  // Iframe del chat
  var iframeContainer = document.createElement('div')
  iframeContainer.style.cssText = 'width:380px;height:560px;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.2);display:none;flex-direction:column;transition:opacity 0.3s;'

  var iframe = document.createElement('iframe')
  var iframeSrc = baseUrl + '/widget/' + widgetId + '?color=' + encodeURIComponent(color) + '&name=' + encodeURIComponent(name)
  iframe.style.cssText = 'width:100%;height:100%;border:none;'
  iframe.setAttribute('title', name)

  iframeContainer.appendChild(iframe)
  container.appendChild(bubble)
  container.appendChild(iframeContainer)
  container.appendChild(btn)
  document.body.appendChild(container)

  // Ocultar burbuja después de 5 segundos
  setTimeout(function () {
    bubble.style.opacity = '0'
    setTimeout(function () { bubble.style.display = 'none' }, 300)
  }, 5000)

  function toggleWidget() {
    isOpen = !isOpen

    if (isOpen) {
      // Primera vez que se abre — cargar el iframe
      if (!hasOpened) {
        iframe.src = iframeSrc
        hasOpened = true
      }
      iframeContainer.style.display = 'flex'
      bubble.style.display = 'none'
      btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    } else {
      iframeContainer.style.display = 'none'
      btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
    }
  }
})()
