import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, GraduationCap } from "lucide-react";
import React from "react";

interface FieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function Field({ label, children, className }: FieldProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-tight">{label}</label>
            {children}
        </div>
    );
}

interface LabelWithIconProps {
    icon: React.ReactNode;
    text: string;
}

export function LabelWithIcon({ icon, text }: LabelWithIconProps) {
    return (
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {icon} {text}
        </div>
    );
}

interface FamilySubSectionProps {
    prefix: 'g' | 'b';
    person: string;
    data: any;
    setData: (data: any) => void;
    toTitleCase: (str: string) => string;
}

export function FamilySubSection({ prefix, person, data, setData, toTitleCase }: FamilySubSectionProps) {
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

interface GiverSubSectionProps {
    prefix: 'g' | 'b';
    age: number;
    data: any;
    setData: (data: any) => void;
}

export function GiverSubSection({ prefix, age, data, setData }: GiverSubSectionProps) {
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
