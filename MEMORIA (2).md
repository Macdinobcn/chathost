# MEMORIA — ChatHost
*Última actualización: 2026-03-30*

---

## ESTADO ACTUAL

### ChatHost (app.chathost.ai)
- ✅ Deploy en Vercel: `chathost-orpin.vercel.app`
- ✅ Panel admin con datos reales de Supabase
- ✅ GitHub: `https://github.com/Macdinobcn/chathost.git`
- ✅ Bucket `widget-assets` en Supabase — PUBLIC, 3 policies
- ✅ SQL ejecutado en Supabase
- ✅ Variables de entorno en Vercel configuradas
- 🔄 DNS propagando: CNAME `app` → `16c0f8562ec8ad05.vercel-dns-017.com`

---

## DOMINIO Y MARCA
- Producto: ChatHost
- Dominio: chathost.ai (Namecheap, mínimo 2 años)
- App: app.chathost.ai → Vercel
- Email pendiente: chathostapp@gmail.com
- GitHub: https://github.com/Macdinobcn/chathost
- Vercel URL temporal: chathost-orpin.vercel.app

---

## VARIABLES DE ENTORNO EN VERCEL
```
NEXT_PUBLIC_SUPABASE_URL=https://nhrfxsyknqegjdngmmkh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[configurado]
SUPABASE_SERVICE_ROLE_KEY=[configurado]
ANTHROPIC_API_KEY=[configurado]
NEXT_PUBLIC_APP_URL=https://app.chathost.ai
ADMIN_EMAIL=chathostapp@gmail.com
NODE_TLS_REJECT_UNAUTHORIZED=0
CRON_SECRET=arandai_cron_secret_2026_xyz
```

---

## ARCHIVOS CLAVE

| Archivo | Ruta en proyecto |
|---------|-----------------|
| page.tsx | app/admin/clients/[id]/page.tsx |
| widget_page.tsx | app/widget/[widgetId]/page.tsx |
| route_widget_config.ts | app/api/widget-config/[widgetId]/route.ts |
| route_export_pdf.ts | app/api/export-pdf/route.ts |
| route_chat_history.ts | app/api/chat/history/route.ts |
| backup.js | raíz del proyecto |

---

## CLIENTES ACTUALES

### Camping La Siesta
- Widget ID: camping-la-siesta-3xgfkp
- Plan: Pro · Cobra Alex: 200€/mes

### Astún — Candanchú
- Plan: Business · Cobra Alex: 400€/mes
- Webcam: https://astuncandanchu.com/camara/truchas.jpg (y otras 6)

### Camping Calella
- Plan: Starter · Cobra Alex: 49€/mes

---

## PLANES Y PRECIOS

| Plan | Precio | Mensajes/mes |
|------|--------|-------------|
| Starter | 19€/mes | 500 |
| Pro | 49€/mes | 3.000 |
| Business | 99€/mes | 10.000 |
| Agency | 199€/mes | 30.000 |

---

## STACK
- Next.js 16 App Router + TypeScript
- Supabase (auth + BD + storage)
- Claude API (Haiku chat, Sonnet KB)
- Puppeteer (PDF + scraping) — pendiente fix Vercel
- Vercel + Stripe (pendiente)

---

## PROYECTO EN DISCO
Ruta: C:\Users\anera\Desktop\chat-arandai

---

## PENDIENTE

### Inmediato
- [ ] Verificar DNS app.chathost.ai propagado
- [ ] Smoke test completo en producción
- [ ] Actualizar snippet clientes con URL nueva
- [ ] Fix Puppeteer Vercel: puppeteer-core + @sparticuz/chromium
- [ ] Cron job re-crawl (/api/cron/recrawl)

### Semana 2
- [ ] Auth clientes magic link (/auth/login)
- [ ] Dashboard cliente (/dashboard)
- [ ] Trial 50 mensajes gratis
- [ ] Stripe pagos + recargas

### Semana 3
- [ ] Landing page chathost.ai
- [ ] Alertas conversaciones problemáticas
- [ ] Email semanal resumen por cliente
- [ ] Deploy arandai.com en GoDaddy

---

## PARA RETOMAR
Sube al proyecto Claude:
1. CHAT_ARANDAI_PROYECTO.md
2. CLAUDE_INSTRUCCIONES_CHAT_ARANDAI.md
3. MEMORIA.md (este archivo)
4. El archivo que quieras modificar
