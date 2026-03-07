-- ==========================================================
-- DUMMY STARTING DATA
-- Run this in your Supabase SQL Editor AFTER running reconstruct_schema.sql
-- ==========================================================

DO $$
DECLARE
    user_id UUID;
    app_id UUID;
    groom_addr_id UUID;
    bride_addr_id UUID;
    
    -- Name arrays for variety
    first_names TEXT[] := ARRAY['Liam', 'Noah', 'Oliver', 'James', 'Elijah', 'William', 'Henry', 'Lucas', 'Benjamin', 'Theodore', 'Mateo', 'Levi', 'Sebastian', 'Daniel', 'Jack', 'Wyatt', 'Alexander', 'Owen', 'Asher', 'Samuel', 'Ethan', 'Leo', 'Jackson', 'Mason', 'Ezra', 'John', 'Hudson', 'Luca', 'Aiden', 'Joseph', 'David', 'Jacob', 'Logan', 'Luke', 'Julian', 'Gabriel', 'Grayson', 'Isaac', 'Anthony', 'Josiah', 'Dylan', 'Elias', 'Caleb', 'Thomas', 'Christopher', 'Ezekiel', 'Miles', 'Josiah', 'Isaiah', 'Andrew'];
    last_names TEXT[] := ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
    female_names TEXT[] := ARRAY['Olivia', 'Emma', 'Charlotte', 'Amelia', 'Sophia', 'Mia', 'Isabella', 'Ava', 'Evelyn', 'Luna', 'Harper', 'Sofia', 'Scarlett', 'Eleanor', 'Hazel', 'Abigail', 'Aurora', 'Elena', 'Penelope', 'Aria', 'Ellie', 'Layla', 'Nora', 'Mila', 'Lily', 'Violet', 'Nova', 'Maya', 'Lily', 'Grace', 'Chloe', 'Zoe', 'Riley', 'Victoria', 'Stella', 'Serenity', 'Emma', 'Willow', 'Emilia', 'Hannah', 'Stella', 'Leah', 'Lila', 'Audrey', 'Lucy', 'Anna', 'Alice', 'Eliana', 'Avery', 'Celia'];
    
    i INTEGER;
    b_first_idx INTEGER;
    b_last_idx INTEGER;
BEGIN
    -- Ensure pgcrypto is enabled for encryption
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- 1. CREATE ADMIN (Password: Admin12345)
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
        user_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
        VALUES (
            user_id,
            'admin@example.com',
            crypt('Admin12345', gen_salt('bf')),
            now(),
            jsonb_build_object('full_name', 'System Admin'),
            'authenticated',
            'authenticated'
        );
        -- Override role to admin
        UPDATE public.profiles SET role = 'admin' WHERE id = user_id;
    END IF;

    -- 2. CREATE EMPLOYEES (3) (Password: Employee12345)
    FOR i IN 1..3 LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = format('employee%s@example.com', i)) THEN
            user_id := gen_random_uuid();
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
            VALUES (
                user_id,
                format('employee%s@example.com', i),
                crypt('Employee12345', gen_salt('bf')),
                now(),
                jsonb_build_object('full_name', format('Staff Member %s', i)),
                'authenticated',
                'authenticated'
            );
            UPDATE public.profiles SET role = 'employee', employee_id = format('EMP-%s', floor(random()*9000 + 1000)) WHERE id = user_id;
        END IF;
    END LOOP;

    -- 3. CREATE 50 USERS WITH APPLICATIONS (Password: User12345)
    FOR i IN 1..50 LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = format('user%s@example.com', i)) THEN
            user_id := gen_random_uuid();
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
            VALUES (
                user_id,
                format('user%s@example.com', i),
                crypt('User12345', gen_salt('bf')),
                now(),
                jsonb_build_object('full_name', format('%s %s', first_names[i], last_names[i])),
                'authenticated',
                'authenticated'
            );

            -- Create Application
            app_id := gen_random_uuid();
            INSERT INTO public.marriage_applications (id, created_by, status, contact_number, created_at, updated_at)
            VALUES (
                app_id,
                user_id,
                'pending',
                format('0917%s', floor(random() * 8999999 + 1000000)),
                now() - (random() * interval '60 days'),
                now()
            );

            -- Create Groom Address
            groom_addr_id := gen_random_uuid();
            INSERT INTO public.addresses (id, province, municipality, barangay, street_address, country, created_by)
            VALUES (groom_addr_id, 'Nueva Vizcaya', 'Solano', 'Poblacion', format('%s Apple St', i), 'Philippines', user_id);

            -- Create Bride Address
            bride_addr_id := gen_random_uuid();
            INSERT INTO public.addresses (id, province, municipality, barangay, street_address, country, created_by)
            VALUES (bride_addr_id, 'Nueva Vizcaya', 'Solano', 'Quirino', format('%s Mango Ave', i), 'Philippines', user_id);

            -- Create Groom Applicant
            INSERT INTO public.applicants (
                application_id, type, first_name, last_name, birth_date, age, citizenship, address_id, religion, created_at
            ) VALUES (
                app_id, 'Groom', first_names[i], last_names[i], 
                (now() - interval '25 years' - (random() * interval '10 years'))::date,
                25 + floor(random() * 10), 'Filipino', groom_addr_id, 'Catholic', now()
            );

            -- Indices for variety
            b_first_idx := (i % 50) + 1;
            b_last_idx := ((i + 13) % 50) + 1;

            -- Create Bride Applicant
            INSERT INTO public.applicants (
                application_id, type, first_name, last_name, birth_date, age, citizenship, address_id, religion, created_at
            ) VALUES (
                app_id, 'Bride', female_names[b_first_idx], last_names[b_last_idx],
                (now() - interval '23 years' - (random() * interval '10 years'))::date,
                23 + floor(random() * 10), 'Filipino', bride_addr_id, 'Catholic', now()
            );
        END IF;
    END LOOP;
END;
$$;
