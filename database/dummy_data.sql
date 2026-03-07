-- ==========================================================
-- HIGH-FIDELITY FILIPINO DUMMY DATA (PROD-READY REFERENCE)
-- 50 Marriage Applications with authentic Solano/NV patterns
-- ==========================================================

DO $$
DECLARE
    u_id UUID;
    app_id UUID;
    groom_addr_id UUID;
    bride_addr_id UUID;
    
    -- AUTHENTIC FILIPINO SURNAMES (FROM PROD REF)
    surnames TEXT[] := ARRAY[
        'Loreto', 'Dugyon', 'Lopez', 'Catahina', 'Corpuz', 'Villanueva', 'Guilaran', 'Peralta', 'Taclan', 'Ferianiza',
        'Baniel', 'Bahiwal', 'Puguon', 'Barbieti', 'Valentino', 'Santos', 'Reyes', 'Cruz', 'Bautista', 'Ocampo',
        'Garcia', 'Mendoza', 'Torres', 'Tomas', 'Andaya', 'Perez', 'Ramos', 'Castro', 'Rivera', 'Santiago',
        'Soriano', 'Aquino', 'Del Rosario', 'Gomez', 'Salvador', 'Marquez', 'Sarmiento', 'Pascual', 'Quinto', 'Agustin',
        'Francisco', 'Bernardo', 'Dela Cruz', 'Dela Rosa', 'Gutierrez', 'Valdez', 'Fernando', 'Castillo', 'Espinoza', 'Navarro',
        'Mercado', 'De Guzman', 'Abad', 'Solis', 'Suarez', 'Gonzales', 'Enriquez', 'Lazaro', 'Alfonso', 'David', 'Lim', 'Tan', 'Lanuza'
    ];

    -- AUTHENTIC FILIPINO MALE NAMES
    male_names TEXT[] := ARRAY[
        'Aldwin', 'Bernard', 'Guilbert', 'Mark', 'Prince', 'Daniel', 'Rhen', 'Dale', 'Oliver', 'Teodorico',
        'Romulo', 'Lester', 'Dann', 'Juan', 'Jose', 'Ricardo', 'Antonio', 'Manuel', 'Rogelio', 'Roberto',
        'Eduardo', 'Gabriel', 'Bener', 'Danilo', 'Edgardo', 'Felipe', 'Gerardo', 'Homer', 'Ismael', 'Jaime',
        'Kevin', 'Leonardo', 'Mario', 'Nestor', 'Orlando', 'Paquito', 'Quentin', 'Romeo', 'Samuel', 'Teodoro',
        'Urbano', 'Victor', 'Wilfredo', 'Zaldy', 'Christian', 'Angelo', 'Paolo', 'Vincent', 'Bryan', 'Darwin',
        'Erwin', 'Ferdinand', 'Gregorio', 'Hezekiah', 'Ibarra', 'Jerome', 'Kenji', 'Leonel', 'Michael', 'Nathan', 'Oscar', 'Patrick'
    ];

    -- AUTHENTIC FILIPINO FEMALE NAMES
    female_names TEXT[] := ARRAY[
        'Mitz', 'Laureine', 'Leilani', 'Ferianiza', 'Marites', 'Laurence', 'Flory', 'Cecilia', 'Lilibeth', 'Maria',
        'Elena', 'Cristina', 'Teresita', 'Imelda', 'Corazon', 'Luzviminda', 'Gloria', 'Flordeliza', 'Bernadette', 'Carmela',
        'Divina', 'Evelyn', 'Fe', 'Gina', 'Hilda', 'Irene', 'Julieta', 'Katrina', 'Liza', 'Myrna',
        'Nelia', 'Ofelia', 'Perla', 'Queenie', 'Rosalie', 'Sonia', 'Thelma', 'Ursula', 'Virginia', 'Winnie',
        'Xandra', 'Yolanda', 'Zenaida', 'Aileen', 'Bianca', 'Cynthia', 'Daisy', 'Estrella', 'Felicidad', 'Gemma',
        'Hazel', 'Isabella', 'Janice', 'Kristine', 'Maricel', 'Nanette', 'Olive', 'Patricia'
    ];

    -- NUEVA VIZCAYA TOWNS & BARANGAYS (FROM PROD REFS)
    nv_towns TEXT[] := ARRAY['Solano', 'Bayombong (Capital)', 'Bambang', 'Aritao', 'Bagabag', 'Quezon', 'Villaverde', 'Dupax Del Sur', 'Dupax Del Norte', 'Kasibu', 'Santa Fe', 'Diadi', 'Ambaguio'];
    
    barangays TEXT[] := ARRAY[
        'Aggub', 'Bangaan', 'Bangar', 'Bascaran', 'Curifang', 'Dadap', 'Lactawan', 'Mabasin', 'Magsaysay', 'Osmeña',
        'Poblacion South', 'Poblacion North', 'Quezon', 'Quirino', 'Roxas', 'San Juan', 'San Luis', 'Tucal', 'Udaidi', 'Wacal',
        'Bone North', 'Abinganan', 'Ammueg', 'Ibung', 'Darubba', 'Beti', 'Busilac', 'Antutot', 'Bonfal West', 'Santo Domingo West', 
        'Cabuaan', 'Calitlitan', 'Abaca', 'Bacneng', 'Rosario', 'San Nicolas', 'Dadap', 'Uddiawan', 'Aliaga', 'Don Mariano Marcos'
    ];

    religions TEXT[] := ARRAY['Roman Catholic', 'Iglesia ni Cristo', 'Seventh-day Adventist', 'Bible Baptist Church', 'Islam', 'Born Again', 'Jehovah''s Witness', 'Others'];
    id_types TEXT[] := ARRAY['PhilSys ID (National ID)', 'Driver''s License', 'Passport', 'Voter''s ID', 'PRC ID', 'UMID', 'Postal ID', 'Senior Citizen ID'];

    i INTEGER;
    created_ts TIMESTAMPTZ;
    app_status TEXT;
    g_bday DATE;
    b_bday DATE;
    g_age INTEGER;
    b_age INTEGER;
    f_name TEXT;
    random_surname_idx INTEGER;
    random_town_idx INTEGER;
    random_brgy_idx INTEGER;
