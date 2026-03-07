-- I manually created an account from my Create account, 
-- and then I manually changed the role to admin using sql command

DO $$
DECLARE
    target_email TEXT := 'Admin@gmail.com';
    u_id UUID;
BEGIN
    -- 1. Find the user ID
    SELECT id INTO u_id FROM auth.users WHERE email = target_email;

    IF u_id IS NULL THEN
        RAISE EXCEPTION 'User % not found. Please create the account via the UI first.', target_email;
    END IF;

    -- 2. Update Auth Metadata (Crucial for JWT-based RLS)
    UPDATE auth.users 
    SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
    WHERE id = u_id;

    -- 3. Update Public Profile
    UPDATE public.profiles 
    SET role = 'admin'
    WHERE id = u_id;

    RAISE NOTICE 'User % (ID: %) has been successfully promoted to Admin.', target_email, u_id;

    -- Refresh schema cache
    NOTIFY pgrst, 'reload schema';
END;
$$;
