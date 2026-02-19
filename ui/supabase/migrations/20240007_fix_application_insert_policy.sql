-- ================================================================
-- FIX: Remove "one application per user" restriction
-- ================================================================
-- The old "app_insert_authenticated" policy had a WITH CHECK clause that
-- prevented users from ever submitting more than ONE application (it blocked
-- inserts if ANY row with created_by = auth.uid() already existed).
-- 
-- This fix replaces that policy with a simpler one that just ensures
-- a user can only set themselves as the creator of their own application.
-- ================================================================

-- Step 1: Drop the old blocking policy
DROP POLICY IF EXISTS "app_insert_authenticated" ON public.marriage_applications;

-- Step 2: Create a corrected policy:
--   - Authenticated users can INSERT applications
--   - They must set created_by to their own user ID
CREATE POLICY "app_insert_authenticated"
  ON public.marriage_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());
