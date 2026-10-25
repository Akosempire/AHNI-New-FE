"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { APPROACH, FOCUS_AREAS, OPP_TYPES, STORIES } from "@/components/public/content";
import { FocusIcon, Heartbeat } from "@/components/public/icons";
import { OppCard, OppCardSkeleton } from "@/components/public/OppCard";
import { FinalCTA, PartnerMarquee, StoryCard } from "@/components/public/sections";
import {
  AccordionItem,
  ArrowUpRight,
  Aurora,
  CountUp,
  Eyebrow,
  Pill,
  Rail,
  Sheet,
  cx,
  reveal,
} from "@/components/public/ui";
import { useOpportunities } from "@/components/public/useOpportunities";

/* ---------------- Hero ---------------- */
const P = {
  a: "/img/healthcare-safety.jpg",
  b: "/img/leadership-conference.jpg",
  c: "/img/education.jpg",
  d: "/img/login.jpeg",
};

function Tile({ kind }: { kind: "mint" | "coral" | "aurora" | "butter" }) {
  if (kind === "mint")
    return (
      <div className="grid h-full place-items-center bg-[var(--accent)] text-[var(--ink)]">
        <FocusIcon name="ribbon" size={72} />
      </div>
    );
  if (kind === "coral")
    return (
      <div className="flex h-full items-center bg-[var(--primary)] px-4">
        <Heartbeat className="w-full" color="#17171c" />
      </div>
    );
  if (kind === "butter")
    return (
      <div className="flex h-full flex-col justify-end bg-[var(--a-butter)] p-5 text-[var(--ink)]">
        <span className="text-[44px] font-bold leading-none tracking-[-0.05em]">2009</span>
        <span className="mt-1 text-[12px] font-bold uppercase tracking-[0.08em]">Serving Nigeria since</span>
      </div>
    );
  return <div className="aurora-band h-full" />;
}

function Photo({ src }: { src: string }) {
  return (
    <div className="relative h-full">
      <Image src={src} alt="" fill sizes="34vw" className="object-cover" />
    </div>
  );
}

