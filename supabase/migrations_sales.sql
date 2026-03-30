-- ============================================================
-- MIGRACIONES PARA MÓDULO DE VENTAS
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- TRIAL_CHATS: Trackea chatbots en periodo de prueba
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trial_chats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_website text,
  company_city text,
  company_lat numeric,
  company_lng numeric,
  company_phone text,
  status text DEFAULT 'active',
  -- 'active' | 'converted' | 'expired' | 'rejected'
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz,
  converted_at timestamptz,
  activity_messages integer DEFAULT 0,
  last_activity_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trial_chats_status_idx ON trial_chats(status);
CREATE INDEX IF NOT EXISTS trial_chats_client_id_idx ON trial_chats(client_id);
CREATE INDEX IF NOT EXISTS trial_chats_activity_idx ON trial_chats(activity_messages DESC);
