"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, FileText, GraduationCap, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
// @ts-ignore
import { barangays, cities } from "select-philippines-address";

const NUEVA_VIZCAYA_CODE = "0250";

const RELIGIONS = [
    "Roman Catholic", "Islam", "Iglesia ni Cristo", "Seventh-day Adventist",
    "Bible Baptist Church", "Jehovah's Witnesses", "United Church of Christ in the Philippines",
    "Pentecostal", "Evangelical", "Aglipayan", "Latter-day Saints", "None",
];

export default function MarriageForm() {
    const [formData, setFormData] = useState({
        // GROOM variables
        gFirst: "", gMiddle: "", gLast: "", gBday: "", gAge: 0,
        gBirthPlace: "",
        gBrgy: "", gTown: "", gProv: "NUEVA VIZCAYA", gCountry: "PHILIPPINES",
        gCitizen: "FILIPINO", gStatus: "SINGLE", gReligion: "",
        gFathF: "", gFathM: "", gFathL: "",
        gMothF: "", gMothM: "", gMothL: "",
        gGiverF: "", gGiverM: "", gGiverL: "", gGiverRelation: "",

        // BRIDE variables
        bFirst: "", bMiddle: "", bLast: "", bBday: "", bAge: 0,
        bBirthPlace: "",
        bBrgy: "", bTown: "", bProv: "NUEVA VIZCAYA", bCountry: "PHILIPPINES",
        bCitizen: "FILIPINO", bStatus: "SINGLE", bReligion: "",
        bFathF: "", bFathM: "", bFathL: "",
        bMothF: "", bMothM: "", bMothL: "",
        bGiverF: "", bGiverM: "", bGiverL: "", bGiverRelation: "",
    });

    const [townOptions, setTownOptions] = useState<any[]>([]);
    const [gBrgyOptions, setGBrgyOptions] = useState<any[]>([]);
    const [bBrgyOptions, setBBrgyOptions] = useState<any[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationCode, setApplicationCode] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        cities(NUEVA_VIZCAYA_CODE).then((res: any) => setTownOptions(res));
    }, []);

    // Logic 1: Date -> Age
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

    // Logic 2: Age -> Date (Estimated)
    const handleAgeChange = (prefix: 'g' | 'b', ageValue: string) => {
        const age = parseInt(ageValue) || 0;
        const currentYear = new Date().getFullYear();
        const estimatedYear = currentYear - age;
        
        // Construct YYYY-MM-DD (defaults to January 1st of that year)
        const estimatedDate = `${estimatedYear}-01-01`;

        setFormData(prev => ({
            ...prev,
            [`${prefix}Age`]: age,
            [`${prefix}Bday`]: age > 0 ? estimatedDate : ""
        }));
    };

    const handleTownChange = async (prefix: 'g' | 'b', cityCode: string, cityName: string) => {
        setFormData(prev => ({ ...prev, [`${prefix}Town`]: cityName, [`${prefix}Brgy`]: "" }));
        const res = await barangays(cityCode);
        if (prefix === 'g') setGBrgyOptions(res);
        else setBBrgyOptions(res);
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
                        <span className="font-bold tracking-tight">Marriage Portal</span>
                    </div>
                    <div className="w-20"></div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 mt-12">
                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Marriage License Application</h1>
                                <p className="text-slate-500 mt-3 text-lg">Please fill out the form carefully.</p>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                setApplicationCode(`${Math.floor(1000 + Math.random() * 9000)}`);
                                setIsSubmitted(true);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} className="space-y-8">

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* GROOM SECTION */}
                                    <SectionCard title="Groom's Information" icon={<User className="w-5 h-5" />} color="blue">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Field label="First Name"><Input placeholder="Juan" value={formData.gFirst} onChange={e => setFormData({ ...formData, gFirst: e.target.value })} /></Field>
                                            <Field label="Middle Name"><Input placeholder="Dela" value={formData.gMiddle} onChange={e => setFormData({ ...formData, gMiddle: e.target.value })} /></Field>
                                            <Field label="Last Name"><Input placeholder="Cruz" value={formData.gLast} onChange={e => setFormData({ ...formData, gLast: e.target.value })} /></Field>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <Field label="Birthday">
                                                <Input type="date" value={formData.gBday} onChange={e => {
                                                    const b = e.target.value;
                                                    setFormData({ ...formData, gBday: b, gAge: calculateAge(b) });
                                                }} />
                                            </Field>
                                            <Field label="Age">
                                                <Input type="number" value={formData.gAge || ""} onChange={e => handleAgeChange('g', e.target.value)} />
                                            </Field>
                                            <Field label="Religion" className="col-span-2 md:col-span-1">
                                                <Input list="religion-list" placeholder="Select..." value={formData.gReligion} onChange={e => setFormData({ ...formData, gReligion: e.target.value })} />
                                            </Field>
                                        </div>
                                        <Field label="Place of Birth"><Input placeholder="Solano, NV" value={formData.gBirthPlace} onChange={e => setFormData({ ...formData, gBirthPlace: e.target.value })} /></Field>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Field label="Town">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm" value={townOptions.find(t => t.city_name === formData.gTown)?.city_code || ""} onChange={(e) => { const town = townOptions.find(t => t.city_code === e.target.value); handleTownChange('g', e.target.value, town?.city_name || ""); }}>
                                                    <option value="" disabled hidden>Select Town</option>
                                                    {townOptions.map(t => <option key={t.city_code} value={t.city_code}>{t.city_name}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Barangay">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50" value={formData.gBrgy} disabled={!gBrgyOptions.length} onChange={(e) => setFormData({ ...formData, gBrgy: e.target.value })}>
                                                    <option value="" disabled hidden>Select Barangay</option>
                                                    {gBrgyOptions.map(b => <option key={b.brgy_code} value={b.brgy_name}>{b.brgy_name}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                        <FamilySubSection prefix="g" person="Groom" data={formData} setData={setFormData} />
                                        <GiverSubSection prefix="g" age={formData.gAge} data={formData} setData={setFormData} />
                                    </SectionCard>

                                    {/* BRIDE SECTION */}
                                    <SectionCard title="Bride's Information" icon={<User className="w-5 h-5 text-zinc-900" />} color="yellow">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Field label="First Name"><Input placeholder="Maria" value={formData.bFirst} onChange={e => setFormData({ ...formData, bFirst: e.target.value })} /></Field>
                                            <Field label="Middle Name"><Input placeholder="Clara" value={formData.bMiddle} onChange={e => setFormData({ ...formData, bMiddle: e.target.value })} /></Field>
                                            <Field label="Last Name"><Input placeholder="Santos" value={formData.bLast} onChange={e => setFormData({ ...formData, bLast: e.target.value })} /></Field>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <Field label="Birthday">
                                                <Input type="date" value={formData.bBday} onChange={e => {
                                                    const b = e.target.value;
                                                    setFormData({ ...formData, bBday: b, bAge: calculateAge(b) });
                                                }} />
                                            </Field>
                                            <Field label="Age">
                                                <Input type="number" value={formData.bAge || ""} onChange={e => handleAgeChange('b', e.target.value)} />
                                            </Field>
                                            <Field label="Religion" className="col-span-2 md:col-span-1">
                                                <Input list="religion-list" placeholder="Select..." value={formData.bReligion} onChange={e => setFormData({ ...formData, bReligion: e.target.value })} />
                                            </Field>
                                        </div>
                                        <Field label="Place of Birth"><Input placeholder="Solano, NV" value={formData.bBirthPlace} onChange={e => setFormData({ ...formData, bBirthPlace: e.target.value })} /></Field>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Field label="Town">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm" value={townOptions.find(t => t.city_name === formData.bTown)?.city_code || ""} onChange={(e) => { const town = townOptions.find(t => t.city_code === e.target.value); handleTownChange('b', e.target.value, town?.city_name || ""); }}>
                                                    <option value="" disabled hidden>Select Town</option>
                                                    {townOptions.map(t => <option key={t.city_code} value={t.city_code}>{t.city_name}</option>)}
                                                </select>
                                            </Field>
                                            <Field label="Barangay">
                                                <select className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm disabled:opacity-50" value={formData.bBrgy} disabled={!bBrgyOptions.length} onChange={(e) => setFormData({ ...formData, bBrgy: e.target.value })}>
                                                    <option value="" disabled hidden>Select Barangay</option>
                                                    {bBrgyOptions.map(b => <option key={b.brgy_code} value={b.brgy_name}>{b.brgy_name}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                        <FamilySubSection prefix="b" person="Bride" data={formData} setData={setFormData} />
                                        <GiverSubSection prefix="b" age={formData.bAge} data={formData} setData={setFormData} />
                                    </SectionCard>
                                </div>

                                <div className="flex justify-center pt-8">
                                    <Button type="submit" size="lg" className="h-16 px-12 text-lg font-bold group">
                                        Confirm Details <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
                            <Card className="p-12 text-center shadow-2xl border-none">
                                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                    <FileText className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-2">Ready for Export</h2>
                                <div className="bg-slate-50 px-8 py-6 rounded-2xl mb-10 border border-slate-100">
                                    <span className="text-6xl font-black text-primary tracking-tighter">{applicationCode}</span>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <Button onClick={generateExcel} disabled={loading} size="lg" variant="secondary" className="h-16 w-full text-xl shadow-xl">
                                        {loading ? "Processing..." : "Download Excel Pack"}
                                    </Button>
                                    <Button variant="ghost" onClick={() => setIsSubmitted(false)} className="h-12 hover:bg-slate-50">Back to editor</Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

// --- Helper Components (SectionCard, FamilySubSection, etc. remain the same) ---

function SectionCard({ title, icon, color, children }: any) {
    const isBlue = color === 'blue';
    return (
        <Card className="p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50 flex flex-col h-full bg-white">
            <div className={`p-6 flex items-center gap-3 border-b-2 ${isBlue ? 'border-primary/20 bg-primary/5' : 'border-secondary/30 bg-secondary/10'}`}>
                <div className="p-2 bg-white rounded-xl shadow-sm">{icon}</div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight italic">{title}</h2>
            </div>
            <div className="p-8 space-y-8 flex-1">{children}</div>
        </Card>
    );
}

function FamilySubSection({ prefix, person, data, setData }: any) {
    return (
        <div className="space-y-6 pt-6 border-t border-slate-100">
            <div>
                <LabelWithIcon icon={<GraduationCap className="w-3 h-3" />} text={`${person}'s Father`} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <Input placeholder="First" value={data[`${prefix}FathF`]} onChange={e => setData({ ...data, [`${prefix}FathF`]: e.target.value })} />
                    <Input placeholder="Middle" value={data[`${prefix}FathM`]} onChange={e => setData({ ...data, [`${prefix}FathM`]: e.target.value })} />
                    <Input placeholder="Last" value={data[`${prefix}FathL`]} onChange={e => setData({ ...data, [`${prefix}FathL`]: e.target.value })} />
                </div>
            </div>
            <div>
                <LabelWithIcon icon={<GraduationCap className="w-3 h-3" />} text={`${person}'s Mother`} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <Input placeholder="First" value={data[`${prefix}MothF`]} onChange={e => setData({ ...data, [`${prefix}MothF`]: e.target.value })} />
                    <Input placeholder="Middle" value={data[`${prefix}MothM`]} onChange={e => setData({ ...data, [`${prefix}MothM`]: e.target.value })} />
                    <Input placeholder="Last" value={data[`${prefix}MothL`]} onChange={e => setData({ ...data, [`${prefix}MothL`]: e.target.value })} />
                </div>
            </div>
        </div>
    );
}

function GiverSubSection({ prefix, age, data, setData }: any) {
    if (!age || age < 18 || age > 24) return null;
    const label = age <= 20 ? "CONSENT" : "ADVICE";

    const handleSelection = (val: string) => {
        const p = val === "Father" ? "Fath" : "Moth";
        if (val === "Others") setData({ ...data, [`${prefix}GiverF`]: "", [`${prefix}GiverM`]: "", [`${prefix}GiverL`]: "", [`${prefix}GiverRelation`]: "" });
        else setData({ ...data, [`${prefix}GiverF`]: data[`${prefix}${p}F`], [`${prefix}GiverM`]: data[`${prefix}${p}M`], [`${prefix}GiverL`]: data[`${prefix}${p}L`], [`${prefix}GiverRelation`]: val });
    };

    return (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-slate-100">
            <div className="p-6 bg-secondary/10 rounded-2xl border border-secondary/30 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <LabelWithIcon icon={<FileText className="w-3 h-3 text-primary" />} text={`PERSON GIVING ${label}`} />
                    <select className="text-xs border border-slate-300 rounded-md px-3 py-1.5 bg-white font-medium" onChange={(e) => handleSelection(e.target.value)} defaultValue="">
                        <option value="" disabled hidden>Select Parent...</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input placeholder="First" value={data[`${prefix}GiverF`]} onChange={e => setData({ ...data, [`${prefix}GiverF`]: e.target.value })} />
                    <Input placeholder="Middle" value={data[`${prefix}GiverM`]} onChange={e => setData({ ...data, [`${prefix}GiverM`]: e.target.value })} />
                    <Input placeholder="Last" value={data[`${prefix}GiverL`]} onChange={e => setData({ ...data, [`${prefix}GiverL`]: e.target.value })} />
                </div>
                <Input placeholder="Relationship..." value={data[`${prefix}GiverRelation`]} onChange={e => setData({ ...data, [`${prefix}GiverRelation`]: e.target.value })} />
            </div>
        </motion.div>
    );
}

function LabelWithIcon({ icon, text }: any) {
    return <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{icon} {text}</div>;
}

function Field({ label, children, className }: any) {
    return <div className={`space-y-1.5 ${className}`}><label className="text-xs font-bold text-slate-600 ml-1">{label}</label>{children}</div>;
}   