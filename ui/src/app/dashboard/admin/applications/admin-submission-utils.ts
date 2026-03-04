import { createClient } from "@/utils/supabase/client";

interface MarriageFormData {
    gFirst: string;
    gMiddle: string;
    gLast: string;
    gSuffix: string;
    gCustomSuffix: string;
    gBday: string;
    gAge: number;
    gBirthPlace: string;
    gBrgy: string;
    gProv: string;
    gTown: string;
    gCitizen: string;
    gReligion: string;
    gFathF: string;
    gFathM: string;
    gFathL: string;
    gMothF: string;
    gMothM: string;
    gMothL: string;
    bFirst: string;
    bMiddle: string;
    bLast: string;
    bSuffix: string;
    bCustomSuffix: string;
    bBday: string;
    bAge: number;
    bBirthPlace: string;
    bBrgy: string;
    bProv: string;
    bTown: string;
    bCitizen: string;
    bReligion: string;
    bFathF: string;
    bFathM: string;
    bFathL: string;
    bMothF: string;
    bMothM: string;
    bMothL: string;
    contactNumber: string;
    gGiverF: string;
    gGiverM: string;
    gGiverL: string;
    gGiverSuffix: string;
    gGiverCustomSuffix: string;
    gGiverRelation: string;
    gGiverOtherTitle?: string;
    bGiverF: string;
    bGiverM: string;
    bGiverL: string;
    bGiverSuffix: string;
    bGiverCustomSuffix: string;
    bGiverRelation: string;
    bGiverOtherTitle?: string;
    // ID fields
    gIncludeId?: boolean;
    gIdType?: string;
    gIdNo?: string;
    gIdCustomType?: string;
    gGiverIncludeId?: boolean;
    gGiverIdType?: string;
    gGiverIdNo?: string;
    gGiverIdCustomType?: string;
    bIncludeId?: boolean;
    bIdType?: string;
    bIdNo?: string;
    bIdCustomType?: string;
    bGiverIncludeId?: boolean;
    bGiverIdType?: string;
    bGiverIdNo?: string;
    bGiverIdCustomType?: string;
}

