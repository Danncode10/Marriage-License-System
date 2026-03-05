/**
 * excelFormatter.ts
 * Responsbile for mapping complex application data into a flat structure
 * optimized for Excel and statistical analysis.
 */

export interface FlattenedApplication {
    application_code: string;
    status: string;
    submission_date: string;

    // Groom Details
    groom_first_name: string;
    groom_last_name: string;
    groom_age: number;
    groom_citizenship: string;
    groom_religion: string;
    groom_municipality: string;
    groom_barangay: string;

    // Bride Details
    bride_first_name: string;
    bride_last_name: string;
    bride_age: number;
    bride_citizenship: string;
    bride_religion: string;
    bride_municipality: string;
    bride_barangay: string;
    registry_number: string;
}

export const formatApplicationsForExcel = (applications: any[]): FlattenedApplication[] => {
    return applications.map(app => {
        const groom = app.applicants?.find((a: any) => a.type === 'groom') || {};
        const bride = app.applicants?.find((a: any) => a.type === 'bride') || {};

        return {
            application_code: app.application_code || '',
            status: (app.status || 'pending').toUpperCase(),
            submission_date: app.created_at ? new Date(app.created_at).toISOString().split('T')[0] : '',

            // Groom
            groom_first_name: groom.first_name || '',
            groom_last_name: groom.last_name || '',
            groom_age: Number(groom.age) || 0,
            groom_citizenship: groom.citizenship || '',
            groom_religion: groom.religion || '',
            groom_municipality: groom.addresses?.municipality || '',
            groom_barangay: groom.addresses?.barangay || '',

            // Bride
            bride_first_name: bride.first_name || '',
            bride_last_name: bride.last_name || '',
            bride_age: Number(bride.age) || 0,
            bride_citizenship: bride.citizenship || '',
            bride_religion: bride.religion || '',
            bride_municipality: bride.addresses?.municipality || '',
            bride_barangay: bride.addresses?.barangay || '',
            registry_number: app.registry_number || '',
        };
    });
};
