# Form to Database Field Mapping

This document maps the marriage application form field names to their corresponding Supabase database columns. This mapping is essential for integrating the form data with the database schema.

## Overview

The marriage application form uses prefixed field names (`g` for groom, `b` for bride) that need to be mapped to the appropriate database tables and columns when saving data to Supabase.

## Database Tables Involved

- `marriage_applications` - Main application records
- `applicants` - Individual applicant details (groom/bride)
- `addresses` - Philippine address information
- `profiles` - User profiles (for created_by/processed_by references)

## Field Mapping Reference

### Groom Fields (`g` prefix → `applicants` table where type = 'groom')

| Form Field | Database Column | Data Type | Required | Description |
|------------|----------------|-----------|----------|-------------|
| `gFirst` | `first_name` | TEXT | Yes | Groom's first name |
| `gMiddle` | `middle_name` | TEXT | No | Groom's middle name |
| `gLast` | `last_name` | TEXT | Yes | Groom's last name |
| `gBday` | `birth_date` | DATE | Yes | Groom's birth date |
| `gAge` | `age` | INTEGER | Yes | Groom's age (auto-calculated) |
| `gBirthPlace` | `birth_place` | TEXT | No | Groom's birthplace |
| `gReligion` | `religion` | TEXT | No | Groom's religion |
| `gCitizen` | `citizenship` | TEXT | Yes | Groom's citizenship |
| `gPhone` | `phone_number` | TEXT | No | Groom's phone number |

### Bride Fields (`b` prefix → `applicants` table where type = 'bride')

| Form Field | Database Column | Data Type | Required | Description |
|------------|----------------|-----------|----------|-------------|
| `bFirst` | `first_name` | TEXT | Yes | Bride's first name |
| `bMiddle` | `middle_name` | TEXT | No | Bride's middle name |
| `bLast` | `last_name` | TEXT | Yes | Bride's last name |
| `bBday` | `birth_date` | DATE | Yes | Bride's birth date |
| `bAge` | `age` | INTEGER | Yes | Bride's age (auto-calculated) |
| `bBirthPlace` | `birth_place` | TEXT | No | Bride's birthplace |
| `bReligion` | `religion` | TEXT | No | Bride's religion |
| `bCitizen` | `citizenship` | TEXT | Yes | Bride's citizenship |
| `bPhone` | `phone_number` | TEXT | No | Bride's phone number |

### Address Fields (Both Applicants → `addresses` table)

| Form Field | Database Column | Data Type | Required | Description |
|------------|----------------|-----------|----------|-------------|
| `gProv`/`bProv` | `province` | TEXT | Yes | Province name |
| `gTown`/`bTown` | `municipality` | TEXT | Yes | Municipality/City name |
| `gBrgy`/`bBrgy` | `barangay` | TEXT | Yes | Barangay name |
| `gStreet`/`bStreet` | `street_address` | TEXT | No | Street address details |

### Parent Information (Both Applicants)

| Form Field | Database Column | Data Type | Required | Description |
|------------|----------------|-----------|----------|-------------|
| `gFathF`, `gFathM`, `gFathL` | `father_name` | TEXT | No | Groom's father's full name (concatenated) |
| `gFathCitizen` | `father_citizenship` | TEXT | No | Groom's father's citizenship |
| `gMothF`, `gMothM`, `gMothL` | `mother_name` | TEXT | No | Groom's mother's full name (concatenated) |
| `gMothCitizen` | `mother_citizenship` | TEXT | No | Groom's mother's citizenship |
| `bFathF`, `bFathM`, `bFathL` | `father_name` | TEXT | No | Bride's father's full name (concatenated) |
| `bFathCitizen` | `father_citizenship` | TEXT | No | Bride's father's citizenship |
| `bMothF`, `bMothM`, `bMothL` | `mother_name` | TEXT | No | Bride's mother's full name (concatenated) |
| `bMothCitizen` | `mother_citizenship` | TEXT | No | Bride's mother's citizenship |

### Marriage Application Fields

| Form Concept | Database Table | Database Column | Data Type | Required | Description |
|--------------|----------------|----------------|-----------|----------|-------------|
| Application Code | `marriage_applications` | `application_code` | VARCHAR(20) | Yes | Unique application identifier |
| Status | `marriage_applications` | `status` | VARCHAR(20) | Yes | Application status (draft, submitted, etc.) |
| Document Number | `marriage_applications` | `document_number` | INTEGER | No | Official document number |
| Created By | `marriage_applications` | `created_by` | UUID | No | Reference to profiles table |
| Processed By | `marriage_applications` | `processed_by` | UUID | No | Reference to profiles table |

## Data Transformation Notes

### Name Concatenation
Parent names in the form are stored as separate fields but should be concatenated when saving to database:
- `father_name` = `FathF + " " + FathM + " " + FathL`
- `mother_name` = `MothF + " " + MothM + " " + MothL`

### Address Handling
Addresses need to be inserted into the `addresses` table first, then the `address_id` foreign key should reference the created address record.

### Application Flow
1. Create `marriage_applications` record first
2. Create `addresses` records for both applicants
3. Create `applicants` records for groom and bride, linking to the application and addresses

## Example Data Flow

```javascript
// Form data structure
const formData = {
  gFirst: "Juan",
  gMiddle: "Dela",
  gLast: "Cruz",
  gBday: "1990-01-01",
  gAge: 34,
  gProv: "Nueva Vizcaya",
  gTown: "Solano",
  gBrgy: "Poblacion",
  // ... other fields
};

// Database insertion order
1. INSERT INTO marriage_applications (application_code, status)
2. INSERT INTO addresses (province, municipality, barangay)
3. INSERT INTO applicants (application_id, address_id, first_name, middle_name, last_name, ...)
```

## Status Values

The `status` field in `marriage_applications` accepts these values:
- `draft` - Initial state
- `submitted` - User submitted application
- `pending` - Awaiting employee processing
- `approved` - Approved by employee
- `processing` - Being processed
- `completed` - Document generated
- `rejected` - Application rejected
- `finished` - Final state

## Type Values

The `type` field in `applicants` accepts:
- `groom` - Male applicant
- `bride` - Female applicant

This mapping ensures consistent data transformation between the frontend form and the Supabase database schema.