import { Card } from "@/components/ui/card";
import { GraduationCap, Heart } from "lucide-react";

interface SectionCardProps {
    title: string;
    color: 'blue' | 'yellow';
    children: React.ReactNode;
}

export function SectionCard({ title, color, children }: SectionCardProps) {
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
