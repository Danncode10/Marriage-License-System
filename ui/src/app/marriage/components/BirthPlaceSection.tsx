import { Input } from "@/components/ui/input";
import { Field } from "./FormComponents";

interface BirthPlaceSectionProps {
    prefix: 'g' | 'b';
    sameAsAddress: boolean | null;
    setSameAsAddress: (value: boolean | null) => void;
    formData: any;
    setFormData: (data: any) => void;
    provincesList: any[];
    birthTownOptions: any[];
    countryOptions: string[];
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
    countryOptions,
    handleBirthProvinceChange,
    handleBirthTownChange
}: BirthPlaceSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2 px-1">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Place of Birth</h3>
                </div>
            </div>

            <div className="flex bg-slate-100/80 p-1 rounded-xl w-full border border-slate-200/50">
                <button
                    type="button"
                    onClick={() => {
                        setSameAsAddress(true);
                        const place = `${formData[`${prefix}Town`]}, ${formData[`${prefix}Prov`]}`;
                        const country = formData[`${prefix}Country`] || "Philippines";
                        setFormData((prev: any) => ({ ...prev, [`${prefix}BirthPlace`]: place, [`${prefix}BirthCountry`]: country }));
                    }}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${sameAsAddress === true ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${sameAsAddress === true ? 'bg-primary' : 'bg-slate-300'}`} />
                    SAME AS ADDRESS
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setSameAsAddress(false);
                        setFormData((prev: any) => ({ ...prev, [`${prefix}BirthPlace`]: "", [`${prefix}BirthCountry`]: "Philippines" }));
                    }}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${sameAsAddress === false ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <div className={`w-2 h-2 rounded-full ${sameAsAddress === false ? 'bg-primary' : 'bg-slate-300'}`} />
                    DIFFERENT ADDRESS
                </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                <label className={`flex items-center gap-3 cursor-pointer group ${sameAsAddress ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:bg-primary checked:border-primary focus:outline-none disabled:cursor-not-allowed"
                            checked={formData[`${prefix}IsNotBornInPh`] === true}
                            disabled={sameAsAddress === true}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev: any) => ({
                                    ...prev,
                                    [`${prefix}IsNotBornInPh`]: checked,
                                    [`${prefix}BirthCountry`]: checked ? prev[`${prefix}BirthCountry`] : "Philippines"
                                }));
                            }}
                        />
                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wide group-hover:text-primary transition-colors">
                        Are you not born in the Philippines? {sameAsAddress === true && <span className="text-[10px] text-primary/50 normal-case font-bold">(Managed by Current Address)</span>}
                    </span>
                </label>
            </div>

            {sameAsAddress === true ? (
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-[10px] font-bold text-primary/70 mb-1 flex items-center gap-2 uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        Selected Birth Place (From Current Address)
                    </p>
                    <p className="text-sm font-black text-slate-700">{formData[`${prefix}BirthPlace`] || "Please select Current Address first..."}</p>
                    <p className="text-xs text-slate-500 mt-1">Country: {formData[`${prefix}BirthCountry`] || formData[`${prefix}Country`] || "Philippines"}</p>
                </div>
            ) : sameAsAddress === false ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1">
                    {!!formData[`${prefix}IsNotBornInPh`] && (
                        <Field label="Country" required>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                value={formData[`${prefix}BirthCountry`] || "Philippines"}
                                onChange={(e) => {
                                    const newCountry = e.target.value || "Philippines";
                                    setFormData((prev: any) => ({
                                        ...prev,
                                        [`${prefix}BirthCountry`]: newCountry,
                                        [`${prefix}BirthPlace`]: "",
                                    }));
                                }}
                            >
                                <option value="" disabled hidden>Select Country</option>
                                {countryOptions.map((c) => (
                                    <option key={`${prefix}birth-country-${c}`} value={c}>{c}</option>
                                ))}
                            </select>
                        </Field>
                    )}
                    {(formData[`${prefix}BirthCountry`] || "Philippines") === "Philippines" ? (
                        <>
                            <Field label="Province">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    value={(() => {
                                        const fullBirth = (formData[`${prefix}BirthPlace`] ?? "").toString().trim();
                                        if (!fullBirth) return "";
                                        const parts = fullBirth.split(',').map((s: string) => s.trim());
                                        const provName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
                                        if (!provName) return "";
                                        const found = provincesList.find(p => (p.province_name || "").trim() === provName);
                                        return found ? found.province_code : "";
                                    })()}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "" || val == null) return;
                                        const prov = provincesList.find(p => p.province_code === val);
                                        handleBirthProvinceChange(prefix, val, prov?.province_name || "");
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
                            <Field label="Municipality">
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                                    disabled={!birthTownOptions.length}
                                    value={(() => {
                                        const fullBirth = (formData[`${prefix}BirthPlace`] ?? "").toString().trim();
                                        if (!fullBirth) return "";
                                        const parts = fullBirth.split(',').map((s: string) => s.trim());
                                        if (parts.length < 2) return "";
                                        const cityName = parts[0];
                                        const found = birthTownOptions.find(t => {
                                            const n1 = (t.city_name || "").toLowerCase().replace(/\(capital\)/gi, "").trim();
                                            const n2 = cityName.toLowerCase().replace(/\(capital\)/gi, "").trim();
                                            return n1 === n2;
                                        });
                                        return found ? found.city_code : "";
                                    })()}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "" || val == null) return;
                                        const town = birthTownOptions.find(t => t.city_code === val);
                                        const parts = (formData[`${prefix}BirthPlace`] || "").split(',').map((s: string) => s.trim());
                                        const provName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
                                        handleBirthTownChange(prefix, val, town?.city_name || "", provName || "");
                                    }}
                                >
                                    <option value="" disabled hidden>Select Town</option>
                                    {birthTownOptions.map(t => (
                                        <option key={t.city_code} value={t.city_code}>{t.city_name}</option>
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
                                    value={(() => {
                                        const fullBirth = (formData[`${prefix}BirthPlace`] ?? "").toString();
                                        const commaIndex = fullBirth.indexOf(',');
                                        if (commaIndex === -1) return "";
                                        return fullBirth.substring(commaIndex + 1).trim();
                                    })()}
                                    onChange={(e) => {
                                        const prov = e.target.value;
                                        const fullBirth = (formData[`${prefix}BirthPlace`] || "").toString();
                                        const commaIndex = fullBirth.indexOf(',');
                                        const town = commaIndex !== -1 ? fullBirth.substring(0, commaIndex).trim() : fullBirth.trim();
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            [`${prefix}BirthPlace`]: `${town}, ${prov}`,
                                        }));
                                    }}
                                />
                            </Field>
                            <Field label="Municipality " required>
                                <Input
                                    placeholder="Type town/municipality"
                                    className="bg-white"
                                    value={(() => {
                                        const fullBirth = (formData[`${prefix}BirthPlace`] ?? "").toString();
                                        const commaIndex = fullBirth.indexOf(',');
                                        if (commaIndex === -1) return fullBirth.trim();
                                        return fullBirth.substring(0, commaIndex).trim();
                                    })()}
                                    onChange={(e) => {
                                        const town = e.target.value;
                                        const fullBirth = (formData[`${prefix}BirthPlace`] || "").toString();
                                        const commaIndex = fullBirth.indexOf(',');
                                        const prov = commaIndex !== -1 ? fullBirth.substring(commaIndex + 1).trim() : "";
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            [`${prefix}BirthPlace`]: `${town}, ${prov}`,
                                        }));
                                    }}
                                />
                            </Field>
                        </>
                    )}
                </div>
            ) : null}
        </div>
    );
}