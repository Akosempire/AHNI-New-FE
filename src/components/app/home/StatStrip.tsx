"use client";

/** Key figures as one ruled strip (not a row of identical cards). Each figure opens its list. */
import Link from "next/link";

export type Stat = { label: string; value: string; note: string; href: string; loading?: boolean };

export default function StatStrip({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <section aria-label="Key figures" data-tour="kpis" className="border-y border-[var(--line-strong)]">
      <ul className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <li
            key={s.label}
            className={[
              "min-w-0",
              i % 2 === 1 ? "border-l border-[var(--line)]" : "",
              i >= 2 ? "border-t border-[var(--line)] lg:border-t-0" : "",
              i === 2 ? "lg:border-l" : "",
            ].join(" ")}
          >
            <Link href={s.href} className="group block h-full px-4 py-5 transition-colors hover:bg-[var(--hover)] md:px-6">
              <span className="block text-[13px] text-[var(--muted)] group-hover:text-[var(--ink-2)]">{s.label}</span>
              {s.loading ? (
                <span className="skeleton mt-3 block h-8 w-24" aria-label="Loading" />
              ) : (
                <span className="mt-2 block truncate text-[26px] font-semibold leading-tight tracking-[-0.02em] tabular-nums md:text-[30px]">{s.value}</span>
              )}
              <span className="mt-1 block truncate text-[12.5px] text-[var(--muted)]">{s.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
