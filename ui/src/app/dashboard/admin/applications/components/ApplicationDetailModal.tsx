"use client";

import { X, Edit2 } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { DetailItem } from "./ApplicationActions";

interface ApplicationDetailModalProps {
    selectedApp: any;
    onClose: () => void;
    onEdit?: (app: any) => void;
}

export default function ApplicationDetailModal({ selectedApp, onClose, onEdit }: ApplicationDetailModalProps) {
    if (!selectedApp) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b px-8 py-5 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Application Review</h2>
                        <p className="text-sm text-zinc-400 font-medium mt-0.5">
                            #{selectedApp.application_code} &bull; {new Date(selectedApp.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            {selectedApp.contact_number && ` · ${selectedApp.contact_number}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(selectedApp)}
                                className="flex items-center gap-2 h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-200"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Info
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all"
                        >
                            <X className="h-5 w-5 text-zinc-600" />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 space-y-8 bg-zinc-50/50">
                    {/* Status + Submitter */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <StatusBadge status={selectedApp.status} />
                        <span className="text-xs text-zinc-400 font-bold">Submitted by: {selectedApp.submitted_by}</span>
                    </div>

                    {/* Groom & Bride Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['groom', 'bride'].map((type) => {
                            const person = type === 'groom' ? selectedApp.groom : selectedApp.bride;
                            const isGroom = type === 'groom';

                            if (!person) return (
                                <div key={type} className="bg-white rounded-3xl border border-zinc-100 p-6 flex items-center justify-center h-40">
                                    <p className="text-zinc-400 text-sm italic">No {type} data found</p>
                                </div>
                            );

                            const fullName = [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") + (person.suffix ? `, ${person.suffix}` : "");
                            const address = person.addresses
                                ? [person.addresses.barangay, person.addresses.municipality, person.addresses.province].filter(Boolean).join(", ")
                                : null;

                            return (
                                <div key={type} className="space-y-3">
                                    <div className={`p-4 rounded-2xl border ${isGroom ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                        <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${isGroom ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                            {type}'s Information
                                        </h3>
                                    </div>

                                    <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
                                        <section className="space-y-3">
                                            <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Personal Details</h4>
                                            <DetailItem label="Full Name" value={fullName} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <DetailItem label="Birthday" value={person.birth_date ? new Date(person.birth_date).toLocaleDateString() : null} />
                                                <DetailItem label="Age" value={person.age} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <DetailItem label="Citizenship" value={person.citizenship} />
                                                <DetailItem label="Religion" value={person.religion} />
                                            </div>
                                        </section>

                                        {address && (
                                            <section className="space-y-2">
                                                <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Current Residence</h4>
                                                <DetailItem label="Address" value={address} />
                                            </section>
                                        )}

                                        <section className="space-y-3">
                                            <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Parental Information</h4>
                                            <DetailItem label="Father's Name" value={person.father_name} />
                                            <DetailItem label="Mother's Name" value={person.mother_name} />
                                        </section>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t pt-4 text-center">
                        <p className="text-xs text-zinc-400 italic">This application record is encrypted and legally binding under RA 10173.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
