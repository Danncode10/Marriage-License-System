import { createAdminClient } from "./src/utils/supabase/server-utils"; // Need careful path here
// This is a test script to check the columns of the applicants table.
async function checkSchema() {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('applicants').select('*').limit(1);
    console.log(JSON.stringify(data?.[0] || {}, null, 2));
}
checkSchema();
