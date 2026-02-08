import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        const variants = {
            primary: "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-sm",
            secondary: "bg-zinc-100 text-black hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
            outline: "border border-zinc-300 bg-transparent hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800",
            ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 py-2",
            lg: "h-12 px-8 text-lg",
        };

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-white active:scale-[0.98]",
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
