-- Add country column to addresses table for non-Philippines addresses
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Philippines';
