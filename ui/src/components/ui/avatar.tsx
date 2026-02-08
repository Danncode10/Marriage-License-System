import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string;
    fallback: string;
}

const Avatar = ({ className, src, fallback, ...props }: AvatarProps) => (
    <div
        className={cn(
            "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-200 dark:border-zinc-800",
            className
        )}
        {...props}
    >
        {src ? (
            <img src={src} alt="Avatar" className="aspect-square h-full w-full" />
        ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">
                {fallback}
            </div>
        )}
    </div>
);

export { Avatar };
