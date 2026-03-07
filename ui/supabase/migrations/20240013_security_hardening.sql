-- ==========================================================
-- SECURITY HARDENING MIGRATION
-- Use these commands in your Supabase SQL Editor
-- This migration fixes data exposure while maintaining staff functionality.
-- ==========================================================

-- 1. SECURE AUTHENTICATED ROLES FUNCTION
-- Adding explicit search_path prevents schema-shadowing attacks
ALTER FUNCTION public.is_admin_or_employee() SET search_path = public;

-- 2. SECURE APPLICANTS TABLE
-- Current policy 'applicants_select_final' (true) is dangerous.
-- Restrict to: Owners of the application OR Admin/Employees.
DROP POLICY IF EXISTS "applicants_select_final" ON public.applicants;
DROP POLICY IF EXISTS "users_read_own_applicants" ON public.applicants;

CREATE POLICY "applicants_secure_select" 
ON public.applicants FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.marriage_applications ma
    WHERE ma.id = applicants.application_id
    AND (ma.created_by = auth.uid() OR public.is_admin_or_employee())
  )
);

-- 3. SECURE ADDRESSES TABLE
-- Current policy 'addresses_select_final' (true) is dangerous.
-- Restrict to: Owners of the address OR Admin/Employees.
DROP POLICY IF EXISTS "addresses_select_final" ON public.addresses;

CREATE POLICY "addresses_secure_select" 
ON public.addresses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.applicants a
    JOIN public.marriage_applications ma ON ma.id = a.application_id
    WHERE a.address_id = addresses.id
    AND (ma.created_by = auth.uid() OR public.is_admin_or_employee())
  )
);

-- 4. SECURE UNCLAIMED APPLICATIONS
-- Restrict 'unclaimed' applications (walk-ins) to staff ONLY until claimed.
DROP POLICY IF EXISTS "allow_authenticated_view_unclaimed" ON public.marriage_applications;

CREATE POLICY "staff_only_view_unclaimed" 
ON public.marriage_applications FOR SELECT 
USING (
  (created_by IS NULL AND public.is_admin_or_employee())
  OR (created_by = auth.uid())
);

-- 5. PROFILE ROLE PROTECTION
-- Prevents users from manually changing their role to 'admin' via standard UPDATE.
CREATE OR REPLACE FUNCTION public.protect_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- If a non-admin is trying to change a role field, block it.
  IF (TG_OP = 'UPDATE' AND NEW.role <> OLD.role AND NOT public.is_admin_or_employee()) THEN
    NEW.role = OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create the trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'tr_protect_role' AND tgrelid = 'public.profiles'::regclass) THEN
    CREATE TRIGGER tr_protect_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_role();
  END IF;
END $$;
