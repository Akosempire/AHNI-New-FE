import Link from "next/link";
import { ORG } from "./content";
import { Heartbeat } from "./icons";

const BROWSE = [
  { label: "Opportunities", href: "/opportunities" },
  { label: "Focus Areas", href: "/focus-areas" },
  { label: "About AHNi", href: "/about" },
  { label: "Partner With Us", href: "/contact?type=partnership" },
  { label: "Contact", href: "/contact" },
];

const PORTAL_LINKS = [
  { label: "Staff Portal", href: "/auth/login" },
  { label: "Vendor Portal", href: "/vendor-portal/login" },
  { label: "Consultant Portal", href: "/consultant-portal" },
  { label: "Main website", href: ORG.website, external: true },
];

export default function Footer() {
  return (
    <footer className="relative z-0 -mt-[var(--radius-sheet)] bg-[var(--ink)] pt-[calc(var(--radius-sheet)+96px)] text-white">
      <div className="wrap">
        <div className="grid gap-14 md:grid-cols-[1.3fr_0.8fr_1.3fr]">
          <div>
            <p className="t-eyebrow !text-white/50">Browse</p>
            <ul className="space-y-2">
              {BROWSE.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[24px] font-bold tracking-[-0.025em] transition-colors hover:text-[var(--primary-text)]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="t-eyebrow !text-white/50">Portals</p>
            <ul className="space-y-2.5">
              {PORTAL_LINKS.map((l) => (
                <li key={l.href}>
                  {l.external ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-[16px] text-white/80 hover:text-white">
                      {l.label} ↗
                    </a>
                  ) : (
                    <Link href={l.href} className="text-[16px] text-white/80 hover:text-white">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="t-eyebrow !text-white/50">Let&apos;s talk</p>
            <div className="space-y-6">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-white/50">Abuja headquarters</p>
                <a href={`tel:${ORG.phones[0].replace(/\s/g, "")}`} className="block text-[24px] font-bold tracking-[-0.025em] hover:text-[var(--accent)]">
                  {ORG.phones[0]}
                </a>
                <a href={`mailto:${ORG.emails.operations}`} className="block break-all text-[20px] font-bold tracking-[-0.02em] hover:text-[var(--accent)] sm:text-[24px]">
                  {ORG.emails.operations}
                </a>
              </div>
              <p className="max-w-[340px] text-[15px] leading-relaxed text-white/60">{ORG.address}</p>
            </div>
          </div>
        </div>

        <Heartbeat className="mt-20 h-auto w-full opacity-60" color="rgba(255,255,255,.35)" />

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-[13px] text-white/55 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {ORG.name} ({ORG.short}). {ORG.reg}
          </p>
          <div className="flex flex-wrap gap-6">
            <button type="button" className="hover:text-white" data-cookie-settings="">
              Cookie settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
