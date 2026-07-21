-- Add soft-delete support: deleted_at column on quotes and users tables
-- When deleted_at IS NOT NULL, the record is soft-deleted (hidden from normal queries)
-- Admin can purge all soft-deleted records via the "Purge" button in the admin dashboard
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
