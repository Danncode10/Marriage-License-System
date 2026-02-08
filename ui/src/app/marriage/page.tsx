"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function MarriageForm() {
    const [formData, setFormData] = useState({
        // GROOM
        gFirst: "", gMiddle: "", gLast: "", gBday: "", gAge: 0,
        gBirthPlace: "",
        gBrgy: "", gTown: "", gProv: "NUEVA VIZCAYA", gCountry: "PHILIPPINES",
        gCitizen: "FILIPINO", gStatus: "SINGLE", gReligion: "",
        gFathF: "", gFathM: "", gFathL: "",
        gMothF: "", gMothM: "", gMothL: "",
        gGiverF: "", gGiverM: "", gGiverL: "", gGiverRelation: "",

        // BRIDE
        bFirst: "", bMiddle: "", bLast: "", bBday: "", bAge: 0,
        bBirthPlace: "",
        bBrgy: "", bTown: "", bProv: "NUEVA VIZCAYA", bCountry: "PHILIPPINES",
        bCitizen: "FILIPINO", bStatus: "SINGLE", bReligion: "",
        bFathF: "", bFathM: "", bFathL: "",
        bMothF: "", bMothM: "", bMothL: " ",
        bGiverF: "", bGiverM: "", bGiverL: "", bGiverRelation: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationCode, setApplicationCode] = useState("");
    const [loading, setLoading] = useState(false);

    const calculateAge = (birthDateString: string): number => {
        if (!birthDateString) return 0;
        const today = new Date();
        const birthDate = new Date(birthDateString);
        if (isNaN(birthDate.getTime())) return 0;

        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age >= 0 ? age : 0;
    };

    const generateExcel = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/generate-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to generate excel');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `MARRIAGE_APPLICATION_${applicationCode}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            alert("Error generating excel.");
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 p-4 md:p-8 text-zinc-900">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <Card className="shadow-2xl rounded-2xl border border-zinc-200 bg-white overflow-hidden">
                    <header className="bg-primary p-6 text-white text-center border-b-4 border-secondary">
                        <h1 className="text-2xl font-black italic tracking-tight">LGU SOLANO MARRIAGE PORTAL</h1>
                    </header>

                    {!isSubmitted ? (
                        <form onSubmit={(e) => { e.preventDefault(); setApplicationCode(`${Math.floor(1000 + Math.random() * 9000)}`); setIsSubmitted(true); }} className="p-6 md:p-10 space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <Section title="GROOM" color="blue">
                                    <div className="grid grid-cols-3 gap-3">
                                        <Field label="First"><Input value={formData.gFirst} onChange={e => setFormData({ ...formData, gFirst: e.target.value })} /></Field>
                                        <Field label="Middle"><Input value={formData.gMiddle} onChange={e => setFormData({ ...formData, gMiddle: e.target.value })} /></Field>
                                        <Field label="Last"><Input value={formData.gLast} onChange={e => setFormData({ ...formData, gLast: e.target.value })} /></Field>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <Field label="Birthday"><Input type="date" value={formData.gBday} onChange={e => { const b = e.target.value; setFormData({ ...formData, gBday: b, gAge: calculateAge(b) }); }} /></Field>
                                        <Field label="Age"><Input type="number" value={formData.gAge || ""} onChange={e => setFormData({ ...formData, gAge: parseInt(e.target.value) || 0 })} className="bg-zinc-50/50" /></Field>
                                        <Field label="Religion"><Input value={formData.gReligion} onChange={e => setFormData({ ...formData, gReligion: e.target.value })} /></Field>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <Field label="Birth Place"><Input value={formData.gBirthPlace} onChange={e => setFormData({ ...formData, gBirthPlace: e.target.value })} /></Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Barangay"><Input value={formData.gBrgy} onChange={e => setFormData({ ...formData, gBrgy: e.target.value })} /></Field>
                                        <Field label="Town"><Input value={formData.gTown} onChange={e => setFormData({ ...formData, gTown: e.target.value })} /></Field>
                                    </div>
                                    <ParentSubSection person="Groom" data={formData} setData={setFormData} prefix="g" />
                                    <GiverSection person="Groom" age={formData.gAge} data={formData} setData={setFormData} prefix="g" />
                                </Section>

                                <Section title="BRIDE" color="pink">
                                    <div className="grid grid-cols-3 gap-3">
                                        <Field label="First"><Input value={formData.bFirst} onChange={e => setFormData({ ...formData, bFirst: e.target.value })} /></Field>
                                        <Field label="Middle"><Input value={formData.bMiddle} onChange={e => setFormData({ ...formData, bMiddle: e.target.value })} /></Field>
                                        <Field label="Last"><Input value={formData.bLast} onChange={e => setFormData({ ...formData, bLast: e.target.value })} /></Field>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <Field label="Birthday"><Input type="date" value={formData.bBday} onChange={e => { const b = e.target.value; setFormData({ ...formData, bBday: b, bAge: calculateAge(b) }); }} /></Field>
                                        <Field label="Age"><Input type="number" value={formData.bAge || ""} onChange={e => setFormData({ ...formData, bAge: parseInt(e.target.value) || 0 })} className="bg-zinc-50/50" /></Field>
                                        <Field label="Religion"><Input value={formData.bReligion} onChange={e => setFormData({ ...formData, bReligion: e.target.value })} /></Field>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <Field label="Birth Place"><Input value={formData.bBirthPlace} onChange={e => setFormData({ ...formData, bBirthPlace: e.target.value })} /></Field>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Barangay"><Input value={formData.bBrgy} onChange={e => setFormData({ ...formData, bBrgy: e.target.value })} /></Field>
                                        <Field label="Town"><Input value={formData.bTown} onChange={e => setFormData({ ...formData, bTown: e.target.value })} /></Field>
                                    </div>
                                    <ParentSubSection person="Bride" data={formData} setData={setFormData} prefix="b" />
                                    <GiverSection person="Bride" age={formData.bAge} data={formData} setData={setFormData} prefix="b" />
                                </Section>
                            </div>
                            <Button type="submit" size="lg" className="w-full h-16 text-xl uppercase tracking-widest font-bold">Generate Marriage Pack</Button>
                        </form>
                    ) : (
                        <div className="p-20 text-center space-y-8">
                            <h2 className="text-8xl font-black text-blue-600">{applicationCode}</h2>
                            <p className="text-zinc-500 dark:text-zinc-400">Application Code Generated</p>
                            <div className="flex flex-col items-center gap-4">
                                <Button onClick={generateExcel} disabled={loading} size="lg" className="w-full max-w-md h-16 text-2xl bg-secondary hover:bg-secondary/90 text-primary-foreground font-bold shadow-xl border-b-4 border-primary/20">
                                    {loading ? "GENERATING..." : "DOWNLOAD EXCEL"}
                                </Button>
                                <button onClick={() => setIsSubmitted(false)} className="text-zinc-500 underline font-bold hover:text-zinc-800 transition-colors">
                                    Back to Edit
                                </button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}

// STYLING COMPONENTS
function Section({ title, color, children }: { title: string, color: 'blue' | 'pink', children: React.ReactNode }) {
    const borderColor = color === 'blue' ? 'border-primary/20' : 'border-secondary/20';
    const textColor = color === 'blue' ? 'text-primary' : 'text-zinc-800';
    return (
        <div className="space-y-6">
            <h2 className={`${textColor} font-black text-xl border-b-4 ${borderColor} pb-1 flex items-center gap-2`}>
                <span className={`w-2 h-6 ${color === 'blue' ? 'bg-primary' : 'bg-secondary'}`}></span>
                {title}
            </h2>
            {children}
        </div>
    );
}

function GiverSection({ person, age, data, setData, prefix }: any) {
    if (!age || age < 18 || age > 24) return null;
    const isG = prefix === 'g';
    const label = age <= 20 ? "CONSENT" : "ADVICE";
    const bgColor = isG ? 'bg-primary/5' : 'bg-secondary/10';
    const borderColor = isG ? 'border-primary/20' : 'border-secondary/20';

    return (
        <div className={`p-5 rounded-2xl border-2 border-dashed ${borderColor} ${bgColor} space-y-4 shadow-inner`}>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-600">Person Giving {label} ({person})</p>
            <div className="grid grid-cols-3 gap-2">
                <Input placeholder="First Name" value={data[`${prefix}GiverF`]} onChange={e => setData({ ...data, [`${prefix}GiverF`]: e.target.value })} />
                <Input placeholder="Middle Name" value={data[`${prefix}GiverM`]} onChange={e => setData({ ...data, [`${prefix}GiverM`]: e.target.value })} />
                <Input placeholder="Last Name" value={data[`${prefix}GiverL`]} onChange={e => setData({ ...data, [`${prefix}GiverL`]: e.target.value })} />
            </div>
            <Field label="Relationship (e.g. Father)"><Input value={data[`${prefix}GiverRelation`]} onChange={e => setData({ ...data, [`${prefix}GiverRelation`]: e.target.value })} /></Field>
        </div>
    );
}

function ParentSubSection({ person, data, setData, prefix }: any) {
    const isG = prefix === 'g';
    const bgColor = isG ? 'bg-primary/5' : 'bg-secondary/5';
    const borderColor = isG ? 'border-primary/10' : 'border-secondary/10';

    return (
        <div className={`p-5 rounded-2xl border ${bgColor} ${borderColor} space-y-4`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{person}'s Parents</p>
            <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Father First" value={data[`${prefix}FathF`]} onChange={e => setData({ ...data, [`${prefix}FathF`]: e.target.value })} />
                <Input placeholder="Father Mid" value={data[`${prefix}FathM`]} onChange={e => setData({ ...data, [`${prefix}FathM`]: e.target.value })} />
                <Input placeholder="Father Last" value={data[`${prefix}FathL`]} onChange={e => setData({ ...data, [`${prefix}FathL`]: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Mother First" value={data[`${prefix}MothF`]} onChange={e => setData({ ...data, [`${prefix}MothF`]: e.target.value })} />
                <Input placeholder="Mother Mid" value={data[`${prefix}MothM`]} onChange={e => setData({ ...data, [`${prefix}MothM`]: e.target.value })} />
                <Input placeholder="Mother Last" value={data[`${prefix}MothL`]} onChange={e => setData({ ...data, [`${prefix}MothL`]: e.target.value })} />
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
    return <div className="space-y-1"><label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">{label}</label>{children}</div>;
}
