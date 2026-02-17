import { createClient } from "@/utils/supabase/client";

export async function submitApplication(formData: any, generatedCode: string, userId: string) {
    const supabase = createClient();

    // Safety: Check if this application was already created (Idempotency)
    const { data: existingApp } = await supabase
        .from('marriage_applications')
        .select('id')
        .eq('application_code', generatedCode)
        .maybeSingle();

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

        const { data: groomAddr, error: groomAddrError } = await supabase
            .from('addresses')
            .insert([groomAddressPayload])
            .select()
            .single();

        if (groomAddrError) throw new Error(`Groom address insert error: ${groomAddrError.message}`);
        if (!groomAddr) throw new Error('Failed to insert groom address - no data returned');
        groom_address_id = groomAddr.id;
    }

    let bride_address_id = null;
    if (formData.bBrgy && formData.bProv && formData.bTown) {
        const brideAddressPayload = {
            street_address: "",
            barangay: formData.bBrgy,
            province: formData.bProv,
            municipality: formData.bTown,
        };

        const { data: brideAddr, error: brideAddrError } = await supabase
            .from('addresses')
            .insert([brideAddressPayload])
            .select()
            .single();

        if (brideAddrError) throw new Error(`Bride address insert error: ${brideAddrError.message}`);
        if (!brideAddr) throw new Error('Failed to insert bride address - no data returned');
        bride_address_id = brideAddr.id;
    }

    // Step B: Insert marriage_applications row, capture ID
    const { data: appData, error: appError } = await supabase
        .from('marriage_applications')
        .insert([{
            application_code: generatedCode,
            created_by: userId
        }])
        .select()
        .single();

    if (appError) throw new Error(`Application insert error: ${appError.message}`);
    if (!appData) throw new Error('Failed to insert application - no data returned');

    const application_id = appData.id;

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
        religion: formData.gReligion || null,
        father_name: [formData.gFathF, formData.gFathM, formData.gFathL].filter(Boolean).join(' ') || null,
        mother_name: [formData.gMothF, formData.gMothM, formData.gMothL].filter(Boolean).join(' ') || null,
    };

    const { error: groomError } = await supabase
        .from('applicants')
        .insert([groomPayload]);

    if (groomError) throw new Error(`Groom applicant insert error: ${groomError.message}`);

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
        religion: formData.bReligion || null,
        father_name: [formData.bFathF, formData.bFathM, formData.bFathL].filter(Boolean).join(' ') || null,
        mother_name: [formData.bMothF, formData.bMothM, formData.bMothL].filter(Boolean).join(' ') || null,
    };

    const { error: brideError } = await supabase
        .from('applicants')
        .insert([bridePayload]);

    if (brideError) throw new Error(`Bride applicant insert error: ${brideError.message}`);

    return application_id;
}
