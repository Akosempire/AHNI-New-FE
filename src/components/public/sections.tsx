"use client";

import Image from "next/image";
import Link from "next/link";
import { PARTNERS, STORIES } from "./content";
import { Heartbeat } from "./icons";
import { ArrowUpRight, Eyebrow, Pill, cx, reveal } from "./ui";

type Story = (typeof STORIES)[number];

export function StoryCard({ s, className, priority }: { s: Story; className?: string; priority?: boolean }) {
  return (
    <Link
      href={s.href}
      className={cx(
        "group relative block h-[460px] overflow-hidden rounded-[var(--radius-img)] bg-[var(--ink)] text-white md:h-[560px]",
        className
      )}
    >
      <Image
        src={s.img}
        alt={s.alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 92vw, 1000px"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/55" />
      <div className="relative flex h-full flex-col p-6 md:p-10">
        <div className="flex flex-wrap gap-2">
          {s.chips.map((c) => (
            <span key={c} className="chip chip-glass">{c}</span>
          ))}
        </div>
        <h3 className="mt-6 max-w-[620px] text-[clamp(34px,5vw,64px)] font-bold leading-[0.98] tracking-[-0.045em]">
          {s.title}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-4">
          <div className="grid w-full max-w-[560px] grid-cols-2 gap-2 md:gap-3">
            {s.stats.map((st) => (
              <div key={st.l} className="glass px-4 py-4 md:px-6 md:py-5">
                <div className="text-[clamp(26px,4vw,52px)] font-bold leading-none tracking-[-0.045em]">{st.v}</div>
                <div className="my-2.5 h-px bg-[rgba(23,23,28,.15)] md:my-3" />
                <div className="text-[12px] font-medium leading-snug text-[var(--ink-soft)] md:text-[14px]">{st.l}</div>
              </div>
            ))}
          </div>
          <span className="arrow-btn hidden md:inline-grid">
            <ArrowUpRight />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PartnerMarquee({ className }: { className?: string }) {
  const row = [...PARTNERS, ...PARTNERS];
  return (
    <div className={cx("relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]", className)}>
      <ul className="marquee flex w-max gap-4" aria-label="Partners and funders">
        {row.map((p, i) => (
          <li
            key={`${p.name}-${i}`}
            aria-hidden={i >= PARTNERS.length}
            className="flex h-[132px] w-[220px] flex-none flex-col items-center justify-center gap-3 rounded-[28px] bg-white px-6"
          >
            <span className="relative block h-[56px] w-[120px]">
              <Image src={p.img} alt={i < PARTNERS.length ? `${p.name} logo` : ""} fill sizes="120px" className="object-contain" />
            </span>
            <span className="text-[13px] font-bold tracking-[-0.01em] text-[var(--ink-soft)]">{p.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FinalCTA({
  eyebrow = "Ready to make an impact?",
  title = (
    <>
      Build a healthier Nigeria
      <br className="hidden md:block" /> with us
    </>
  ),
  z = 1,
}: {
  eyebrow?: string;
  title?: React.ReactNode;
  z?: number;
}) {
  return (
    <section className="relative px-3 md:px-6" style={{ zIndex: z }} aria-label="Get involved">
      <div className="aurora-band relative -mt-[var(--radius-sheet)] overflow-hidden rounded-[var(--radius-sheet)] px-6 pb-24 pt-[calc(var(--radius-sheet)+80px)] text-center md:pb-32">
        <Heartbeat className="pointer-events-none absolute bottom-2 left-1/2 w-[900px] max-w-none -translate-x-1/2 opacity-25" color="#17171c" />
        <div className="relative">
          <Eyebrow className="!text-[var(--ink)]/70">{eyebrow}</Eyebrow>
          <h2 {...reveal()} className="mx-auto max-w-[980px] text-[clamp(40px,6.4vw,80px)] font-bold leading-[1] tracking-[-0.05em]">
            {title}
          </h2>
          <div {...reveal(1)} className="mt-10 flex flex-wrap justify-center gap-3">
            <Pill href="/contact?type=partnership" tone="ink">Partner with us</Pill>
            <Pill href="/opportunities" tone="accent">Find opportunities</Pill>
          </div>
        </div>
      </div>
    </section>
  );
}
