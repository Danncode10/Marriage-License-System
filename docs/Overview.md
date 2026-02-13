# LGU Solano Marriage License System - Overview

## System Description

The LGU Solano Marriage License System is an office-based workflow management application designed to digitize and streamline marriage license processing at the Local Government Unit of Solano, Nueva Vizcaya. The system enables employees to efficiently process marriage applications through employee-assisted data entry, real-time photo capture, and automated Excel document generation, eliminating manual paperwork and messenger-based photo transfers.

## Architecture Overview

The system follows a hybrid architecture combining modern web technologies with traditional document processing:

### Frontend Layer (Next.js)
- **Framework**: Next.js 16.1.6 with React 19.2.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom component library with shadcn/ui foundation
- **Authentication**: Supabase Auth integration
- **State Management**: React hooks with custom form management

### API Layer (Next.js API Routes)
- **Technology**: Next.js API routes with Node.js runtime
- **Communication**: RESTful endpoints for data processing
- **Process Management**: Child process spawning for Python script execution
- **File Handling**: Binary stream processing for Excel file generation

### Backend Processing (Python)
- **Language**: Python 3.x
- **Excel Processing**: openpyxl library for template manipulation
- **Data Processing**: JSON input parsing and Excel cell mapping
- **Image Processing**: PNG image overlay capabilities
- **Template Management**: Dynamic sheet visibility based on applicant criteria

## Core Features

### 1. Employee Authentication & Role Management
- **Supabase Integration**: Secure authentication for office staff
- **Dual Role System**:
  - **Employees**: Process marriage applications, capture photos, generate documents
  - **Administrators**: Oversee operations, manage employees, view analytics
- **Session Management**: Secure login sessions for office workstations
- **Public Access**: Unauthenticated form filling for self-service kiosks

### 2. Office Workflow Management
- **Two-Tier Processing System**: User self-service data entry followed by employee verification and processing
- **Application Code Generation**: Unique alphanumeric codes issued after user form completion and review
- **Employee Code Processing**: Staff dashboard for reviewing, editing, and finalizing applications
- **Real-Time Photo Capture**: Integrated camera access during employee processing phase
- **Sequential Document Numbering**: Official file naming with auto-incrementing counters (e.g., MARRIAGE_APPLICATION_2024_0001)
- **Status Tracking**: Real-time visibility into application processing stages

### 3. Marriage Application Form
- **Dual Applicant Support**: Single comprehensive form collecting information for both groom and bride
- **Comprehensive Data Collection**:
  - Personal information (name, birth date, age, religion)
  - Address management with Philippine location hierarchy
  - Family information (parents, guardians)
  - Citizenship and residency details
- **Dynamic Validation**: Age-based conditional fields and requirements
- **Address Integration**: Philippine address selection with province/municipality/barangay hierarchy

### 4. Excel Document Generation
- **Template-based Processing**: Pre-designed Excel templates for official forms
- **Dynamic Sheet Management**: Conditional sheet inclusion based on:
  - Applicant ages (consent/advice requirements)
  - Residency status (local vs. external applicants)
- **Data Mapping**: Automated population of form fields with proper formatting
- **Image Integration**: Real-time photo overlay and official seal placement
- **Multi-sheet Output**: Comprehensive application packages with notices, consents, and envelopes

### 5. Administrative Oversight
- **Employee Management**: Add/remove staff accounts and assign roles
- **Analytics Dashboard**: Track processing metrics, application volumes, and performance
- **System Monitoring**: Real-time status of office operations and system health
- **Report Generation**: Export data for compliance and planning purposes

## Technical Implementation Details

### Frontend Components Structure
```
ui/src/
├── app/
│   ├── marriage/          # Main application form
│   ├── dashboard/         # Admin dashboard
│   ├── login/            # Authentication pages
│   └── api/              # API endpoints
├── components/
│   ├── ui/               # Reusable UI components
│   └── marriage/         # Form-specific components
└── utils/                # Utility functions and configurations
```

### Key Technologies & Dependencies
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Python, openpyxl, pandas, numpy
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Address Data**: select-philippines-address library
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Application Processing Workflow
1. **User Form Entry**: Applicants fill comprehensive marriage application form with dual applicant data
2. **Data Review & Validation**: Users review all entered information and make corrections before submission
3. **Form Locking & Code Generation**: Form becomes read-only, generates unique alphanumeric application code (e.g., "MLS-2024-001A")
4. **Code Presentation**: User receives code to present to office employee for processing
5. **Employee Code Processing**: Staff enters code in employee dashboard to access and review application
6. **Employee Verification**: Staff reviews data, makes necessary corrections, and captures applicant photos
7. **Document Finalization**: System assigns sequential document number and generates final Excel package
8. **File Download**: Employee downloads officially numbered document (e.g., "MARRIAGE_APPLICATION_2024_0001.xlsx")
9. **Status Tracking**: Real-time visibility into processing stages for both users and staff

### Excel Template Management
- **Template Location**: `necessary/data/APPLICATION-for-MARRIAGE-LICENSE.xlsx`
- **Dynamic Sheets**:
  - APPLICATION: Main application form
  - Notice: Official notices with image overlays
  - CONSENT sheets: Age-based consent requirements
  - ADVICE sheets: Counseling requirements
  - AddressBACKnotice: External applicant notices
  - EnvelopeAddress: Mailing information
- **Cell Mapping**: Hard-coded cell references for precise data placement
- **Formatting**: Uppercase conversion and proper data type handling

## Security Considerations
- **Two-Tier Access Control**: Public form filling with employee-controlled processing prevents unauthorized access
- **Form Locking Mechanism**: Submitted forms become read-only, preventing spam and data tampering
- **Unique Code System**: Alphanumeric application codes provide secure handoff between users and employees
- **Employee Authentication**: All processing operations require authenticated staff credentials
- **Input Validation**: Client and server-side validation with Philippine address verification
- **Process Isolation**: Python script execution in separate process space prevents system compromise
- **File Type Restrictions**: Strict Excel file generation with binary output validation
- **Session Management**: Secure token-based authentication with automatic timeouts
- **Audit Trail**: Complete logging of all form access, modifications, and processing actions

## Deployment & Development
- **Development Setup**: Automated setup scripts for local development
- **Environment Configuration**: Supabase keys and environment variables
- **Build Process**: Next.js build system with TypeScript compilation
- **Python Dependencies**: pip-based package management for backend processing
- **Cross-platform**: Compatible with Windows, macOS, and Linux

## Future Enhancements
- Database integration for application tracking and historical data
- Offline capability for areas with poor internet connectivity
- Digital signature capabilities for electronic document approval
- Multi-language support for diverse applicant base
- Mobile camera integration for enhanced photo capture
- Image compression and storage optimization for Supabase free tier limits (target: <200KB per photo, ~800-1,600 applications capacity)
- Integration with LGU document management and archiving systems
- Advanced analytics and reporting for operational insights
- Audit logging and compliance reporting for regulatory requirements
- Queue management system for high-volume periods
- Integration with existing LGU databases and citizen registries

## System Requirements
- **Node.js**: 18.x or higher
- **Python**: 3.x with pip package manager
- **Browser Support**: Modern browsers with JavaScript enabled
- **Internet Connection**: Required for Supabase authentication
- **Storage**: Minimal local storage requirements

This system represents a modern approach to digitizing traditional government office workflows, combining web technologies with established document formats to create an efficient, office-centric solution for marriage license processing that eliminates manual paperwork and streamlines the application intake process for both staff and applicants.
