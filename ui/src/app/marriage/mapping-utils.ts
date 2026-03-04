import { INITIAL_FORM_STATE, RELIGIONS, SUFFIX_OPTIONS, VALID_ID_TYPES } from "./constants";
import { splitName } from "./utils";

export const mapAppToFormData = (app: any) => {
    // Handle different structures (UserDashboard passes raw app with applicants array, 
    // AdminDashboard passes processed app with groom/bride properties)
    const applicants = app.applicants || [];
    const groom = app.groom || applicants.find((a: any) => a.type === 'groom') || {};
    const bride = app.bride || applicants.find((a: any) => a.type === 'bride') || {};

    const groomFather = splitName(groom.father_name);
    const groomMother = splitName(groom.mother_name);
    const groomGiver = splitName(groom.giver_name);

    const brideFather = splitName(bride.father_name);
    const brideMother = splitName(bride.mother_name);
    const brideGiver = splitName(bride.giver_name);

    const isCustomSuffix = (suffix: string) => suffix && !SUFFIX_OPTIONS.includes(suffix) && suffix !== "";
    const isCustomReligion = (religion: string) => religion && !RELIGIONS.includes(religion) && religion !== "";

    // Determine if birth place matches address (Municipality and Province only — no barangay)
    const normalize = (s: string) => (s || "").trim().toLowerCase().replace(/\(capital\)/gi, "").trim();
    const gAddrShort = groom.addresses ? `${groom.addresses.municipality}, ${groom.addresses.province}` : "";
    const bAddrShort = bride.addresses ? `${bride.addresses.municipality}, ${bride.addresses.province}` : "";

    // If birth_place exists and differs from address, show "different address"; otherwise same as address
    const gSameAsAddress =
        groom.birth_place != null && groom.birth_place.trim() !== ""
            ? normalize(groom.birth_place) === normalize(gAddrShort)
            : true;
    const bSameAsAddress =
        bride.birth_place != null && bride.birth_place.trim() !== ""
            ? normalize(bride.birth_place) === normalize(bAddrShort)
            : true;

    const gAddrCountry = groom.addresses?.country || "Philippines";
    const bAddrCountry = bride.addresses?.country || "Philippines";

    return {
        ...INITIAL_FORM_STATE,
        // Groom
        gFirst: groom.first_name || "",
        gMiddle: groom.middle_name || "",
        gLast: groom.last_name || "",
        gSuffix: isCustomSuffix(groom.suffix) ? "Others" : (groom.suffix || ""),
        gCustomSuffix: isCustomSuffix(groom.suffix) ? groom.suffix : "",
        gBday: groom.birth_date || "",
        gAge: groom.age || 0,
        gBirthPlace: (groom.birth_place != null && groom.birth_place.trim() !== "") ? groom.birth_place : gAddrShort,
        gBrgy: groom.addresses?.barangay || "",
        gTown: groom.addresses?.municipality || "",
        gProv: groom.addresses?.province || "Nueva Vizcaya",
        gReligion: isCustomReligion(groom.religion) ? "Others" : (groom.religion || ""),
        gCustomReligion: isCustomReligion(groom.religion) ? groom.religion : "",
        gCountry: gAddrCountry,
        gIsForeigner: !!groom.addresses?.is_foreigner,
        gIsNotBornInPh: !!groom.is_not_born_in_ph,
        gBirthCountry: groom.birth_country || "Philippines",
        gCitizen: groom.citizenship || "",
        gSameAsAddress: !!gSameAsAddress,
        gFathF: groomFather.first,
        gFathM: groomFather.middle,
        gFathL: groomFather.last,
        gMothF: groomMother.first,
        gMothM: groomMother.middle,
        gMothL: groomMother.last,
        gGiverF: groomGiver.first,
        gGiverM: groomGiver.middle,
        gGiverL: groomGiver.last,
        gGiverSuffix: isCustomSuffix(groom.giver_suffix) ? "Others" : (groom.giver_suffix || ""),
        gGiverCustomSuffix: isCustomSuffix(groom.giver_suffix) ? groom.giver_suffix : "",
        gGiverRelation: groom.giver_relationship || "",
        gGiverOtherTitle: (groom.giver_relationship && groom.giver_relationship !== "Father" && groom.giver_relationship !== "Mother") ? groom.giver_relationship : "",
        // Groom ID
        gIdType: isCustomValidId(groom.id_type) ? "Others" : (groom.id_type || ""),
        gIdNo: groom.id_no || "",
        gIdCustomType: isCustomValidId(groom.id_type) ? groom.id_type : "",
        gIncludeId: !!groom.include_id,
        gGiverIdType: isCustomValidId(groom.giver_id_type) ? "Others" : (groom.giver_id_type || ""),
        gGiverIdNo: groom.giver_id_no || "",
        gGiverIdCustomType: isCustomValidId(groom.giver_id_type) ? groom.giver_id_type : "",
        gGiverIncludeId: !!groom.giver_include_id,

        // Bride
        bFirst: bride.first_name || "",
        bMiddle: bride.middle_name || "",
        bLast: bride.last_name || "",
        bSuffix: isCustomSuffix(bride.suffix) ? "Others" : (bride.suffix || ""),
        bCustomSuffix: isCustomSuffix(bride.suffix) ? bride.suffix : "",
        bBday: bride.birth_date || "",
        bAge: bride.age || 0,
        bBirthPlace: (bride.birth_place != null && bride.birth_place.trim() !== "") ? bride.birth_place : bAddrShort,
        bBrgy: bride.addresses?.barangay || "",
        bTown: bride.addresses?.municipality || "",
        bProv: bride.addresses?.province || "Nueva Vizcaya",
        bReligion: isCustomReligion(bride.religion) ? "Others" : (bride.religion || ""),
        bCustomReligion: isCustomReligion(bride.religion) ? bride.religion : "",
        bCountry: bAddrCountry,
        bIsForeigner: !!bride.addresses?.is_foreigner,
        bIsNotBornInPh: !!bride.is_not_born_in_ph,
        bBirthCountry: bride.birth_country || "Philippines",
        bCitizen: bride.citizenship || "",
        bSameAsAddress: !!bSameAsAddress,
        bFathF: brideFather.first,
        bFathM: brideFather.middle,
        bFathL: brideFather.last,
        bMothF: brideMother.first,
        bMothM: brideMother.middle,
        bMothL: brideMother.last,
        bGiverF: brideGiver.first,
        bGiverM: brideGiver.middle,
        bGiverL: brideGiver.last,
        bGiverSuffix: isCustomSuffix(bride.giver_suffix) ? "Others" : (bride.giver_suffix || ""),
        bGiverCustomSuffix: isCustomSuffix(bride.giver_suffix) ? bride.giver_suffix : "",
        bGiverRelation: bride.giver_relationship || "",
        bGiverOtherTitle: (bride.giver_relationship && bride.giver_relationship !== "Father" && bride.giver_relationship !== "Mother") ? bride.giver_relationship : "",

        // Bride ID
        bIdType: isCustomValidId(bride.id_type) ? "Others" : (bride.id_type || ""),
        bIdNo: bride.id_no || "",
        bIdCustomType: isCustomValidId(bride.id_type) ? bride.id_type : "",
        bIncludeId: !!bride.include_id,
        bGiverIdType: isCustomValidId(bride.giver_id_type) ? "Others" : (bride.giver_id_type || ""),
        bGiverIdNo: bride.giver_id_no || "",
        bGiverIdCustomType: isCustomValidId(bride.giver_id_type) ? bride.giver_id_type : "",
        bGiverIncludeId: !!bride.giver_include_id,

        contactNumber: app.contact_number || "",
    };
};

const isCustomValidId = (idType: string) => {
    return idType && !VALID_ID_TYPES.includes(idType) && idType !== "";
};

