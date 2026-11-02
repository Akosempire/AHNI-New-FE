"use client";

/**
 * Start a request. Learns which requests this person starts most and puts those first
 * (stored on this device only); the rest sit under "More".
 */
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

const KEY = "ahni-quick-usage";
const read = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};

export default function QuickStart({
  actions,
  icons,
  show = 3,
}: {
  actions: { label: string; href: string }[];
  icons: Record<string, ReactNode>;
  show?: number;
}) {
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [more, setMore] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => setUsage(read()), []);
  useEffect(() => {
    if (!more) return;
    const off = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMore(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMore(false);
    document.addEventListener("mousedown", off);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", off);
      document.removeEventListener("keydown", esc);
    };
  }, [more]);

  const sorted = useMemo(
    () => actions.map((a, i) => ({ ...a, i, n: usage[a.href] ?? 0 })).sort((a, b) => b.n - a.n || a.i - b.i),
    [actions, usage]
  );
  const track = (href: string) => {
    const u = { ...read(), [href]: (read()[href] ?? 0) + 1 };
    try {
      localStorage.setItem(KEY, JSON.stringify(u));
    } catch {}
  };
  if (!actions.length) return null;
  const first = sorted.slice(0, show);
  const rest = sorted.slice(show);

  const item =
    "flex h-8 flex-none items-center gap-2 whitespace-nowrap rounded-[6px] border border-[var(--line-strong)] bg-[var(--surface)] px-2.5 text-[13px] text-[var(--ink-2)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:stroke-[1.7]";

  return (
    <nav aria-label="Start a request" className="flex min-w-0 items-center gap-2">
      <span className="hidden flex-none text-[13px] text-[var(--muted)] xl:inline">Start</span>
      <ul className="flex min-w-0 gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {first.map((q) => (
          <li key={q.href}>
            <Link href={q.href} onClick={() => track(q.href)} className={item}>
              {icons[q.label]}
              {q.label}
            </Link>
          </li>
        ))}
      </ul>
      {rest.length > 0 && (
        <div ref={ref} className="relative flex-none">
          <button type="button" aria-haspopup="menu" aria-expanded={more} onClick={() => setMore((v) => !v)} className={item}>
            More <ChevronDown className="!h-3.5 !w-3.5" />
          </button>
          {more && (
            <div role="menu" className="ux-pop absolute right-0 top-[calc(100%+6px)] z-30 w-[220px] rounded-[8px] bg-[var(--surface)] p-1 shadow-[var(--shadow-pop)]">
              {rest.map((q) => (
                <Link
                  key={q.href}
                  role="menuitem"
                  href={q.href}
                  onClick={() => track(q.href)}
                  className="flex h-8 items-center gap-2 rounded-[6px] px-2 text-[13.5px] hover:bg-[var(--hover)] [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:text-[var(--muted)]"
                >
                  {icons[q.label]}
                  {q.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
