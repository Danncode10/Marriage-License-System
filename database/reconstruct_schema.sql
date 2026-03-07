-- ==========================================================
-- SUPABASE SCHEMA RECONSTRUCTION (UPDATED FOR RLS FIX)
-- ==========================================================

-- 1. FUNCTIONS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.is_admin_or_employee()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'employee')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. TABLES

-- Table: addresses
CREATE TABLE IF NOT EXISTS public.addresses (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    province text NULL,
    municipality text NULL,
    barangay text NULL,
    street_address text NULL,
    created_at timestamptz NULL DEFAULT now(),
    updated_at timestamptz NULL DEFAULT now(),
    country text NULL DEFAULT 'Philippines'::text,
    is_foreigner bool NULL DEFAULT false,
    created_by uuid NULL, -- Added to fix RLS during insertion
    CONSTRAINT addresses_pkey PRIMARY KEY (id)
);

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL,
    role varchar NOT NULL DEFAULT 'user',
    full_name text NULL,
    employee_id varchar NULL,
    created_at timestamptz NULL DEFAULT now(),
    updated_at timestamptz NULL DEFAULT now(),
    phone_number text NULL,
    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Trigger Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: on_auth_user_created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Table: marriage_applications
CREATE TABLE IF NOT EXISTS public.marriage_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_code varchar NOT NULL DEFAULT substring(md5(random()::text), 1, 6),
    status varchar NULL DEFAULT 'draft'::character varying,
    document_number int4 NULL,
    created_by uuid NULL,
    processed_by uuid NULL,
    created_at timestamptz NULL DEFAULT now(),
    updated_at timestamptz NULL DEFAULT now(),
    contact_number text NULL,
    registry_number varchar NULL,
    CONSTRAINT marriage_applications_pkey PRIMARY KEY (id)
);

-- Table: applicants
CREATE TABLE IF NOT EXISTS public.applicants (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL,
    type varchar NULL,
    first_name text NULL,
    middle_name text NULL,
    last_name text NULL,
    birth_date date NULL,
    age int4 NULL,
    religion text NULL,
    citizenship text NULL,
    phone_number text NULL,
    address_id uuid NULL,
    father_name text NULL,
    father_citizenship text NULL,
    mother_name text NULL,
    mother_citizenship text NULL,
    created_at timestamptz NULL DEFAULT now(),
    updated_at timestamptz NULL DEFAULT now(),
    suffix text NULL,
    giver_name text NULL,
    giver_relationship text NULL,
    valid_id_type text NULL,
    valid_id_number text NULL,
    giver_id_type text NULL,
    giver_id_number text NULL,
    include_id bool NULL DEFAULT false,
    id_type text NULL,
    id_no text NULL,
    giver_include_id bool NULL DEFAULT false,
    giver_id_no text NULL,
    birth_place text NULL,
    giver_suffix text NULL,
    is_not_born_in_ph bool NULL DEFAULT false,
    birth_country text NULL DEFAULT 'Philippines'::text,
    civil_status text NULL DEFAULT 'Single'::text,
    dissolved_how text NULL,
    dissolved_place text NULL,
    dissolved_country text NULL DEFAULT 'Philippines'::text,
    dissolved_date date NULL,
    relationship_degree text NULL,
    CONSTRAINT applicants_pkey PRIMARY KEY (id)
);

-- Table: application_photos
CREATE TABLE IF NOT EXISTS public.application_photos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL,
    photo_type varchar NOT NULL,
    file_path text NOT NULL,
    file_size int4 NOT NULL,
    uploaded_by uuid NULL,
    uploaded_at timestamptz NULL DEFAULT now(),
    CONSTRAINT application_photos_pkey PRIMARY KEY (id)
);

-- Table: audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NULL,
    application_id uuid NULL,
    action text NOT NULL,
    details jsonb NULL,
    created_at timestamptz NULL DEFAULT now(),
    CONSTRAINT audit_logs_pkey PRIMARY KEY (id)
);

