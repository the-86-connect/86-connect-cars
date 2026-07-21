-- Add status_updated_at column to quotes table for tracking when delivery status was last updated
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ;
