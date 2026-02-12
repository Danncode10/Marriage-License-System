# Marriage Form Module

This module has been refactored for better maintainability and developer experience.

## File Structure

```
marriage/
├── page.tsx                          # Main page component (~250 lines)
├── constants.ts                      # Constants and initial state
├── utils.ts                          # Utility functions
├── hooks/
│   └── useMarriageForm.ts           # Custom hook for form logic
└── components/
    ├── FormComponents.tsx           # Reusable form UI components
    ├── SectionCard.tsx              # Section card wrapper
    ├── AddressSection.tsx           # Address selection component
    └── BirthPlaceSection.tsx        # Birth place selection component
```

## Component Breakdown

### `page.tsx` (Main Component)
- **Lines**: ~250 (down from 700)
- **Purpose**: Orchestrates the overall form layout and submission flow
- **Responsibilities**: 
  - Rendering the main form structure
  - Handling form submission
  - Displaying success state

### `constants.ts`
- **Purpose**: Centralized constants and configuration
- **Exports**:
  - `NUEVA_VIZCAYA_CODE`: Default province code
  - `RELIGIONS`: List of available religions
  - `INITIAL_FORM_STATE`: Default form data structure

### `utils.ts`
- **Purpose**: Reusable utility functions
- **Exports**:
  - `toTitleCase()`: Converts strings to title case
  - `calculateAge()`: Calculates age from birthdate

### `hooks/useMarriageForm.ts`
- **Purpose**: Encapsulates all form state and business logic
- **Returns**: All state variables and handler functions
- **Benefits**: 
  - Separates logic from presentation
  - Makes testing easier
  - Reduces component complexity

### `components/FormComponents.tsx`
- **Components**:
  - `Field`: Form field wrapper with label
  - `LabelWithIcon`: Icon + text label
  - `FamilySubSection`: Father/Mother name inputs
  - `GiverSubSection`: Consent/Advice giver section

### `components/SectionCard.tsx`
- **Purpose**: Styled card wrapper for Groom/Bride sections
- **Props**: `title`, `color` (blue/yellow), `children`

### `components/AddressSection.tsx`
- **Purpose**: Province/Town/Barangay selection
- **Props**: Prefix, options, handlers
- **Reusable**: Used for both Groom and Bride

### `components/BirthPlaceSection.tsx`
- **Purpose**: Birth place selection with same/different address toggle
- **Props**: Prefix, state, options, handlers
- **Features**: Dynamic address selection

## Benefits of This Structure

1. **Maintainability**: Each file has a single, clear purpose
2. **Reusability**: Components can be easily reused
3. **Testability**: Logic is separated from UI
4. **Readability**: Smaller files are easier to understand
5. **Scalability**: Easy to add new features without bloating files

## Development Guidelines

- Keep components under 200 lines
- Extract repeated logic into hooks
- Use TypeScript interfaces for props
- Follow the single responsibility principle
- Document complex logic with comments
