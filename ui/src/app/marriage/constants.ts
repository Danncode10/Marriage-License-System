export const NUEVA_VIZCAYA_CODE = "0250";

export const RELIGIONS = [
    "Roman Catholic", "Iglesia ni Cristo", "Islam", "Seventh-day Adventist",
    "Bible Baptist Church", "Jehovah's Witnesses", "United Church of Christ in the Philippines", "None", "Others",
];

export const SUFFIX_OPTIONS = ["Jr.", "Sr.", "I", "II", "III", "IV", "V", "Others"];

export const VALID_ID_TYPES = [
    "Driver's License", "Passport", "PRC ID", "Postal ID", "Voter's ID",
    "UMID", "PhilSys ID (National ID)", "Senior Citizen ID", "PWD ID",
    "Solo Parent ID", "Company ID", "TIN ID", "Others"
];

export const INITIAL_FORM_STATE = {
    // Groom
    gFirst: "", gMiddle: "", gLast: "", gSuffix: "", gCustomSuffix: "", gBday: "", gAge: 0,
    gBirthPlace: "Philippines", gBirthCountry: "Philippines", gBrgy: "", gTown: "", gProv: "Nueva Vizcaya", gCountry: "Philippines",
    gCitizen: "", gStatus: "Single", gReligion: "", gCustomReligion: "",
    gDissolvedHow: "", gDissolvedPlace: "", gDissolvedCountry: "Philippines", gDissolvedIsPh: true, gDissolvedDate: "", gRelationshipDegree: "",
    gFathF: "", gFathM: "", gFathL: "", gFathSuffix: "", gFathCustomSuffix: "",
    gMothF: "", gMothM: "", gMothL: "", gMothSuffix: "", gMothCustomSuffix: "",
    gGiverF: "", gGiverM: "", gGiverL: "", gGiverSuffix: "", gGiverCustomSuffix: "",
    gGiverRelation: "", gGiverOtherTitle: "",

    // Groom ID
    gIdType: "", gIdNo: "", gIdCustomType: "", gIncludeId: false,
    gGiverIdType: "", gGiverIdNo: "", gGiverIdCustomType: "", gGiverIncludeId: false,
    gIsForeigner: false,
    bIsForeigner: false,
    gIsNotBornInPh: false,
    bIsNotBornInPh: false,
    gSameAsAddress: null as boolean | null,

    contactNumber: "",

    // Bride
    bFirst: "", bMiddle: "", bLast: "", bSuffix: "", bCustomSuffix: "", bBday: "", bAge: 0,
    bBirthPlace: "Philippines", bBirthCountry: "Philippines", bBrgy: "", bTown: "", bProv: "Nueva Vizcaya", bCountry: "Philippines",
    bCitizen: "", bStatus: "Single", bReligion: "", bCustomReligion: "",
    bDissolvedHow: "", bDissolvedPlace: "", bDissolvedCountry: "Philippines", bDissolvedIsPh: true, bDissolvedDate: "", bRelationshipDegree: "",
    bFathF: "", bFathM: "", bFathL: "", bFathSuffix: "", bFathCustomSuffix: "",
    bMothF: "", bMothM: "", bMothL: "", bMothSuffix: "", bMothCustomSuffix: "",
    bGiverF: "", bGiverM: "", bGiverL: "", bGiverSuffix: "", bGiverCustomSuffix: "",
    bGiverRelation: "", bGiverOtherTitle: "",

    // Bride ID
    bIdType: "", bIdNo: "", bIdCustomType: "", bIncludeId: false,
    bGiverIdType: "", bGiverIdNo: "", bGiverIdCustomType: "", bGiverIncludeId: false,
    bSameAsAddress: null as boolean | null,
};
