"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Copy, FileText, GraduationCap, Heart, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
// @ts-ignore
import { barangays, cities, provinces, regions } from "select-philippines-address";

const NUEVA_VIZCAYA_CODE = "0250";

const RELIGIONS = [
    "Roman Catholic", "Islam", "Iglesia ni Cristo", "Seventh-day Adventist",
    "Bible Baptist Church", "Jehovah's Witnesses", "United Church of Christ in the Philippines",
    "Pentecostal", "Evangelical", "Aglipayan", "Latter-day Saints", "None",
];

const INITIAL_FORM_STATE = {
    gFirst: "", gMiddle: "", gLast: "", gBday: "", gAge: 0,
    gBirthPlace: "", gBrgy: "", gTown: "", gProv: "Nueva Vizcaya", gCountry: "Philippines",
    gCitizen: "FILIPINO", gStatus: "SINGLE", gReligion: "",
    gFathF: "", gFathM: "", gFathL: "",
    gMothF: "", gMothM: "", gMothL: "",
    gGiverF: "", gGiverM: "", gGiverL: "", gGiverRelation: "",

    bFirst: "", bMiddle: "", bLast: "", bBday: "", bAge: 0,
    bBirthPlace: "", bBrgy: "", bTown: "", bProv: "Nueva Vizcaya", bCountry: "Philippines",
    bCitizen: "FILIPINO", bStatus: "SINGLE", bReligion: "",
    bFathF: "", bFathM: "", bFathL: "",
    bMothF: "", bMothM: "", bMothL: "",
    bGiverF: "", bGiverM: "", bGiverL: "", bGiverRelation: "",
};

