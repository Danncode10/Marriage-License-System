"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from 'framer-motion';
import { X, FileText, Heart, Trash2, ArrowRight, Clock } from 'lucide-react';
import { AddressSection } from "../../../marriage/components/AddressSection";
import { BirthPlaceSection } from "../../../marriage/components/BirthPlaceSection";
import { FamilySubSection, Field, GiverSubSection } from "../../../marriage/components/FormComponents";
import { SectionCard } from "../../../marriage/components/SectionCard";
import { RELIGIONS, SUFFIX_OPTIONS } from "../../../marriage/constants";
import { useMarriageForm } from "../../../marriage/hooks/useMarriageForm";
import { toTitleCase } from "../../../marriage/utils";
import { createClient } from "@/utils/supabase/client";
import { COUNTRY_OPTIONS } from "@/utils/countries";

interface AdminMarriageFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AdminMarriageForm({ isOpen, onClose, onSuccess }: AdminMarriageFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [applicationCode, setApplicationCode] = useState("");

    const {
        formData,
        setFormData,
        gTownOptions,
        bTownOptions,
        provincesList,
        gBrgyOptions,
        bBrgyOptions,
        gBirthTownOptions,
        bBirthTownOptions,
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
        calculateAge,
        isFormValid,
    } = useMarriageForm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const supabase = createClient();
            const { data: { user: currentUser } } = await supabase.auth.getUser();

            if (!currentUser) {
                alert('Not authenticated');
                return;
            }

            // Generate application code (6 digits for uniqueness)
            const generatedCode = `${Math.floor(100000 + Math.random() * 900000)}`;

            // Submit application with admin/employee as processor
            const { submitAdminApplication } = await import('./admin-submission-utils');
            await submitAdminApplication(formData, generatedCode, currentUser.id);

            setApplicationCode(generatedCode);
            setIsSubmitted(true);
            onSuccess();

        } catch (error) {
            console.error('Submission error:', error);
            if (error instanceof Error) {
                alert(`Submission failed: ${error.message}`);
            } else {
                alert('An unknown error occurred during submission');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl relative"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b px-8 py-6 flex justify-between items-center z-10 rounded-t-[2rem]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Heart className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight italic">Create Marriage Application</h2>
                            <p className="text-sm text-slate-500 font-medium">Office use - Fill application details</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all focus:outline-none"
                    >
                        <X className="h-5 w-5 text-zinc-600" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                                <div className="text-center mb-12">
                                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight italic">Marriage License Application</h1>
                                    <p className="text-slate-500 mt-3 text-lg">Make sure that all data you entered is correct!</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <SectionCard title="Groom's Information" color="blue">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <Field label="First Name" required><Input placeholder="Juan" className="bg-white" value={formData.gFirst} onChange={e => setFormData({ ...formData, gFirst: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Middle Name"><Input placeholder="Dela" className="bg-white" value={formData.gMiddle} onChange={e => setFormData({ ...formData, gMiddle: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Last Name" required><Input placeholder="Cruz" className="bg-white" value={formData.gLast} onChange={e => setFormData({ ...formData, gLast: toTitleCase(e.target.value) })} /></Field>
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
                                                <Field label="Birthday" required>
                                                    <Input type="date" className="bg-white" value={formData.gBday} onChange={e => {
                                                        const b = e.target.value;
                                                        setFormData({ ...formData, gBday: b, gAge: calculateAge(b) });
                                                    }} />
                                                </Field>
                                                <Field label="Age" required>
                                                    <Input type="number" className="bg-white font-bold text-primary" value={formData.gAge || ""} onChange={e => handleAgeChange('g', e.target.value)} />
                                                </Field>
                                                <Field label="Religion" className="col-span-2 md:col-span-1" required>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                        value={formData.gReligion}
                                                        onChange={e => setFormData({ ...formData, gReligion: e.target.value })}
                                                    >
                                                        <option value="" disabled hidden>Select Religion</option>
                                                        {RELIGIONS.map(rel => (
                                                            <option key={rel} value={rel}>{rel}</option>
                                                        ))}
                                                    </select>
                                                </Field>
                                            </div>
                                            <AnimatePresence>
                                                {formData.gReligion === "Others" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4"
                                                    >
                                                        <div className="md:col-span-3"></div>
                                                        <Field label="Specify Religion" required>
                                                            <Input
                                                                placeholder="Type religion..."
                                                                className="bg-white border-blue-200"
                                                                value={formData.gCustomReligion}
                                                                onChange={e => setFormData({ ...formData, gCustomReligion: toTitleCase(e.target.value) })}
                                                            />
                                                        </Field>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <AddressSection prefix="g" provincesList={provincesList} gTownOptions={gTownOptions} bTownOptions={bTownOptions} brgyOptions={gBrgyOptions} formData={formData} setFormData={setFormData} handleProvinceChange={handleProvinceChange} handleTownChange={handleTownChange} handleBrgyChange={handleBrgyChange} />
                                            <BirthPlaceSection prefix="g" sameAsAddress={gSameAsAddress} setSameAsAddress={setGSameAsAddress} formData={formData} setFormData={setFormData} provincesList={provincesList} birthTownOptions={gBirthTownOptions} countryOptions={COUNTRY_OPTIONS} handleBirthProvinceChange={handleBirthProvinceChange} handleBirthTownChange={handleBirthTownChange} />
                                            <FamilySubSection prefix="g" person="Groom" data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                            <GiverSubSection prefix="g" age={formData.gAge} data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                        </SectionCard>

                                        <SectionCard title="Bride's Information" color="yellow">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <Field label="First Name" required><Input placeholder="Maria" className="bg-white" value={formData.bFirst} onChange={e => setFormData({ ...formData, bFirst: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Middle Name"><Input placeholder="Clara" className="bg-white" value={formData.bMiddle} onChange={e => setFormData({ ...formData, bMiddle: toTitleCase(e.target.value) })} /></Field>
                                                <Field label="Last Name" required><Input placeholder="Santos" className="bg-white" value={formData.bLast} onChange={e => setFormData({ ...formData, bLast: toTitleCase(e.target.value) })} /></Field>
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
                                                <Field label="Birthday" required>
                                                    <Input type="date" className="bg-white" value={formData.bBday} onChange={e => {
                                                        const b = e.target.value;
                                                        setFormData({ ...formData, bBday: b, bAge: calculateAge(b) });
                                                    }} />
                                                </Field>
                                                <Field label="Age" required>
                                                    <Input type="number" className="bg-white font-bold text-primary" value={formData.bAge || ""} onChange={e => handleAgeChange('b', e.target.value)} />
                                                </Field>
                                                <Field label="Religion" className="col-span-2 md:col-span-1" required>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                        value={formData.bReligion}
                                                        onChange={e => setFormData({ ...formData, bReligion: e.target.value })}
                                                    >
                                                        <option value="" disabled hidden>Select Religion</option>
                                                        {RELIGIONS.map(rel => (
                                                            <option key={rel} value={rel}>{rel}</option>
                                                        ))}
                                                    </select>
                                                </Field>
                                            </div>
                                            <AnimatePresence>
                                                {formData.bReligion === "Others" && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4"
                                                    >
                                                        <div className="md:col-span-3"></div>
                                                        <Field label="Specify Religion" required>
                                                            <Input
                                                                placeholder="Type religion..."
                                                                className="bg-white border-blue-200"
                                                                value={formData.bCustomReligion}
                                                                onChange={e => setFormData({ ...formData, bCustomReligion: toTitleCase(e.target.value) })}
                                                            />
                                                        </Field>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            <AddressSection prefix="b" provincesList={provincesList} gTownOptions={gTownOptions} bTownOptions={bTownOptions} brgyOptions={bBrgyOptions} formData={formData} setFormData={setFormData} handleProvinceChange={handleProvinceChange} handleTownChange={handleTownChange} handleBrgyChange={handleBrgyChange} />
                                            <BirthPlaceSection prefix="b" sameAsAddress={bSameAsAddress} setSameAsAddress={setBSameAsAddress} formData={formData} setFormData={setFormData} provincesList={provincesList} birthTownOptions={bBirthTownOptions} countryOptions={COUNTRY_OPTIONS} handleBirthProvinceChange={handleBirthProvinceChange} handleBirthTownChange={handleBirthTownChange} />
                                            <FamilySubSection prefix="b" person="Bride" data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                            <GiverSubSection prefix="b" age={formData.bAge} data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                        </SectionCard>
                                    </div>

                                    <div className="mt-12">
                                        <SectionCard title="Contact Information" color="blue">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                                <Field label="Primary Contact Number (Optional)">
                                                    <div className="relative">
                                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-blue-600 border-r border-blue-200 pr-3">
                                                            <span className="text-xs font-black tracking-tighter font-mono">+63</span>
                                                        </div>
                                                        <Input
                                                            type="tel"
                                                            placeholder="912 345 6789"
                                                            className="pl-16 h-12 bg-white border-blue-100 focus:border-blue-500 rounded-xl"
                                                            value={formData.contactNumber}
                                                            onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
                                                        />
                                                    </div>
                                                </Field>
                                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                                                    <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                                                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-tight leading-tight">
                                                        Our staff will coordinate with you via this number for interview schedules and updates.
                                                    </p>
                                                </div>
                                            </div>
                                        </SectionCard>
                                    </div>

                                    <div className="flex flex-col items-center gap-6 pt-8">
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={!isFormValid || submitting}
                                            className={`h-16 px-12 text-lg font-bold group rounded-2xl shadow-xl transition-all duration-300 ${!isFormValid
                                                ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed opacity-70'
                                                : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'
                                                }`}
                                        >
                                            {submitting ? "Reviewing..." : "Review Application"}
                                            <ArrowRight className={`ml-2 w-5 h-5 transition-transform ${isFormValid ? 'group-hover:translate-x-1' : ''}`} />
                                        </Button>
                                        {!isFormValid && (
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                                                Please complete all mandatory fields to proceed
                                            </p>
                                        )}
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
                                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Application Created Successfully</h2>
                                    <p className="text-slate-500 mb-8 font-medium">Application Code Generated</p>
                                    <div className="bg-slate-50 px-8 py-6 rounded-3xl mb-10 border border-slate-100 shadow-inner">
                                        <span className="text-6xl font-black text-primary tracking-tighter">{applicationCode}</span>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 text-left shadow-sm">
                                            <h3 className="text-blue-800 font-black tracking-tight mb-6 flex items-center gap-2 text-xl italic uppercase">
                                                <Heart className="w-5 h-5" /> Next Steps
                                            </h3>

                                            <div className="space-y-4">
                                                <div className="flex gap-4 items-start bg-white/60 p-5 rounded-2xl border border-blue-100">
                                                    <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center text-xs font-black shrink-0">1</div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Save the Code</p>
                                                        <p className="text-slate-600 text-[11px] font-bold leading-tight">Print or screenshot the 6-digit application code.</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 items-start bg-white/60 p-5 rounded-2xl border border-blue-100">
                                                    <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center text-xs font-black shrink-0">2</div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Prepare Requirements</p>
                                                        <p className="text-slate-600 text-[11px] font-bold leading-tight">Birth Certificate, CENOMAR, and Valid IDs (Original & Photocopy).</p>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 items-start bg-white/60 p-5 rounded-2xl border border-blue-100">
                                                    <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center text-xs font-black shrink-0">3</div>
                                                    <div className="space-y-0.5">
                                                        <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Visit Solano Office</p>
                                                        <p className="text-slate-600 text-[11px] font-bold leading-tight">Proceed to the Solano Municipal Office to finalize the application.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <Button onClick={() => { setIsSubmitted(false); handleReset(); }} className="h-16 w-full text-xl shadow-xl rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">
                                                Create Another Application
                                            </Button>
                                            <Button variant="ghost" onClick={onClose} className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                                Close Modal
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Clear Form Modal */}
                <AnimatePresence>
                    {showClearAlert && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
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
            </motion.div>
        </div>
    );
}