# LGU Solano Marriage License System - Master Plan

## 🎯 Foundation Setup
**Clone starter repo**: https://github.com/vercel/next.js/tree/canary/examples/with-supabase
- Includes Next.js 16.1.6 with Supabase Auth integration
- Pre-configured authentication flows and session management
- TypeScript setup with Tailwind CSS

**Install dependencies**:
```bash
npm install
```

**Setup environment**:
```bash
cp .env.example .env.local
# Fill in your Supabase credentials (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
```

## 📊 Database Design & Row Level Security (RLS)
Based on Overview.md core features: marriage application processing with dual applicants, employee processing workflow, photo capture, and document generation.

### Core Tables Schema

| Table | Primary Key | Foreign Keys | Key Fields | Data Types | Description |
|-------|-------------|--------------|------------|------------|-------------|
| profiles | id (UUID) | auth.users(id) | role, full_name, employee_id | VARCHAR(20), TEXT, VARCHAR(10) | User/Employee/Admin profiles extending Supabase auth |
| marriage_applications | id (UUID) | created_by → profiles(id), processed_by → profiles(id) | application_code, status, document_number | VARCHAR(20) UNIQUE, VARCHAR(20), INTEGER | Main application records with unique codes |
| applicants | id (UUID) | application_id → marriage_applications(id), address_id → addresses(id) | type, first_name, middle_name, last_name, birth_date, age, religion, citizenship | VARCHAR(10), TEXT, TEXT, TEXT, DATE, INTEGER, TEXT, TEXT | Groom/Bride applicant data |
| addresses | id (UUID) | - | province, municipality, barangay, street_address | TEXT, TEXT, TEXT, TEXT | Philippine address hierarchy |
| user_document_uploads | id (UUID) | application_id → marriage_applications(id), uploaded_by → profiles(id) | document_type, file_path, file_size, file_name | VARCHAR(50), TEXT, INTEGER, TEXT | User-uploaded supporting documents |
| application_photos | id (UUID) | application_id → marriage_applications(id) | photo_type, file_path, file_size | VARCHAR(10), TEXT, INTEGER | Photo storage metadata |
| generated_documents | id (UUID) | application_id → marriage_applications(id) | file_path, file_size, generated_at | TEXT, INTEGER, TIMESTAMP | Excel document metadata |
| audit_logs | id (UUID) | user_id → profiles(id), application_id → marriage_applications(id) | action, details | TEXT, JSONB | Audit trail for all actions |

### Complete SQL Schema
```sql
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

-- Applicant details (groom/bride)
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
  address_id UUID REFERENCES addresses(id),
  father_name TEXT,
  father_citizenship TEXT,
  mother_name TEXT,
  mother_citizenship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Philippine addresses
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  province TEXT NOT NULL,
  municipality TEXT NOT NULL,
  barangay TEXT NOT NULL,
  street_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marriage_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### Row Level Security (RLS) Policies

**profiles table**:
- Users can read/update their own profile
- Employees can read/update their own profile
- Admins can read all profiles and manage employees
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

**marriage_applications table**:
- Users can view their own applications
- Employees can view all applications for processing
- Admins can view all applications
- No public access (applications created via API)
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

**user_document_uploads table**:
- Users can view/manage their own uploaded documents
- Employees can view all uploaded documents
- Admins can view all uploaded documents
```sql
-- Users can view/manage their own documents
CREATE POLICY "users_manage_own_documents" ON user_document_uploads
FOR ALL TO authenticated
USING (
  uploaded_by = auth.uid()
);

-- Employees can view all documents
CREATE POLICY "employees_view_all_documents" ON user_document_uploads
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);
```

**applicants table**:
- Same as marriage_applications (accessed via application_id)
```sql
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
```

**addresses table**:
- Public read for address selection
- Authenticated users can create addresses
```sql
CREATE POLICY "public_read_addresses" ON addresses
FOR SELECT TO anon
USING (true);

