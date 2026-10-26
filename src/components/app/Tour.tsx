"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Step = {
  target?: string; // value of a data-tour attribute; no target = centred welcome card
  title: string;
  body: string;
  /** On phones, open the navigation drawer before showing this step */
  inDrawer?: boolean;
  /** Only show on the dashboard home page */
  homeOnly?: boolean;
};

const STEPS: Step[] = [
  {
    title: "Welcome to your AHNi workspace",
    body: "Everything you need – requests, approvals and your department's tools – now lives in one place. This 1-minute tour shows you where things are.",
  },
  {
    target: "search",
    inDrawer: true,
    title: "Find any page in seconds",
    body: "Search every page you have access to. Press Ctrl K (⌘K on Mac) from anywhere to open it.",
  },
  {
    target: "nav-workspace",
    inDrawer: true,
    title: "Your self-service hub",
    body: "Leave, timesheets, payment and purchase requests, travel and messages – the things every staff member uses.",
  },
  {
    target: "nav-department",
    inDrawer: true,
    title: "Your department's tools",
    body: "Pages for your team's work. Groups open automatically on the page you're on, so you never lose your place.",
  },
  {
    target: "new",
    title: "Start a request fast",
    body: "Jump straight into the requests people make most often, without hunting through menus.",
  },
  {
    target: "notifications",
    title: "Stay on top of approvals",
    body: "New approvals, comments and reminders land here. The badge shows how many are waiting.",
  },
  {
    target: "kpis",
    homeOnly: true,
    title: "Your numbers at a glance",
    body: "Live figures for the areas you work in. Select a card to open the full list.",
  },
  {
    target: "attention",
    homeOnly: true,
    title: "What needs you today",
    body: "Items waiting on you or your team appear here first, so nothing slips.",
  },
  {
    target: "help",
    inDrawer: true,
    title: "Replay any time",
    body: "You can restart this tour from here or from your account menu whenever you need a refresher.",
  },
];

const KEY = (uid?: string | number) => `ahni-tour-done-v1-${uid ?? "anon"}`;

export function useTourControls(userId: string | number | undefined, ready: boolean) {
  const [running, setRunning] = useState(false);
  const pathname = usePathname();

  // Auto-start once per user, on the dashboard home, after the shell has loaded
  useEffect(() => {
    if (!ready || pathname !== "/dashboard") return;
    let done = true;
    try {
      done = localStorage.getItem(KEY(userId)) === "1";
    } catch {}
    if (done) return;
    const t = setTimeout(() => setRunning(true), 900);
    return () => clearTimeout(t);
  }, [ready, userId, pathname]);

  const start = useCallback(() => setRunning(true), []);
  const finish = useCallback(() => {
    setRunning(false);
    try {
      localStorage.setItem(KEY(userId), "1");
    } catch {}
  }, [userId]);

  return useMemo(() => ({ running, start, finish }), [running, start, finish]);
}

