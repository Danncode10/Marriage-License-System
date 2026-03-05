-- Add 'deleted' to the allowed statuses in the marriage_applications table
ALTER TABLE marriage_applications 
DROP CONSTRAINT IF EXISTS marriage_applications_status_check;

ALTER TABLE marriage_applications 
ADD CONSTRAINT marriage_applications_status_check 
CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'processing', 'completed', 'rejected', 'finished', 'deleted'));
