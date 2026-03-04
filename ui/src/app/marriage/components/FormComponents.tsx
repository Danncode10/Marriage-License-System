import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, GraduationCap, ShieldCheck } from "lucide-react";
import React from "react";
import { SUFFIX_OPTIONS, VALID_ID_TYPES } from "../constants";

interface FieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
    required?: boolean;
}

export function Field({ label, children, className, required }: FieldProps) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-tight">
                {label} {required && <span className="text-rose-500 font-black">*</span>}
            </label>
            {children}
        </div>
    );
}

export function ValidationFeedback({ data, prefix }: { data: any, prefix: 'g' | 'b' }) {
    const missingFields: string[] = [];

    // Middle names and suffixes are optional, others are required
    const requiredFields = [
        { key: `${prefix}First`, label: 'First Name' },
        { key: `${prefix}Last`, label: 'Last Name' },
        { key: `${prefix}Bday`, label: 'Birthday' },
        { key: `${prefix}Religion`, label: 'Religion' },
        // Only require Barangay if NOT a foreigner
        ...(data[`${prefix}IsForeigner`] ? [] : [{ key: `${prefix}Brgy`, label: 'Barangay' }]),
        { key: `${prefix}Town`, label: 'Town' },
        { key: `${prefix}Prov`, label: 'Province' },
        { key: `${prefix}Citizen`, label: 'Nationality' },
        { key: `${prefix}BirthPlace`, label: 'Birth Place' },
        { key: `${prefix}FathF`, label: 'Father First Name' },
        { key: `${prefix}FathL`, label: 'Father Last Name' },
        { key: `${prefix}MothF`, label: 'Mother First Name' },
        { key: `${prefix}MothL`, label: 'Mother Last Name' },
    ];


    requiredFields.forEach(f => {
        if (!data[f.key]) missingFields.push(f.label);
    });

    if (data[`${prefix}Religion`] === "Others" && !data[`${prefix}CustomReligion`]) {
        missingFields.push('Specify Religion');
    }

    const age = data[`${prefix}Age`];
    if (data[`${prefix}IncludeId`]) {
        if (!data[`${prefix}IdType`]) missingFields.push('ID Type');
        if (!data[`${prefix}IdNo`]) missingFields.push('ID Number');
        if (data[`${prefix}IdType`] === "Others" && !data[`${prefix}IdCustomType`]) missingFields.push('Specify ID Type');
    }

    if (age && age >= 18 && age <= 24) {
        if (!data[`${prefix}GiverRelation`]) missingFields.push('Giver Relationship');
        if (!data[`${prefix}GiverF`] || !data[`${prefix}GiverL`]) missingFields.push('Giver Name');
        if (data[`${prefix}GiverIncludeId`]) {
            if (!data[`${prefix}GiverIdType`]) missingFields.push('Giver ID Type');
            if (!data[`${prefix}GiverIdNo`]) missingFields.push('Giver ID Number');
            if (data[`${prefix}GiverIdType`] === "Others" && !data[`${prefix}GiverIdCustomType`]) missingFields.push('Specify Giver ID Type');
        }
    }

    if (missingFields.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center gap-3"
        >
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-tight">Please fill up the form above</p>
                <p className="text-[9px] font-bold text-amber-600/80 uppercase">Pending: {missingFields.join(', ')}</p>
            </div>
        </motion.div>
    );
}

