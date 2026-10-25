"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export { cx };

/* ---------- Section "sheet" with overlapping rounded bottom ---------- */
export function Sheet({
  tone = "white",
  z,
  id,
  className,
  children,
  style,
  ariaLabel,
}: {
  tone?: "white" | "mist" | "ink";
  /** Higher sheets sit on top of the one below. Pass a descending number down the page. */
  z: number;
  id?: string;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cx("sheet", `is-${tone}`, className)}
      style={{ zIndex: z, ...style }}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("t-eyebrow mb-5", className)}>{children}</p>;
}

type PillTone = "primary" | "accent" | "ink" | "white" | "chip";
export function Pill({
  href,
  tone = "ink",
  children,
  size,
  className,
  external,
  onClick,
}: {
  href?: string;
  tone?: PillTone;
  children: ReactNode;
  size?: "sm";
  className?: string;
  external?: boolean;
  onClick?: () => void;
}) {
  const cls = cx("pill", `pill-${tone}`, size, className);
  if (!href) {
    return (
      <button type="button" className={cls} onClick={onClick}>
        {children}
      </button>
    );
  }
  if (external || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return (
      <a href={href} className={cls} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} onClick={onClick}>
      {children}
    </Link>
  );
}

export function ArrowUpRight({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Aurora({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden="true" className={cx("aurora", className)} style={style} />;
}

/* ---------- Reveal-on-scroll: one observer for the whole public site ---------- */
export function RevealRoot() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    const scan = () => {
      document.querySelectorAll<HTMLElement>(".ahni-public [data-reveal]:not(.is-in)").forEach((el) => {
        if (reduce) el.classList.add("is-in");
        else io.observe(el);
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}

/** Convenience props for staggered reveal: <div {...reveal(2)} /> */
export const reveal = (i = 0) => ({ "data-reveal": "", style: { ["--i" as any]: i } as CSSProperties });

/* ---------- Horizontal carousel with progress bar ---------- */
export function Rail({
  children,
  label,
  className,
  controls = true,
}: {
  children: ReactNode;
  label: string;
  className?: string;
  controls?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ left: 0, width: 100 });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth;
    const width = Math.min(100, (el.clientWidth / Math.max(max, 1)) * 100);
    const left = max > el.clientWidth ? (el.scrollLeft / max) * 100 : 0;
    setBar({ left, width });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, children]);

  const step = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const amount = first ? first.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <div className={className}>
      <div
        ref={ref}
        className="rail"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        style={{
          // keep first card aligned with the page container on wide screens
          paddingInline: "max(var(--gutter), calc((100vw - var(--container)) / 2))",
          scrollPaddingInline: "max(var(--gutter), calc((100vw - var(--container)) / 2))",
        }}
      >
        {children}
        <div aria-hidden="true" style={{ width: 1 }} />
      </div>
      <div className="wrap mt-8 flex items-center gap-6">
        <div className="progress flex-1" aria-hidden="true">
          <span style={{ left: `${bar.left}%`, width: `${bar.width}%` }} />
        </div>
        {controls && (
          <div className="flex gap-2">
            <button type="button" aria-label="Previous" onClick={() => step(-1)} className="arrow-btn sm chip-bg" style={{ transform: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button type="button" aria-label="Next" onClick={() => step(1)} className="arrow-btn sm chip-bg" style={{ transform: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Count-up number ---------- */
export function CountUp({ value, duration = 1400 }: { value: number | null | undefined; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (value == null) return;
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(value);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);
  return <span ref={ref}>{value == null ? "–" : shown}</span>;
}

/* ---------- Accordion row ---------- */
export function AccordionItem({
  title,
  children,
  open,
  onToggle,
  id,
  size = "lg",
  dark,
}: {
  title: ReactNode;
  children: ReactNode;
  open: boolean;
  onToggle: () => void;
  id: string;
  size?: "lg" | "md";
  dark?: boolean;
}) {
  return (
    <div className={cx("border-b", dark ? "border-white/15" : "border-[var(--line)]")}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={onToggle}
          className={cx(
            "flex w-full items-center justify-between gap-6 py-6 text-left font-bold tracking-[-0.025em] transition-colors",
            size === "lg" ? "text-[clamp(22px,2.4vw,30px)]" : "text-[20px]"
          )}
        >
          <span>{title}</span>
          <span
            aria-hidden="true"
            className={cx(
              "grid h-11 w-11 flex-none place-items-center rounded-full text-[22px] font-medium transition-transform duration-300",
              dark ? "bg-white/10" : "bg-[var(--chip)]",
              open && "rotate-45"
            )}
          >
            +
          </span>
        </button>
      </h3>
      <div className="acc-panel" data-open={open} id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`}>
        <div>
          <div className="pb-7 pr-14">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Scroll-linked text: words fill from grey to ink as you scroll ---------- */
export type TextPart = string | { t: string; hl?: boolean };
export function ScrollText({
  parts,
  className,
  as: Tag = "p",
}: {
  parts: TextPart[];
  className?: string;
  as?: "p" | "h2" | "h3";
}) {
  const ref = useRef<HTMLElement>(null);
  const words: { w: string; hl: boolean }[] = [];
  parts.forEach((p) => {
    const t = typeof p === "string" ? p : p.t;
    const hl = typeof p !== "string" && !!p.hl;
    t.split(/(\s+)/).forEach((w) => w && words.push({ w, hl }));
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-w]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      spans.forEach((s) => s.setAttribute("data-on", ""));
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // starts filling when the top reaches 85% of the viewport, done when the bottom reaches 45%
      const start = vh * 0.85;
      const end = vh * 0.45;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height)));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => (i < lit ? s.setAttribute("data-on", "") : s.removeAttribute("data-on")));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <Tag ref={ref as any} className={cx("scroll-text", className)}>
      <span className="sr-only">{words.map((x) => x.w).join("")}</span>
      <span aria-hidden="true">
        {words.map((x, i) =>
          /^\s+$/.test(x.w) ? (
            x.w
          ) : (
            <span key={i} data-w="" className={x.hl ? "is-hl" : undefined}>
              {x.w}
            </span>
          )
        )}
      </span>
    </Tag>
  );
}
