# Sistema de Ventas Automático - Setup

Todo está listo. Pasos para mañana:

## 1️⃣ Ejecutar migraciones Supabase

Ve a Supabase SQL Editor y ejecuta el contenido de:
```
supabase/migrations_sales.sql
```

Crea la tabla `trial_chats` para trackear trials.

## 2️⃣ Deploy en Vercel

```bash
git add -A
git commit -m "feat: add sales module with prospecting automation"
git push
```

Vercel desplegará automáticamente.

## 3️⃣ Usar el módulo

En Admin → **Ventas tab**:

### Buscar empresas:
1. Selecciona sector (hoteles, campings, tours, etc.)
2. Escribe región (España, Francia, etc.)
3. Click "🔍 Buscar"
4. Claude busca 10 empresas sin chat

### Validar empresas:
1. Verifica la lista que sale
2. Click "✓ Crear" en las que quieras
3. Sistema automáticamente:
   - Scrapeea su web
   - Crea chat trial (15 días, 100 msgs)
   - Entrena KB con su contenido
   - **Envía email HTML profesional**
   - Añade widget del tiempo (si tiene lat/lng)

### Monitorear actividad:
- Verás todos los trials activos
- 🔥 Hot leads = empresas con >5 mensajes
- Click "📞 Contactar" cuando veas movimiento

## 🎯 Flujo esperado

```
1. Buscas → Validas 3-5 empresas
2. Sistema crea chats + envía emails
3. Esperas 2-3 días a actividad
4. Si tiene mensajes → contactas por teléfono
5. Si interesada → migra a clientes normales
6. Si no → prueba con otras
```

## 📊 Objetivo

- 10 trials/día
- 20% conversion = 2 nuevos clientes/día
- A $49/mes (Pro) = ~$98/mes extra

## ⚙️ Costes

- Claude API calls: ~$0.03/día
- Email: gratis
- Infraestructura: cubierta por Vercel

**ROI**: Muy positivo si conversion >10%

## 🔍 Próximo paso (Opcional)

Una vez valides el flujo manual, podemos automaticar:
- Búsqueda diaria automática
- Creación automática de trials
- Envío automático de emails
- Notificaciones de hot leads

Por ahora: **100% manual pero con herramientas que autosprospecting**.

---

Made with ❤️ by Claude
