import * as React from "react";
import { cn } from "@/lib/utils";

const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm",
            className
        )}
        {...props}
    />
);

export { Card };