function Hero() {
  const cols: { cls: string; cells: React.ReactNode[] }[] = [
    { cls: "drift-up", cells: [<Photo key="1" src={P.a} />, <Tile key="2" kind="mint" />, <Photo key="3" src={P.c} />, <Tile key="4" kind="butter" />] },
    { cls: "drift-down", cells: [<Tile key="1" kind="aurora" />, <Photo key="2" src={P.b} />, <Tile key="3" kind="coral" />, <Photo key="4" src={P.d} />] },
    { cls: "drift-up", cells: [<Photo key="1" src={P.d} />, <Tile key="2" kind="butter" />, <Photo key="3" src={P.a} />, <Tile key="4" kind="mint" />] },
  ];
  return (
    <Sheet tone="ink" z={20} className="!p-0 overflow-hidden" ariaLabel="Introduction">
      <div className="relative flex min-h-[100svh] flex-col">
        {/* drifting photo grid */}
        <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 gap-3 p-3 md:grid-cols-3 md:gap-4 md:p-4">
          {cols.map((c, i) => (
            <div key={i} className={cx("flex flex-col gap-3 md:gap-4", c.cls, i === 2 && "hidden md:flex")}>
              {c.cells.map((cell, j) => (
                <div key={j} className="h-[38svh] flex-none overflow-hidden rounded-[24px]">
                  {cell}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[rgba(14,14,18,.66)]" />

        <div className="on-dark relative flex flex-1 flex-col items-center justify-center px-4 pb-40 pt-40 text-center">
          <h1 className="t-display text-white">
            <span className="block" {...reveal(0)}>Building a</span>
            <span className="block" {...reveal(1)}>
              <span className="hl">healthier</span> Nigeria
            </span>
          </h1>
          <Heartbeat className="mt-8 w-[min(560px,80vw)]" color="var(--primary-text)" />
          <p {...reveal(2)} className="mt-8 max-w-[640px] text-[clamp(17px,1.6vw,20px)] leading-relaxed text-white/80">
            Health technical assistance for Nigeria&apos;s public health sector – through inclusive, innovative,
            community-led programming.
          </p>
        </div>

        <div className="wrap relative flex items-end justify-between pb-[calc(var(--radius-sheet)+16px)] md:pb-16">
          <p className="text-[clamp(18px,1.8vw,22px)] font-semibold leading-snug text-white">
            Community-led.
            <br />
            Evidence-driven.
          </p>
          <a href="#intro" className="hidden items-center gap-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white/80 hover:text-white md:flex">
            Scroll
            <span className="grid h-11 w-11 place-items-center rounded-full border border-white/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 5v14m0 0-6-6m6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </a>
        </div>
      </div>
    </Sheet>
  );
}

/* ---------------- Page ---------------- */
export default function HomePage() {
  const { items, isLoading, isError } = useOpportunities({ size: 100 });
  const featured = items.slice(0, 8);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((o) => (c[o.type] = (c[o.type] ?? 0) + 1));
    return c;
  }, [items]);
  const haveData = !isLoading && !isError;
  const [openApproach, setOpenApproach] = useState(0);

  const countCards = [
    { label: "Jobs open now", value: counts.JOB ?? 0 },
    { label: "Consultancies & ad-hoc roles", value: (counts.CONSULTANT ?? 0) + (counts.ADHOC ?? 0) },
    { label: "Procurement calls (EOI, RFQ, RFP)", value: (counts.EOI ?? 0) + (counts.RFQ ?? 0) + (counts.RFP ?? 0) },
  ];

  return (
    <>
      <Hero />

      {/* Intro statement */}
      <Sheet tone="white" z={19} id="intro" ariaLabel="Who we are">
        <div className="wrap text-center">
          <Eyebrow>Healthy communities are built by communities</Eyebrow>
          <p {...reveal()} className="t-statement mx-auto max-w-[980px]">
            We partner with government, donors and communities to{" "}
            <span className="hl">end HIV, TB and malaria</span>, protect mothers and children, and build health
            systems that keep working long after a project ends.
          </p>
          <div {...reveal(1)} className="mt-12 flex flex-wrap items-center justify-center gap-5">
            <div className="flex -space-x-4">
              {[P.a, P.c, P.b].map((src) => (
                <span key={src} className="relative h-14 w-14 overflow-hidden rounded-full border-[3px] border-white">
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                </span>
              ))}
            </div>
            <Pill href="/about" tone="primary">About AHNi</Pill>
          </div>
        </div>
      </Sheet>

      {/* Focus areas */}
      <Sheet tone="mist" z={18} ariaLabel="Focus areas">
        <div className="wrap relative">
          <Aurora className="-left-24 -top-16 h-[320px] w-[520px]" />
          <div className="relative">
            <Eyebrow>Where we work</Eyebrow>
            <h2 {...reveal()} className="t-h2">Focus Areas</h2>
          </div>
          <ul className="relative mt-14 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {FOCUS_AREAS.slice(0, 8).map((f, i) => (
              <li key={f.slug} {...reveal(i % 4)}>
                <Link href={`/focus-areas#${f.slug}`} className="group block">
                  <span className="relative grid h-[120px] place-items-center overflow-hidden rounded-[24px] bg-white text-[#8b8b95] transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:text-[var(--ink)] md:h-[140px]">
                    <FocusIcon name={f.icon} size={64} className="transition-transform duration-500 group-hover:scale-110" />
                    <span className="arrow-btn sm chip-bg absolute right-3 top-3">
                      <ArrowUpRight size={14} />
                    </span>
                  </span>
                  <span className="mt-3 block text-[16px] font-bold tracking-[-0.015em]">{f.short}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Sheet>

      {/* Impact stories carousel */}
      <Sheet tone="white" z={17} ariaLabel="Impact stories">
        <div className="wrap mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Impact stories</Eyebrow>
            <h2 {...reveal()} className="t-h2">Our Work</h2>
          </div>
          <Pill href="/focus-areas" tone="chip">All focus areas</Pill>
        </div>
        <Rail label="Impact stories">
          {STORIES.map((s, i) => (
            <StoryCard key={s.title} s={s} priority={i === 0} className="w-[min(1000px,calc(100vw-32px))]" />
          ))}
        </Rail>
      </Sheet>

      {/* Reach orbit */}
      <Sheet tone="mist" z={16} ariaLabel="Our reach">
        <div className="wrap grid items-center gap-16 lg:grid-cols-2">
          <ReachOrbit />
          <div>
            <Eyebrow>Community-led. Evidence-driven.</Eyebrow>
            <p {...reveal()} className="t-statement">
              From our Abuja headquarters we work across <span className="hl">five geopolitical zones</span> – from
              federal ministries to the last-mile community health worker.
            </p>
            <div {...reveal(1)} className="mt-10">
              <Pill href="/contact" tone="ink">Contact us</Pill>
            </div>
          </div>
        </div>
      </Sheet>

      {/* Featured opportunities */}
      <Sheet tone="white" z={15} ariaLabel="Featured opportunities">
        <div className="wrap mb-12">
          <Eyebrow>Find your next role</Eyebrow>
          <h2 {...reveal()} className="t-h2">Opportunities</h2>
        </div>
        <div className="[&_article]:bg-[var(--mist)] [&_.animate-pulse]:bg-[var(--mist)]">
          {isLoading ? (
            <Rail label="Loading opportunities" controls={false}>
              {[0, 1, 2].map((i) => (
                <OppCardSkeleton key={i} className="w-[min(380px,calc(100vw-48px))]" />
              ))}
            </Rail>
          ) : featured.length ? (
            <Rail label="Featured opportunities">
              {featured.map((o) => (
                <OppCard key={o.id} o={o} className="w-[min(380px,calc(100vw-48px))]" />
              ))}
            </Rail>
          ) : (
            <div className="wrap">
              <div className="rounded-[var(--radius-card)] bg-[var(--mist)] p-10 text-center">
                <p className="text-[24px] font-bold tracking-[-0.02em]">
                  {isError ? "We couldn't load opportunities right now." : "No open opportunities right now."}
                </p>
                <p className="mt-2 text-[var(--ink-soft)]">
                  {isError ? "Please try again in a moment." : "New roles and procurement calls are posted regularly – check back soon."}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="wrap mt-10">
          <Pill href="/opportunities" tone="accent">All opportunities</Pill>
        </div>
      </Sheet>

      {/* How we work */}
      <Sheet tone="mist" z={14} ariaLabel="How we work">
        <div className="wrap grid items-start gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto h-[440px] w-full max-w-[460px] md:h-[540px]" aria-hidden="true">
            <Aurora className="inset-10" />
            <div {...reveal(0)} className="absolute left-0 top-0 h-[58%] w-[62%] overflow-hidden rounded-[32px]">
              <Image src={P.b} alt="" fill sizes="300px" className="object-cover" />
            </div>
            <div {...reveal(1)} className="absolute right-0 top-[18%] h-[46%] w-[48%] overflow-hidden rounded-[32px]">
              <Image src={P.c} alt="" fill sizes="240px" className="object-cover" />
            </div>
            <div {...reveal(2)} className="absolute bottom-0 left-[16%] h-[40%] w-[56%] overflow-hidden rounded-[32px]">
              <Image src={P.a} alt="" fill sizes="280px" className="object-cover" />
            </div>
          </div>
          <div>
            <Eyebrow>How we work</Eyebrow>
            <p {...reveal()} className="t-statement !text-[clamp(26px,3vw,40px)]">
              Lasting change needs more than a single intervention. We combine technical expertise with local
              ownership.
            </p>
            <div className="mt-10 border-t border-[var(--line)]">
              {APPROACH.map((a, i) => (
                <AccordionItem
                  key={a.title}
                  id={`approach-${i}`}
                  title={a.title}
                  open={openApproach === i}
                  onToggle={() => setOpenApproach(openApproach === i ? -1 : i)}
                >
                  <p className="t-body !text-[18px]">{a.body}</p>
                </AccordionItem>
              ))}
            </div>
          </div>
        </div>
      </Sheet>

      {/* Mission (dark) */}
      <Sheet tone="ink" z={13} ariaLabel="Our mission">
        <div className="wrap">
          <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
            <div {...reveal()} className="relative h-[200px] w-[180px] md:h-[240px] md:w-[210px]">
              <div className="relative h-full w-full overflow-hidden rounded-[28px]">
                <Image src={P.c} alt="" fill sizes="210px" className="object-cover" />
              </div>
              <span aria-hidden="true" className="absolute -bottom-4 -right-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--a-lilac)] text-[40px] font-bold leading-none text-[var(--ink)]">
                &ldquo;
              </span>
            </div>
            <div>
              <Eyebrow>Our mission</Eyebrow>
              <h2 {...reveal()} className="text-[clamp(38px,5.4vw,72px)] font-bold leading-[1] tracking-[-0.05em]">
                Health is built in <span className="hl">communities</span>, not only in clinics
              </h2>
              <div className="mt-8 grid max-w-[860px] gap-6 md:grid-cols-2">
                <p className="t-body !text-[18px]">
                  Our mission is improved quality of life for people – especially vulnerable groups – through
                  inclusive and innovative community-led programming.
                </p>
                <p className="t-body !text-[18px]">
                  Our vision is a healthy and safe society where everyone thrives, with equitable access to
                  quality healthcare and opportunities for sustainable development.
                </p>
              </div>
              <p className="mt-8 text-[13px] font-bold uppercase tracking-[0.1em] text-white/60">
                Achieving Health Nigeria Initiative · Abuja
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {[
              { v: "2009", t: "Founded to give Nigeria's public health sector dedicated technical support." },
              { v: "5", t: "Geopolitical zones where our programmes operate, coordinated from Abuja." },
              { v: "10+", t: "Government and international partners, including the Global Fund, USAID and UNICEF." },
            ].map((s, i) => (
              <div key={s.v} {...reveal(i)} className="rounded-[28px] bg-[var(--ink-2)] p-8">
                <div className="text-[clamp(48px,5vw,68px)] font-bold leading-none tracking-[-0.05em]">{s.v}</div>
                <p className="mt-5 text-[16px] leading-relaxed text-white/70">{s.t}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Pill href="/contact?type=partnership" tone="primary">Partner with us</Pill>
          </div>
        </div>
      </Sheet>

      {/* Live numbers + partners */}
      <Sheet tone="mist" z={12} ariaLabel="Open right now">
        <div className="wrap text-center">
          <Eyebrow>Open right now</Eyebrow>
          <h2 {...reveal()} className="t-statement mx-auto max-w-[760px]">Ways to join the work, live from our portal</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {countCards.map((c, i) => (
              <div key={c.label} {...reveal(i)} className="rounded-[28px] bg-white p-8 text-left">
                <div className="text-[clamp(52px,6vw,80px)] font-bold leading-none tracking-[-0.055em]">
                  <CountUp value={haveData ? c.value : null} />
                </div>
                <div className="my-4 h-px bg-[var(--line)]" />
                <p className="text-[16px] font-medium text-[var(--ink-soft)]">{c.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Pill href="/opportunities" tone="primary">Browse opportunities</Pill>
          </div>
        </div>
        <div className="mt-24">
          <p className="t-eyebrow text-center">Trusted by government & development partners</p>
          <PartnerMarquee className="mt-6" />
        </div>
      </Sheet>

      {/* Get involved */}
      <Sheet tone="white" z={11} ariaLabel="Get involved">
        <div className="wrap mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Get involved</Eyebrow>
            <h2 {...reveal()} className="t-h2">Work With Us</h2>
          </div>
        </div>
        <Rail label="Ways to work with AHNi">
          {ENGAGE.map((e) => (
            <Link key={e.title} href={e.href} className="group block w-[min(400px,calc(100vw-48px))]">
              <span className="relative block aspect-video overflow-hidden rounded-[32px]">
                <Image src={e.img} alt="" fill sizes="400px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <span className="arrow-btn absolute right-4 top-4"><ArrowUpRight /></span>
              </span>
              <span className="mt-5 block text-[13px] font-bold uppercase tracking-[0.08em]">
                {e.who} <span className="font-medium text-[var(--ink-soft)]">· {e.via}</span>
              </span>
              <span className="mt-2 block text-[26px] font-bold leading-[1.12] tracking-[-0.03em]">{e.title}</span>
              <span className="mt-4 flex flex-wrap gap-2">
                {e.tags.map((t) => (
                  <span key={t} className="chip !h-8">{t}</span>
                ))}
              </span>
            </Link>
          ))}
        </Rail>
        <div className="wrap mt-10">
          <Pill href="/opportunities" tone="ink">All opportunities</Pill>
        </div>
      </Sheet>

      <FinalCTA z={10} />
    </>
  );
}

const ENGAGE = [
  {
    who: "Careers",
    via: "Staff roles",
    title: "Join our team of public health professionals",
    img: "/img/healthcare-safety.jpg",
    tags: ["Jobs", "Ad-hoc"],
    href: "/opportunities?type=JOB",
  },
  {
    who: "Consultants",
    via: "Short-term expertise",
    title: "Bring specialist skills to time-bound assignments",
    img: "/img/leadership-conference.jpg",
    tags: ["Consultancy"],
    href: "/opportunities?type=CONSULTANT",
  },
  {
    who: "Vendors",
    via: "Procurement",
    title: "Supply goods and services to health programmes",
    img: "/img/login.jpeg",
    tags: ["EOI", "RFQ", "RFP"],
    href: "/opportunities?type=EOI",
  },
  {
    who: "Partners",
    via: "Collaboration",
    title: "Co-design programmes that reach more communities",
    img: "/img/education.jpg",
    tags: ["Partnership"],
    href: "/contact?type=partnership",
  },
];

/* ---------------- Reach orbit diagram ---------------- */
function ReachOrbit() {
  const pills = [
    { t: "Federal ministries", x: "50%", y: "4%" },
    { t: "State programmes", x: "82%", y: "30%" },
    { t: "Health facilities", x: "76%", y: "86%" },
    { t: "Communities", x: "22%", y: "84%" },
    { t: "Donor partners", x: "17%", y: "40%" },
  ];
  const faces = [
    { src: P.a, x: "26%", y: "14%" },
    { src: P.c, x: "86%", y: "62%" },
    { src: P.b, x: "38%", y: "96%" },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]" aria-hidden="true">
      <Aurora className="inset-[12%]" />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
        <g className="orbit-spin" style={{ transformBox: "fill-box" } as any}>
          <circle cx="200" cy="200" r="190" fill="none" stroke="#17171c" strokeOpacity=".25" strokeDasharray="2 7" strokeLinecap="round" strokeWidth="1.6" />
        </g>
        <g className="orbit-spin-rev" style={{ transformBox: "fill-box" } as any}>
          <circle cx="200" cy="200" r="130" fill="none" stroke="#17171c" strokeOpacity=".25" strokeDasharray="2 7" strokeLinecap="round" strokeWidth="1.6" />
        </g>
        <circle cx="200" cy="200" r="70" fill="none" stroke="#17171c" strokeOpacity=".2" strokeDasharray="2 6" strokeWidth="1.6" />
        {[
          [200, 16],
          [368, 136],
          [320, 344],
          [72, 352],
          [24, 144],
        ].map(([x, y], i) => (
          <line key={i} x1="200" y1="200" x2={x} y2={y} stroke="#17171c" strokeOpacity=".18" strokeWidth="1" />
        ))}
      </svg>
      {/* centre */}
      <div className="absolute left-1/2 top-1/2 grid h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--ink)] text-center text-white shadow-[0_20px_50px_rgba(0,0,0,.25)]">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--primary)] opacity-20" />
        <span className="relative text-[12px] font-bold uppercase leading-tight tracking-[0.08em]">
          Abuja
          <br />
          HQ
        </span>
      </div>
      {pills.map((p) => (
        <span
          key={p.t}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-[var(--ink)] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-white md:text-[12px]"
          style={{ left: p.x, top: p.y }}
        >
          {p.t}
        </span>
      ))}
      {faces.map((f) => (
        <span
          key={f.src}
          className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[3px] border-white md:h-14 md:w-14"
          style={{ left: f.x, top: f.y }}
        >
          <Image src={f.src} alt="" fill sizes="56px" className="object-cover" />
        </span>
      ))}
    </div>
  );
}
