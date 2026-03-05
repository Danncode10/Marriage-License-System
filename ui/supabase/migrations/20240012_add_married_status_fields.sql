-- Migration to add previous marriage dissolved fields
ALTER TABLE applicants 
ADD COLUMN IF NOT EXISTS civil_status TEXT DEFAULT 'Single',
ADD COLUMN IF NOT EXISTS dissolved_how TEXT,
ADD COLUMN IF NOT EXISTS dissolved_place TEXT,
ADD COLUMN IF NOT EXISTS dissolved_country TEXT DEFAULT 'Philippines',
ADD COLUMN IF NOT EXISTS dissolved_date DATE,
ADD COLUMN IF NOT EXISTS relationship_degree TEXT;
