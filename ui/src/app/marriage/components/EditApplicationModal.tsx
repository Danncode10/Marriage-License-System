"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from 'framer-motion';
import { X, Heart, Edit2, Save } from 'lucide-react';
import { AddressSection } from "./AddressSection";
import { BirthPlaceSection } from "./BirthPlaceSection";
import { FamilySubSection, Field, GiverSubSection } from "./FormComponents";
import { SectionCard } from "./SectionCard";
import { RELIGIONS, SUFFIX_OPTIONS } from "../constants";
import { useMarriageForm } from "../hooks/useMarriageForm";
import { toTitleCase } from "../utils";
import { updateApplicationDetails } from "../../dashboard/admin/applications/actions";
import { mapAppToFormData } from "../mapping-utils";

interface EditApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    selectedApp: any;
}

export default function EditApplicationModal({ isOpen, onClose, onSuccess, selectedApp }: EditApplicationModalProps) {
    const [submitting, setSubmitting] = useState(false);

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
        gSameAsAddress,
        setGSameAsAddress,
        bSameAsAddress,
        setBSameAsAddress,
        handleAgeChange,
        handleProvinceChange,
        handleTownChange,
        handleBrgyChange,
        handleBirthProvinceChange,
        handleBirthTownChange,
        calculateAge,
    } = useMarriageForm();

    useEffect(() => {
        if (selectedApp) {
            const initialData = mapAppToFormData(selectedApp);
            setFormData(initialData);
        }
    }, [selectedApp, setFormData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await updateApplicationDetails(selectedApp.id, formData);

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                alert(`Update failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('An unknown error occurred during update');
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
                className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl"
            >
                {/* Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b px-8 py-6 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <Edit2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Application</h2>
                            <p className="text-sm text-slate-500 font-medium">Updating details for #{selectedApp?.application_code}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all"
                    >
                        <X className="h-5 w-5 text-zinc-600" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Groom and Bride Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <SectionCard title="Groom's Information" color="blue">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Field label="First Name"><Input placeholder="Juan" className="bg-white" value={formData.gFirst} onChange={e => setFormData({ ...formData, gFirst: toTitleCase(e.target.value) })} required /></Field>
                                    <Field label="Middle Name"><Input placeholder="Dela" className="bg-white" value={formData.gMiddle} onChange={e => setFormData({ ...formData, gMiddle: toTitleCase(e.target.value) })} /></Field>
                                    <Field label="Last Name"><Input placeholder="Cruz" className="bg-white" value={formData.gLast} onChange={e => setFormData({ ...formData, gLast: toTitleCase(e.target.value) })} required /></Field>
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
                                        }} required />
                                    </Field>
                                    <Field label="Age">
                                        <Input type="number" className="bg-white font-bold text-primary" value={formData.gAge || ""} onChange={e => handleAgeChange('g', e.target.value)} required />
                                    </Field>
                                    <Field label="Religion" className="col-span-2 md:col-span-1">
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.gReligion}
                                            onChange={e => setFormData({ ...formData, gReligion: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            {RELIGIONS.map(rel => <option key={rel} value={rel}>{rel}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                {formData.gReligion === "Others" && (
                                    <Field label="Specify Religion">
                                        <Input
                                            className="bg-white"
                                            value={formData.gCustomReligion}
                                            onChange={e => setFormData({ ...formData, gCustomReligion: toTitleCase(e.target.value) })}
                                        />
                                    </Field>
                                )}
                                <AddressSection prefix="g" provincesList={provincesList} townOptions={townOptions} brgyOptions={gBrgyOptions} formData={formData} handleProvinceChange={handleProvinceChange} handleTownChange={handleTownChange} handleBrgyChange={handleBrgyChange} />
                                <BirthPlaceSection prefix="g" sameAsAddress={gSameAsAddress} setSameAsAddress={setGSameAsAddress} formData={formData} setFormData={setFormData} provincesList={provincesList} birthTownOptions={gBirthTownOptions} birthBrgyOptions={gBirthBrgyOptions} handleBirthProvinceChange={handleBirthProvinceChange} handleBirthTownChange={handleBirthTownChange} />
                                <FamilySubSection prefix="g" person="Groom" data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                <GiverSubSection prefix="g" age={formData.gAge} data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                            </SectionCard>

                            <SectionCard title="Bride's Information" color="yellow">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Field label="First Name"><Input placeholder="Maria" className="bg-white" value={formData.bFirst} onChange={e => setFormData({ ...formData, bFirst: toTitleCase(e.target.value) })} required /></Field>
                                    <Field label="Middle Name"><Input placeholder="Clara" className="bg-white" value={formData.bMiddle} onChange={e => setFormData({ ...formData, bMiddle: toTitleCase(e.target.value) })} /></Field>
                                    <Field label="Last Name"><Input placeholder="Santos" className="bg-white" value={formData.bLast} onChange={e => setFormData({ ...formData, bLast: toTitleCase(e.target.value) })} required /></Field>
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
                                        }} required />
                                    </Field>
                                    <Field label="Age">
                                        <Input type="number" className="bg-white font-bold text-primary" value={formData.bAge || ""} onChange={e => handleAgeChange('b', e.target.value)} required />
                                    </Field>
                                    <Field label="Religion" className="col-span-2 md:col-span-1">
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.bReligion}
                                            onChange={e => setFormData({ ...formData, bReligion: e.target.value })}
                                        >
                                            <option value="">Select...</option>
                                            {RELIGIONS.map(rel => <option key={rel} value={rel}>{rel}</option>)}
                                        </select>
                                    </Field>
                                </div>
                                {formData.bReligion === "Others" && (
                                    <Field label="Specify Religion">
                                        <Input
                                            className="bg-white"
                                            value={formData.bCustomReligion}
                                            onChange={e => setFormData({ ...formData, bCustomReligion: toTitleCase(e.target.value) })}
                                        />
                                    </Field>
                                )}
                                <AddressSection prefix="b" provincesList={provincesList} townOptions={townOptions} brgyOptions={bBrgyOptions} formData={formData} handleProvinceChange={handleProvinceChange} handleTownChange={handleTownChange} handleBrgyChange={handleBrgyChange} />
                                <BirthPlaceSection prefix="b" sameAsAddress={bSameAsAddress} setSameAsAddress={setBSameAsAddress} formData={formData} setFormData={setFormData} provincesList={provincesList} birthTownOptions={bBirthTownOptions} birthBrgyOptions={bBirthBrgyOptions} handleBirthProvinceChange={handleBirthProvinceChange} handleBirthTownChange={handleBirthTownChange} />
                                <FamilySubSection prefix="b" person="Bride" data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                                <GiverSubSection prefix="b" age={formData.bAge} data={formData} setData={setFormData} toTitleCase={toTitleCase} />
                            </SectionCard>
                        </div>

                        <div className="mt-12">
                            <SectionCard title="Contact Information" color="blue">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    <Field label="Primary Contact Number">
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
                                </div>
                            </SectionCard>
                        </div>

                        <div className="flex flex-col items-center gap-6 pt-8">
                            <Button type="submit" size="lg" disabled={submitting} className="h-16 px-12 text-lg font-bold group rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-3">
                                <Save className="w-5 h-5" />
                                {submitting ? "Updating..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