export function ValidIDSection({ prefix, data, setData, type = 'Main' }: { prefix: 'g' | 'b', data: any, setData: (d: any) => void, type?: 'Main' | 'Giver' }) {
    const idKey = type === 'Main' ? `${prefix}IdType` : `${prefix}GiverIdType`;
    const noKey = type === 'Main' ? `${prefix}IdNo` : `${prefix}GiverIdNo`;
    const includeKey = type === 'Main' ? `${prefix}IncludeId` : `${prefix}GiverIncludeId`;

    const isIncluded = !!data[includeKey];
    const labelPrefix = type === 'Main' ? (prefix === 'g' ? "Groom's" : "Bride's") : "Giver's";

    return (
        <div className={`pt-6 border-t border-slate-100 ${type === 'Giver' ? 'mt-4 bg-slate-100/30 p-4 rounded-xl' : ''}`}>
            <div className="flex items-center justify-between mb-4">
                <LabelWithIcon icon={<FileText className="w-3 h-3 text-slate-400" />} text={`${labelPrefix} Valid ID`} />
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary transition-all"
                        checked={isIncluded}
                        onChange={e => setData({ ...data, [includeKey]: e.target.checked })}
                    />
                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-400 group-hover:text-primary transition-colors">
                        Include ID Info
                    </span>
                </label>
            </div>

            <AnimatePresence>
                {isIncluded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="ID Type" required>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                    value={data[idKey] || ""}
                                    onChange={e => setData({ ...data, [idKey]: e.target.value })}
                                >
                                    <option value="">Select ID Type...</option>
                                    {VALID_ID_TYPES.map(id => <option key={id} value={id}>{id}</option>)}
                                </select>
                            </Field>
                            <Field label="ID Number" required>
                                <Input
                                    placeholder="Enter ID number..."
                                    className="bg-white border-slate-200"
                                    value={data[noKey] || ""}
                                    onChange={e => setData({ ...data, [noKey]: e.target.value.toUpperCase() })}
                                />
                            </Field>
                        </div>

                        <AnimatePresence>
                            {data[idKey] === "Others" && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="pt-2 border-t border-slate-100/50"
                                >
                                    <Field label="Specify ID Type" required>
                                        <Input
                                            placeholder="e.g. PhilHealth ID, TIN ID, etc."
                                            className="bg-white border-blue-200"
                                            value={data[type === 'Main' ? `${prefix}IdCustomType` : `${prefix}GiverIdCustomType`] || ""}
                                            onChange={e => setData({ ...data, [type === 'Main' ? `${prefix}IdCustomType` : `${prefix}GiverIdCustomType`]: e.target.value })}
                                        />
                                    </Field>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                    <Field label="First Name" required>
                        <Input placeholder="First Name" className="bg-white" value={data[`${prefix}FathF`]} onChange={e => setData({ ...data, [`${prefix}FathF`]: toTitleCase(e.target.value) })} />
                    </Field>
                    <Field label="Middle Name">
                        <Input placeholder="Middle Name" className="bg-white" value={data[`${prefix}FathM`]} onChange={e => setData({ ...data, [`${prefix}FathM`]: toTitleCase(e.target.value) })} />
                    </Field>
                    <Field label="Last Name" required>
                        <Input placeholder="Last Name" className="bg-white" value={data[`${prefix}FathL`]} onChange={e => setData({ ...data, [`${prefix}FathL`]: toTitleCase(e.target.value) })} />
                    </Field>
                    <Field label="Suffix">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={data[`${prefix}FathSuffix`]}
                            onChange={e => setData({ ...data, [`${prefix}FathSuffix`]: e.target.value })}
                        >
                            <option value="">None</option>
                            {SUFFIX_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </Field>
                </div>
                {data[`${prefix}FathSuffix`] === "Others" && (
                    <div className="grid grid-cols-4 gap-3 mt-2">
                        <div className="col-span-3"></div>
                        <Input placeholder="Specify..." className="bg-white" value={data[`${prefix}FathCustomSuffix`]} onChange={e => setData({ ...data, [`${prefix}FathCustomSuffix`]: e.target.value })} />
                    </div>
                )}
            </div>

            {/* Mother Section */}
            <div>
                <div className="flex justify-between items-center">
                    <LabelWithIcon icon={<GraduationCap className="w-3 h-3" />} text={`${person}'s Mother`} />
                    <span className="text-[9px] font-bold text-rose-500 italic bg-rose-50 px-2 py-0.5 rounded-full">MAIDEN NAME REQUIRED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                    <Field label="First Name" required>
                        <Input placeholder="First Name" className="bg-white" value={data[`${prefix}MothF`]} onChange={e => setData({ ...data, [`${prefix}MothF`]: toTitleCase(e.target.value) })} />
                    </Field>
                    <Field label="Middle Name">
                        <Input placeholder="Middle Name" className="bg-white" value={data[`${prefix}MothM`]} onChange={e => setData({ ...data, [`${prefix}MothM`]: toTitleCase(e.target.value) })} />
                    </Field>
                    <Field label="Last Name" required>
                        <Input
                            placeholder="Maiden Last Name"
                            className={`bg-white transition-colors ${isSameLastName ? 'border-orange-400 ring-2 ring-orange-100' : ''}`}
                            value={data[`${prefix}MothL`]}
                            onChange={e => setData({ ...data, [`${prefix}MothL`]: toTitleCase(e.target.value) })}
                        />
                    </Field>
                    <Field label="Suffix">
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                            value={data[`${prefix}MothSuffix`]}
                            onChange={e => setData({ ...data, [`${prefix}MothSuffix`]: e.target.value })}
                        >
                            <option value="">None</option>
                            {SUFFIX_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </Field>
                </div>
                {data[`${prefix}MothSuffix`] === "Others" && (
                    <div className="grid grid-cols-4 gap-3 mt-2">
                        <div className="col-span-3"></div>
                        <Input placeholder="Specify..." className="bg-white" value={data[`${prefix}MothCustomSuffix`]} onChange={e => setData({ ...data, [`${prefix}MothCustomSuffix`]: e.target.value })} />
                    </div>
                )}

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
    toTitleCase: (str: string) => string;
}

export function GiverSubSection({ prefix, age, data, setData, toTitleCase }: GiverSubSectionProps) {
    const showGiver = age && age >= 18 && age <= 24;
    const label = age <= 20 ? "CONSENT" : "ADVICE";

    // variables
    const selectedRelation = data[`${prefix}GiverRelation`] || "";

    const hasFatherName = !!(data[`${prefix}FathF`]?.trim() && data[`${prefix}FathL`]?.trim());
    const hasMotherName = !!(data[`${prefix}MothF`]?.trim() && data[`${prefix}MothL`]?.trim());

    const showMissingParentWarning =
        (selectedRelation === "Father" && !hasFatherName) ||
        (selectedRelation === "Mother" && !hasMotherName);

    const handleRelationshipChange = (val: string) => {
        let newData = { ...data, [`${prefix}GiverRelation`]: val };

        if (val === "Father" && hasFatherName) {
            newData[`${prefix}GiverF`] = data[`${prefix}FathF`];
            newData[`${prefix}GiverM`] = data[`${prefix}FathM`];
            newData[`${prefix}GiverL`] = data[`${prefix}FathL`];
            newData[`${prefix}GiverSuffix`] = data[`${prefix}FathSuffix`];
            newData[`${prefix}GiverCustomSuffix`] = data[`${prefix}FathCustomSuffix`];
        } else if (val === "Mother" && hasMotherName) {
            newData[`${prefix}GiverF`] = data[`${prefix}MothF`];
            newData[`${prefix}GiverM`] = data[`${prefix}MothM`];
            newData[`${prefix}GiverL`] = data[`${prefix}MothL`];
            newData[`${prefix}GiverSuffix`] = data[`${prefix}MothSuffix`];
            newData[`${prefix}GiverCustomSuffix`] = data[`${prefix}MothCustomSuffix`];
        } else {
            newData[`${prefix}GiverF`] = "";
            newData[`${prefix}GiverM`] = "";
            newData[`${prefix}GiverL`] = "";
            newData[`${prefix}GiverSuffix`] = "";
            newData[`${prefix}GiverCustomSuffix`] = "";
        }
        setData(newData);
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {showGiver && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-6 border-t border-slate-100">
                        <div className="p-6 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                            <LabelWithIcon icon={<FileText className="w-3 h-3 text-primary" />} text={`PERSON GIVING ${label}`} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Relationship" required>
                                    <select
                                        className={`flex h-10 w-full rounded-md border ${showMissingParentWarning ? 'border-rose-500 ring-2 ring-rose-100' : 'border-input'} bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                                        value={selectedRelation}
                                        onChange={(e) => handleRelationshipChange(e.target.value)}
                                    >
                                        <option value="" disabled={selectedRelation !== ""}>Select Relationship</option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Other">Other (Specify)</option>
                                    </select>
                                </Field>

                                <AnimatePresence>
                                    {selectedRelation === "Other" && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                            <Field label="Specify Relationship" required>
                                                <Input
                                                    placeholder="e.g. Grandmother"
                                                    value={data[`${prefix}GiverOtherTitle`] || ""}
                                                    onChange={e => setData({ ...data, [`${prefix}GiverOtherTitle`]: toTitleCase(e.target.value) })}
                                                />
                                            </Field>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <AnimatePresence>
                                {showMissingParentWarning && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700 text-[11px] font-bold uppercase tracking-tight"
                                    >
                                        <span className="text-base">⚠️</span>
                                        PLEASE FILL UP THE {selectedRelation.toUpperCase()} DETAILS IN THE SECTION ABOVE FIRST
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                <Field label="First Name" required>
                                    <Input
                                        placeholder="First Name"
                                        disabled={selectedRelation === "Father" || selectedRelation === "Mother"}
                                        value={data[`${prefix}GiverF`] || ""}
                                        onChange={e => setData({ ...data, [`${prefix}GiverF`]: toTitleCase(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Middle Name">
                                    <Input
                                        placeholder="Middle Name"
                                        disabled={selectedRelation === "Father" || selectedRelation === "Mother"}
                                        value={data[`${prefix}GiverM`] || ""}
                                        onChange={e => setData({ ...data, [`${prefix}GiverM`]: toTitleCase(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Last Name" required>
                                    <Input
                                        placeholder="Last Name"
                                        disabled={selectedRelation === "Father" || selectedRelation === "Mother"}
                                        value={data[`${prefix}GiverL`] || ""}
                                        onChange={e => setData({ ...data, [`${prefix}GiverL`]: toTitleCase(e.target.value) })}
                                    />
                                </Field>
                                <Field label="Suffix">
                                    <select
                                        disabled={selectedRelation === "Father" || selectedRelation === "Mother"}
                                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                        value={data[`${prefix}GiverSuffix`] || ""}
                                        onChange={e => setData({ ...data, [`${prefix}GiverSuffix`]: e.target.value })}
                                    >
                                        <option value="">None</option>
                                        {SUFFIX_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </Field>
                            </div>

                            {data[`${prefix}GiverSuffix`] === "Others" && (
                                <div className="grid grid-cols-4 gap-3 mt-2">
                                    <div className="col-span-3"></div>
                                    <Input
                                        placeholder="Specify..."
                                        className="bg-white"
                                        disabled={selectedRelation === "Father" || selectedRelation === "Mother"}
                                        value={data[`${prefix}GiverCustomSuffix`] || ""}
                                        onChange={e => setData({ ...data, [`${prefix}GiverCustomSuffix`]: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Giver ID Section (inside Giver box) */}
                            <ValidIDSection prefix={prefix} data={data} setData={setData} type="Giver" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Groom/Bride Main ID Section */}
            <ValidIDSection prefix={prefix} data={data} setData={setData} type="Main" />

            {/* Missing Info Feedback */}
            <ValidationFeedback data={data} prefix={prefix} />
        </div>
    );
}   
