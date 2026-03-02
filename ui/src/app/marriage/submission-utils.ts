import { createClient } from "@/utils/supabase/client";

export async function submitApplication(formData: any, generatedCode: string, userId: string) {
    const supabase = createClient();

    console.log('=== submitApplication START ===');
    console.log('userId:', userId);
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
    const appPayload = {
        application_code: generatedCode,
        created_by: userId,
        contact_number: formData.contactNumber || null,
        status: 'pending'
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
        religion: formData.gReligion === "Others" ? formData.gCustomReligion : (formData.gReligion || null),
        father_name: [formData.gFathF, formData.gFathM, formData.gFathL].filter(Boolean).join(' ') || null,
        mother_name: [formData.gMothF, formData.gMothM, formData.gMothL].filter(Boolean).join(' ') || null,
        giver_name: [formData.gGiverF, formData.gGiverM, formData.gGiverL].filter(Boolean).join(' ') || null,
        giver_relationship: formData.gGiverOtherTitle || formData.gGiverRelation || null,
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
        religion: formData.bReligion === "Others" ? formData.bCustomReligion : (formData.bReligion || null),
        father_name: [formData.bFathF, formData.bFathM, formData.bFathL].filter(Boolean).join(' ') || null,
        mother_name: [formData.bMothF, formData.bMothM, formData.bMothL].filter(Boolean).join(' ') || null,
        giver_name: [formData.bGiverF, formData.bGiverM, formData.bGiverL].filter(Boolean).join(' ') || null,
        giver_relationship: formData.bGiverOtherTitle || formData.bGiverRelation || null,
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
    console.log('=== submitApplication COMPLETE ===');

    return application_id;
}