BEGIN
    -- Ensure pgcrypto is enabled
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- 1. AUTHENTIC STAFF SETUP
    -- Admin
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'lester.admin@example.com') THEN
        u_id := gen_random_uuid();
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
        VALUES (u_id, 'lester.admin@example.com', crypt('Admin12345', gen_salt('bf')), now(), jsonb_build_object('full_name', 'Lester Admin'), 'authenticated', 'authenticated');
        
        INSERT INTO public.profiles (id, role, full_name)
        VALUES (u_id, 'admin', 'Lester Admin')
        ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Lester Admin';
    END IF;

    -- Employees
    FOR i IN 1..2 LOOP
        f_name := CASE WHEN i=1 THEN 'Employee One' ELSE 'Dann Employee' END;
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = format('employee%s@example.com', i)) THEN
            u_id := gen_random_uuid();
            INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role)
            VALUES (u_id, format('employee%s@example.com', i), crypt('Employee12345', gen_salt('bf')), now(), jsonb_build_object('full_name', f_name), 'authenticated', 'authenticated');
            
            INSERT INTO public.profiles (id, role, full_name)
            VALUES (u_id, 'employee', f_name)
            ON CONFLICT (id) DO UPDATE SET role = 'employee', full_name = f_name;
        END IF;
    END LOOP;

    -- 2. CREATE 50 AUTHENTIC APPLICATIONS
    FOR i IN 1..50 LOOP
        created_ts := now() - (random() * interval '90 days'); -- More spread out
        app_status := CASE 
            WHEN random() < 0.15 THEN 'draft' 
            WHEN random() < 0.45 THEN 'pending' 
            WHEN random() < 0.80 THEN 'approved' 
            ELSE 'completed' 
        END;

        -- Create User Account
        u_id := gen_random_uuid();
        random_surname_idx := floor(random() * array_length(surnames, 1)) + 1;
        f_name := format('%s %s', male_names[floor(random() * array_length(male_names, 1)) + 1], surnames[random_surname_idx]);
        
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at)
        VALUES (u_id, format('user%s@example.com', i), crypt('User12345', gen_salt('bf')), created_ts, jsonb_build_object('full_name', f_name), 'authenticated', 'authenticated', created_ts);
        
        INSERT INTO public.profiles (id, role, full_name, created_at)
        VALUES (u_id, 'user', f_name, created_ts)
        ON CONFLICT (id) DO UPDATE SET full_name = f_name;

        -- Create Application
        app_id := gen_random_uuid();
        INSERT INTO public.marriage_applications (
            id, application_code, status, created_by, created_at, updated_at, contact_number, registry_number
        ) VALUES (
            app_id, 
            upper(substring(md5(random()::text), 1, 6)),
            app_status,
            u_id,
            created_ts,
            created_ts + (random() * interval '7 days'),
            format('09%s%s', CASE WHEN random() < 0.5 THEN '17' ELSE '27' END, floor(random()*8999999 + 1000000)),
            CASE WHEN app_status = 'completed' THEN format('2026-%s', 1000 + i) ELSE NULL END
        );

        -- Groom Address
        groom_addr_id := gen_random_uuid();
        random_town_idx := floor(random() * array_length(nv_towns, 1)) + 1;
        random_brgy_idx := floor(random() * array_length(barangays, 1)) + 1;
        INSERT INTO public.addresses (id, province, municipality, barangay, street_address, country, created_at, is_foreigner)
        VALUES (groom_addr_id, 'Nueva Vizcaya', nv_towns[random_town_idx], barangays[random_brgy_idx], '', 'Philippines', created_ts, false);

        -- Bride Address
        bride_addr_id := gen_random_uuid();
        random_town_idx := floor(random() * array_length(nv_towns, 1)) + 1;
        random_brgy_idx := floor(random() * array_length(barangays, 1)) + 1;
        INSERT INTO public.addresses (id, province, municipality, barangay, street_address, country, created_at, is_foreigner)
        VALUES (bride_addr_id, 'Nueva Vizcaya', nv_towns[random_town_idx], barangays[random_brgy_idx], '', 'Philippines', created_ts, false);

        -- Applicants details
        g_age := 20 + floor(random()*40);
        b_age := 18 + floor(random()*40);
        g_bday := (created_ts - (format('%s years', g_age)::interval) - (random() * interval '365 days'))::date;
        b_bday := (created_ts - (format('%s years', b_age)::interval) - (random() * interval '365 days'))::date;

        -- Groom
        INSERT INTO public.applicants (
            application_id, type, first_name, middle_name, last_name, birth_date, age, citizenship, 
            address_id, religion, birth_place, birth_country, civil_status,
            father_name, mother_name, giver_name, giver_relationship, giver_id_type,
            id_type, id_no, include_id, created_at
        ) VALUES (
            app_id, 'groom', male_names[floor(random() * array_length(male_names, 1)) + 1], 
            surnames[floor(random() * array_length(surnames, 1)) + 1], surnames[random_surname_idx], g_bday, g_age, 'Filipino',
            groom_addr_id, religions[floor(random() * array_length(religions, 1)) + 1], 
            format('%s, Nueva Vizcaya', nv_towns[floor(random() * array_length(nv_towns, 1)) + 1]), 
            'Philippines', 'Single',
            format('%s %s %s', male_names[floor(random() * array_length(male_names, 1)) + 1], surnames[floor(random() * array_length(surnames, 1)) + 1], surnames[random_surname_idx]),
            format('%s %s %s', female_names[floor(random() * array_length(female_names, 1)) + 1], surnames[floor(random() * array_length(surnames, 1)) + 1], surnames[random_surname_idx]),
            CASE WHEN g_age < 25 THEN format('%s %s %s', male_names[floor(random() * array_length(male_names, 1)) + 1], surnames[floor(random() * array_length(surnames, 1)) + 1], surnames[random_surname_idx]) ELSE NULL END,
            CASE WHEN g_age < 25 THEN 'Father' ELSE NULL END,
            CASE WHEN g_age < 25 THEN id_types[floor(random() * 3 + 1)] ELSE NULL END,
            id_types[floor(random() * array_length(id_types, 1)) + 1], format('%s-%s', 100+i, 999-i),
            true, created_ts
        );

        -- Bride
        random_surname_idx := floor(random() * array_length(surnames, 1)) + 1;
        INSERT INTO public.applicants (
            application_id, type, first_name, middle_name, last_name, birth_date, age, citizenship, 
            address_id, religion, birth_place, birth_country, civil_status,
            father_name, mother_name, giver_name, giver_relationship, giver_id_type,
            id_type, id_no, include_id, created_at
        ) VALUES (
            app_id, 'bride', female_names[floor(random() * array_length(female_names, 1)) + 1], 
            surnames[floor(random() * array_length(surnames, 1)) + 1], surnames[random_surname_idx], b_bday, b_age, 'Filipino',
            bride_addr_id, religions[floor(random() * array_length(religions, 1)) + 1], 
            format('%s, Nueva Vizcaya', nv_towns[floor(random() * array_length(nv_towns, 1)) + 1]), 
            'Philippines', 'Single',
            format('%s %s %s', male_names[floor(random() * array_length(male_names, 1)) + 1], surnames[floor(random() * array_length(surnames, 1)) + 1], surnames[random_surname_idx]),
            format('%s %s %s', female_names[floor(random() * array_length(female_names, 1)) + 1], surnames[floor(random() * array_length(surnames, 1)) + 1], surnames[random_surname_idx]),
            CASE WHEN b_age < 25 THEN format('%s %s %s', female_names[floor(random() * array_length(female_names, 1)) + 1], surnames[floor(random() * array_length(surnames, 1)) + 1], surnames[random_surname_idx]) ELSE NULL END,
            CASE WHEN b_age < 25 THEN 'Mother' ELSE NULL END,
            CASE WHEN b_age < 25 THEN id_types[floor(random() * 3 + 1)] ELSE NULL END,
            id_types[floor(random() * array_length(id_types, 1)) + 1], format('%s-%s', 200+i, 888-i),
            true, created_ts
        );

        -- Notifications
        INSERT INTO public.notifications (user_id, title, message, type, related_application_id, created_at)
        VALUES (u_id, 'Application Submitted', 'Your marriage license application has been successfully submitted.', 'status_change', app_id, created_ts);

        IF app_status IN ('approved', 'completed') THEN
             INSERT INTO public.notifications (user_id, title, message, type, related_application_id, created_at)
             VALUES (u_id, 'Application Approved', 'Good news! Your marriage license application has been approved.', 'status_change', app_id, created_ts + interval '2 days');
        END IF;

    END LOOP;
END;
$$;