function visibleTarget(name?: string): HTMLElement | null {
  if (!name) return null;
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`));
  return all.find((el) => el.getClientRects().length > 0 && el.offsetParent !== null) ?? null;
}

export function Tour({
  running,
  finish,
  openDrawer,
  closeDrawer,
}: {
  running: boolean;
  start: () => void;
  finish: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}) {
  const pathname = usePathname();
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mobile, setMobile] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  const steps = useMemo(() => STEPS.filter((s) => !s.homeOnly || pathname === "/dashboard"), [pathname]);
  const step = steps[i];

  useEffect(() => {
    if (running) {
      setI(0);
      prevFocus.current = document.activeElement as HTMLElement;
    } else {
      prevFocus.current?.focus?.();
    }
  }, [running]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // Position the spotlight; skip steps whose target isn't on screen for this user
  const measure = useCallback(() => {
    if (!step) return;
    const el = visibleTarget(step.target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(() => {
    if (!running || !step) return;
    if (mobile && step.inDrawer) openDrawer();
    if (mobile && !step.inDrawer) closeDrawer();
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const locate = () => {
      const el = visibleTarget(step.target);
      if (step.target && !el) {
        if (tries++ < 6) {
          timer = setTimeout(locate, 80); // allow the drawer to open
          return;
        }
        // Target not available for this user/screen – move on
        setI((x) => (x < steps.length - 1 ? x + 1 : x));
        if (i >= steps.length - 1) finish();
        return;
      }
      el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      setTimeout(measure, 220);
      measure();
    };
    locate();
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, i, mobile, step?.target]);

  useEffect(() => {
    if (!running) return;
    const on = () => measure();
    window.addEventListener("resize", on);
    window.addEventListener("scroll", on, true);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("scroll", on, true);
    };
  }, [running, measure]);

  // Focus the card and keep keyboard focus inside it
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => cardRef.current?.querySelector<HTMLElement>("[data-primary]")?.focus(), 30);
    return () => clearTimeout(t);
  }, [running, i]);

  const end = useCallback(() => {
    if (mobile) closeDrawer();
    finish();
  }, [finish, closeDrawer, mobile]);

  const next = useCallback(() => (i < steps.length - 1 ? setI(i + 1) : end()), [i, steps.length, end]);
  const back = useCallback(() => setI((x) => Math.max(0, x - 1)), []);

  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") end();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
      if (e.key === "Tab" && cardRef.current) {
        const f = Array.from(cardRef.current.querySelectorAll<HTMLElement>("button"));
        const k = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && k <= 0) {
          e.preventDefault();
          f[f.length - 1]?.focus();
        } else if (!e.shiftKey && k === f.length - 1) {
          e.preventDefault();
          f[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [running, next, back, end]);

  if (!running || !step || typeof document === "undefined") return null;

  // Card placement: below the target if there's room, otherwise above; centred when no target
  const pad = 8;
  const W = Math.min(360, window.innerWidth - 32);
  let style: React.CSSProperties;
  if (mobile) {
    style = { left: 16, right: 16, bottom: 16 };
  } else if (!rect) {
    style = { left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 420 };
  } else {
    const below = rect.bottom + 16 + 220 < window.innerHeight;
    const rightSpace = window.innerWidth - rect.right;
    if ((rect.height > window.innerHeight * 0.5 || rect.right < 340) && rightSpace > W + 32) {
      // tall targets (the sidebar sections): put the card to the right
      style = { left: rect.right + 20, top: Math.max(16, Math.min(rect.top, window.innerHeight - 260)), width: W };
    } else {
      const left = Math.max(16, Math.min(rect.left + rect.width / 2 - W / 2, window.innerWidth - W - 16));
      style = below ? { left, top: rect.bottom + 16, width: W } : { left, bottom: window.innerHeight - rect.top + 16, width: W };
    }
  }

  return createPortal(
    <div className="ahni-app" style={{ background: "transparent", minHeight: 0 }}>
      {/* click-blocker + dimmer */}
      <div className="fixed inset-0 z-[1099]" onClick={end} aria-hidden="true" style={rect ? undefined : { background: "rgba(10,10,14,.62)" }} />
      {rect && (
        <div
          className="ahni-tour-spot"
          style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }}
          aria-hidden="true"
        />
      )}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="fixed z-[1101] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-[var(--ink)] shadow-[var(--shadow-2)]"
        style={style}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--brand-ink)]">
            Step {i + 1} of {steps.length}
          </span>
          <button type="button" onClick={end} className="text-[13px] font-semibold text-[var(--muted)] hover:text-[var(--ink)]">
            Skip tour
          </button>
        </div>
        <h2 id="tour-title" className="mt-2 text-[19px] font-bold leading-snug tracking-[-0.02em]">
          {step.title}
        </h2>
        <p id="tour-body" className="mt-1.5 text-[14px] leading-relaxed text-[var(--muted)]" aria-live="polite">
          {step.body}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1" aria-hidden="true">
            {steps.map((_, k) => (
              <span key={k} className="h-1.5 rounded-full transition-all" style={{ width: k === i ? 18 : 6, background: k <= i ? "var(--brand)" : "var(--line-strong)" }} />
            ))}
          </div>
          <div className="flex gap-2">
            {i > 0 && (
              <button type="button" onClick={back} className="btn btn-outline !h-9">
                Back
              </button>
            )}
            <button type="button" data-primary onClick={next} className="btn btn-primary !h-9">
              {i === 0 ? "Show me around" : i === steps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
