"use client";

/**
 * "Waiting on you" – the approvals queue as a real table.
 * Filter by type, sort by amount or waiting time, open a row with click or Enter.
 * On phones the rows collapse to a two-line list.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CheckCircle2 } from "lucide-react";
import { KeyboardEvent, useMemo, useState } from "react";

export type AttentionItem = {
  id: string;
  ref?: string;
  title: string;
  /** Short type name used for the filter tabs, e.g. "Fund request" */
  type: string;
  amount?: number;
  currency?: string;
  date?: string;
  status?: string;
  urgent?: boolean;
  href: string;
};

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const formatMoney = (n: number, currency = "NGN") => {
  const sym = currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "";
  return `${sym}${n.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
};

export const waitingFor = (d?: string) => {
  if (!d) return "—";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))} min`;
  if (s < 86400) return `${Math.floor(s / 3600)} h`;
  const days = Math.floor(s / 86400);
  return days === 1 ? "1 day" : `${days} days`;
};

const tone = (s?: string) =>
  /reject|declin|cancel/i.test(s || "") ? "danger" : /approv|complete|paid/i.test(s || "") ? "success" : /pend|submit|review|await/i.test(s || "") ? "warning" : "neutral";

type SortKey = "default" | "amount" | "age";

export default function AttentionTable({
  items,
  loading,
  viewAllHref = "/dashboard/notifications",
}: {
  items: AttentionItem[];
  loading?: boolean;
  viewAllHref?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<string>("All");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "default", dir: "desc" });

  const types = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((i) => m.set(i.type, (m.get(i.type) ?? 0) + 1));
    return [...m.entries()];
  }, [items]);

  const rows = useMemo(() => {
    const list = items.filter((i) => type === "All" || i.type === type);
    const age = (i: AttentionItem) => (i.date ? new Date(i.date).getTime() : Date.now());
    const sorted = [...list].sort((a, b) => {
      if (sort.key === "amount") return ((a.amount ?? 0) - (b.amount ?? 0)) * (sort.dir === "asc" ? 1 : -1);
      if (sort.key === "age") return (age(b) - age(a)) * (sort.dir === "asc" ? 1 : -1);
      // Default: urgent first, then whatever has waited longest
      if (!!b.urgent !== !!a.urgent) return b.urgent ? 1 : -1;
      return age(a) - age(b);
    });
    return sorted;
  }, [items, type, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));

  const open = (href: string) => router.push(href);
  const onRowKey = (e: KeyboardEvent, href: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(href);
    }
  };

  const SortHead = ({ k, children, right }: { k: SortKey; children: string; right?: boolean }) => (
    <th
      scope="col"
      aria-sort={sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      className={cx("h-10 px-4 text-[12.5px] font-medium text-[var(--muted)]", right && "text-right")}
    >
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className={cx("inline-flex items-center gap-1 rounded-[4px] hover:text-[var(--ink)]", right && "flex-row-reverse")}
      >
        {children}
        {sort.key === k ? (
          sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowDown className="h-3 w-3 opacity-0" />
        )}
      </button>
    </th>
  );

  return (
    <section aria-labelledby="queue-title" id="queue" className="min-w-0" data-tour="attention">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--line-strong)]">
        <h2 id="queue-title" className="pb-3 text-[17px] font-semibold">
          Waiting on you
        </h2>
        {types.length > 1 && (
          <div role="tablist" aria-label="Filter by type" className="ux-plain-tabs -mb-px flex gap-1 overflow-x-auto">
            {[["All", items.length] as [string, number], ...types].map(([t, n]) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={type === t}
                onClick={() => setType(t)}
                className={cx(
                  "flex h-10 flex-none items-center gap-1.5 border-b-2 px-2.5 text-[13.5px] transition-colors",
                  type === t ? "border-[var(--ink)] font-semibold text-[var(--ink)]" : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                )}
              >
                {t}
                <span className={cx("tabular-nums text-[12px]", type === t ? "text-[var(--ink-2)]" : "text-[var(--faint)]")}>{n}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="divide-y divide-[var(--line)]" aria-hidden="true">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="flex items-center gap-4 py-4">
              <div className="skeleton h-4 w-2/5" />
              <div className="skeleton ml-auto h-4 w-20" />
              <div className="skeleton h-4 w-16" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex items-center gap-3 py-10 text-[15px] text-[var(--muted)]">
          <CheckCircle2 className="h-5 w-5 flex-none text-[var(--mint-ink)]" />
          Nothing is waiting on you. New approvals will show up here.
        </div>
      ) : (
        <>
          {/* Desktop / tablet table */}
          <table className="hidden w-full table-fixed text-[14px] sm:table">
            <colgroup>
              <col />
              <col className="w-[92px]" />
              <col className="w-[128px]" />
              <col className="w-[132px]" />
              <col className="w-[84px]" />
            </colgroup>
            <caption className="sr-only">Requests and approvals waiting on you</caption>
            <thead>
              <tr className="border-b border-[var(--line)]">
                <th scope="col" className="h-10 px-4 pl-0 text-left text-[12.5px] font-medium text-[var(--muted)]">Request</th>
                <SortHead k="age">Waiting</SortHead>
                <SortHead k="amount" right>Amount</SortHead>
                <th scope="col" className="h-10 px-4 text-left text-[12.5px] font-medium text-[var(--muted)]">Status</th>
                <th scope="col" className="h-10 w-[1%] pr-0"><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  tabIndex={0}
                  onClick={() => open(r.href)}
                  onKeyDown={(e) => onRowKey(e, r.href)}
                  className="group cursor-pointer border-b border-[var(--line)] outline-none transition-colors last:border-0 hover:bg-[var(--hover)] focus-visible:bg-[var(--hover)] focus-visible:shadow-[inset_2px_0_0_var(--ink)]"
                >
                  <td className="min-w-0 py-3 pl-0 pr-4">
                    <span className="flex min-w-0 items-center gap-2">
                      {r.urgent && <span className="h-1.5 w-1.5 flex-none rounded-full bg-[var(--brand)]" aria-label="Urgent" />}
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-[var(--ink)]">{r.title}</span>
                        <span className="block truncate text-[12.5px] tabular-nums text-[var(--muted)]">
                          {r.type}
                          {r.ref ? `, ${r.ref}` : ""}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-[var(--ink-2)]">{waitingFor(r.date)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">
                    {r.amount != null ? formatMoney(r.amount, r.currency) : <span className="text-[var(--faint)]">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`badge badge-${tone(r.status)}`}>{(r.status || "New").replace(/_/g, " ")}</span>
                  </td>
                  <td className="py-3 pl-2 pr-0 text-right">
                    <Link
                      href={r.href}
                      onClick={(e) => e.stopPropagation()}
                      tabIndex={-1}
                      className="btn btn-outline !h-8 !px-3 text-[13px] opacity-70 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phone list */}
          <ul className="divide-y divide-[var(--line)] sm:hidden">
            {rows.map((r) => (
              <li key={r.id}>
                <Link href={r.href} className="flex items-start gap-3 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      {r.urgent && <span className="h-1.5 w-1.5 flex-none rounded-full bg-[var(--brand)]" aria-label="Urgent" />}
                      <span className="truncate text-[14.5px] font-medium">{r.title}</span>
                    </span>
                    <span className="mt-0.5 block text-[12.5px] text-[var(--muted)]">
                      {r.type}, waiting {waitingFor(r.date)}
                    </span>
                  </span>
                  <span className="flex flex-none flex-col items-end gap-1">
                    {r.amount != null && <span className="text-[14px] font-medium tabular-nums">{formatMoney(r.amount, r.currency)}</span>}
                    <span className={`badge badge-${tone(r.status)} !text-[12px]`}>{(r.status || "New").replace(/_/g, " ")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-1 flex items-center justify-between border-t border-[var(--line)] pt-3 text-[13px] text-[var(--muted)]">
        <span className="tabular-nums">
          {rows.length} of {items.length} shown
        </span>
        <Link href={viewAllHref} className="font-medium text-[var(--ink)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--ink)]">
          Open all approvals
        </Link>
      </div>
    </section>
  );
}
