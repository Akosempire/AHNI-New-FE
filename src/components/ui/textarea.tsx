import { cn } from "@/lib/utils";
import * as React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[88px] w-full rounded-[6px] border border-[var(--line-strong,#e2e1e8)] bg-[var(--surface,#fff)] px-3 py-2 text-[14px] text-[var(--ink,#17171c)] transition-colors placeholder:text-[var(--faint,#8d8d97)] hover:border-[var(--faint,#8d8d97)] focus-visible:outline-none focus-visible:border-[var(--brand,#f2564d)] focus-visible:ring-2 focus-visible:ring-[var(--brand,#f2564d)]/25 disabled:cursor-not-allowed disabled:opacity-[.45]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