export async function submitAdminApplication(formData: MarriageFormData, generatedCode: string, processorId: string) {
    const supabase = createClient();

    console.log('=== submitAdminApplication START ===');
    console.log('processorId:', processorId);
    console.log('generatedCode:', generatedCode);

    // Safety: Check if this application was already created (Idempotency)
    const { data: existingApp, error: existingCheckError } = await supabase
        .from('marriage_applications')
        .select('id')
        .eq('application_code', generatedCode)
        .maybeSingle();

    if (existingCheckError) {
        console.error('Error checking existing application:', existingCheckError.message, existingCheckError.details);
        throw new Error(`Duplicate check failed: ${existingCheckError.message}`);
    }

    if (existingApp) {
        console.log('Application already exists in DB. Skipping creation.');
        return existingApp.id;
    }

    // Step A: Insert addresses for Groom and Bride, capture IDs
    let groom_address_id = null;
    if (formData.gBrgy && formData.gProv && formData.gTown) {
        const groomAddressPayload = {
            street_address: "",
            barangay: formData.gBrgy,
            province: formData.gProv,
            municipality: formData.gTown,
            country: (formData as any).gCountry || "Philippines",
            is_foreigner: !!(formData as any).gIsForeigner,
        };

        console.log('Inserting groom address:', groomAddressPayload);
        const { data: groomAddr, error: groomAddrError } = await supabase
            .from('addresses')
            .insert([groomAddressPayload])
            .select()
            .single();

        if (groomAddrError) {
            console.error('Groom address insert error:', groomAddrError.message, groomAddrError.details, groomAddrError.hint);
            throw new Error(`Groom address insert error: ${groomAddrError.message}`);
        }
        if (!groomAddr) throw new Error('Failed to insert groom address - no data returned');
        groom_address_id = groomAddr.id;
        console.log('Groom address ID:', groom_address_id);
    }

    let bride_address_id = null;
    if (formData.bBrgy && formData.bProv && formData.bTown) {
        const brideAddressPayload = {
            street_address: "",
            barangay: formData.bBrgy,
            province: formData.bProv,
            municipality: formData.bTown,
            country: (formData as any).bCountry || "Philippines",
            is_foreigner: !!(formData as any).bIsForeigner,
        };

        console.log('Inserting bride address:', brideAddressPayload);
        const { data: brideAddr, error: brideAddrError } = await supabase
            .from('addresses')
            .insert([brideAddressPayload])
            .select()
            .single();

        if (brideAddrError) {
            console.error('Bride address insert error:', brideAddrError.message, brideAddrError.details, brideAddrError.hint);
            throw new Error(`Bride address insert error: ${brideAddrError.message}`);
        }
        if (!brideAddr) throw new Error('Failed to insert bride address - no data returned');
        bride_address_id = brideAddr.id;
        console.log('Bride address ID:', bride_address_id);
    }

    // Step B: Insert marriage_applications row, capture ID
    // For admin submissions, created_by is null, processed_by is the admin/employee
    const appPayload = {
        application_code: generatedCode,
        created_by: null, // Office use
        contact_number: formData.contactNumber || null,
        status: 'pending',
        processed_by: processorId
    };
    console.log('Inserting application:', appPayload);

    const { data: appData, error: appError } = await supabase
        .from('marriage_applications')
        .insert([appPayload])
        .select()
        .single();

    if (appError) {
        console.error('Application insert error:', appError.message, appError.details, appError.hint, appError.code);
        throw new Error(`Application insert error: ${appError.message}`);
    }
    if (!appData) throw new Error('Failed to insert application - no data returned');

    const application_id = appData.id;
    console.log('Application inserted, ID:', application_id);

    // Step C: Insert applicants (Groom and Bride)
    const groomPayload = {
        application_id,
        address_id: groom_address_id,
        first_name: formData.gFirst,
        last_name: formData.gLast,
        middle_name: formData.gMiddle || null,
        suffix: formData.gSuffix === "Others" ? formData.gCustomSuffix : (formData.gSuffix || null),
        type: 'groom',
        birth_date: formData.gBday,
        age: formData.gAge,
        citizenship: formData.gCitizen,
        birth_place: formData.gBirthPlace || null,
        birth_country: (formData as any).gBirthCountry || "Philippines",
        is_not_born_in_ph: !!(formData as any).gIsNotBornInPh,
        religion: formData.gReligion || null,
        father_name: [formData.gFathF, formData.gFathM, formData.gFathL].filter(Boolean).join(' ') || null,
        mother_name: [formData.gMothF, formData.gMothM, formData.gMothL].filter(Boolean).join(' ') || null,
        giver_name: [formData.gGiverF, formData.gGiverM, formData.gGiverL].filter(Boolean).join(' ') || null,
        giver_suffix: formData.gGiverSuffix === "Others" ? formData.gGiverCustomSuffix : (formData.gGiverSuffix || null),
        giver_relationship: formData.gGiverOtherTitle || formData.gGiverRelation || null,
        // ID fields
        include_id: formData.gIncludeId || false,
        id_type: formData.gIdType === "Others" ? formData.gIdCustomType : (formData.gIdType || null),
        id_no: formData.gIdNo || null,
        giver_include_id: formData.gGiverIncludeId || false,
        giver_id_type: formData.gGiverIdType === "Others" ? formData.gGiverIdCustomType : (formData.gGiverIdType || null),
        giver_id_no: formData.gGiverIdNo || null,
    };

    console.log('Inserting groom applicant...');
    const { error: groomError } = await supabase
        .from('applicants')
        .insert([groomPayload]);

    if (groomError) {
        console.error('Groom insert error:', groomError.message, groomError.details, groomError.hint);
        throw new Error(`Groom applicant insert error: ${groomError.message}`);
    }
    console.log('Groom inserted successfully.');

    const bridePayload = {
        application_id,
        address_id: bride_address_id,
        first_name: formData.bFirst,
        last_name: formData.bLast,
        middle_name: formData.bMiddle || null,
        suffix: formData.bSuffix === "Others" ? formData.bCustomSuffix : (formData.bSuffix || null),
        type: 'bride',
        birth_date: formData.bBday,
        age: formData.bAge,
        citizenship: formData.bCitizen,
        birth_place: formData.bBirthPlace || null,
        birth_country: (formData as any).bBirthCountry || "Philippines",
        is_not_born_in_ph: !!(formData as any).bIsNotBornInPh,
        religion: formData.bReligion || null,
        father_name: [formData.bFathF, formData.bFathM, formData.bFathL].filter(Boolean).join(' ') || null,
        mother_name: [formData.bMothF, formData.bMothM, formData.bMothL].filter(Boolean).join(' ') || null,
        giver_name: [formData.bGiverF, formData.bGiverM, formData.bGiverL].filter(Boolean).join(' ') || null,
        giver_suffix: formData.bGiverSuffix === "Others" ? formData.bGiverCustomSuffix : (formData.bGiverSuffix || null),
        giver_relationship: formData.bGiverOtherTitle || formData.bGiverRelation || null,
        // ID fields
        include_id: formData.bIncludeId || false,
        id_type: formData.bIdType === "Others" ? formData.bIdCustomType : (formData.bIdType || null),
        id_no: formData.bIdNo || null,
        giver_include_id: formData.bGiverIncludeId || false,
        giver_id_type: formData.bGiverIdType === "Others" ? formData.bGiverIdCustomType : (formData.bGiverIdType || null),
        giver_id_no: formData.bGiverIdNo || null,
    };

    console.log('Inserting bride applicant...');
    const { error: brideError } = await supabase
        .from('applicants')
        .insert([bridePayload]);

    if (brideError) {
        console.error('Bride insert error:', brideError.message, brideError.details, brideError.hint);
        throw new Error(`Bride applicant insert error: ${brideError.message}`);
    }
    console.log('Bride inserted successfully.');
    console.log('=== submitAdminApplication COMPLETE ===');

    return application_id;
}