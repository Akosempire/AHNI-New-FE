"use client";

import { useMemo } from "react";
import { useGetPublicEois } from "@/features/procurement/controllers/eoiController";
import { OPP_TYPES, OppTypeKey } from "./content";

export type Opportunity = {
  id: string;
  title: string;
  type: OppTypeKey | string;
  typeLabel: string;
  group: "people" | "procurement" | "other";
  reference?: string;
  project?: string;
  location: string;
  postedDate?: string;
  deadline?: string;
  description: string;
  href: string;
};

export function detailHref(type: string, id: string) {
  switch (type) {
    case "JOB":
    case "HR_JOB":
      return `/jobs/${id}`;
    case "CONSULTANT":
      return `/consultant-jobs/${id}`;
    case "ADHOC":
      return `/adhoc-jobs/${id}`;
    case "RFQ":
      return `/rfq/${id}`;
    case "RFP":
      return `/rfp/${id}`;
    default:
      return `/eoi/${id}`;
  }
}

const stripHtml = (s: string) => s.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

export function normalise(item: any): Opportunity {
  const t: string = item.opportunity_type || "EOI";
  const meta = OPP_TYPES.find((o) => o.key === t);
  let location = "Nigeria";
  if (Array.isArray(item.categories)) {
    const loc = item.categories.find((c: any) => c?.parent_category === "Location");
    if (loc?.name) location = loc.name;
  }
  if (item.location && typeof item.location === "string") location = item.location;
  return {
    id: String(item.id),
    title: item.name || item.title || "Untitled opportunity",
    type: t,
    typeLabel: meta?.label ?? t,
    group: meta?.group ?? "other",
    reference: item.eoi_number || item.reference_number || item.ref_no || undefined,
    project: typeof item.project === "string" ? item.project : item.project?.name,
    location,
    postedDate: item.created_at || item.opening_date,
    deadline: item.closing_date || item.deadline,
    description: stripHtml(item.description || ""),
    href: detailHref(t, String(item.id)),
  };
}

export function useOpportunities({
  page = 1,
  size = 20,
  search = "",
  type = "",
  enabled = true,
}: {
  page?: number;
  size?: number;
  search?: string;
  type?: string;
  enabled?: boolean;
}) {
  const q = useGetPublicEois({ page, size, search, opportunity_type: type, enabled });
  const items = useMemo<Opportunity[]>(
    () => ((q.data as any)?.data?.results ?? []).map(normalise),
    [q.data]
  );
  const d = (q.data as any)?.data;
  const total: number | null = d?.pagination?.count ?? d?.count ?? (q.data ? items.length : null);
  const pages: number = d?.pagination?.total_pages ?? d?.number_of_pages ?? 1;
  return { items, total, pages, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

/* ---------- formatting helpers ---------- */
export function isToday(d?: string) {
  if (!d) return false;
  const x = new Date(d);
  const n = new Date();
  return x.toDateString() === n.toDateString();
}

export function fmtDate(d?: string) {
  if (!d) return "";
  const x = new Date(d);
  if (isNaN(x.getTime())) return "";
  return x.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}

export function deadlineText(d?: string) {
  if (!d) return "Open until filled";
  const x = new Date(d);
  if (isNaN(x.getTime())) return "Open until filled";
  const days = Math.ceil((x.getTime() - Date.now()) / 86400000);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes tomorrow";
  if (days <= 14) return `Closes in ${days} days`;
  return `Closes ${x.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}
