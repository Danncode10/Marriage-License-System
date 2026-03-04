import { useEffect, useState } from "react";
// @ts-ignore
import { barangays, cities, provinces, regions } from "select-philippines-address";
import { INITIAL_FORM_STATE, NUEVA_VIZCAYA_CODE } from "../constants";
import { calculateAge } from "../utils";

export function useMarriageForm() {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // Independent Town Options
    const [gTownOptions, setGTownOptions] = useState<any[]>([]);
    const [bTownOptions, setBTownOptions] = useState<any[]>([]);

    // Independent Province List (can be shared as it's static)
    const [provincesList, setProvincesList] = useState<any[]>([]);

    // Independent Barangay Options
    const [gBrgyOptions, setGBrgyOptions] = useState<any[]>([]);
    const [bBrgyOptions, setBBrgyOptions] = useState<any[]>([]);

    // Birth Place Options
    const [gBirthTownOptions, setGBirthTownOptions] = useState<any[]>([]);
    const [bBirthTownOptions, setBBirthTownOptions] = useState<any[]>([]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationCode, setApplicationCode] = useState("");
    const [loading, setLoading] = useState(false);

    const [gSameAsAddress, setGSameAsAddress] = useState(INITIAL_FORM_STATE.gSameAsAddress);
    const [bSameAsAddress, setBSameAsAddress] = useState(INITIAL_FORM_STATE.bSameAsAddress);

    const [showClearAlert, setShowClearAlert] = useState(false);

    // Initial load: Fetch provinces
    useEffect(() => {
        regions().then(async (regs: any) => {
            const allProvs = await Promise.all(regs.map((r: any) => provinces(r.region_code)));
            const flatProvs = allProvs.flat();
            const uniqueProvs = Array.from(
                new Map(flatProvs.map((p: any) => [p.province_code, p])).values()
            );
            const sortedProvs = uniqueProvs.sort((a, b) => a.province_name.localeCompare(b.province_name));
            setProvincesList(sortedProvs);

            // Default Town Options (Nueva Vizcaya)
            cities(NUEVA_VIZCAYA_CODE).then((res: any) => {
                setGTownOptions(res);
                setBTownOptions(res);
            });
        });
    }, []);

    // CRITICAL: Effect to handle initialization of options when formData is set (e.g. from Edit mode)
    // This prevents Town/Barangay from resetting to empty
    useEffect(() => {
        const initializeOptions = async () => {
            if (provincesList.length === 0) return;

            // Handle Groom
            if (formData.gProv) {
                const prov = provincesList.find(p => p.province_name === formData.gProv);
                if (prov) {
                    const towns = await cities(prov.province_code);
                    setGTownOptions(towns);

                    if (formData.gTown) {
                        const town = towns.find((t: any) => {
                            const n1 = (t.city_name || "").toLowerCase().replace(/\(capital\)/gi, "").trim();
                            const n2 = formData.gTown.toLowerCase().replace(/\(capital\)/gi, "").trim();
                            return n1 === n2;
                        });
                        if (town) {
                            const brgys = await barangays(town.city_code);
                            setGBrgyOptions(brgys);
                        }
                    }
                }
            }

            // Handle Bride
            if (formData.bProv) {
                const prov = provincesList.find(p => p.province_name === formData.bProv);
                if (prov) {
                    const towns = await cities(prov.province_code);
                    setBTownOptions(towns);

                    if (formData.bTown) {
                        const town = towns.find((t: any) => {
                            const n1 = (t.city_name || "").toLowerCase().replace(/\(capital\)/gi, "").trim();
                            const n2 = formData.bTown.toLowerCase().replace(/\(capital\)/gi, "").trim();
                            return n1 === n2;
                        });
                        if (town) {
                            const brgys = await barangays(town.city_code);
                            setBBrgyOptions(brgys);
                        }
                    }
                }
            }
        };

        // Deep initialization logic:
        // We run this if formData has values but the respective options are empty OR 
        // if they contain defaults (Nueva Vizcaya) but formData points elsewhere.
        const isGroomExternal = formData.gProv && formData.gProv !== "Nueva Vizcaya";
        const isBrideExternal = formData.bProv && formData.bProv !== "Nueva Vizcaya";

        const needsGroomInit = formData.gTown && (gTownOptions.length === 0 || isGroomExternal);
        const needsBrideInit = formData.bTown && (bTownOptions.length === 0 || isBrideExternal);

        if (needsGroomInit || needsBrideInit) {
            initializeOptions();
        }

        // --- NEW: Initialize Birth Place Options ---
        const initializeBirthOptions = async () => {
            if (provincesList.length === 0) return;

            // Groom Birth
            const gBirthParts = (formData.gBirthPlace || "").split(',').map(s => s.trim());
            const gBirthProvName = gBirthParts.length > 1 ? gBirthParts[gBirthParts.length - 1] : gBirthParts[0];
            if (gBirthProvName) {
                const prov = provincesList.find(p => p.province_name === gBirthProvName);
                if (prov) {
                    const towns = await cities(prov.province_code);
                    setGBirthTownOptions(towns);
                }
            }

            // Bride Birth
            const bBirthParts = (formData.bBirthPlace || "").split(',').map(s => s.trim());
            const bBirthProvName = bBirthParts.length > 1 ? bBirthParts[bBirthParts.length - 1] : bBirthParts[0];
            if (bBirthProvName) {
                const prov = provincesList.find(p => p.province_name === bBirthProvName);
                if (prov) {
                    const towns = await cities(prov.province_code);
                    setBBirthTownOptions(towns);
                }
            }
        };

        if (formData.gBirthPlace && gBirthTownOptions.length === 0) {
            initializeBirthOptions();
        }
        if (formData.bBirthPlace && bBirthTownOptions.length === 0) {
            initializeBirthOptions();
        }
    }, [formData.gProv, formData.gTown, formData.bProv, formData.bTown, formData.gBirthPlace, formData.bBirthPlace, provincesList.length]);

    const handleAgeChange = (prefix: 'g' | 'b', ageValue: string) => {
        const age = parseInt(ageValue) || 0;
        const currentYear = new Date().getFullYear();
        const estimatedYear = currentYear - age;
        const estimatedDate = `${estimatedYear}-01-01`;

        setFormData(prev => ({
            ...prev,
            [`${prefix}Age`]: age,
            [`${prefix}Bday`]: age > 0 ? estimatedDate : ""
        }));
    };

    const handleProvinceChange = async (prefix: 'g' | 'b', provinceCode: string, provinceName: string) => {
        setFormData(prev => {
            const newData = { ...prev, [`${prefix}Prov`]: provinceName, [`${prefix}Town`]: "", [`${prefix}Brgy`]: "" };
            const isSame = prefix === 'g' ? gSameAsAddress : bSameAsAddress;
            if (isSame) {
                newData[`${prefix}BirthPlace`] = provinceName;
            }
            return newData;
        });
        const res = await cities(provinceCode);
        if (prefix === 'g') setGTownOptions(res);
        else setBTownOptions(res);
    };

    const handleTownChange = async (prefix: 'g' | 'b', cityCode: string, cityName: string) => {
        setFormData(prev => {
            const newData = { ...prev, [`${prefix}Town`]: cityName, [`${prefix}Brgy`]: "" };
            const isSame = prefix === 'g' ? gSameAsAddress : bSameAsAddress;
            if (isSame) {
                newData[`${prefix}BirthPlace`] = `${cityName}, ${newData[`${prefix}Prov`]}`;
            }
            return newData;
        });
        const res = await barangays(cityCode);
        if (prefix === 'g') setGBrgyOptions(res);
        else setBBrgyOptions(res);
    };

    const handleBrgyChange = (prefix: 'g' | 'b', brgyName: string) => {
        setFormData(prev => {
            const newData = { ...prev, [`${prefix}Brgy`]: brgyName };

            const isSame = prefix === 'g' ? gSameAsAddress : bSameAsAddress;
            if (isSame) {
                const town = newData[`${prefix}Town`];
                const prov = newData[`${prefix}Prov`];
                newData[`${prefix}BirthPlace`] = `${town}, ${prov}`;
            }

            return newData;
        });
    };

    const handleBirthProvinceChange = async (prefix: 'g' | 'b', provinceCode: string, provinceName: string) => {
        const res = await cities(provinceCode);
        if (prefix === 'g') {
            setGBirthTownOptions(res);
        } else {
            setBBirthTownOptions(res);
        }
        setFormData(prev => ({ ...prev, [`${prefix}BirthPlace`]: provinceName }));
    };

    const handleBirthTownChange = async (prefix: 'g' | 'b', cityCode: string, cityName: string, provinceName: string) => {
        // No more birth barangay logic

        setFormData(prev => ({ ...prev, [`${prefix}BirthPlace`]: `${cityName}, ${provinceName}` }));
    };

    const handleCopyAddressToBirthplace = (prefix: 'g' | 'b') => {
        const town = formData[prefix === 'g' ? 'gTown' : 'bTown'];
        const brgy = formData[prefix === 'g' ? 'gBrgy' : 'bBrgy'];
        const prov = formData[prefix === 'g' ? 'gProv' : 'bProv'];

        if (!town || !brgy) {
            alert("Please select Town and Barangay first!");
            return;
        }

        const fullAddress = `${town}, ${prov}`;
        setFormData(prev => ({ ...prev, [`${prefix}BirthPlace`]: fullAddress }));
    };

    const handleReset = () => {
        setFormData(INITIAL_FORM_STATE);
        setShowClearAlert(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const generateExcel = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `MARRIAGE_APPLICATION_${applicationCode || 'download'}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(`Error generating excel: ${errorData.details || errorData.error || 'Server error'}`);
            }
        } catch (e) {
            console.error("Excel generation error:", e);
            alert("Error generating excel. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = () => {
        const check = (prefix: 'g' | 'b') => {
            const age = formData[`${prefix}Age`];
            const isGiverNeeded = age && age >= 18 && age <= 24;

            // Main fields (Middle Name & Suffixes are optional)
            const mainFields = [
                formData[`${prefix}First`],
                formData[`${prefix}Last`],
                formData[`${prefix}Bday`],
                formData[`${prefix}Town`],
                formData[`${prefix}Prov`],
                formData[`${prefix}Religion`],
                formData[`${prefix}Citizen`],
                formData[`${prefix}BirthPlace`],
            ];

            // If not foreigner, Brgy is required
            if (!formData[`${prefix}IsForeigner`]) {
                mainFields.push(formData[`${prefix}Brgy`]);
            }

            if (mainFields.some(f => !f || f.toString().trim() === "")) return false;

            // Country validation if foreigner
            if (formData[`${prefix}IsForeigner`] && !formData[`${prefix}Country`]) return false;

            // Birth Country validation if not born in PH
            if (formData[`${prefix}IsNotBornInPh`] && !formData[`${prefix}BirthCountry`]) return false;

            // Religion validation for "Others"
            if (formData[`${prefix}Religion`] === "Others" && (!formData[`${prefix}CustomReligion`] || formData[`${prefix}CustomReligion`].trim() === "")) return false;

            // Parents (First and Last are required)
            const parentFields = [
                formData[`${prefix}FathF`],
                formData[`${prefix}FathL`],
                formData[`${prefix}MothF`],
                formData[`${prefix}MothL`],
            ];
            if (parentFields.some(f => !f || f.trim() === "")) return false;

            // Giver
            if (isGiverNeeded) {
                const relation = formData[`${prefix}GiverRelation`];
                if (!relation) return false;
                if (relation === "Other" && !formData[`${prefix}GiverOtherTitle`]) return false;
                if (!formData[`${prefix}GiverF`] || !formData[`${prefix}GiverL`]) return false;

                // Giver ID if included
                if (formData[`${prefix}GiverIncludeId`]) {
                    if (!formData[`${prefix}GiverIdType`] || !formData[`${prefix}GiverIdNo`]) return false;
                    if (formData[`${prefix}GiverIdType`] === "Others" && !formData[`${prefix}GiverIdCustomType`]) return false;
                }
            }

            // Main ID if included
            if (formData[`${prefix}IncludeId`]) {
                if (!formData[`${prefix}IdType`] || !formData[`${prefix}IdNo`]) return false;
                if (formData[`${prefix}IdType`] === "Others" && !formData[`${prefix}IdCustomType`]) return false;
            }

            return true;
        };

        // Groom and Bride checks
        if (!check('g') || !check('b')) return false;

        return true;
    };

    return {
        formData,
        setFormData,
        gTownOptions,
        bTownOptions,
        provincesList,
        gBrgyOptions,
        bBrgyOptions,
        gBirthTownOptions,
        bBirthTownOptions,
        isSubmitted,
        setIsSubmitted,
        applicationCode,
        setApplicationCode,
        loading,
        gSameAsAddress,
        setGSameAsAddress,
        bSameAsAddress,
        setBSameAsAddress,
        showClearAlert,
        setShowClearAlert,
        handleAgeChange,
        handleProvinceChange,
        handleTownChange,
        handleBrgyChange,
        handleBirthProvinceChange,
        handleBirthTownChange,
        handleCopyAddressToBirthplace,
        handleReset,
        generateExcel,
        calculateAge,
        isFormValid: isFormValid(),
    };
}

