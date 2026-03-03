import { Field } from "./FormComponents";

interface AddressSectionProps {
    prefix: 'g' | 'b';
    provincesList: any[];
    gTownOptions?: any[];
    bTownOptions?: any[];
    townOptions?: any[]; // legacy
    brgyOptions: any[];
    formData: any;

    handleProvinceChange: (prefix: 'g' | 'b', provinceCode: string, provinceName: string) => void;
    handleTownChange: (prefix: 'g' | 'b', cityCode: string, cityName: string) => void;
    handleBrgyChange: (prefix: 'g' | 'b', brgyName: string) => void;
}

export function AddressSection({
    prefix,
    provincesList,
    gTownOptions = [],
    bTownOptions = [],
    townOptions = [],
    brgyOptions,
    formData,
    handleProvinceChange,
    handleTownChange,
    handleBrgyChange
}: AddressSectionProps) {
    const currentTownOptions = prefix === 'g' ? gTownOptions : bTownOptions;
    // Fallback to legacy townOptions if specific ones aren't provided
    const finalTownOptions = currentTownOptions.length > 0 ? currentTownOptions : townOptions;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <Field label="Province" required>
                <select
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={provincesList.find(p => p.province_name === formData[`${prefix}Prov`])?.province_code || ""}
                    onChange={(e) => {
                        const prov = provincesList.find(p => p.province_code === e.target.value);
                        handleProvinceChange(prefix, e.target.value, prov?.province_name || "");
                    }}
                >
                    <option value="" disabled hidden>Select Province</option>
                    {provincesList.map((p, idx) => (
                        <option key={`${prefix}prov-${p.province_code}-${idx}`} value={p.province_code}>
                            {p.province_name}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Town/Municipality" required>
                <select
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={finalTownOptions.find((t: any) => t.city_name === formData[`${prefix}Town`])?.city_code || ""}
                    onChange={(e) => {
                        const town = finalTownOptions.find((t: any) => t.city_code === e.target.value);
                        handleTownChange(prefix, e.target.value, town?.city_name || "");
                    }}
                >
                    <option value="" disabled hidden>Select Town</option>
                    {finalTownOptions.map((t: any) => (
                        <option key={t.city_code} value={t.city_code}>{t.city_name}</option>
                    ))}
                </select>
            </Field>
            <Field label="Barangay" required>
                <select
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                    value={formData[`${prefix}Brgy`]}
                    disabled={!brgyOptions.length}
                    onChange={(e) => handleBrgyChange(prefix, e.target.value)}
                >
                    <option value="" disabled hidden>Select Barangay</option>
                    {brgyOptions.map((b: any) => (
                        <option key={b.brgy_code} value={b.brgy_name}>{b.brgy_name}</option>
                    ))}
                </select>
            </Field>
        </div>
    );
}

