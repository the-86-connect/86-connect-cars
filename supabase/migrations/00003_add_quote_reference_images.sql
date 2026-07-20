-- Add reference_images column to quotes table (array of image URLs from Cloudinary)
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS reference_images TEXT[] DEFAULT '{}';
