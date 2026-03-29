# MEMORIA — Chat Arandai
*Última actualización: 2026-03-29*

---

## ESTADO ACTUAL

### Chat Arandai (app.arandai.com)
- Panel admin funcional — sidebar, stats, 8 tabs por cliente
- Crear/editar/borrar clientes funciona
- Scraper con sitemap funciona
- Chat funciona con KB real y links clicables
- Widget embebible funciona con renderizado de Markdown
- Instrucciones maestras en 3 bloques (Base + Formato + Normas)
- Playground de testing por cliente con selector de modelos
- Multiidioma en panel cliente (ES/EN/FR/DE/NL)
- Activity con export PDF via Puppeteer
- Widgets contextuales: tiempo, ocupación, webcam
- Logo e icono del widget funciona (bucket widget-assets en Supabase)
- **Pendiente de deploy en Vercel**

---

## ARCHIVOS CLAVE — ÚLTIMAS VERSIONES

| Archivo | Ruta en proyecto |
|---------|-----------------|
| `page.tsx` | `app/admin/clients/[id]/page.tsx` |
| `widget_page.tsx` | `app/widget/[widgetId]/page.tsx` |
| `route_widget_config.ts` | `app/api/widget-config/[widgetId]/route.ts` |
| `route_export_pdf.ts` | `app/api/export-pdf/route.ts` |
| `route_chat_history.ts` | `app/api/chat/history/route.ts` |
| `backup.js` | raíz del proyecto |

---

## CAMBIOS DE ESTA SESIÓN

### Activity / Chat logs
- Filtro score corregido a escala 0-10 (antes era 0-1, filtraba todo)
- Botón Export PDF amarillo directo — genera PDF con Puppeteer, descarga sin diálogo
- PDF modo lista: todas las convs filtradas con primer mensaje como preview
- PDF modo detalle: conversación completa con markdown renderizado
- Panel izquierdo: muestra primer mensaje en vez del session_id
- Panel derecho: markdown renderizado con links clicables, etiquetas de rol
- Burbuja usuario usa color del widget del cliente
- Bug periodo exportación corregido (stale closure)

### Widget
- Tab "Widgets" eliminado — widgets contextuales integrados dentro del tab "Widget"
- Preview del widget: centrado, sin ventana semitransparente
- Preview muestra: tiempo, ocupación, webcam, logo/icono reales
- Botón "Abrir widget real en nueva pestaña"
- Logo e icono: botón borrar (🗑 rojo), resolución 150×150px mínimo
- Cropper exporta a 400×400px (antes 200px)
- Bug logo/icono corregido: se incluyen en el PUT de guardar widget
- Upload guarda URL con PUT adicional como doble garantía

### Widgets contextuales
- 🌤 Tiempo: buscador por nombre (Nominatim, gratis), auto-carga al entrar al tab
- Campo `widget_weather_place` guarda el nombre del lugar en Supabase
- 📊 Ocupación: slider + texto personalizable + preview en tiempo real
- 📷 Webcam: soporta imagen JPG/PNG Y iframe (ipcamlive, etc.)
  - Para Astún: `https://astuncandanchu.com/camara/truchas.jpg` (y otras 6)

### Noticias (antes "Especiales")
- Tab renombrado de "Especiales" a "Noticias"
- La noticia aparece ANTES del saludo inicial (antes aparecía después)
- Preview sincronizado con widgetForm (logo, color, mensaje inicial reales)
- "Powered by Chat Arandai" con enlace a arandai.com, fuente 12px

### General
- Coste API eliminado de la vista del cliente
- Reemplazado por: Mensajes disponibles (restantes / total del plan)
- Barra de progreso de consumo (verde → amarillo → rojo al llegar al 20%)

### Knowledge base
- Card "Re-crawl automático": slider 1-30 días, default 10, atajos rápidos
- Muestra fecha último crawl y fecha próximo crawl calculada
- Guarda en campo `recrawl_days` en Supabase

### Playground
- Header usa widgetForm en lugar de cliente — logo, color, nombre actualizados en tiempo real

### Widget real
- Fetch de config desde `/api/widget-config/[widgetId]` — resuelve bug logo/icono
- Memoria entre sesiones con localStorage (historial colapsable)
- Widgets: tiempo con SVG custom, ocupación, webcam
- "Powered by Chat Arandai" con enlace y color del widget

### Endpoint widget-config
- Fix params async para Next.js 15: `params: Promise<{ widgetId: string }>`

### Export PDF (Puppeteer)
- Genera HTML limpio, Puppeteer renderiza, descarga directa sin diálogo
- Modo lista: convs filtradas con primer mensaje
- Modo detalle: conversación completa

### Backup
- `backup.js` adaptado para chat-arandai (rutas, nombre, prefijo ZIP)

---

## SQL PENDIENTE EN SUPABASE

```sql
-- Ejecutar TODO esto en orden:

alter table clients
  add column if not exists ai_model text default 'claude-haiku-4-5-20251001',
  add column if not exists panel_language text default 'es',
  add column if not exists widget_window_size text default 'medium',
  add column if not exists widget_weather_enabled boolean default true,
  add column if not exists widget_weather_lat numeric(9,6),
  add column if not exists widget_weather_lng numeric(9,6),
  add column if not exists widget_weather_place text,
  add column if not exists widget_occupancy_enabled boolean default false,
  add column if not exists widget_occupancy_pct int default 50,
  add column if not exists widget_occupancy_text text,
  add column if not exists widget_webcam_enabled boolean default false,
  add column if not exists widget_webcam_url text,
  add column if not exists recrawl_days int default 10;

alter table master_settings
  add column if not exists master_format text,
  add column if not exists master_rules text;
```

---

## SUPABASE STORAGE