export default function MarriageForm() {
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

    // State for Clear Form Warning
    const [showClearAlert, setShowClearAlert] = useState(false);

    const toTitleCase = (str: string) => {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    useEffect(() => {
        // Fetch all provinces across all regions
        regions().then(async (regs: any) => {
            const allProvs = await Promise.all(regs.map((r: any) => provinces(r.region_code)));
            setProvincesList(allProvs.flat().sort((a, b) => a.province_name.localeCompare(b.province_name)));
        });

        cities(NUEVA_VIZCAYA_CODE).then((res: any) => setTownOptions(res));
    }, []);

    const calculateAge = (birthDateString: string): number => {
        if (!birthDateString) return 0;
        const today = new Date();
        const birthDate = new Date(birthDateString);
        if (isNaN(birthDate.getTime())) return 0;
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age >= 0 ? age : 0;
    };

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

            // If "same as address" is active, update birth place with the new barangay
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
            a.click(); a.remove();
        } catch (e) { alert("Error generating excel."); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <datalist id="religion-list">
                {RELIGIONS.map((rel) => <option key={rel} value={rel} />)}
            </datalist>

            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-medium">
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Heart className="w-5 h-5 fill-current" /></div>
                        <span className="font-bold tracking-tight text-slate-900">Marriage Portal</span>
                    </div>
                    <div className="w-20"></div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 mt-12">
                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight italic">Marriage License Application</h1>
                                <p className="text-slate-500 mt-3 text-lg">Make sure that all data you entered is correct!</p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setApplicationCode(`${Math.floor(1000 + Math.random() * 9000)}`);
                                setIsSubmitted(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} className="space-y-8">

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* GROOM SECTION */}
                                    <SectionCard title="Groom's Information" color="blue">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Field label="First Name"><Input placeholder="Juan" className="bg-white" value={formData.gFirst} onChange={e => setFormData({ ...formData, gFirst: toTitleCase(e.target.value) })} /></Field>
                                            <Field label="Middle Name"><Input placeholder="Dela" className="bg-white" value={formData.gMiddle} onChange={e => setFormData({ ...formData, gMiddle: toTitleCase(e.target.value) })} /></Field>
                                            <Field label="Last Name"><Input placeholder="Cruz" className="bg-white" value={formData.gLast} onChange={e => setFormData({ ...formData, gLast: toTitleCase(e.target.value) })} /></Field>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <Field label="Birthday">
                                                <Input type="date" className="bg-white" value={formData.gBday} onChange={e => {
                                                    const b = e.target.value;
                                                    setFormData({ ...formData, gBday: b, gAge: calculateAge(b) });
                                                }} />
                                            </Field>
                                            <Field label="Age">
                                                <Input type="number" className="bg-white font-bold text-primary" value={formData.gAge || ""} onChange={e => handleAgeChange('g', e.target.value)} />
                                            </Field>
                                            <Field label="Religion" className="col-span-2 md:col-span-1">
                                                <Input list="religion-list" placeholder="Select..." className="bg-white" value={formData.gReligion} onChange={e => setFormData({ ...formData, gReligion: e.target.value })} />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                                            <Field label="Province">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={provincesList.find(p => p.province_name === formData.gProv)?.province_code || ""} onChange={(e) => { const prov = provincesList.find(p => p.province_code === e.target.value); handleProvinceChange('g', e.target.value, prov?.province_name || ""); }}>
                                                    <option value="" disabled hidden>Select Province</option>
                                                    {provincesList.map(p => <option key={p.province_code} value={p.province_code}>{p.province_name}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Town/Municipality">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={townOptions.find(t => t.city_name === formData.gTown)?.city_code || ""} onChange={(e) => { const town = townOptions.find(t => t.city_code === e.target.value); handleTownChange('g', e.target.value, town?.city_name || ""); }}>
                                                    <option value="" disabled hidden>Select Town</option>
                                                    {townOptions.map(t => <option key={t.city_code} value={t.city_code}>{t.city_name}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Barangay">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none" value={formData.gBrgy} disabled={!gBrgyOptions.length} onChange={(e) => handleBrgyChange('g', e.target.value)}>
                                                    <option value="" disabled hidden>Select Barangay</option>
                                                    {gBrgyOptions.map(b => <option key={b.brgy_code} value={b.brgy_name}>{b.brgy_name}</option>)}
                                                </select>
                                            </Field>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-tight">Place of Birth</label>
                                            </div>

                                            <div className="flex bg-slate-100/80 p-1 rounded-xl w-full border border-slate-200/50">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setGSameAsAddress(true);
                                                        const place = `${formData.gBrgy ? formData.gBrgy + ', ' : ''}${formData.gTown}, ${formData.gProv}`;
                                                        setFormData(prev => ({ ...prev, gBirthPlace: place }));
                                                    }}
                                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${gSameAsAddress ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${gSameAsAddress ? 'bg-primary' : 'bg-slate-300'}`} />
                                                    SAME AS ADDRESS
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setGSameAsAddress(false)}
                                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${!gSameAsAddress ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${!gSameAsAddress ? 'bg-primary' : 'bg-slate-300'}`} />
                                                    DIFFERENT ADDRESS
                                                </button>
                                            </div>

                                            {gSameAsAddress ? (
                                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in zoom-in-95 duration-300">
                                                    <p className="text-xs font-medium text-primary/70 mb-1 flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-primary rounded-full" />
                                                        Current Selection
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-700">{formData.gBirthPlace || "Select address first..."}</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1">
                                                    <Field label="Birth Province">
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                            onChange={(e) => {
                                                                const prov = provincesList.find(p => p.province_code === e.target.value);
                                                                handleBirthProvinceChange('g', e.target.value, prov?.province_name || "");
                                                            }}
                                                        >
                                                            <option value="" disabled hidden>Select Province</option>
                                                            {provincesList.map(p => <option key={p.province_code} value={p.province_code}>{p.province_name}</option>)}
                                                        </select>
                                                    </Field>
                                                    <Field label="Birth Town">
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                                                            disabled={!gBirthTownOptions.length}
                                                            onChange={(e) => {
                                                                const town = gBirthTownOptions.find(t => t.city_code === e.target.value);
                                                                const parts = formData.gBirthPlace.split(',');
                                                                const prov = parts[parts.length - 1]?.trim() || "";
                                                                handleBirthTownChange('g', e.target.value, town?.city_name || "", prov);
                                                            }}
                                                        >
                                                            <option value="" disabled hidden>Select Town</option>
                                                            {gBirthTownOptions.map(t => <option key={t.city_code} value={t.city_code}>{t.city_name}</option>)}
                                                        </select>
                                                    </Field>
                                                    <Field label="Birth Barangay">
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                                                            disabled={!gBirthBrgyOptions.length}
                                                            onChange={(e) => {
                                                                const parts = formData.gBirthPlace.split(',');
                                                                const townName = parts.length >= 2 ? parts[parts.length - 2].trim() : "";
                                                                const prov = parts[parts.length - 1]?.trim() || "";
                                                                setFormData({ ...formData, gBirthPlace: `${e.target.value}, ${townName}, ${prov}` });
                                                            }}
                                                        >
                                                            <option value="" disabled hidden>Select Barangay</option>
                                                            {gBirthBrgyOptions.map(b => <option key={b.brgy_code} value={b.brgy_name}>{b.brgy_name}</option>)}
                                                        </select>
                                                    </Field>
                                                </div>
                                            )}
                                        </div>

                                        <FamilySubSection prefix="g" person="Groom" data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                        <GiverSubSection prefix="g" age={formData.gAge} data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                    </SectionCard>

                                    {/* BRIDE SECTION */}
                                    <SectionCard title="Bride's Information" color="yellow">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Field label="First Name"><Input placeholder="Maria" className="bg-white" value={formData.bFirst} onChange={e => setFormData({ ...formData, bFirst: toTitleCase(e.target.value) })} /></Field>
                                            <Field label="Middle Name"><Input placeholder="Clara" className="bg-white" value={formData.bMiddle} onChange={e => setFormData({ ...formData, bMiddle: toTitleCase(e.target.value) })} /></Field>
                                            <Field label="Last Name"><Input placeholder="Santos" className="bg-white" value={formData.bLast} onChange={e => setFormData({ ...formData, bLast: toTitleCase(e.target.value) })} /></Field>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <Field label="Birthday">
                                                <Input type="date" className="bg-white" value={formData.bBday} onChange={e => {
                                                    const b = e.target.value;
                                                    setFormData({ ...formData, bBday: b, bAge: calculateAge(b) });
                                                }} />
                                            </Field>
                                            <Field label="Age">
                                                <Input type="number" className="bg-white font-bold text-primary" value={formData.bAge || ""} onChange={e => handleAgeChange('b', e.target.value)} />
                                            </Field>
                                            <Field label="Religion" className="col-span-2 md:col-span-1">
                                                <Input list="religion-list" placeholder="Select..." className="bg-white" value={formData.bReligion} onChange={e => setFormData({ ...formData, bReligion: e.target.value })} />
                                            </Field>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                                            <Field label="Province">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={provincesList.find(p => p.province_name === formData.bProv)?.province_code || ""} onChange={(e) => { const prov = provincesList.find(p => p.province_code === e.target.value); handleProvinceChange('b', e.target.value, prov?.province_name || ""); }}>
                                                    <option value="" disabled hidden>Select Province</option>
                                                    {provincesList.map(p => <option key={p.province_code} value={p.province_code}>{p.province_name}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Town/Municipality">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" value={townOptions.find(t => t.city_name === formData.bTown)?.city_code || ""} onChange={(e) => { const town = townOptions.find(t => t.city_code === e.target.value); handleTownChange('b', e.target.value, town?.city_name || ""); }}>
                                                    <option value="" disabled hidden>Select Town</option>
                                                    {townOptions.map(t => <option key={t.city_code} value={t.city_code}>{t.city_name}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Barangay">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none" value={formData.bBrgy} disabled={!bBrgyOptions.length} onChange={(e) => handleBrgyChange('b', e.target.value)}>
                                                    <option value="" disabled hidden>Select Barangay</option>
                                                    {bBrgyOptions.map(b => <option key={b.brgy_code} value={b.brgy_name}>{b.brgy_name}</option>)}
                                                </select>
                                            </Field>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-tight">Place of Birth</label>
                                            </div>

                                            <div className="flex bg-slate-100/80 p-1 rounded-xl w-full border border-slate-200/50">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBSameAsAddress(true);
                                                        const place = `${formData.bBrgy ? formData.bBrgy + ', ' : ''}${formData.bTown}, ${formData.bProv}`;
                                                        setFormData(prev => ({ ...prev, bBirthPlace: place }));
                                                    }}
                                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${bSameAsAddress ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${bSameAsAddress ? 'bg-primary' : 'bg-slate-300'}`} />
                                                    SAME AS ADDRESS
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setBSameAsAddress(false)}
                                                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-2 ${!bSameAsAddress ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    <div className={`w-2 h-2 rounded-full ${!bSameAsAddress ? 'bg-primary' : 'bg-slate-300'}`} />
                                                    DIFFERENT ADDRESS
                                                </button>
                                            </div>

                                            {bSameAsAddress ? (
                                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 animate-in fade-in zoom-in-95 duration-300">
                                                    <p className="text-xs font-medium text-primary/70 mb-1 flex items-center gap-2">
                                                        <span className="w-1 h-1 bg-primary rounded-full" />
                                                        Current Selection
                                                    </p>
                                                    <p className="text-sm font-bold text-slate-700">{formData.bBirthPlace || "Select address first..."}</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-1">
                                                    <Field label="Birth Province">
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                            onChange={(e) => {
                                                                const prov = provincesList.find(p => p.province_code === e.target.value);
                                                                handleBirthProvinceChange('b', e.target.value, prov?.province_name || "");
                                                            }}
                                                        >
                                                            <option value="" disabled hidden>Select Province</option>
                                                            {provincesList.map(p => <option key={p.province_code} value={p.province_code}>{p.province_name}</option>)}
                                                        </select>
                                                    </Field>
                                                    <Field label="Birth Town">
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                                                            disabled={!bBirthTownOptions.length}
                                                            onChange={(e) => {
                                                                const town = bBirthTownOptions.find(t => t.city_code === e.target.value);
                                                                const parts = formData.bBirthPlace.split(',');
                                                                const prov = parts[parts.length - 1]?.trim() || "";
                                                                handleBirthTownChange('b', e.target.value, town?.city_name || "", prov);
                                                            }}
                                                        >
                                                            <option value="" disabled hidden>Select Town</option>
                                                            {bBirthTownOptions.map(t => <option key={t.city_code} value={t.city_code}>{t.city_name}</option>)}
                                                        </select>
                                                    </Field>
                                                    <Field label="Birth Barangay">
                                                        <select
                                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50 focus:ring-2 focus:ring-primary outline-none"
                                                            disabled={!bBirthBrgyOptions.length}
                                                            onChange={(e) => {
                                                                const parts = formData.bBirthPlace.split(',');
                                                                const townName = parts.length >= 2 ? parts[parts.length - 2].trim() : "";
                                                                const prov = parts[parts.length - 1]?.trim() || "";
                                                                setFormData({ ...formData, bBirthPlace: `${e.target.value}, ${townName}, ${prov}` });
                                                            }}
                                                        >
                                                            <option value="" disabled hidden>Select Barangay</option>
                                                            {bBirthBrgyOptions.map(b => <option key={b.brgy_code} value={b.brgy_name}>{b.brgy_name}</option>)}
                                                        </select>
                                                    </Field>
                                                </div>
                                            )}
                                        </div>

                                        <FamilySubSection prefix="b" person="Bride" data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                        <GiverSubSection prefix="b" age={formData.bAge} data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                    </SectionCard>
                                </div>

                                {/* Form Action Footer */}
                                <div className="flex flex-col items-center gap-6 pt-8">
                                    <Button type="submit" size="lg" className="h-16 px-12 text-lg font-bold group rounded-2xl shadow-xl shadow-primary/20">
                                        Review Application <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => setShowClearAlert(true)}
                                        className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-widest"
                                    >
                                        <Trash2 className="w-4 h-4" /> Clear Form
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                            <Card className="p-12 text-center shadow-2xl border-none rounded-[2rem]">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <FileText className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">System Validated</h2>
                                <p className="text-slate-500 mb-8 font-medium">Application ID Generated</p>
                                <div className="bg-slate-50 px-8 py-6 rounded-3xl mb-10 border border-slate-100 shadow-inner">
                                    <span className="text-6xl font-black text-primary tracking-tighter">{applicationCode}</span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Button onClick={generateExcel} disabled={loading} size="lg" variant="secondary" className="h-16 w-full text-xl shadow-xl rounded-2xl">
                                        {loading ? "Exporting Data..." : "Download Excel Pack"}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setIsSubmitted(false)} className="h-12 hover:bg-slate-50 rounded-xl">Edit Information</Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Clear Form Confirmation Modal */}
            <AnimatePresence>
                {showClearAlert && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowClearAlert(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center border border-slate-100"
                        >
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Clear Form?</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">Are you sure? This will permanently delete all the information you have entered.</p>

                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="primary"
                                    onClick={handleReset}
                                    className="h-14 rounded-2xl font-bold text-lg shadow-lg bg-red-600 hover:bg-red-700 text-white shadow-red-200"
                                >
                                    Yes, Clear Everything
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowClearAlert(false)}
                                    className="h-12 rounded-xl text-slate-500 font-medium hover:bg-slate-50"
                                >
                                    No, Keep My Data
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SectionCard({ title, color, children }: any) {
    const isBlue = color === 'blue';
    return (
        <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-slate-200/60 flex flex-col h-full bg-white rounded-[1.5rem]">
            <div className={`p-6 flex flex-col items-center justify-center border-b ${isBlue ? 'border-blue-100 bg-blue-50/50' : 'border-rose-100 bg-rose-50/50'}`}>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase text-center">
                    {title}
                </h2>
            </div>
            <div className="p-8 space-y-6 flex-1">
                {children}
            </div>
        </Card>
    );
}

function FamilySubSection({ prefix, person, data, setData, toTitleCase }: any) {
    // Logic to check if Mother's Last Name matches Father's Last Name
    const isSameLastName =
        data[`${prefix}FathL`].trim() !== "" &&
        data[`${prefix}MothL`].trim() !== "" &&
        data[`${prefix}FathL`].toLowerCase() === data[`${prefix}MothL`].toLowerCase();

    return (
        <div className="space-y-6 pt-6 border-t border-slate-100">
            {/* Father Section */}
            <div>
                <LabelWithIcon icon={<GraduationCap className="w-3 h-3" />} text={`${person}'s Father`} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <Input placeholder="First Name" className="bg-white" value={data[`${prefix}FathF`]} onChange={e => setData({ ...data, [`${prefix}FathF`]: toTitleCase(e.target.value) })} />
                    <Input placeholder="Middle Name" className="bg-white" value={data[`${prefix}FathM`]} onChange={e => setData({ ...data, [`${prefix}FathM`]: toTitleCase(e.target.value) })} />
                    <Input placeholder="Last Name" className="bg-white" value={data[`${prefix}FathL`]} onChange={e => setData({ ...data, [`${prefix}FathL`]: toTitleCase(e.target.value) })} />
                </div>
            </div>

            {/* Mother Section */}
            <div>
                <div className="flex justify-between items-center">
                    <LabelWithIcon icon={<GraduationCap className="w-3 h-3" />} text={`${person}'s Mother`} />
                    <span className="text-[9px] font-bold text-rose-500 italic bg-rose-50 px-2 py-0.5 rounded-full">MAIDEN NAME REQUIRED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <Input placeholder="First Name" className="bg-white" value={data[`${prefix}MothF`]} onChange={e => setData({ ...data, [`${prefix}MothF`]: toTitleCase(e.target.value) })} />
                    <Input placeholder="Middle Name" className="bg-white" value={data[`${prefix}MothM`]} onChange={e => setData({ ...data, [`${prefix}MothM`]: toTitleCase(e.target.value) })} />
                    <Input
                        placeholder="Maiden Last Name"
                        className={`bg-white transition-colors ${isSameLastName ? 'border-orange-400 ring-2 ring-orange-100' : ''}`}
                        value={data[`${prefix}MothL`]}
                        onChange={e => setData({ ...data, [`${prefix}MothL`]: toTitleCase(e.target.value) })}
                    />
                </div>

                {/* Visual Notification */}
                <AnimatePresence>
                    {isSameLastName && (
                        <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-[11px] text-orange-600 font-medium mt-2 flex items-center gap-1 bg-orange-50 p-2 rounded-lg border border-orange-100"
                        >
                            <span className="text-base">⚠️</span>
                            Please enter the Mother's <strong>Maiden Name</strong> (her last name before marriage), not her married name.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function GiverSubSection({ prefix, age, data, setData }: any) {
    if (!age || age < 18 || age > 24) return null;
    const label = age <= 20 ? "CONSENT" : "ADVICE";

    return (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-slate-100">
            <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                <LabelWithIcon icon={<FileText className="w-3 h-3 text-primary" />} text={`PERSON GIVING ${label}`} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="First Name" value={data[`${prefix}GiverF`]} onChange={e => setData({ ...data, [`${prefix}GiverF`]: e.target.value })} />
                    <Input placeholder="Middle Name" value={data[`${prefix}GiverM`]} onChange={e => setData({ ...data, [`${prefix}GiverM`]: e.target.value })} />
                    <Input placeholder="Last Name" value={data[`${prefix}GiverL`]} onChange={e => setData({ ...data, [`${prefix}GiverL`]: e.target.value })} />
                </div>
                <Field label="Relationship (e.g. Father)">
                    <Input placeholder="Father" value={data[`${prefix}GiverRelation`]} onChange={e => setData({ ...data, [`${prefix}GiverRelation`]: e.target.value })} />
                </Field>
            </div>
        </motion.div>
    );
}

function LabelWithIcon({ icon, text }: any) {
    return <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{icon} {text}</div>;
}

function Field({ label, children, className }: any) {
    return <div className={`space-y-1.5 ${className}`}><label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-tight">{label}</label>{children}</div>;
}