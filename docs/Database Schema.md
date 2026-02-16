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
