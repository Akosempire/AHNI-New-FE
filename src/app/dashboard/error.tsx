"use client";

/**
 * Shown inside the app shell when a page fails to render, so the navigation stays
 * usable and the user has a clear way forward instead of a blank screen.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const [details, setDetails] = useState(false);
  useEffect(() => {
    console.error("Page failed to render:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-start py-16">
      <span className="mb-5 grid h-10 w-10 place-items-center rounded-[8px] bg-[var(--danger-soft,#fdecec)] text-[var(--danger,#c62828)]">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="text-[24px] font-medium leading-8">This page couldn&apos;t load</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted,#64646e)]">
        Some of its information came back in a form the page didn&apos;t expect. Try again; if it keeps happening, let IT support know which page
        you were on.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <button type="button" onClick={reset} className="btn btn-primary">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link href="/dashboard" className="btn btn-outline">
          Go to dashboard
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setDetails((v) => !v)}
        aria-expanded={details}
        className="mt-8 text-[13px] text-[var(--muted,#64646e)] underline underline-offset-4 hover:text-[var(--ink,#17171c)]"
      >
        {details ? "Hide technical details" : "Show technical details"}
      </button>
      {details && (
        <pre className="mt-3 w-full overflow-x-auto rounded-[6px] border border-[var(--line-strong,#e2e1e8)] bg-[var(--surface-2,#f3f2f7)] p-3 font-mono text-[12px] text-[var(--ink-2,#3a3a44)]">
          {error.message}
          {error.digest ? `\nRef: ${error.digest}` : ""}
        </pre>
      )}
    </div>
  );
}
