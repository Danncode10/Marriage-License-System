import { useEffect, useState } from "react";
// @ts-ignore
import { barangays, cities, provinces, regions } from "select-philippines-address";
import { NUEVA_VIZCAYA_CODE, INITIAL_FORM_STATE } from "../constants";
import { calculateAge } from "../utils";

export function useMarriageForm() {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [townOptions, setTownOptions] = useState<any[]>([]);
    const [provincesList, setProvincesList] = useState<any[]>([]);
    const [gBrgyOptions, setGBrgyOptions] = useState<any[]>([]);
    const [bBrgyOptions, setBBrgyOptions] = useState<any[]>([]);

    // Birth Place Options
    const [gBirthTownOptions, setGBirthTownOptions] = useState<any[]>([]);
    const [bBirthTownOptions, setBBirthTownOptions] = useState<any[]>([]);
    const [gBirthBrgyOptions, setGBirthBrgyOptions] = useState<any[]>([]);
    const [bBirthBrgyOptions, setBBirthBrgyOptions] = useState<any[]>([]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationCode, setApplicationCode] = useState("");
    const [loading, setLoading] = useState(false);

    const [gSameAsAddress, setGSameAsAddress] = useState(true);
    const [bSameAsAddress, setBSameAsAddress] = useState(true);

    const [showClearAlert, setShowClearAlert] = useState(false);

    useEffect(() => {
        // Fetch all provinces across all regions and deduplicate
        regions().then(async (regs: any) => {
            const allProvs = await Promise.all(regs.map((r: any) => provinces(r.region_code)));
            const flatProvs = allProvs.flat();

            // Deduplicate by province_code
            const uniqueProvs = Array.from(
                new Map(flatProvs.map((p: any) => [p.province_code, p])).values()
            );

            setProvincesList(uniqueProvs.sort((a, b) => a.province_name.localeCompare(b.province_name)));
        });

        cities(NUEVA_VIZCAYA_CODE).then((res: any) => setTownOptions(res));
    }, []);

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
        setTownOptions(res);
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
                newData[`${prefix}BirthPlace`] = `${brgyName}, ${town}, ${prov}`;
            }

            return newData;
        });
    };

    const handleBirthProvinceChange = async (prefix: 'g' | 'b', provinceCode: string, provinceName: string) => {
        const res = await cities(provinceCode);
        if (prefix === 'g') {
            setGBirthTownOptions(res);
            setGBirthBrgyOptions([]);
        } else {
            setBBirthTownOptions(res);
            setBBirthBrgyOptions([]);
        }
        setFormData(prev => ({ ...prev, [`${prefix}BirthPlace`]: provinceName }));
    };

    const handleBirthTownChange = async (prefix: 'g' | 'b', cityCode: string, cityName: string, provinceName: string) => {
        const res = await barangays(cityCode);
        if (prefix === 'g') setGBirthBrgyOptions(res);
        else setBBirthBrgyOptions(res);

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

        const fullAddress = `${brgy}, ${town}, ${prov}`;
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
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MARRIAGE_APPLICATION_${applicationCode}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (e) {
            alert("Error generating excel.");
        } finally {
            setLoading(false);
        }
    };

    return {
        formData,
        setFormData,
        townOptions,
        provincesList,
        gBrgyOptions,
        bBrgyOptions,
        gBirthTownOptions,
        bBirthTownOptions,
        gBirthBrgyOptions,
        bBirthBrgyOptions,
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
    };
}
