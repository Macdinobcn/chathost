-- ============================================================
-- MIGRACIONES MANUALES — ChatHost.ai
-- Ejecutar en Supabase SQL Editor en este orden
-- ============================================================

-- 1. WIDGET_LANGUAGES: idiomas permitidos por chatbot
-- ─────────────────────────────────────────────────────────────
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS widget_languages text[] DEFAULT '{}';


-- 2. INCIDENTS: panel de incidencias
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL,
  -- 'scrape_failed' | 'no_credits' | 'payment_failed' | 'bot_inactive' | 'high_error_rate'
  severity text DEFAULT 'medium',
  -- 'low' | 'medium' | 'high' | 'critical'
  status text DEFAULT 'open',
  -- 'open' | 'auto_fixed' | 'needs_human' | 'resolved'
  title text,
  description text,
  auto_fix_attempted boolean DEFAULT false,
  auto_fix_result text,
  notified_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incidents_client_id_idx ON incidents(client_id);
CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents(status);
CREATE INDEX IF NOT EXISTS incidents_severity_idx ON incidents(severity);


-- 3. SENTIMENT_ANALYSIS: análisis de sentimiento por cliente
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sentiment_analysis (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  client_name text,
  widget_color text DEFAULT '#059669',
  total_analyzed integer DEFAULT 0,
  positive_pct integer DEFAULT 0,
  negative_pct integer DEFAULT 0,
  neutral_pct integer DEFAULT 0,
  top_topics text[] DEFAULT '{}',
  top_issues text[] DEFAULT '{}',
  summary text,
  last_analyzed timestamptz DEFAULT now()
);


-- 4. GLOBAL_INSIGHTS: insights globales de sentimiento
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS global_insights (
  id text PRIMARY KEY DEFAULT 'singleton',
  total_conversations integer DEFAULT 0,
  avg_positive integer DEFAULT 0,
  avg_negative integer DEFAULT 0,
  top_complaints text[] DEFAULT '{}',
  top_praises text[] DEFAULT '{}',
  improvement_suggestions text[] DEFAULT '{}',
  generated_at timestamptz DEFAULT now()
);


-- 5. BOT CHATHOST.AI INTERNO
-- ─────────────────────────────────────────────────────────────
-- Crea el chatbot interno de ChatHost.ai con knowledge base manual
-- NOTA: Ejecuta esto DESPUÉS de las migraciones anteriores

DO $$
DECLARE
  v_client_id uuid;
  v_widget_id text := 'chathost-ai-' || substr(md5(random()::text), 1, 6);
BEGIN
  -- Crear el cliente interno
  INSERT INTO clients (
    name, website_url, email, plan,
    widget_id, widget_color, widget_name,
    active, is_internal, billing_override,
    credits_balance, subscription_status,
    system_prompt, initial_message,
    widget_placeholder
  ) VALUES (
    'ChatHost.ai',
    'https://chathost.ai',
    'chathostapp@gmail.com',
    'agency',
    v_widget_id,
    '#6366f1',
    'Asistente ChatHost.ai',
    true,
    true,
    'free',
    999999,
    'active',
    'Eres el asistente virtual de ChatHost.ai. Explica con entusiasmo cómo funciona la plataforma, los planes y precios, y cómo puede ayudar a los negocios. No menciones información interna, costes de API ni datos de otros clientes. Sé amable, claro y orientado a vender el valor del producto.',
    '¡Hola! Soy el asistente de ChatHost.ai 👋 ¿En qué puedo ayudarte?',
    '¿Tienes alguna pregunta sobre ChatHost.ai?'
  )
  RETURNING id INTO v_client_id;

  -- Crear la knowledge base con el contenido manual
  INSERT INTO knowledge_bases (
    client_id,
    content_md,
    scraping_status,
    pages_scraped,
    words_count,
    last_scraped_at
  ) VALUES (
    v_client_id,
    'VER ARCHIVO: lib/chathost-kb.md — ejecutar script de carga',
    'pending',
    1,
    500,
    now()
  );

  RAISE NOTICE 'Bot ChatHost.ai creado con ID: % y widget_id: %', v_client_id, v_widget_id;
END $$;
