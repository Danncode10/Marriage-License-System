"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, MapPin, Edit2 } from "lucide-react";
import Link from "next/link";

interface ReviewSuccessViewProps {
    applicationCode: string;
    user: any;
    onEdit: () => void;
}

export default function ReviewSuccessView({ applicationCode, user, onEdit }: ReviewSuccessViewProps) {
    return (
        <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto"
        >
            <Card className="p-12 text-center shadow-2xl border-none rounded-[2rem]">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <FileText className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Application Submitted</h2>
                <p className="text-slate-500 mb-8 font-medium">Your Application Code Generated</p>
                <div className="bg-slate-50 px-8 py-6 rounded-3xl mb-10 border border-slate-100 shadow-inner">
                    <span className="text-6xl font-black text-primary tracking-tighter">{applicationCode}</span>
                </div>

                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-[2rem] p-8 text-left shadow-sm">
                        <h3 className="text-blue-800 font-black tracking-tight mb-6 flex items-center gap-2 text-xl italic uppercase">
                            <MapPin className="w-5 h-5" /> Final Steps
                        </h3>

                        <div className="space-y-4">
                            <Step number={1} title="Save your Code" desc="Print or screenshot your 6-digit application code." />
                            <Step number={2} title="Prepare Requirements" desc="Birth Certificate, CENOMAR, and Valid IDs (Original & Photocopy)." />
                            <Step number={3} title="Visit Solano Office" desc="Proceed to the Solano Municipal Office to finalize your application." />
                        </div>

                        {/* Special Cases Info */}
                        <div className="mt-8 pt-6 border-t border-blue-200/50">
                            <p className="text-blue-800 text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                For Special Cases
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                                <div className="bg-white/40 p-3 rounded-xl border border-blue-100">
                                    <p className="text-slate-700 text-[11px] font-bold leading-tight">
                                        <span className="text-blue-700">If Widowed:</span> Death certificate of past spouse
                                    </p>
                                </div>
                                <div className="bg-white/40 p-3 rounded-xl border border-blue-100">
                                    <p className="text-slate-700 text-[11px] font-bold leading-tight">
                                        <span className="text-blue-700">If Divorced:</span> Court Order
                                    </p>
                                </div>
                                <div className="bg-white/40 p-3 rounded-xl border border-blue-100">
                                    <p className="text-slate-700 text-[11px] font-bold leading-tight">
                                        <span className="text-blue-700">If Foreigner:</span> Legal Capacity
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {user ? (
                            <Link href="/dashboard/user">
                                <Button size="lg" className="h-16 w-full text-xl shadow-xl rounded-2xl font-bold bg-green-600 hover:bg-green-700">
                                    Go to My Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <Link href={`/login/signup?code=${applicationCode}`}>
                                <Button size="lg" className="h-16 w-full text-xl shadow-xl rounded-2xl font-bold">
                                    Create Account to Track
                                </Button>
                            </Link>
                        )}

                        <div className="flex gap-4 justify-center pt-8 border-t border-slate-100 mt-8">
                            <Button
                                variant="ghost"
                                onClick={onEdit}
                                className="h-14 px-8 rounded-2xl font-black text-slate-500 hover:text-primary hover:bg-primary/5 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 border-2 border-transparent hover:border-primary/10 group"
                            >
                                <Edit2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
                                EDIT INFORMATION
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function Step({ number, title, desc }: { number: number, title: string, desc: string }) {
    return (
        <div className="flex gap-4 items-start bg-white/60 p-5 rounded-2xl border border-blue-100">
            <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center text-xs font-black shrink-0">{number}</div>
            <div className="space-y-0.5">
                <p className="text-slate-900 font-black text-sm uppercase tracking-tight">{title}</p>
                <p className="text-slate-600 text-[11px] font-bold leading-tight">{desc}</p>
            </div>
        </div>
    );
}
