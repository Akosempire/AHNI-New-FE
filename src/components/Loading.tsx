import logoPng from "@/assets/svgs/logo-bg.svg";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
  text?: string;
}

export const LoadingSpinner = React.memo(({
  size = "default",
  className,
  text = "Loading..."
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className={cn("flex items-center justify-center gap-2", className)} role="status" aria-live="polite">
      <Loader2 className={cn("animate-spin", sizeClasses[size])} aria-hidden="true" />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
      {!text && <span className="sr-only">Loading...</span>}
    </div>
  );
});

LoadingSpinner.displayName = "LoadingSpinner";

/**
 * Page-level loading state. A skeleton shaped like a typical page (title, summary
 * cards, list) so the screen feels responsive instead of blank (Doherty threshold).
 */
export const Loading = () => {
  return (
    <div className="w-full py-2" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div aria-hidden="true">
        <div className="ux-skel mb-3 h-3 w-28 rounded-full" />
        <div className="ux-skel mb-8 h-7 w-64 max-w-[70%] rounded-full" />
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("ux-card p-4", i > 1 && "hidden lg:block")}>
              <div className="ux-skel mb-3 h-3 w-1/2 rounded-full" />
              <div className="ux-skel h-6 w-2/3 rounded-full" />
            </div>
          ))}
        </div>
        <div className="ux-card overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="flex items-center gap-4 border-b border-[var(--line,#e7e6ee)] px-4 py-4 last:border-0">
              <div className="ux-skel h-3.5 w-1/3 rounded-full" />
              <div className="ux-skel hidden h-3.5 w-1/5 rounded-full sm:block" />
              <div className="ux-skel ml-auto h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** Full-screen splash, for the very first app load only */
export const AppSplash = () => {
  return (
    <div className="flex justify-center h-screen items-center p-8">
      <div className="text-center">
        <img src={logoPng?.src || logoPng} alt="logo" className="mx-auto animate-bounce mb-4" />
        <LoadingSpinner text="Loading application..." />
      </div>
    </div>
  );
};
