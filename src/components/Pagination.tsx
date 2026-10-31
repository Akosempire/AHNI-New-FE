"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useState } from "react";

type TProps = {
  onChange: (page: number) => void;
  total: number;
  itemsPerPage: number;
  page?: number;
  nextLabel?: string;
  previousLabel?: string;
  className?: string;
  placement?: "left" | "right";
};

/**
 * Compact pager: "1–25 of 164" on the left, « ‹ 1 / 7 › » on the right.
 * Same props as before, so every list keeps working.
 */
export default function Pagination({ onChange, total, itemsPerPage, page, className }: TProps) {
  // Some lists don't pass the current page; keep track of it here in that case
  const [own, setOwn] = useState(1);
  if (!(total > 0 && itemsPerPage > 0)) return null;
  const pages = Math.max(1, Math.ceil(total / itemsPerPage));
  const current = Math.min(Math.max(1, page ?? own), pages);
  const from = (current - 1) * itemsPerPage + 1;
  const to = Math.min(total, current * itemsPerPage);
  const go = (p: number) => {
    if (p < 1 || p > pages || p === current) return;
    setOwn(p);
    onChange(p);
  };

  const btn =
    "grid h-9 w-9 place-items-center rounded-[6px] text-[var(--muted,#6b6b76)] transition-colors hover:bg-[var(--hover,#f6f5f9)] hover:text-[var(--ink,#17171c)] disabled:pointer-events-none disabled:opacity-[.45]";

  return (
    <nav aria-label="Pagination" className={cn("mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[13px]", className)}>
      <p className="text-[var(--muted,#6b6b76)]" aria-live="polite">
        <span className="font-medium tabular-nums text-[var(--ink,#17171c)]">
          {from.toLocaleString()}–{to.toLocaleString()}
        </span>{" "}
        of <span className="tabular-nums">{total.toLocaleString()}</span>
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-0.5">
          <button type="button" className={btn} onClick={() => go(1)} disabled={current === 1} aria-label="First page">
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button type="button" className={btn} onClick={() => go(current - 1)} disabled={current === 1} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[64px] text-center tabular-nums text-[var(--ink,#17171c)]">
            {current} <span className="text-[var(--faint,#9a9aa5)]">/</span> {pages}
          </span>
          <button type="button" className={btn} onClick={() => go(current + 1)} disabled={current === pages} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </button>
          <button type="button" className={btn} onClick={() => go(pages)} disabled={current === pages} aria-label="Last page">
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
