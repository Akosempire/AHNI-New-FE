import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center gap-x-2 justify-center whitespace-nowrap rounded-[6px] text-[13.5px] font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[.45] [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-[var(--brand-hover,#e2443b)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[var(--line-strong,#e2e1e8)] bg-[var(--surface,#fff)] text-[var(--ink,#17171c)] hover:border-[var(--faint,#8d8d97)] hover:bg-[var(--hover,#f6f5f9)]",
        secondary:
          "bg-[var(--surface-2,#f3f2f7)] text-[var(--ink,#17171c)] hover:bg-[var(--line-strong,#e2e1e8)]",
        ghost: "text-[var(--ink-2,#3a3a44)] hover:bg-[var(--hover,#f6f5f9)] hover:text-[var(--ink,#17171c)]",
        link: "text-primary underline-offset-4 hover:underline",
        custom: "border border-[var(--line-strong,#e2e1e8)] bg-[var(--surface,#fff)] text-[var(--ink,#17171c)] hover:bg-[var(--hover,#f6f5f9)]",
        shallow: "bg-[var(--brand-soft,#fff0ee)] text-[var(--brand-ink,#b8302a)] hover:bg-[var(--brand-soft,#fff0ee)]/70",
      },
      size: {
        default: "h-9 px-3.5",
        sm: "h-8 px-3 text-[13px]",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
