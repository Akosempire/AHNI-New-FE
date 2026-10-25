"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "./ui";

const ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  },
  {
    href: "/opportunities",
    label: "Jobs",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="3" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </>
    ),
  },
  {
    href: "/focus-areas",
    label: "Focus",
    icon: <path d="M3 12h4l2-6 4 12 2-6h6" />,
  },
  {
    href: "/contact",
    label: "Contact",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
  },
];

/** Phone-only floating dock: quick jumps between the key pages once you scroll past the hero. */
export default function MobileDock() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const nearBottom = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 420;
      setShow(window.scrollY > window.innerHeight * 0.55 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <nav
      aria-label="Quick navigation"
      className={cx(
        "fixed bottom-4 left-4 right-[88px] z-[55] md:hidden",
        "transition-all duration-300",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      )}
    >
      <ul className="flex h-[60px] items-center justify-between rounded-full bg-[rgba(23,23,28,.92)] px-2 text-white shadow-[0_16px_40px_rgba(0,0,0,.28)] backdrop-blur-md">
        {ITEMS.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname?.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "mx-auto flex h-[46px] w-full max-w-[76px] flex-col items-center justify-center gap-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.06em] transition-colors",
                  active ? "bg-[var(--accent)] text-[var(--ink)]" : "text-white/75"
                )}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {it.icon}
                </svg>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
