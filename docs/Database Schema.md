### Run this complete SQL schema in the correct order:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Philippine addresses (create this FIRST)
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL,
  municipality TEXT NOT NULL,
  barangay TEXT NOT NULL,
  street_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User/Employee/Admin profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'employee', 'admin')),
  full_name TEXT,
  employee_id VARCHAR(10) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Main marriage applications
CREATE TABLE marriage_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'pending', 'approved', 'processing', 'completed', 'rejected', 'finished')),
  document_number INTEGER,
  created_by UUID REFERENCES profiles(id),
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applicant details (groom/bride) - NOW addresses table exists
CREATE TABLE applicants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES marriage_applications(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('groom', 'bride')),
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  age INTEGER NOT NULL,
  religion TEXT,
  citizenship TEXT NOT NULL,
  phone_number TEXT,
  address_id UUID REFERENCES addresses(id),
  father_name TEXT,
  father_citizenship TEXT,
  mother_name TEXT,
  mother_citizenship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User document uploads
CREATE TABLE user_document_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES marriage_applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo storage metadata
CREATE TABLE application_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES marriage_applications(id) ON DELETE CASCADE,
  photo_type VARCHAR(10) NOT NULL CHECK (photo_type IN ('groom', 'bride')),
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated document metadata
CREATE TABLE generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES marriage_applications(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  generated_by UUID REFERENCES profiles(id),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logging
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  application_id UUID REFERENCES marriage_applications(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


---

## Enable Row Level Security

Run this SQL in your Supabase SQL Editor:

```sql
-- Enable RLS on all tables 
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marriage_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_document_uploads ENABLE ROW LEVEL SECURITY;
```

## Create RLS Policies

Now apply these policies. Run them one by one or in groups:

**Profiles table policies:** 
```sql
-- Users and employees can view/edit their own profile 
CREATE POLICY "users_employees_manage_own_profile" ON profiles
FOR ALL TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles 
CREATE POLICY "admins_view_all_profiles" ON profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can manage employee profiles 
CREATE POLICY "admins_manage_employees" ON profiles
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

**Marriage applications policies:**
```sql
-- Users can view their own applications 
CREATE POLICY "users_view_own_applications" ON marriage_applications
FOR SELECT TO authenticated
USING (
  created_by = auth.uid()
);

-- Employees can view all applications 
CREATE POLICY "employees_view_all_applications" ON marriage_applications
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);

-- Employees can update applications they process 
CREATE POLICY "employees_update_applications" ON marriage_applications
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);

-- Allow insert for application creation (via API) 
CREATE POLICY "allow_application_creation" ON marriage_applications
FOR INSERT TO anon
WITH CHECK (true);
```

**Remaining policies (run these next):**
```sql
-- User document uploads 
CREATE POLICY "users_manage_own_documents" ON user_document_uploads
FOR ALL TO authenticated
USING (uploaded_by = auth.uid());

CREATE POLICY "employees_view_all_documents" ON user_document_uploads
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);

-- Applicants 
CREATE POLICY "employees_manage_applicants" ON applicants
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);

CREATE POLICY "allow_applicant_creation" ON applicants
FOR INSERT TO anon
WITH CHECK (true);

-- Addresses 
CREATE POLICY "public_read_addresses" ON addresses
FOR SELECT TO anon
USING (true);

CREATE POLICY "authenticated_create_addresses" ON addresses
FOR INSERT TO authenticated
WITH CHECK (true);

-- Application photos 
CREATE POLICY "employees_manage_application_photos" ON application_photos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);

-- Generated documents 
CREATE POLICY "employees_manage_documents" ON generated_documents
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);

-- Audit logs
CREATE POLICY "admins_view_audit_logs" ON audit_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "authenticated_insert_audit_logs" ON audit_logs
FOR INSERT TO authenticated
WITH CHECK (true);
```