-- Table: generated_documents
CREATE TABLE IF NOT EXISTS public.generated_documents (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL,
    file_path text NOT NULL,
    file_size int4 NOT NULL,
    generated_by uuid NULL,
    generated_at timestamptz NULL DEFAULT now(),
    CONSTRAINT generated_documents_pkey PRIMARY KEY (id)
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    related_application_id uuid NULL,
    related_user_id uuid NULL,
    created_by uuid NULL,
    created_at timestamptz NULL DEFAULT now(),
    read_at timestamptz NULL,
    metadata jsonb NULL DEFAULT '{}'::jsonb,
    CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Table: user_document_uploads
CREATE TABLE IF NOT EXISTS public.user_document_uploads (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL,
    document_type varchar NOT NULL,
    file_path text NOT NULL,
    file_size int4 NOT NULL,
    file_name text NOT NULL,
    uploaded_by uuid NULL,
    uploaded_at timestamptz NULL DEFAULT now(),
    CONSTRAINT user_document_uploads_pkey PRIMARY KEY (id)
);

-- 3. FOREIGN KEYS
ALTER TABLE public.marriage_applications DROP CONSTRAINT IF EXISTS marriage_applications_created_by_fkey;
ALTER TABLE public.marriage_applications ADD CONSTRAINT marriage_applications_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);
ALTER TABLE public.marriage_applications DROP CONSTRAINT IF EXISTS marriage_applications_processed_by_fkey;
ALTER TABLE public.marriage_applications ADD CONSTRAINT marriage_applications_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES profiles(id);

ALTER TABLE public.applicants DROP CONSTRAINT IF EXISTS applicants_address_id_fkey;
ALTER TABLE public.applicants ADD CONSTRAINT applicants_address_id_fkey FOREIGN KEY (address_id) REFERENCES addresses(id);
ALTER TABLE public.applicants DROP CONSTRAINT IF EXISTS applicants_application_id_fkey;
ALTER TABLE public.applicants ADD CONSTRAINT applicants_application_id_fkey FOREIGN KEY (application_id) REFERENCES marriage_applications(id);

ALTER TABLE public.application_photos DROP CONSTRAINT IF EXISTS application_photos_application_id_fkey;
ALTER TABLE public.application_photos ADD CONSTRAINT application_photos_application_id_fkey FOREIGN KEY (application_id) REFERENCES marriage_applications(id);
ALTER TABLE public.application_photos DROP CONSTRAINT IF EXISTS application_photos_uploaded_by_fkey;
ALTER TABLE public.application_photos ADD CONSTRAINT application_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES profiles(id);

ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_application_id_fkey;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_application_id_fkey FOREIGN KEY (application_id) REFERENCES marriage_applications(id);
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE public.audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

ALTER TABLE public.generated_documents DROP CONSTRAINT IF EXISTS generated_documents_application_id_fkey;
ALTER TABLE public.generated_documents ADD CONSTRAINT generated_documents_application_id_fkey FOREIGN KEY (application_id) REFERENCES marriage_applications(id);
ALTER TABLE public.generated_documents DROP CONSTRAINT IF EXISTS generated_documents_generated_by_fkey;
ALTER TABLE public.generated_documents ADD CONSTRAINT generated_documents_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES profiles(id);

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_related_application_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_related_application_id_fkey FOREIGN KEY (related_application_id) REFERENCES marriage_applications(id);

ALTER TABLE public.user_document_uploads DROP CONSTRAINT IF EXISTS user_document_uploads_application_id_fkey;
ALTER TABLE public.user_document_uploads ADD CONSTRAINT user_document_uploads_application_id_fkey FOREIGN KEY (application_id) REFERENCES marriage_applications(id);
ALTER TABLE public.user_document_uploads DROP CONSTRAINT IF EXISTS user_document_uploads_uploaded_by_fkey;
ALTER TABLE public.user_document_uploads ADD CONSTRAINT user_document_uploads_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES profiles(id);

-- 4. ENABLE RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marriage_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_document_uploads ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES (CLEANED UP WITH DROP)

-- addresses
DROP POLICY IF EXISTS "addresses_secure_select" ON public.addresses;
CREATE POLICY "addresses_secure_select" ON public.addresses FOR SELECT TO public 
USING (
    created_by = auth.uid() 
    OR 
    is_admin_or_employee()
    OR
    EXISTS ( SELECT 1 FROM public.applicants a JOIN public.marriage_applications ma ON ma.id = a.application_id WHERE a.address_id = addresses.id AND (ma.created_by = auth.uid() OR is_admin_or_employee()))
);