CREATE POLICY "authenticated_create_addresses" ON addresses
FOR INSERT TO authenticated
WITH CHECK (true);
```

**application_photos table**:
- Employees can view/manage photos for applications they process
- Admins can view all photos
```sql
CREATE POLICY "employees_manage_application_photos" ON application_photos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);
```

**generated_documents table**:
- Employees can view/manage documents for applications they process
- Admins can view all documents
```sql
CREATE POLICY "employees_manage_documents" ON generated_documents
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('employee', 'admin')
  )
);
```

**audit_logs table**:
- Only admins can view audit logs
- All authenticated users can insert audit entries
```sql
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

## 👥 User Roles & Dashboard Design
Based on Overview.md three-tier role system: Users track applications, Employees process applications, Administrators oversee operations.

### User Dashboard (`/dashboard/user`):
- **Application Status Tracking**: View current status (pending, approved, finished) for all submitted applications
- **Office Visit Instructions**: Clear guidance to visit Municipal Office in Solano for processing
- **Application History**: Complete timeline of application progress and updates
- **Document Management**: View uploaded supporting documents and download generated files
- **Profile Management**: Update personal information and account settings
- **Real-time Notifications**: Instant updates when application status changes

### Employee Dashboard (`/dashboard/employee`):
- **Application Processing**: Enter application codes to access and review submitted forms
- **Data Verification**: Edit applicant information, validate Philippine addresses
- **Photo Capture**: Real-time camera integration for applicant photos
- **Document Generation**: Trigger Excel file creation with sequential numbering
- **Status Management**: Update application status through processing workflow
- **Recent Applications**: View recently processed applications
- **Search/Filter**: Find applications by code, date, or status

### Admin Dashboard (`/dashboard/admin`):
- **Employee Management**: Add/remove staff accounts, assign roles
- **System Analytics**: Processing metrics, application volumes, performance stats
- **Application Oversight**: View all applications across all statuses
- **Audit Trail**: Review system activity and changes
- **Report Generation**: Export data for compliance and planning
- **System Health**: Monitor real-time status of operations

### Public/User Access:
- **Marriage Application Form** (`/marriage`): Comprehensive form for dual applicants with optional document upload
- **Account Creation**: User registration after form submission for status tracking
- **Application Status Check** (`/status`): Public lookup using application code
- **Form Submission**: Generate unique application code after validation

### Complete App Directory Structure:
```
ui/src/app/
├── marriage/                    # Public application form
│   ├── page.tsx                # Main form page
│   ├── components/             # Form components
│   ├── hooks/                  # Form state management
│   └── utils.ts                # Form utilities
├── dashboard/
│   ├── user/                   # User status tracking dashboard
│   │   ├── page.tsx           # Main user dashboard
│   │   ├── applications/      # Application status and history
│   │   ├── documents/         # Document management
│   │   └── profile/           # User profile management
│   ├── employee/               # Employee processing dashboard
│   │   ├── page.tsx           # Main employee dashboard
│   │   ├── process/[code]/    # Application processing page
│   │   └── components/        # Employee-specific components
│   ├── admin/                  # Admin oversight dashboard
│   │   ├── page.tsx           # Main admin dashboard
│   │   ├── employees/         # Employee management
│   │   ├── analytics/         # System analytics
│   │   └── reports/           # Report generation
│   └── layout.tsx             # Shared dashboard layout
├── status/                     # Public status checking
│   └── [code]/                # Status page by code
├── login/                      # Authentication pages
├── signup/                     # User account creation
├── logout/                     # Logout handling
└── api/                        # API routes
    ├── generate-excel/         # Excel generation endpoint
    ├── applications/           # Application CRUD
    ├── documents/              # Document upload/download
    ├── photos/                 # Photo upload handling
    └── auth/                   # Authentication callbacks
```

## 🗂️ Storage Engineering & Atomic Metadata
Based on Overview.md file requirements: applicant photos and generated Excel documents with size optimization for Supabase free tier.

