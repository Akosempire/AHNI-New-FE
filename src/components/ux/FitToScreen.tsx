"use client";

/**
 * On large screens, list pages should fit the window: if the page is taller than the
 * screen and has a table, the table box gets just short enough for everything to fit,
 * and scrolls inside itself. Re-checks when the page changes size or content.
 */
import { useEffect } from "react";

const MIN_TABLE = 260;

export default function FitToScreen({ pathname }: { pathname: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const big = window.matchMedia("(min-width: 1024px) and (min-height: 700px)");
    let raf = 0;

    const fit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const main = document.getElementById("app-main");
        if (!main) return;
        const wraps = Array.from(main.querySelectorAll<HTMLElement>(".ux-table-wrap"));
        wraps.forEach((w) => (w.style.maxHeight = ""));
        if (!big.matches || !wraps.length) return;
        const overflow = document.documentElement.scrollHeight - window.innerHeight;
        if (overflow <= 0) return;
        // shrink the tallest table first
        const target = wraps.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
        const h = target.getBoundingClientRect().height;
        const next = Math.max(MIN_TABLE, Math.floor(h - overflow - 2));
        if (next < h) target.style.maxHeight = `${next}px`;
      });
    };

    const mo = new MutationObserver(() => fit());
    const main = document.getElementById("app-main");
    if (main) mo.observe(main, { childList: true, subtree: true });
    window.addEventListener("resize", fit);
    const timers = [300, 1200, 3000].map((t) => setTimeout(fit, t));
    fit();
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", fit);
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [pathname]);
  return null;
}
