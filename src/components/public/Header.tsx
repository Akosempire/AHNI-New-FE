"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MENU, PORTALS, STORIES } from "./content";
import { ScribbleRing } from "./icons";
import { ArrowUpRight, Pill, Rail, cx } from "./ui";

function Logo({ small }: { small: boolean }) {
  return (
    <Link
      href="/"
      aria-label="AHNi – Achieving Health Nigeria Initiative, home"
      className={cx(
        "relative grid flex-none place-items-center rounded-full bg-white text-[var(--ink)] shadow-[0_6px_24px_rgba(0,0,0,.08)] transition-all duration-300",
        small ? "h-[64px] w-[64px]" : "h-[64px] w-[64px] md:h-[92px] md:w-[92px]"
      )}
    >
      <ScribbleRing className="absolute inset-[3px] text-[var(--ink)]" />
      <Image src="/imgs/logo.png" alt="" width={192} height={76} priority className="h-auto w-[62%]" />
    </Link>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const portalMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close everything on route change
  useEffect(() => {
    setMenuOpen(false);
    setPortalOpen(false);
  }, [pathname]);

  // Esc to close + focus trap inside the menu panel
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a,button,[tabindex]:not([tabindex="-1"])') ?? []).filter(
        (el) => el.offsetParent !== null
      );
    setTimeout(() => focusables()[0]?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
      if (e.key === "Tab") {
        const f = [menuBtnRef.current!, ...focusables()];
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1]?.focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const lock = window.innerWidth < 768;
    if (lock) document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  // click outside for portal dropdown
  useEffect(() => {
    if (!portalOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!portalRef.current?.contains(t) && !portalMenuRef.current?.contains(t)) setPortalOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPortalOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [portalOpen]);

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-[60] transition-all duration-300",
        scrolled ? "py-3" : "py-4 md:py-6"
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:font-bold">
        Skip to content
      </a>
      <div className="wrap flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <Logo small={scrolled} />
          <div className="hidden items-center gap-2 lg:flex">
            <Pill href="/contact?type=partnership" tone="primary" size="sm">Partner with us</Pill>
            <Pill href="/opportunities" tone="accent" size="sm">Find opportunities</Pill>
          </div>
        </div>

        <div className="relative">
          {/* Capsule: MENU | Portals | EN */}
          <div
            className={cx(
              "flex h-[52px] items-stretch overflow-hidden rounded-[14px] border border-[var(--line)] bg-white text-[13px] font-bold uppercase tracking-[0.06em] text-[var(--ink)]",
              scrolled ? "shadow-[0_8px_30px_rgba(0,0,0,.08)]" : ""
            )}
          >
            <button
              ref={menuBtnRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => {
                setMenuOpen((v) => !v);
                setPortalOpen(false);
              }}
              className="flex items-center gap-2.5 px-4 transition-colors hover:bg-[var(--mist)] md:px-5"
            >
              <span aria-hidden="true" className="relative block h-3 w-[18px]">
                <span className={cx("absolute left-0 h-[2px] w-full rounded bg-current transition-all duration-300", menuOpen ? "top-[5px] rotate-45" : "top-0")} />
                <span className={cx("absolute left-0 top-[5px] h-[2px] w-full rounded bg-current transition-opacity", menuOpen && "opacity-0")} />
                <span className={cx("absolute left-0 h-[2px] w-full rounded bg-current transition-all duration-300", menuOpen ? "top-[5px] -rotate-45" : "top-[10px]")} />
              </span>
              {menuOpen ? "Close" : "Menu"}
            </button>
            <span aria-hidden="true" className="my-3 w-px bg-[var(--line)]" />
            <div ref={portalRef} className="relative hidden sm:flex">
              <button
                type="button"
                aria-expanded={portalOpen}
                aria-haspopup="true"
                aria-label="Portal log in"
                onClick={() => {
                  setPortalOpen((v) => !v);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 transition-colors hover:bg-[var(--mist)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cx("transition-transform", portalOpen && "rotate-180")}><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
            <span aria-hidden="true" className="my-3 hidden w-px bg-[var(--line)] sm:block" />
            <span className="hidden items-center gap-2 px-4 sm:flex" title="English">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z" stroke="currentColor" strokeWidth="2" /></svg>
              EN
            </span>
          </div>

          {/* Portal dropdown */}
          {portalOpen && (
            <div ref={portalMenuRef} className="absolute right-0 top-[60px] w-[300px] rounded-[16px] bg-white p-2 shadow-[0_24px_60px_rgba(0,0,0,.16)]">
              <p className="t-eyebrow px-4 pb-1 pt-3 !mb-0 text-[12px]">Log in to</p>
              {PORTALS.map((p) => (
                <Link key={p.href} href={p.href} onClick={() => setPortalOpen(false)} className="group flex items-center justify-between gap-3 rounded-[12px] px-4 py-3 hover:bg-[var(--mist)]">
                  <span>
                    <span className="block text-[16px] font-bold tracking-[-0.01em]">{p.label}</span>
                    <span className="block text-[13px] text-[var(--ink-soft)]">{p.desc}</span>
                  </span>
                  <span className="arrow-btn sm chip-bg"><ArrowUpRight size={14} /></span>
                </Link>
              ))}
            </div>
          )}

          {/* Menu panel – grows from the capsule on desktop, full sheet on mobile */}
          <div
            id="site-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            hidden={!menuOpen}
            className={cx(
              "fixed inset-0 top-0 z-[-1] overflow-y-auto bg-white px-4 pb-10 pt-[100px]",
              "md:absolute md:inset-auto md:right-0 md:top-[60px] md:z-auto md:max-h-[calc(100vh-110px)] md:w-[460px] md:rounded-[16px] md:px-0 md:pb-6 md:pt-3 md:shadow-[0_30px_80px_rgba(0,0,0,.18)]"
            )}
          >
            <nav aria-label="Main" className="md:px-7">
              <ul>
                {MENU.map((item) => {
                  const isOpen = openGroup === item.label;
                  const dim = openGroup && !isOpen;
                  return (
                    <li key={item.label} className="border-b border-[var(--line)] last:border-0">
                      {item.children ? (
                        <>
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => setOpenGroup(isOpen ? null : item.label)}
                            className={cx(
                              "flex w-full items-center justify-between py-3.5 text-left text-[26px] font-bold tracking-[-0.03em] transition-colors",
                              dim ? "text-[#b4b4bd]" : "text-[var(--ink)]"
                            )}
                          >
                            {item.label}
                            <span aria-hidden="true" className="text-[24px] font-medium">{isOpen ? "–" : "+"}</span>
                          </button>
                          <div className="acc-panel" data-open={isOpen}>
                            <div>
                              <ul className="pb-4">
                                {item.children.map((c) => (
                                  <li key={c.href}>
                                    <Link href={c.href} onClick={() => setMenuOpen(false)} className="block py-1 text-[15px] text-[var(--ink-soft)] hover:text-[var(--ink)]">
                                      {c.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={cx(
                            "block py-3.5 text-[26px] font-bold tracking-[-0.03em] transition-colors",
                            dim ? "text-[#b4b4bd]" : "text-[var(--ink)]"
                          )}
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-6 flex flex-wrap gap-2 md:px-7 lg:hidden">
              <Pill href="/contact?type=partnership" tone="primary" size="sm">Partner with us</Pill>
              <Pill href="/opportunities" tone="accent" size="sm">Find opportunities</Pill>
            </div>

            <div className="mt-8 [--container:396px]">
              <p className="t-eyebrow !mb-4 px-0 md:px-7">Featured stories</p>
              <div className="-mx-4 md:mx-0 [&_.rail]:!px-4 md:[&_.rail]:!px-7 [&_.wrap]:!px-4 md:[&_.wrap]:!px-7 [&_.rail]:!gap-3">
                <Rail label="Featured stories" controls={false}>
                  {STORIES.map((s) => (
                    <Link key={s.title} href={s.href} onClick={() => setMenuOpen(false)} className="group block w-[168px] overflow-hidden rounded-[18px] bg-[var(--mist)]">
                      <span className="relative block h-[104px] overflow-hidden rounded-[18px]">
                        <Image src={s.img} alt="" fill sizes="168px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        <span className="arrow-btn sm absolute right-2 top-2 !h-8 !w-8"><ArrowUpRight size={13} /></span>
                      </span>
                      <span className="block px-3 py-2.5 text-[13px] font-bold leading-tight">{s.title}</span>
                    </Link>
                  ))}
                </Rail>
              </div>
            </div>

            {/* Mobile-only portal links */}
            <div className="mt-8 sm:hidden">
              <p className="t-eyebrow !mb-2">Log in to</p>
              {PORTALS.map((p) => (
                <Link key={p.href} href={p.href} className="flex items-center justify-between border-b border-[var(--line)] py-3 text-[17px] font-bold">
                  {p.label} <ArrowUpRight size={16} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
