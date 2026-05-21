-- FUB Upgrade Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/aymltwuhrquekbafseae/sql

-- 1. lead_stage enum
DO $$ BEGIN
  CREATE TYPE lead_stage AS ENUM (
    'yeni','iletisime_gecildi','gorusme','teklif','sozlesme','kapandi','kaybedildi'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. leads tablosu — yeni kolonlar
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage lead_stage NOT NULL DEFAULT 'yeni';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS score integer NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS days_in_stage integer NOT NULL DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS stage_changed_at timestamptz DEFAULT now();
ALTER TABLE leads ADD COLUMN IF NOT EXISTS assigned_at timestamptz;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city text;

-- Mevcut status → stage migration
UPDATE leads SET stage =
  CASE status
    WHEN 'yeni'       THEN 'yeni'::lead_stage
    WHEN 'aranildi'   THEN 'iletisime_gecildi'::lead_stage
    WHEN 'gorusme'    THEN 'gorusme'::lead_stage
    WHEN 'teklif'     THEN 'teklif'::lead_stage
    WHEN 'kapandi'    THEN 'kapandi'::lead_stage
    WHEN 'kaybedildi' THEN 'kaybedildi'::lead_stage
    ELSE 'yeni'::lead_stage
  END;

-- 3. brokers — yeni kolonlar
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS daily_lead_limit integer NOT NULL DEFAULT 10;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS current_month_leads integer NOT NULL DEFAULT 0;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS conversion_rate numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE brokers ADD COLUMN IF NOT EXISTS avg_response_time_minutes integer NOT NULL DEFAULT 0;

-- 4. listings — scraper için
ALTER TABLE listings ADD COLUMN IF NOT EXISTS external_id text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS external_source text;

-- 5. action_plans tablosu
CREATE TABLE IF NOT EXISTS action_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  created_by text NOT NULL,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. lead_action_logs tablosu
CREATE TABLE IF NOT EXISTS lead_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES action_plans(id),
  step_index integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz,
  executed_at timestamptz,
  result text NOT NULL DEFAULT 'pending' CHECK (result IN ('pending','sent','failed','skipped')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. saved_filters tablosu
CREATE TABLE IF NOT EXISTS saved_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_shared boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 8. tenants tablosu
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan text NOT NULL DEFAULT 'baslangic' CHECK (plan IN ('baslangic','takim','kurumsal')),
  max_brokers integer NOT NULL DEFAULT 1,
  max_leads_per_month integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Varsayılan action plan
INSERT INTO action_plans (name, description, is_default, created_by, steps)
VALUES (
  'Yeni Lead Takip Planı',
  'Her yeni lead için otomatik başlatılan standart takip akışı',
  true,
  'system',
  '[
    {"day": 0, "type": "whatsapp", "template": "Merhaba {ad}, {ofis_adi} olarak sizi aradık, ulaşamadık. Uygun zamanınızda dönüş yapabilirsiniz: {ofis_tel}", "assignTo": "sorumlu_broker"},
    {"day": 1, "type": "arama",    "template": "Lead ile ilk görüşme yapın", "assignTo": "sorumlu_broker"},
    {"day": 3, "type": "whatsapp", "template": "{ad} Bey/Hanım, {ilce} bölgesinde bütçenize uygun yeni ilanlarımız var. İncelemek ister misiniz?", "assignTo": "sorumlu_broker"},
    {"day": 7, "type": "gorev",    "template": "7 günde dönüş yok — yönetici bilgilendir", "assignTo": "ofis_yoneticisi"},
    {"day": 14, "type": "whatsapp","template": "{ad} Bey/Hanım, arayışınız devam ediyor mu? Size yardımcı olmak isteriz.", "assignTo": "sorumlu_broker"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- 10. İndeksler
CREATE INDEX IF NOT EXISTS leads_stage_idx   ON leads(stage);
CREATE INDEX IF NOT EXISTS leads_score_idx   ON leads(score);
CREATE INDEX IF NOT EXISTS leads_follow_up_idx ON leads(next_follow_up_at);
CREATE INDEX IF NOT EXISTS lead_logs_lead_idx ON lead_action_logs(lead_id);
CREATE INDEX IF NOT EXISTS lead_logs_sched_idx ON lead_action_logs(scheduled_for) WHERE result = 'pending';