**Supabase Storage Setup**:
```javascript
// Storage bucket: 'marriage-license-files'
// File naming: applications/{application_id}/{timestamp}_{type}.{ext}

const uploadPhoto = async (file, applicationId, photoType) => {
  // Compress photo client-side
  const compressedFile = await compressFile(file);

  const timestamp = Date.now();
  const fileName = `${timestamp}_${photoType}.png`;
  const filePath = `applications/${applicationId}/photos/${fileName}`;

  const { data, error } = await supabase.storage
    .from('marriage-license-files')
    .upload(filePath, compressedFile, {
      cacheControl: '3600',
      upsert: false
    });

  // Store metadata atomically
  if (data) {
    const { error: dbError } = await supabase
      .from('application_photos')
      .insert({
        application_id: applicationId,
        photo_type: photoType,
        file_path: filePath,
        file_size: compressedFile.size,
        uploaded_by: user.id
      });

    if (dbError) {
      // Cleanup storage on metadata failure
      await supabase.storage
        .from('marriage-license-files')
        .remove([filePath]);
      throw dbError;
    }
  }

  return { data, error };
};

const generateDocument = async (applicationId, documentData) => {
  const timestamp = Date.now();
  const documentNumber = await getNextDocumentNumber();
  const fileName = `MARRIAGE_APPLICATION_2024_${documentNumber.toString().padStart(4, '0')}.xlsx`;
  const filePath = `applications/${applicationId}/documents/${fileName}`;

  // Generate Excel file via API
  const response = await fetch('/api/generate-excel', {
    method: 'POST',
    body: JSON.stringify({
      applicationId,
      documentNumber,
      data: documentData
    })
  });

  if (!response.ok) throw new Error('Document generation failed');

  const excelBlob = await response.blob();

  // Upload to storage
  const { data, error } = await supabase.storage
    .from('marriage-license-files')
    .upload(filePath, excelBlob, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

  // Store metadata
  if (data) {
    await supabase
      .from('generated_documents')
      .insert({
        application_id: applicationId,
        file_path: filePath,
        file_size: excelBlob.size,
        generated_by: user.id
      });

    // Update application with document number
    await supabase
      .from('marriage_applications')
      .update({
        document_number: documentNumber,
        status: 'completed'
      })
      .eq('id', applicationId);
  }

  return { data, error };
};
```

**File Compression** (client-side):
```javascript
import Compressor from 'compressorjs';

const compressFile = (file) => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,        // 60% quality for ~200KB target
      maxWidth: 800,       // Max width 800px
      maxHeight: 600,      // Max height 600px
      convertSize: 200000, // Convert if over 200KB
      success: resolve,
      error: reject
    });
  });
};
```

**Storage Folder Structure**:
```
marriage-license-files/
├── applications/
│   ├── {application_id}/
│   │   ├── photos/
│   │   │   ├── {timestamp}_groom.png
│   │   │   └── {timestamp}_bride.png
│   │   └── documents/
│   │       └── MARRIAGE_APPLICATION_2024_{sequential_number}.xlsx
```

## 🔄 Realtime Synchronization & Optimistic UI
Based on Overview.md realtime requirements: status tracking, photo uploads, and document generation updates.

**Real-time subscriptions**:
```javascript
// Subscribe to application status changes
const subscribeToApplication = (applicationId) => {
  const channel = supabase
    .channel(`application_${applicationId}`)
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'marriage_applications',
        filter: `id=eq.${applicationId}`
      },
      (payload) => {
        updateApplicationStatus(payload.new);
      }
    )
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'application_photos',
        filter: `application_id=eq.${applicationId}`
      },
      (payload) => {
        addApplicationPhoto(payload.new);
      }
    )
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'generated_documents',
        filter: `application_id=eq.${applicationId}`
      },
      (payload) => {
        addGeneratedDocument(payload.new);
      }
    )
    .subscribe();

  return channel;
};

// Subscribe to new applications for employee dashboard
const subscribeToNewApplications = () => {
  const channel = supabase
    .channel('new_applications')
    .on('postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'marriage_applications'
      },
      (payload) => {
        addNewApplication(payload.new);
      }
    )
    .subscribe();

  return channel;
};
```

