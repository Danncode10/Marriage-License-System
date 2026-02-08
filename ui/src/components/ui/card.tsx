import * as React from "react";
import { cn } from "@/lib/utils";

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/50",
            className
        )}
        {...props}
    />
);

export { Card };