DROP POLICY IF EXISTS "addresses_insert_authenticated_only" ON public.addresses;
CREATE POLICY "addresses_insert_authenticated_only" ON public.addresses FOR INSERT TO authenticated 
WITH CHECK (created_by = auth.uid());

-- profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT TO public USING ((auth.uid() = id) OR is_admin_or_employee());
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id) OR is_admin_or_employee());
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT TO public WITH CHECK (auth.uid() = id);

-- marriage_applications
DROP POLICY IF EXISTS "app_insert_authenticated" ON public.marriage_applications;
CREATE POLICY "app_insert_authenticated" ON public.marriage_applications FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS "users_view_own_applications" ON public.marriage_applications;
CREATE POLICY "users_view_own_applications" ON public.marriage_applications FOR SELECT TO authenticated USING (created_by = auth.uid());
DROP POLICY IF EXISTS "staff_only_view_unclaimed" ON public.marriage_applications;
CREATE POLICY "staff_only_view_unclaimed" ON public.marriage_applications FOR SELECT TO public USING (((created_by IS NULL) AND is_admin_or_employee()) OR (created_by = auth.uid()));
DROP POLICY IF EXISTS "staff_update_access" ON public.marriage_applications;
CREATE POLICY "staff_update_access" ON public.marriage_applications FOR UPDATE TO public USING (is_admin_or_employee());
DROP POLICY IF EXISTS "service_role_full_access" ON public.marriage_applications;
CREATE POLICY "service_role_full_access" ON public.marriage_applications FOR ALL TO public USING (auth.role() = 'service_role'::text);

-- applicants
DROP POLICY IF EXISTS "applicants_insert_authenticated_only" ON public.applicants;
CREATE POLICY "applicants_insert_authenticated_only" ON public.applicants FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "applicants_secure_select" ON public.applicants;
CREATE POLICY "applicants_secure_select" ON public.applicants FOR SELECT TO public USING (EXISTS ( SELECT 1 FROM marriage_applications ma WHERE ma.id = applicants.application_id AND (ma.created_by = auth.uid() OR is_admin_or_employee())));

-- application_photos
DROP POLICY IF EXISTS "employees_manage_application_photos" ON public.application_photos;
CREATE POLICY "employees_manage_application_photos" ON public.application_photos FOR ALL TO authenticated USING (is_admin_or_employee());

-- audit_logs
DROP POLICY IF EXISTS "admins_view_audit_logs" ON public.audit_logs;
CREATE POLICY "admins_view_audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (is_admin_or_employee());
DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON public.audit_logs;
CREATE POLICY "authenticated_insert_audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- generated_documents
DROP POLICY IF EXISTS "employees_manage_documents" ON public.generated_documents;
CREATE POLICY "employees_manage_documents" ON public.generated_documents FOR ALL TO authenticated USING (is_admin_or_employee());

-- notifications
DROP POLICY IF EXISTS "authenticated_insert_notifications" ON public.notifications;
CREATE POLICY "authenticated_insert_notifications" ON public.notifications FOR INSERT TO public WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "users_view_own_notifications" ON public.notifications;
CREATE POLICY "users_view_own_notifications" ON public.notifications FOR SELECT TO public USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "staff_view_created_notifications" ON public.notifications;
CREATE POLICY "staff_view_created_notifications" ON public.notifications FOR SELECT TO public USING (is_admin_or_employee());
DROP POLICY IF EXISTS "users_update_own_notifications" ON public.notifications;
CREATE POLICY "users_update_own_notifications" ON public.notifications FOR UPDATE TO public USING (auth.uid() = user_id);

-- user_document_uploads
DROP POLICY IF EXISTS "users_manage_own_documents" ON public.user_document_uploads;
CREATE POLICY "users_manage_own_documents" ON public.user_document_uploads FOR ALL TO authenticated USING (uploaded_by = auth.uid());
DROP POLICY IF EXISTS "employees_view_all_documents" ON public.user_document_uploads;
CREATE POLICY "employees_view_all_documents" ON public.user_document_uploads FOR SELECT TO authenticated USING (is_admin_or_employee());
