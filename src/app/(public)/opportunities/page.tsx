"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { OPP_TYPES, ORG } from "@/components/public/content";
import { Heartbeat } from "@/components/public/icons";
import { OppCard, OppCardSkeleton } from "@/components/public/OppCard";
import { FinalCTA } from "@/components/public/sections";
import { Aurora, Eyebrow, Pill, Sheet, cx } from "@/components/public/ui";
import { useOpportunities } from "@/components/public/useOpportunities";

const PAGE_SIZE = 20;

function OpportunitiesInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initialType = (params?.get("type") ?? "").toUpperCase();
  const [type, setType] = useState(OPP_TYPES.some((t) => t.key === initialType) ? initialType : "");
  const [query, setQuery] = useState(params?.get("q") || "");
  const [search, setSearch] = useState(query);
  const [location, setLocation] = useState("all");
  const [sort, setSort] = useState<"latest" | "closing">("latest");
  const [page, setPage] = useState(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  // debounce the keyword search
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => setPage(1), [type, search]);

  // keep the URL shareable
  useEffect(() => {
    const sp = new URLSearchParams();
    if (type) sp.set("type", type);
    if (search) sp.set("q", search);
    const qs = sp.toString();
    router.replace(`/opportunities${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [type, search, router]);

  const { items, total, pages, isLoading, isError, refetch } = useOpportunities({
    page,
    size: PAGE_SIZE,
    search,
    type,
  });

  const locations = useMemo(() => Array.from(new Set(items.map((o) => o.location))).sort(), [items]);
  const shown = useMemo(() => {
    let r = location === "all" ? items : items.filter((o) => o.location === location);
    r = [...r].sort((a, b) => {
      if (sort === "closing") {
        const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return da - db;
      }
      return new Date(b.postedDate || 0).getTime() - new Date(a.postedDate || 0).getTime();
    });
    return r;
  }, [items, location, sort]);

  const count = location === "all" ? total ?? shown.length : shown.length;

  return (
    <>
      {/* Dark hero */}
      <Sheet tone="ink" z={20} className="on-dark !pb-[150px] !pt-[180px] md:!pt-[220px]" ariaLabel="Opportunities">
        <Heartbeat className="pointer-events-none absolute right-0 top-[120px] hidden w-[620px] opacity-30 lg:block" color="var(--primary-text)" />
        <div className="wrap relative flex flex-wrap items-end justify-between gap-8">
          <div>
            <Eyebrow>Careers · Consultancies · Procurement</Eyebrow>
            <h1 className="t-display">
              Find your <span className="hl">place</span>
              <br />
              in the work
            </h1>
          </div>
          <Pill href="/consultant-portal" tone="accent">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9Zm4 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Consultant portal
          </Pill>
        </div>
      </Sheet>

      {/* Floating search bar */}
      <div className="wrap relative z-[25] -mt-[44px]">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(query.trim());
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="flex flex-col gap-2 rounded-[32px] bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,.14)] md:h-[88px] md:flex-row md:items-center md:gap-0 md:rounded-full md:pl-8"
        >
          <label className="flex flex-1 items-center gap-3 px-4 py-3 md:px-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span className="sr-only">Keyword</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Job title, keyword or reference"
              className="w-full bg-transparent text-[17px] outline-none placeholder:text-[#8b8b95]"
            />
          </label>
          <span aria-hidden="true" className="hidden h-10 w-px bg-[var(--line)] md:block" />
          <label className="flex items-center px-4 md:px-6">
            <span className="sr-only">Location</span>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="h-12 w-full cursor-pointer bg-transparent text-[15px] font-semibold outline-none md:w-[180px]">
              <option value="all">All locations</option>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
          <span aria-hidden="true" className="hidden h-10 w-px bg-[var(--line)] md:block" />
          <label className="flex items-center px-4 md:px-6">
            <span className="sr-only">Opportunity type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="h-12 w-full cursor-pointer bg-transparent text-[15px] font-semibold outline-none md:w-[200px]">
              <option value="">All opportunity types</option>
              {OPP_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </label>
          <button type="submit" aria-label="Search" className="grid h-[60px] w-full flex-none place-items-center rounded-full bg-[var(--accent)] transition-colors hover:bg-[var(--accent-strong)] md:mr-1.5 md:h-[72px] md:w-[72px]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.4" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
          </button>
        </form>
      </div>

      {/* Results */}
      <section ref={resultsRef} className="relative z-[19] mt-[calc(-44px-var(--radius-sheet))] scroll-mt-28 rounded-b-[var(--radius-sheet)] bg-[var(--mist)] pb-32 pt-[calc(110px+var(--radius-sheet))]" aria-label="Results">
        <div className="wrap">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
            <button type="button" className="chip" aria-pressed={type === ""} onClick={() => setType("")}>All</button>
            {OPP_TYPES.map((t) => (
              <button key={t.key} type="button" className="chip" aria-pressed={type === t.key} onClick={() => setType(t.key)}>
                {t.plural}
              </button>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[clamp(40px,5vw,64px)] font-bold leading-none tracking-[-0.05em]" aria-live="polite">
              {type ? OPP_TYPES.find((t) => t.key === type)?.plural : "Opportunities"}
              <sup className="ml-1 align-super text-[0.4em] font-bold tracking-normal text-[var(--ink-soft)]">
                {isLoading ? "…" : count}
              </sup>
            </h2>
            <label className="flex items-center gap-2 text-[14px] font-semibold">
              <span className="text-[var(--ink-soft)]">Sort by:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="cursor-pointer rounded-full bg-white px-4 py-2.5 font-bold outline-none">
                <option value="latest">Latest</option>
                <option value="closing">Closing soon</option>
              </select>
            </label>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {isLoading
              ? [0, 1, 2, 3].map((i) => <OppCardSkeleton key={i} />)
              : shown.map((o) => <OppCard key={o.id} o={o} className="h-full" />)}
          </div>

          {!isLoading && shown.length === 0 && (
            <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-white px-8 py-16 text-center">
              <Aurora className="left-1/2 top-0 h-40 w-80 -translate-x-1/2 opacity-50" />
              <div className="relative">
                <p className="text-[28px] font-bold tracking-[-0.03em]">
                  {isError ? "We couldn't load opportunities" : "Nothing matches just yet"}
                </p>
                <p className="mx-auto mt-3 max-w-[520px] text-[var(--ink-soft)]">
                  {isError
                    ? "The portal may be busy. Please try again in a moment."
                    : `Try a different keyword or type, or email ${ORG.emails.careers} to register your interest.`}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {isError ? (
                    <Pill tone="ink" onClick={() => refetch()}>Try again</Pill>
                  ) : (
                    <Pill
                      tone="ink"
                      onClick={() => {
                        setType("");
                        setQuery("");
                        setLocation("all");
                      }}
                    >
                      Clear filters
                    </Pill>
                  )}
                </div>
              </div>
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
              <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className={cx("pill pill-white sm", page <= 1 && "pointer-events-none opacity-40")}>
                Previous
              </button>
              <span className="px-4 text-[14px] font-bold">
                Page {page} of {pages}
              </span>
              <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className={cx("pill pill-ink sm", page >= pages && "pointer-events-none opacity-40")}>
                Next
              </button>
            </nav>
          )}
        </div>
      </section>

      <FinalCTA
        z={10}
        eyebrow="Can't find the right fit?"
        title={
          <>
            Tell us how you&apos;d like to
            <br className="hidden md:block" /> make an impact
          </>
        }
      />
    </>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--ink)]" />}>
      <OpportunitiesInner />
    </Suspense>
  );
}