**Optimistic UI for updates**:
```javascript
// Optimistic status update
const updateApplicationStatus = async (applicationId, newStatus) => {
  // Update UI immediately
  setApplications(prev => prev.map(app =>
    app.id === applicationId ? { ...app, status: newStatus } : app
  ));

  // Sync with server
  const { error } = await supabase
    .from('marriage_applications')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId);

  if (error) {
    // Revert on error
    setApplications(prev => prev.map(app =>
      app.id === applicationId ? { ...app, status: 'error' } : app
    ));
    showErrorToast('Failed to update status');
  }
};

// Optimistic photo upload
const uploadApplicationPhoto = async (applicationId, file, photoType) => {
  // Show loading state immediately
  setUploadingPhoto(true);

  // Compress and upload
  try {
    const result = await uploadPhoto(file, applicationId, photoType);

    // UI will update via real-time subscription
    showSuccessToast('Photo uploaded successfully');
  } catch (error) {
    showErrorToast('Photo upload failed');
  } finally {
    setUploadingPhoto(false);
  }
};

// Optimistic document generation
const generateApplicationDocument = async (applicationId) => {
  // Show generating state
  setGeneratingDocument(true);

  try {
    const result = await generateDocument(applicationId, formData);

    // Update status optimistically
    updateApplicationStatus(applicationId, 'completed');

    showSuccessToast('Document generated successfully');
  } catch (error) {
    showErrorToast('Document generation failed');
  } finally {
    setGeneratingDocument(false);
  }
};
```

## 📋 Implementation Checklist

### ✅ Completed
- [x] Analyze Overview.md requirements and extract core features
- [x] Design comprehensive database schema with all required tables
- [x] Define RLS policies for secure multi-tenant access
- [x] Map out complete app routing structure for all user roles
- [x] Design storage strategy with atomic metadata handling
- [x] Identify real-time subscriptions and optimistic UI patterns

### 🚧 In Progress
- [ ] Set up Supabase project and configure authentication
- [ ] Implement database schema with migrations
- [ ] Configure RLS policies and test security
- [ ] Create Next.js project structure with TypeScript
- [ ] Implement authentication flows for employees/admins
- [ ] Build marriage application form with validation
- [ ] Add Philippine address selection component
- [ ] Implement application code generation and status tracking
- [ ] Create employee dashboard with application processing
- [ ] Integrate camera API for real-time photo capture
- [ ] Implement photo compression and upload to Supabase Storage
- [ ] Build Excel generation API with Python script integration
- [ ] Add document numbering and sequential file naming
- [ ] Implement real-time subscriptions for status updates
- [ ] Add optimistic UI for all user interactions
- [ ] Create admin dashboard with employee management
- [ ] Build analytics and reporting features
- [ ] Implement audit logging for all actions
- [ ] Add comprehensive error handling and validation
- [ ] Test end-to-end application workflow
- [ ] Optimize performance and implement caching
- [ ] Add responsive design for office workstations
- [ ] Implement comprehensive testing suite
- [ ] Prepare deployment configuration for production

### 📋 Next Steps (Detailed Breakdown)
- [ ] **Database Setup**: Create Supabase project, run schema migrations, configure RLS policies
- [ ] **Authentication**: Implement employee login/signup, role-based access, session management
- [ ] **Core Forms**: Build marriage application form with dual applicant support, address integration
- [ ] **Application Flow**: Implement code generation, form locking, status tracking
- [ ] **Employee Processing**: Create dashboard for code entry, data verification, photo capture
- [ ] **File Handling**: Set up storage buckets, implement compression, atomic uploads
- [ ] **Document Generation**: Integrate Python Excel script, implement numbering system
- [ ] **Real-time Features**: Add subscriptions for status updates, implement optimistic UI
- [ ] **Admin Features**: Build employee management, analytics dashboard, audit logs
- [ ] **Public Access**: Create status checking page, ensure form accessibility
- [ ] **Security**: Implement input validation, audit trails, secure file handling
- [ ] **Performance**: Optimize images, implement caching, monitor bundle size
- [ ] **Testing**: Unit tests, integration tests, end-to-end workflow testing
- [ ] **Deployment**: Configure production environment, set up monitoring, prepare documentation

## 🔗 Quick References
- **Overview.md**: Source of truth for all features and requirements
- **Supabase Dashboard**: Database management, authentication, storage
- **Vercel Dashboard**: Deployment monitoring and analytics
- **GitHub Issues**: Task tracking and bug reports
- **Figma/Design System**: UI component library and design guidelines

---
*This Master Plan transforms the LGU Solano Marriage License System vision into a detailed technical roadmap. All decisions are derived directly from Overview.md to ensure complete feature alignment.*