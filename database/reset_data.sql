-- ==========================================================
-- DATABASE RESET SCRIPT
-- WARNING: THIS WILL PERMANENTLY DELETE ALL DATA!
-- Use this before running dummy_data.sql to ensure a clean start.
-- ==========================================================

DO $$
BEGIN
    -- 1. Disable triggers to speed up and avoid conflicts
    SET session_replication_role = 'replica';

    -- 2. Clear all Public Tables
    -- TRUNCATE is faster than DELETE and resets serial IDs
    -- CASCADE ensures related records are removed correctly
    TRUNCATE TABLE 
        public.applicants,
        public.marriage_applications,
        public.addresses,
        public.application_photos,
        public.audit_logs,
        public.generated_documents,
        public.notifications,
        public.user_document_uploads,
        public.profiles
    RESTART IDENTITY CASCADE;

    -- 3. Clear all Auth Users (Except system roles)
    -- This removes all accounts (Admin, Employees, and Couples)
    DELETE FROM auth.users;

    -- 4. Re-enable triggers
    SET session_replication_role = 'origin';

    RAISE NOTICE 'Database reset complete. All public data and auth users have been removed.';
END $$;
