-- Add toggle for testimonial section visibility
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS testimonials_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Backfill the default row so the column has a value
UPDATE site_settings SET testimonials_enabled = TRUE WHERE id = 'default';
