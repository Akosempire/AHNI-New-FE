"use client";

import { useEffect, useState } from "react";

const KEY = "ahni-cookie-consent";
type Consent = { essential: true; analytics: boolean; at: string };

function read(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}
function write(analytics: boolean) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ essential: true, analytics, at: new Date().toISOString() }));
  } catch {
    /* storage unavailable – banner will simply show again next visit */
  }
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const c = read();
    if (!c) setOpen(true);
    else setAnalytics(c.analytics);
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-cookie-settings]")) {
        setCustom(true);
        setOpen(true);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!open) return null;
  const done = (a: boolean) => {
    write(a);
    setOpen(false);
    setCustom(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed bottom-4 left-4 right-4 z-[80] max-w-[460px] rounded-[24px] bg-white p-6 text-[var(--ink)] shadow-[0_24px_70px_rgba(0,0,0,.22)] md:bottom-6 md:left-6 md:right-auto"
    >
      <p className="text-[20px] font-bold tracking-[-0.02em]">We value your privacy</p>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)]">
        We use essential cookies to keep the portal working and, with your permission, analytics cookies to
        understand how the site is used.
      </p>
      {custom && (
        <div className="mt-4 space-y-3 rounded-[16px] bg-[var(--mist)] p-4 text-[14px]">
          <label className="flex items-center justify-between gap-4">
            <span><b>Essential</b> – required for log in and security</span>
            <input type="checkbox" checked disabled className="h-5 w-5 accent-[var(--ink)]" />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span><b>Analytics</b> – anonymous usage statistics</span>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="h-5 w-5 accent-[var(--ink)]" />
          </label>
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {custom ? (
          <button type="button" className="pill pill-accent sm" onClick={() => done(analytics)}>Save choices</button>
        ) : (
          <button type="button" className="pill pill-accent sm" onClick={() => setCustom(true)}>Customise</button>
        )}
        <button type="button" className="pill pill-primary sm" onClick={() => done(false)}>Reject all</button>
        <button type="button" className="pill pill-primary sm" onClick={() => done(true)}>Accept all</button>
      </div>
    </div>
  );
}