Bucket `widget-assets` — YA CREADO ✅
- Public bucket ✅
- 3 policies ✅

---

## INSTRUCCIONES MAESTRAS

Guardadas en `/admin/settings`. Bloques:

### 💬 Comportamiento base
```
CRÍTICO: Nunca uses asteriscos (*) ni negritas (**). Usa solo guiones (-) para listas.
Eres un asistente virtual amable y útil.
Responde siempre en el idioma del usuario.
Sé conciso pero completo.
Si no sabes algo, dilo honestamente y ofrece el contacto del negocio.
No inventes información que no esté en la knowledge base.
```

### 📐 Formato
```
FORMATO OBLIGATORIO:
- NUNCA uses # ## ### para títulos
- NUNCA uses ** para negritas
- Usa numeración simple (1. 2. 3.) y guiones (-) para sublistas
- Máximo 1-2 emojis por respuesta, solo al final
LINKS: cuando menciones un alojamiento con URL, escríbelo como [Texto](URL)
LONGITUD: conciso pero completo.
```

### ⚖️ Normas
```
- Nunca comparaciones negativas con competidores
- No menciones precios sin añadir enlace a reservas
- Si no está en la KB: "no tengo esa información, contacta en [email/teléfono]"
- No hagas promesas sobre disponibilidad
- No compartas datos personales ni información interna
- Si hay queja grave: ofrece contacto directo inmediatamente
```

---

## MODELOS Y CRÉDITOS

| Modelo | ID | Créditos/msg |
|--------|-----|-------------|
| Claude Haiku | `claude-haiku-4-5-20251001` | 1 |
| Claude Sonnet | `claude-sonnet-4-5` | 4 |
| Claude Opus | `claude-opus-4-5` | 20 |

Default: **Haiku**

---

## PLANES Y PRECIOS

| Plan | Precio | Mensajes/mes | Chatbots |
|------|--------|-------------|----------|
| Starter | €19/mes | 500 | 1 |
| Pro | €49/mes | 3.000 | 3 |
| Business | €99/mes | 10.000 | 10 |
| Agency | €199/mes | 30.000 | Ilimitados |

---

## CLIENTES ACTUALES

### Camping La Siesta
- Widget ID: `camping-la-siesta-3xgfkp`
- Plan: Pro · URL: https://www.camping-lasiesta.com
- Cobra Alex: 200 €/mes
- Coordenadas webcam: lat 41.0775, lng 1.139444

### Astún — Candanchú
- Plan: Business · Cobra Alex: 400 €/mes
- Webcams disponibles (JPG directo):
  - `https://astuncandanchu.com/camara/truchas.jpg`
  - `https://astuncandanchu.com/camara/aguila.jpg`
  - `https://astuncandanchu.com/camara/pradoblanco.jpg`
  - `https://astuncandanchu.com/camara/canalroya.jpg`
  - `https://astuncandanchu.com/camara/CAFETERIASARRIOS.jpg`
  - `https://astuncandanchu.com/camara/sarrios-aguila.jpg`
  - `https://astuncandanchu.com/camara/cimaraca.jpg`

### Camping Calella
- Plan: Starter · Cobra Alex: 49 €/mes

---

## ARQUITECTURA

```
arandai.com          → Web corporativa (HTML estático en GoDaddy)
app.arandai.com      → Chat Arandai SaaS (Next.js en Vercel)
lovejobs.ai          → Ya existe
studioad.io          → Por comprar
```

### Stack
- Next.js 16 App Router + TypeScript
- Supabase (auth + BD + storage)
- Claude API (Haiku para chat, Sonnet para KB)
- Puppeteer (export PDF + scraping)
- Vercel (deploy pendiente)
- Stripe (pendiente)

### Variables de entorno
```
NEXT_PUBLIC_SUPABASE_URL=https://nhrfxsyknqegjdngmmkh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[en archivo]
SUPABASE_SERVICE_ROLE_KEY=[en archivo]
ANTHROPIC_API_KEY=[en archivo]
NEXT_PUBLIC_APP_URL=https://app.arandai.com  ← cambiar en producción
ADMIN_EMAIL=alexcollspeyra@gmail.com
NODE_TLS_REJECT_UNAUTHORIZED=0
CRON_SECRET=[generar con openssl rand -hex 32]
```

---

## PROYECTO EN DISCO

**Ruta:** `C:\Users\anera\Desktop\chat-arandai`

---

## PENDIENTE PRÓXIMAS SESIONES

### Urgente (antes del deploy)
- [ ] Ejecutar SQL pendiente en Supabase (ver arriba)
- [ ] Deploy en Vercel
- [ ] DNS en GoDaddy: CNAME `app` → `cname.vercel-dns.com`
- [ ] Puppeteer en Vercel requiere `puppeteer-core` + `@sparticuz/chromium`
- [ ] Cron job para re-crawl automático (`/api/cron/recrawl`)

### Semana 2
- [ ] Auth clientes — magic link Supabase (`/auth/login`)
- [ ] Dashboard cliente (`/dashboard`) — versión simplificada
- [ ] Lógica trial — 50 mensajes gratis, bloquear al llegar a 0
- [ ] Stripe — pagos de planes + recargas automáticas

### Semana 3
- [ ] Sistema de alertas — detección conversaciones problemáticas
- [ ] Email semanal automático con resumen por cliente
- [ ] Deploy `arandai.com` en GoDaddy
- [ ] Tab Details en Activity (ficha técnica de conversación)

---

## PARA RETOMAR

Sube al proyecto Claude estos archivos antes de empezar:
1. `CHAT_ARANDAI_PROYECTO.md`
2. `CLAUDE_INSTRUCCIONES_CHAT_ARANDAI.md`
3. Este archivo `MEMORIA.md`
4. El archivo que quieras modificar
