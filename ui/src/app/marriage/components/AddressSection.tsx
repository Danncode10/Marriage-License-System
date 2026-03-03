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
        <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Current Address</h3>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
    );
}
