import { Field } from "./FormComponents";
import { Input } from "@/components/ui/input";

interface AddressSectionProps {
    prefix: 'g' | 'b';
    provincesList: any[];
    gTownOptions?: any[];
    bTownOptions?: any[];
    townOptions?: any[]; // legacy
    brgyOptions: any[];
    formData: any;
    setFormData?: (data: any) => void;

    handleProvinceChange: (prefix: 'g' | 'b', provinceCode: string, provinceName: string) => void;
    handleTownChange: (prefix: 'g' | 'b', cityCode: string, cityName: string) => void;
    handleBrgyChange: (prefix: 'g' | 'b', brgyName: string) => void;
    countryOptions?: string[];
}

export function AddressSection({
    prefix,
    provincesList,
    gTownOptions = [],
    bTownOptions = [],
    townOptions = [],
    brgyOptions,
    formData,
    setFormData,
    handleProvinceChange,
    handleTownChange,
    handleBrgyChange,
    countryOptions = []
}: AddressSectionProps) {
    const currentTownOptions = prefix === 'g' ? gTownOptions : bTownOptions;
    const finalTownOptions = currentTownOptions.length > 0 ? currentTownOptions : townOptions;

    const isForeigner = !!formData[`${prefix}IsForeigner`];
    const currentCountry = formData[`${prefix}Country`] || "Philippines";
    const isPhilippines = currentCountry === "Philippines";

    const updateFormData = (key: string, value: any) => {
        setFormData?.((prev: any) => ({ ...prev, [key]: value }));
    };

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

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:bg-primary checked:border-primary focus:outline-none"
                            checked={isForeigner}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData?.((prev: any) => ({
                                    ...prev,
                                    [`${prefix}IsForeigner`]: checked,
                                    [`${prefix}Country`]: checked ? (prev[`${prefix}Country`] === "Philippines" ? "" : prev[`${prefix}Country`]) : "Philippines",
                                    [`${prefix}Prov`]: checked ? "" : prev[`${prefix}Prov`],
                                    [`${prefix}Town`]: checked ? "" : prev[`${prefix}Town`],
                                    [`${prefix}Brgy`]: checked ? "" : prev[`${prefix}Brgy`],
                                }));
                            }}
                        />
                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wide group-hover:text-primary transition-colors">
                        Are you a foreigner? (Not filipino)
                    </span>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1">
                {isForeigner && (
                    <Field label="Country" required>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={currentCountry}
                            onChange={(e) => updateFormData(`${prefix}Country`, e.target.value)}
                        >
                            <option value="" disabled hidden>Select Country</option>
                            {countryOptions.map((c) => (
                                <option key={`addr-country-${c}`} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>
                )}

                {isPhilippines ? (
                    <>
                        <Field label="Province" required className={!isForeigner ? "md:col-start-1" : ""}>
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
                    </>
                ) : (
                    <>
                        <Field label="Province" required>
                            <Input
                                placeholder="Type province/state"
                                className="bg-white"
                                value={formData[`${prefix}Prov`] || ""}
                                onChange={(e) => updateFormData(`${prefix}Prov`, e.target.value)}
                            />
                        </Field>
                        <Field label="Town/Municipality" required>
                            <Input
                                placeholder="Type town/municipality"
                                className="bg-white"
                                value={formData[`${prefix}Town`] || ""}
                                onChange={(e) => updateFormData(`${prefix}Town`, e.target.value)}
                            />
                        </Field>
                        <Field label="Barangay" required={!isForeigner}>
                            <Input
                                placeholder="Type barangay/district"
                                className="bg-white"
                                value={formData[`${prefix}Brgy`] || ""}
                                onChange={(e) => updateFormData(`${prefix}Brgy`, e.target.value)}
                            />
                        </Field>
                    </>
                )}
            </div>
        </div>
    );
}
