-- Site-wide settings (single-row key-value store)
CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  chatbot_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin manage site_settings" ON site_settings FOR ALL USING (auth.role() = 'service_role');

INSERT INTO site_settings (id, chatbot_enabled) VALUES ('default', TRUE) ON CONFLICT (id) DO NOTHING;
