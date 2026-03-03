import { Field } from "./FormComponents";

interface BirthPlaceSectionProps {
    prefix: 'g' | 'b';
    sameAsAddress: boolean;
    setSameAsAddress: (value: boolean) => void;
    formData: any;
    setFormData: (data: any) => void;
    provincesList: any[];
    birthTownOptions: any[];
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
                        const place = `${formData[`${prefix}Town`]}, ${formData[`${prefix}Prov`]}`;
                        setFormData((prev: any) => ({ ...prev, [`${prefix}BirthPlace`]: place }));
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                    <Field label="Birth Province">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={provincesList.find(p => p.province_name === formData[`${prefix}BirthPlace`].split(',').pop()?.trim())?.province_code || ""}
                            onChange={(e) => {
                                const prov = provincesList.find(p => p.province_code === e.target.value);
                                handleBirthProvinceChange(prefix, e.target.value, prov?.province_name || "");
                            }}
                        >
                            <option value="" disabled>Select Province</option>
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
                            value={birthTownOptions.find(t => t.city_name === formData[`${prefix}BirthPlace`].split(',')[0]?.trim())?.city_code || ""}
                            onChange={(e) => {
                                const town = birthTownOptions.find(t => t.city_code === e.target.value);
                                const parts = formData[`${prefix}BirthPlace`].split(',');
                                const prov = parts[parts.length - 1]?.trim() || "";
                                handleBirthTownChange(prefix, e.target.value, town?.city_name || "", prov);
                            }}
                        >
                            <option value="" disabled>Select Town</option>
                            {birthTownOptions.map(t => (
                                <option key={t.city_code} value={t.city_code}>{t.city_name}</option>
                            ))}
                        </select>
                    </Field>
                </div>
            )}
        </div>
    );
}
