"use client";

import "@fontsource-variable/plus-jakarta-sans";
import "./app.css";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReactNode } from "react";

/**
 * Split-screen layout for staff sign-in flows (login, forgot password, OTP, new password).
 * Form on the left, brand panel on the right (hidden on phones so the form comes first).
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  step,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** e.g. "Step 2 of 3" for multi-step flows */
  step?: string;
}) {
  return (
    <div className="ahni-app grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="AHNi home">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--line)] bg-white">
              <Image src="/imgs/logo.png" alt="" width={192} height={76} className="h-auto w-9" priority />
            </span>
            <span className="text-[15px] font-bold tracking-[-0.01em]">AHNi ERP</span>
          </Link>
          <Link href="/" className="btn btn-ghost !h-9 text-[13px]">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
        </div>

        <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          {step && <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--brand-ink)]">{step}</p>}
          <h1 className="text-[clamp(28px,3.4vw,36px)] font-bold leading-tight tracking-[-0.035em]">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-[var(--muted)]">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-[14px] text-[var(--muted)]">{footer}</div>}
        </main>

        <p className="text-[12px] text-[var(--faint)]">© {new Date().getFullYear()} Achieving Health Nigeria Initiative</p>
      </div>

      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-[#17171c] p-4 lg:block" aria-hidden="true">
        <div className="relative h-full overflow-hidden rounded-[32px]">
          <Image src="/img/healthcare-safety.jpg" alt="" fill sizes="50vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17171c] via-[#17171c]/55 to-[#17171c]/10" />
          <div className="absolute inset-x-0 bottom-0 p-10 text-white">
            <svg viewBox="0 0 600 80" className="mb-6 w-[320px]" fill="none">
              <path d="M0 50 H170 L188 50 L200 22 L214 70 L230 8 L246 62 L258 50 H330 L342 44 L352 50 H594" stroke="#ff7a70" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="592" cy="50" r="5" fill="#ff7a70" />
            </svg>
            <p className="max-w-[460px] text-[30px] font-bold leading-[1.15] tracking-[-0.03em]">
              Building a <span className="text-[#ff7a70]">healthier</span> Nigeria, together.
            </p>
            <p className="mt-3 max-w-[420px] text-[15px] leading-relaxed text-white/75">
              One workspace for requests, approvals and programme delivery across AHNi.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

/** Small helper for consistent text links inside auth footers */
export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="font-semibold text-[var(--ink)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--ink)]">
      {children}
    </a>
  );
}
