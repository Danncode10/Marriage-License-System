"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, FileText, Heart, Scale, ShieldCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AddressSection } from "./components/AddressSection";
import { BirthPlaceSection } from "./components/BirthPlaceSection";
import { FamilySubSection, Field, GiverSubSection } from "./components/FormComponents";
import { SectionCard } from "./components/SectionCard";
import { RELIGIONS } from "./constants";
import { useMarriageForm } from "./hooks/useMarriageForm";
import { toTitleCase } from "./utils";

export const SUFFIX_OPTIONS = ["Jr.", "Sr.", "I", "II", "III", "IV", "V", "Others"];

export default function MarriageForm() {
    // PRIVACY contants
    const [hasAcceptedPrivacy, setHasAcceptedPrivacy] = useState(false);
    const [showLawDetails, setShowLawDetails] = useState(false);

    const {
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
        handleReset,
        generateExcel,
        calculateAge,
    } = useMarriageForm();

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            <datalist id="religion-list">
                {RELIGIONS.map((rel) => <option key={rel} value={rel} />)}
            </datalist>

            {/*PRIVACY & LAW MODALS*/}
            <AnimatePresence>
                {!hasAcceptedPrivacy && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        />
                        
                        {!showLawDetails ? (
                            // Main Privacy Notice
                            <motion.div
                                key="privacy-main"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="relative bg-white p-8 md:p-12 rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-slate-100"
                            >
                                <div className="flex items-center gap-5 mb-8">
                                <div className="flex-shrink-0 w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                    Data Privacy Notice
                                </h2>
                            </div>
                                <div className="space-y-4 text-slate-600 mb-8 text-sm md:text-base leading-relaxed">
                                    <p>By proceeding with this application, you agree to the collection and processing of your personal information for the purpose of the <strong>Marriage License Application</strong>.</p>
                                    <ul className="list-disc pl-5 space-y-2 text-slate-500">
                                        <li>Your data will be used solely for civil registration and legal documents.</li>
                                        <li>
                                            Information is protected under the{" "}
                                            <button 
                                                type="button"
                                                onClick={() => setShowLawDetails(true)}
                                                className="text-primary font-bold underline decoration-primary/30 hover:decoration-primary transition-all"
                                            >
                                                Data Privacy Act of 2012 (RA 10173)
                                            </button>.
                                        </li>
                                        <li>All sensitive personal information (birthdays, family name, address, etc.) is encrypted and handled securely.</li>
                                    </ul>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Button onClick={() => setHasAcceptedPrivacy(true)} className="flex-1 h-14 rounded-2xl font-bold text-lg">
                                        I Accept & Continue
                                    </Button>
                                    <Link href="/dashboard" className="sm:w-1/3">
                                        <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-500">Go Back</Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ) : (
                            // RA 10173 Details View
                            <motion.div
                                key="law-details"
                                initial={{ x: 50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -50, opacity: 0 }}
                                className="relative bg-white p-8 md:p-10 rounded-[2.5rem] max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                        <Scale className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">Republic Act No. 10173</h3>
                                        <p className="text-sm text-slate-500 font-medium">Data Privacy Act of 2012</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2 space-y-6 text-slate-600 text-sm leading-relaxed mb-8 custom-scrollbar">
                                    <section>
                                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" /> Core Principles
                                        </h4>
                                        <p>Personal information must be collected for specified and legitimate purposes and processed fairly and lawfully. It must be accurate, relevant, and kept up to date.</p>
                                    </section>
                                    <section>
                                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" /> Your Rights (Data Subject)
                                        </h4>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                            <li className="bg-slate-50 p-2 rounded-lg"><strong>Right to be Informed:</strong> Knowing if your data is being processed.</li>
                                            <li className="bg-slate-50 p-2 rounded-lg"><strong>Right to Object:</strong> Withholding consent for certain processing.</li>
                                            <li className="bg-slate-50 p-2 rounded-lg"><strong>Right to Access:</strong> Demanding a copy of your personal data.</li>
                                            <li className="bg-slate-50 p-2 rounded-lg"><strong>Right to Erasure:</strong> Suspension or removal of your records.</li>
                                        </ul>
                                    </section>
                                    <section>
                                        <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full" /> Security Measures
                                        </h4>
                                        <p>The system implements organizational, physical, and technical security measures to prevent unauthorized access, accidental loss, or destruction of your marriage application data.</p>
                                    </section>
                                </div>

                                <Button 
                                    onClick={() => setShowLawDetails(false)}
                                    className="w-full h-14 rounded-2xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-900"
                                >
                                    Back to Agreement
                                </Button>
                            </motion.div>
                        )}
                    </div>
                )}
            </AnimatePresence>

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
                {hasAcceptedPrivacy && (
                    <AnimatePresence mode="wait">
                        {/* MarriageForm  */}
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
                                    {/* GROOM AND BRIDE SECTIONS HERE */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <SectionCard title="Groom's Information" color="blue">
                                            {/* (Existing Groom Content) */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <Field label="First Name"><Input placeholder="Juan" className="bg-white" value={formData.gFirst} onChange={e => setFormData({ ...formData, gFirst: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Middle Name"><Input placeholder="Dela" className="bg-white" value={formData.gMiddle} onChange={e => setFormData({ ...formData, gMiddle: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Last Name"><Input placeholder="Cruz" className="bg-white" value={formData.gLast} onChange={e => setFormData({ ...formData, gLast: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Suffix">
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                        value={formData.gSuffix}
                                                        onChange={(e) => setFormData({ ...formData, gSuffix: e.target.value })}
                                                    >
                                                        <option value="">None</option>
                                                        {SUFFIX_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </Field>
                                            </div>
                                            <AnimatePresence>
                                                {formData.gSuffix === "Others" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="grid grid-cols-1 md:grid-cols-4 gap-4"
                                                    >
                                                        <div></div>
                                                        <div></div>
                                                        <div></div>
                                                        <Field label="Specify Suffix">
                                                            <Input
                                                                placeholder="e.g. VI"
                                                                className="bg-white border-blue-200"
                                                                value={formData.gCustomSuffix}
                                                                onChange={e => setFormData({ ...formData, gCustomSuffix: e.target.value })}
                                                            />
                                                        </Field>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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
                                            <AddressSection prefix="g" provincesList={provincesList} townOptions={townOptions} brgyOptions={gBrgyOptions} formData={formData} handleProvinceChange={handleProvinceChange} handleTownChange={handleTownChange} handleBrgyChange={handleBrgyChange} />
                                            <BirthPlaceSection prefix="g" sameAsAddress={gSameAsAddress} setSameAsAddress={setGSameAsAddress} formData={formData} setFormData={setFormData} provincesList={provincesList} birthTownOptions={gBirthTownOptions} birthBrgyOptions={gBirthBrgyOptions} handleBirthProvinceChange={handleBirthProvinceChange} handleBirthTownChange={handleBirthTownChange} />
                                            <FamilySubSection prefix="g" person="Groom" data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                            <GiverSubSection prefix="g" age={formData.gAge} data={formData} setData={setFormData} toTitleCase={toTitleCase} 
/>
                                        </SectionCard>

                                        <SectionCard title="Bride's Information" color="yellow">
                                            {/* (Existing Bride Content) */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <Field label="First Name"><Input placeholder="Maria" className="bg-white" value={formData.bFirst} onChange={e => setFormData({ ...formData, bFirst: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Middle Name"><Input placeholder="Clara" className="bg-white" value={formData.bMiddle} onChange={e => setFormData({ ...formData, bMiddle: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Last Name"><Input placeholder="Santos" className="bg-white" value={formData.bLast} onChange={e => setFormData({ ...formData, bLast: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Suffix">
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                        value={formData.bSuffix}
                                                        onChange={(e) => setFormData({ ...formData, bSuffix: e.target.value })}
                                                    >
                                                        <option value="">None</option>
                                                        {SUFFIX_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </Field>
                                            </div>
                                            <AnimatePresence>
                                                {formData.bSuffix === "Others" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="grid grid-cols-1 md:grid-cols-4 gap-4"
                                                    >
                                                        <div></div>
                                                        <div></div>
                                                        <div></div>
                                                        <Field label="Specify Suffix">
                                                            <Input
                                                                placeholder="e.g. VI"
                                                                className="bg-white border-blue-200"
                                                                value={formData.bCustomSuffix}
                                                                onChange={e => setFormData({ ...formData, bCustomSuffix: e.target.value })}
                                                            />
                                                        </Field>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
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
                                            <AddressSection prefix="b" provincesList={provincesList} townOptions={townOptions} brgyOptions={bBrgyOptions} formData={formData} handleProvinceChange={handleProvinceChange} handleTownChange={handleTownChange} handleBrgyChange={handleBrgyChange} />
                                            <BirthPlaceSection prefix="b" sameAsAddress={bSameAsAddress} setSameAsAddress={setBSameAsAddress} formData={formData} setFormData={setFormData} provincesList={provincesList} birthTownOptions={bBirthTownOptions} birthBrgyOptions={bBirthBrgyOptions} handleBirthProvinceChange={handleBirthProvinceChange} handleBirthTownChange={handleBirthTownChange} />
                                            <FamilySubSection prefix="b" person="Bride" data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                            <GiverSubSection prefix="b" age={formData.bAge} data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                        </SectionCard>
                                    </div>

                                    <div className="flex flex-col items-center gap-6 pt-8">
                                        <Button type="submit" size="lg" className="h-16 px-12 text-lg font-bold group rounded-2xl shadow-xl shadow-primary/20">
                                            Review Application <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                        <button type="button" onClick={() => setShowClearAlert(true)} className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-widest">
                                            <Trash2 className="w-4 h-4" /> Clear Form
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            // SUCCESS VIEW
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
                )}
            </main>

            {/* Clear Form Modal */}
            <AnimatePresence>
                {showClearAlert && (
                   <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowClearAlert(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center border border-slate-100">
                            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 className="w-10 h-10" /></div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Clear Form?</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed">Are you sure? This will permanently delete all the information you have entered.</p>
                            <div className="flex flex-col gap-3">
                                <Button variant="primary" onClick={handleReset} className="h-14 rounded-2xl font-bold text-lg shadow-lg bg-red-600 hover:bg-red-700 text-white shadow-red-200">Yes, Clear Everything</Button>
                                <Button variant="ghost" onClick={() => setShowClearAlert(false)} className="h-12 rounded-xl text-slate-500 font-medium hover:bg-slate-50">No, Keep My Data</Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}