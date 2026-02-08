import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:bg-primary/90 shadow-[0_4px_14px_0_rgba(1,103,244,0.39)] active:scale-[0.98]",
            secondary: "bg-secondary text-primary-foreground font-bold hover:bg-secondary/90 shadow-[0_4px_14px_0_rgba(254,222,9,0.39)] active:scale-[0.98]",
            outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm active:scale-[0.98]",
            ghost: "bg-transparent hover:bg-slate-100 text-slate-600 active:scale-[0.95]",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 py-2 text-sm",
            lg: "h-14 px-10 text-base font-bold tracking-tight",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
