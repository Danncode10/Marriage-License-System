import { Field } from "./FormComponents";

interface BirthPlaceSectionProps {
    prefix: 'g' | 'b';
    sameAsAddress: boolean;
    setSameAsAddress: (value: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    provincesList: any[];
    birthTownOptions: any[];
    birthBrgyOptions: any[];
    handleBirthProvinceChange: (prefix: 'g' | 'b', provinceCode: string, provinceName: string) => void;
    handleBirthTownChange: (prefix: 'g' | 'b', cityCode: string, cityName: string, provinceName: string) => void;
}

export function BirthPlaceSection({
    prefix,
    sameAsAddress,
    setSameAsAddress,
    formData,
    setFormData,
    provincesList,
    birthTownOptions,
    birthBrgyOptions,
    handleBirthProvinceChange,
    handleBirthTownChange
}: BirthPlaceSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-tight">Place of Birth</label>
            </div>

            <div className="flex bg-slate-100/80 p-1 rounded-xl w-full border border-slate-200/50">
                <button
                    type="button"
                    onClick={() => {
                        setSameAsAddress(true);
                        const place = `${formData[`${prefix}Brgy`] ? formData[`${prefix}Brgy`] + ', ' : ''}${formData[`${prefix}Town`]}, ${formData[`${prefix}Prov`]}`;
                        setFormData(prev => ({ ...prev, [`${prefix}BirthPlace`]: place }));
                    }}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${sameAsAddress ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${sameAsAddress ? 'bg-primary' : 'bg-slate-300'}`} />
                    SAME AS ADDRESS
                </button>
                <button
                    type="button"
                    onClick={() => setSameAsAddress(false)}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${!sameAsAddress ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${!sameAsAddress ? 'bg-primary' : 'bg-slate-300'}`} />
                    DIFFERENT ADDRESS
                </button>
            </div>

            {sameAsAddress ? (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-xs font-medium text-primary/70 mb-1 flex items-center gap-2">
                        <span className="w-1 h-1 bg-primary rounded-full" />
                        Current Selection
                    </p>
                    <p className="text-sm font-bold text-slate-700">{formData[`${prefix}BirthPlace`] || "Select address first..."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1">
                    <Field label="Birth Province">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            onChange={(e) => {
                                const prov = provincesList.find(p => p.province_code === e.target.value);
                                handleBirthProvinceChange(prefix, e.target.value, prov?.province_name || "");
                            }}
                        >
                            <option value="" disabled hidden>Select Province</option>
                            {provincesList.map((p, idx) => (
                                <option key={`${prefix}birth-${p.province_code}-${idx}`} value={p.province_code}>
                                    {p.province_name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Birth Town">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                            disabled={!birthTownOptions.length}
                            onChange={(e) => {
                                const town = birthTownOptions.find(t => t.city_code === e.target.value);
                                const parts = formData[`${prefix}BirthPlace`].split(',');
                                const prov = parts[parts.length - 1]?.trim() || "";
                                handleBirthTownChange(prefix, e.target.value, town?.city_name || "", prov);
                            }}
                        >
                            <option value="" disabled hidden>Select Town</option>
                            {birthTownOptions.map(t => (
                                <option key={t.city_code} value={t.city_code}>{t.city_name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Birth Barangay">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                            disabled={!birthBrgyOptions.length}
                            onChange={(e) => {
                                const parts = formData[`${prefix}BirthPlace`].split(',');
                                const townName = parts.length >= 2 ? parts[parts.length - 2].trim() : "";
                                const prov = parts[parts.length - 1]?.trim() || "";
                                setFormData({ ...formData, [`${prefix}BirthPlace`]: `${e.target.value}, ${townName}, ${prov}` });
                            }}
                        >
                            <option value="" disabled hidden>Select Barangay</option>
                            {birthBrgyOptions.map(b => (
                                <option key={b.brgy_code} value={b.brgy_name}>{b.brgy_name}</option>
                            ))}
                        </select>
                    </Field>
                </div>
            )}
        </div>
    );
}
