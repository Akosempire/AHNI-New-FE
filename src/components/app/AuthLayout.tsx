"use client";

import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./app.css";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";
import DemoLoginHint from "@/components/DemoLoginHint";

export type AuthAudience = "staff" | "vendor" | "consultant";

const PORTALS: { key: AuthAudience; label: string; href: string }[] = [
  { key: "staff", label: "Staff", href: "/auth/login" },
  { key: "vendor", label: "Vendor", href: "/vendor-portal/login" },
  { key: "consultant", label: "Consultant", href: "/consultant-portal/login" },
];

const ASIDE: Record<AuthAudience, { line: string; sub: string }> = {
  staff: {
    line: "One workspace for requests, approvals and programme delivery across AHNi.",
    sub: "Achieving Health Nigeria Initiative",
  },
  vendor: {
    line: "Track your bids, purchase orders and payments with AHNi in one place.",
    sub: "AHNi vendor portal",
  },
  consultant: {
    line: "Submit timesheets, deliverables and payment requests for your AHNi engagements.",
    sub: "AHNi consultant portal",
  },
};

/**
 * Split sign-in (New Design System "Sign in" template) on AHNi colours:
 * form on the left, a quiet dotted aside on the right (hidden on phones).
 * Used by staff sign-in, password reset steps, and the vendor & consultant portals.
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  step,
  audience = "staff",
  showPortalSwitch = false,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** e.g. "Step 2 of 3" for multi-step flows */
  step?: string;
  audience?: AuthAudience;
  /** Show Staff / Vendor / Consultant switch (on the sign-in screens) */
  showPortalSwitch?: boolean;
}) {
  const aside = ASIDE[audience];
  return (
    <div className="ahni-app grid min-h-screen bg-[var(--surface)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex min-h-screen flex-col px-5 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 rounded-[6px]" aria-label="AHNi home">
            <Image src="/imgs/logo.png" alt="" width={192} height={76} className="h-auto w-9" priority />
            <span className="text-[14px] font-medium">AHNi ERP</span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2 text-[13px] text-[var(--muted)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--ink)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to website
          </Link>
        </div>

        <main className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          {showPortalSwitch && (
            <nav aria-label="Choose a portal" className="mb-8 inline-flex self-start rounded-[8px] border border-[var(--line-strong)] p-0.5">
              {PORTALS.map((p) => (
                <Link
                  key={p.key}
                  href={p.href}
                  aria-current={p.key === audience ? "page" : undefined}
                  className={[
                    "flex h-8 items-center rounded-[6px] px-3 text-[13px] transition-colors",
                    p.key === audience ? "bg-[var(--surface-2)] font-medium text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]",
                  ].join(" ")}
                >
                  {p.label}
                </Link>
              ))}
            </nav>
          )}
          {step && <p className="ux-label mb-2">{step}</p>}
          <h1 className="text-[24px] font-medium leading-8 tracking-[-0.01em]">{title}</h1>
          {subtitle && <p className="mt-1 text-[14px] leading-relaxed text-[var(--muted)]">{subtitle}</p>}
          <div className="mt-7">
            <DemoLoginHint kind={audience} />
            {children}
          </div>
          {footer && <div className="mt-8 text-center text-[13.5px] text-[var(--muted)]">{footer}</div>}
        </main>

        <p className="text-center text-[12px] text-[var(--faint)]">
          © {new Date().getFullYear()} Achieving Health Nigeria Initiative. By continuing you agree to AHNi&apos;s terms and privacy policy.
        </p>
      </div>

      {/* Quiet dotted aside – the one decorative surface, as in the design system */}
      <aside
        className="relative hidden border-l border-[var(--line-strong)] lg:flex lg:flex-col lg:justify-end lg:p-14"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(var(--line-strong) 1.2px, transparent 1.2px)",
          backgroundSize: "16px 16px",
        }}
      >
        <div className="max-w-[440px] bg-[var(--surface)] pr-4">
          <svg viewBox="0 0 600 80" className="mb-5 w-[220px]" fill="none">
            <path
              d="M0 50 H170 L188 50 L200 22 L214 70 L230 8 L246 62 L258 50 H330 L342 44 L352 50 H594"
              stroke="var(--brand)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[20px] leading-[30px] text-[var(--ink)]">{aside.line}</p>
          <p className="mt-3 text-[13px] text-[var(--muted)]">{aside.sub}</p>
        </div>
      </aside>
    </div>
  );
}

/** Small helper for consistent text links inside auth footers */
export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-medium text-[var(--ink)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--ink)]">
      {children}
    </a>
  );
}
