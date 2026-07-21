-- Add vehicle_slug column to quotes table for tracking vehicle context
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS vehicle_slug TEXT;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
