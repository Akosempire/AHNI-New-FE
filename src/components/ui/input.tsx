import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-9 w-full rounded-[6px] border border-[var(--line-strong,#e2e1e8)] bg-[var(--surface,#fff)] px-3 py-1.5 text-[14px] text-[var(--ink,#17171c)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--faint,#8d8d97)] hover:border-[var(--faint,#8d8d97)] focus-visible:outline-none focus-visible:border-[var(--brand,#f2564d)] focus-visible:ring-2 focus-visible:ring-[var(--brand,#f2564d)]/25 disabled:cursor-not-allowed disabled:opacity-[.45]",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
