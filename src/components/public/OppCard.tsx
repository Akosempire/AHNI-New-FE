"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Opportunity, deadlineText, fmtDate, isToday } from "./useOpportunities";
import { cx } from "./ui";

const SAVED_KEY = "ahni-saved-opportunities";
function readSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function OppCard({ o, className }: { o: Opportunity; className?: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(readSaved().includes(o.id)), [o.id]);
  const toggle = () => {
    const s = new Set(readSaved());
    s.has(o.id) ? s.delete(o.id) : s.add(o.id);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify([...s]));
    } catch {}
    setSaved(s.has(o.id));
  };
  const today = isToday(o.postedDate);

  return (
    <article className={cx("flex flex-col rounded-[var(--radius-card)] bg-white p-7 md:p-8", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cx(
            "inline-flex h-8 items-center rounded-full px-3.5 text-[12px] font-bold uppercase tracking-[0.06em]",
            today ? "bg-[var(--accent)] text-[var(--ink)]" : "bg-[var(--ink)] text-white"
          )}
        >
          {today ? "Today" : fmtDate(o.postedDate) || "New"}
        </span>
        <span className="text-[13px] font-medium uppercase tracking-[0.06em] text-[var(--ink-soft)]">
          {o.reference || o.typeLabel}
        </span>
      </div>

      <h3 className="mt-6 line-clamp-3 text-[clamp(24px,2.3vw,30px)] font-bold leading-[1.1] tracking-[-0.03em]">
        <Link href={o.href} className="hover:underline decoration-2 underline-offset-4">
          {o.title}
        </Link>
      </h3>

      <ul className="mt-6 space-y-2.5 text-[15px] text-[var(--ink-soft)]">
        <li className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" /></svg>
          <span><span className="sr-only">Location: </span>{o.location}</span>
        </li>
        <li className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="3" stroke="currentColor" strokeWidth="1.8" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.8" /></svg>
          <span><span className="sr-only">Type: </span>{o.typeLabel}</span>
        </li>
        <li className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" /><path d="M12 9v4l2.5 2M10 2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          <span>{deadlineText(o.deadline)}</span>
        </li>
      </ul>

      <div className="mt-auto flex items-center gap-2 pt-8">
        <Link href={o.href} className="pill pill-ink sm" aria-label={`View details: ${o.title}`}>
          Info
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save opportunity"}
          className={cx(
            "grid h-11 w-11 place-items-center rounded-full transition-colors",
            saved ? "bg-[var(--primary)] text-[var(--ink)]" : "bg-[var(--chip)] hover:bg-[#dcdce3]"
          )}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} aria-hidden="true"><path d="M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </article>
  );
}

export function OppCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cx("h-[380px] animate-pulse rounded-[var(--radius-card)] bg-white p-8", className)} aria-hidden="true">
      <div className="h-8 w-28 rounded-full bg-[var(--chip)]" />
      <div className="mt-6 h-7 w-4/5 rounded-lg bg-[var(--chip)]" />
      <div className="mt-3 h-7 w-3/5 rounded-lg bg-[var(--chip)]" />
      <div className="mt-8 h-4 w-1/2 rounded bg-[var(--chip)]" />
      <div className="mt-3 h-4 w-2/5 rounded bg-[var(--chip)]" />
    </div>
  );
}
