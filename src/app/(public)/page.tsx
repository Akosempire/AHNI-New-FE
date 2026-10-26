"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { APPROACH, FOCUS_AREAS, STORIES } from "@/components/public/content";
import { FocusIcon, Heartbeat } from "@/components/public/icons";
import { FinalCTA, PartnerMarquee, StoryCard } from "@/components/public/sections";
import {
  AccordionItem,
  ArrowUpRight,
  Aurora,
  CountUp,
  Eyebrow,
  Pill,
  Rail,
  ScrollText,
  Sheet,
  cx,
  reveal,
} from "@/components/public/ui";
import { deadlineText, useOpportunities } from "@/components/public/useOpportunities";

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
  const latest = items.slice(0, 4);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((o) => (c[o.type] = (c[o.type] ?? 0) + 1));
    return c;
  }, [items]);
  const haveData = !isLoading && !isError;
  const [openApproach, setOpenApproach] = useState(0);

  const countCards = [
    { label: "Jobs", short: "Jobs", value: counts.JOB ?? 0, href: "/opportunities?type=JOB" },
    { label: "Consultancies", short: "Consulting", value: (counts.CONSULTANT ?? 0) + (counts.ADHOC ?? 0), href: "/opportunities?type=CONSULTANT" },
    { label: "Procurement", short: "Tenders", value: (counts.EOI ?? 0) + (counts.RFQ ?? 0) + (counts.RFP ?? 0), href: "/opportunities?type=EOI" },
  ];

  return (
    <>
      <Hero />

      {/* Partners – straight after the hero */}
      <Sheet tone="white" z={19} ariaLabel="Partners" className="!pb-12 md:!pb-16" style={{ paddingTop: "calc(var(--radius-sheet) + 40px)" }}>
        <p className="t-eyebrow !mb-6 text-center">Trusted by government &amp; development partners</p>
        <PartnerMarquee className="[&_li]:!h-[104px] [&_li]:!w-[180px] [&_li]:bg-[var(--mist)]" />
      </Sheet>

      {/* Intro statement + compact focus areas */}
      <Sheet tone="mist" z={18} id="intro" ariaLabel="Who we are">
        <div className="wrap">
          <Eyebrow className="text-center">Healthy communities are built by communities</Eyebrow>
          <ScrollText
            className="t-statement mx-auto max-w-[980px] text-center"
            parts={[
              "We partner with government, donors and communities to ",
              { t: "end HIV, TB and malaria,", hl: true },
              " protect mothers and children, and build health systems that keep working long after a project ends.",
            ]}
          />

          <div className="mt-14 md:mt-20">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="t-eyebrow !mb-0">Focus areas</p>
              <Link href="/focus-areas" className="text-[13px] font-bold uppercase tracking-[0.06em] underline-offset-4 hover:underline">
                See all →
              </Link>
            </div>
            <ul className="-mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
              {FOCUS_AREAS.slice(0, 8).map((f, i) => (
                <li key={f.slug} className="snap-start" {...reveal(i % 4)}>
                  <Link
                    href={`/focus-areas#${f.slug}`}
                    className="group flex h-[56px] items-center gap-3 whitespace-nowrap rounded-full bg-white pl-2 pr-5 transition-colors duration-300 hover:bg-[var(--accent)]"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--mist)] transition-colors group-hover:bg-white">
                      <FocusIcon name={f.icon} size={20} />
                    </span>
                    <span className="text-[15px] font-bold tracking-[-0.01em]">{f.short}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Sheet>

      {/* Impact stories carousel */}
      <Sheet tone="white" z={17} ariaLabel="Impact stories">
        <div className="wrap mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div>
            <Eyebrow>Impact stories</Eyebrow>
            <h2 {...reveal()} className="t-h2">Our Work</h2>
          </div>
          <Pill href="/about" tone="chip" className="hidden md:inline-flex">About AHNi</Pill>
        </div>
        <Rail label="Impact story cards" autoplay={5000}>
          {STORIES.map((s, i) => (
            <StoryCard key={s.title} s={s} priority={i === 0} className="w-[min(1000px,calc(100vw-32px))]" />
          ))}
        </Rail>
      </Sheet>

      {/* Compact live opportunities */}
      <Sheet tone="ink" z={16} ariaLabel="Open opportunities">
        <div className="wrap grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 [&>*]:min-w-0">
          <div>
            <Eyebrow>Open right now · live from our portal</Eyebrow>
            <ScrollText
              as="h2"
              className="text-[clamp(34px,4.4vw,56px)] font-bold leading-[1.02] tracking-[-0.045em]"
              parts={["Find your ", { t: "place", hl: true }, " in the work"]}
            />
            <div className="mt-8 grid grid-cols-3 gap-2 md:gap-3">
              {countCards.map((c) => (
                <Link key={c.label} href={c.href} className="rounded-[22px] bg-[var(--ink-2)] p-4 transition-colors hover:bg-[#33333b] md:p-6">
                  <span className="block text-[clamp(34px,4vw,52px)] font-bold leading-none tracking-[-0.05em]">
                    <CountUp value={haveData ? c.value : null} />
                  </span>
                  <span className="mt-2 block text-[11px] font-bold uppercase tracking-[0.04em] text-white/60 md:text-[13px] md:tracking-[0.06em]"><span className="md:hidden">{c.short}</span><span className="hidden md:inline">{c.label}</span></span>
                </Link>
              ))}
            </div>
            <div className="mt-8 hidden lg:block">
              <Pill href="/opportunities" tone="accent">All opportunities</Pill>
            </div>
          </div>

          <div>
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {isLoading &&
                [0, 1, 2].map((i) => (
                  <li key={i} className="py-5" aria-hidden="true">
                    <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                    <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-white/10" />
                  </li>
                ))}
              {!isLoading &&
                latest.map((o) => (
                  <li key={o.id}>
                    <Link href={o.href} className="group flex items-center gap-4 py-5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[18px] font-bold tracking-[-0.02em] md:text-[20px]">{o.title}</span>
                        <span className="mt-1 block text-[13px] text-white/60">
                          {o.typeLabel} · {o.location} · {deadlineText(o.deadline)}
                        </span>
                      </span>
                      <span className="arrow-btn sm"><ArrowUpRight size={14} /></span>
                    </Link>
                  </li>
                ))}
              {!isLoading && latest.length === 0 && (
                <li className="py-8 text-white/70">
                  {isError ? "We couldn't load opportunities right now – please try again shortly." : "No open opportunities right now – new roles are posted regularly."}
                </li>
              )}
            </ul>
            <div className="mt-8 lg:hidden">
              <Pill href="/opportunities" tone="accent">All opportunities</Pill>
            </div>
          </div>
        </div>
      </Sheet>

      {/* Reach orbit */}
      <Sheet tone="mist" z={15} ariaLabel="Our reach">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <ReachOrbit />
          </div>
          <div className="order-1 lg:order-2">
            <Eyebrow>Community-led. Evidence-driven.</Eyebrow>
            <ScrollText
              className="t-statement"
              parts={[
                "From our Abuja headquarters we work across ",
                { t: "five geopolitical zones", hl: true },
                " – from federal ministries to the last-mile community health worker.",
              ]}
            />
            <div className="mt-8 md:mt-10">
              <Pill href="/contact" tone="ink">Contact us</Pill>
            </div>
          </div>
        </div>
      </Sheet>

      {/* How we work */}
      <Sheet tone="white" z={14} ariaLabel="How we work">
        <div className="wrap grid items-start gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative mx-auto hidden h-[540px] w-full max-w-[460px] lg:block" aria-hidden="true">
            <Aurora className="inset-10" />
            <div {...reveal(0)} className="absolute left-0 top-0 h-[58%] w-[62%] overflow-hidden rounded-[32px]">
              <Image src={P.b} alt="" fill sizes="300px" className="kenburns object-cover" />
            </div>
            <div {...reveal(1)} className="absolute right-0 top-[18%] h-[46%] w-[48%] overflow-hidden rounded-[32px]">
              <Image src={P.c} alt="" fill sizes="240px" className="object-cover" />
            </div>
            <div {...reveal(2)} className="absolute bottom-0 left-[16%] h-[40%] w-[56%] overflow-hidden rounded-[32px]">
              <Image src={P.a} alt="" fill sizes="280px" className="kenburns object-cover" />
            </div>
          </div>
          <div>
            <Eyebrow>How we work</Eyebrow>
            <ScrollText
              className="t-statement !text-[clamp(26px,3vw,40px)]"
              parts={["Lasting change needs more than a single intervention. We combine ", { t: "technical expertise", hl: true }, " with local ownership."]}
            />
            <div className="mt-8 border-t border-[var(--line)] md:mt-10">
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
            <div {...reveal()} className="relative hidden h-[240px] w-[210px] lg:block">
              <div className="relative h-full w-full overflow-hidden rounded-[28px]">
                <Image src={P.c} alt="" fill sizes="210px" className="object-cover" />
              </div>
              <span aria-hidden="true" className="absolute -bottom-4 -right-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--a-lilac)] text-[40px] font-bold leading-none text-[var(--ink)]">
                &ldquo;
              </span>
            </div>
            <div>
              <Eyebrow>Our mission</Eyebrow>
              <ScrollText
                as="h2"
                className="text-[clamp(36px,5.4vw,72px)] font-bold leading-[1] tracking-[-0.05em]"
                parts={["Health is built in ", { t: "communities,", hl: true }, " not only in clinics"]}
              />
              <div className="mt-8 grid max-w-[860px] gap-6 md:grid-cols-2">
                <p className="t-body !text-[17px] md:!text-[18px]">
                  Our mission is improved quality of life for people – especially vulnerable groups – through
                  inclusive and innovative community-led programming.
                </p>
                <p className="t-body hidden !text-[18px] md:block">
                  Our vision is a healthy and safe society where everyone thrives, with equitable access to
                  quality healthcare and opportunities for sustainable development.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-2 md:mt-16 md:gap-4">
            {[
              { v: "2009", s: "Founded", t: "Founded to give Nigeria's public health sector dedicated technical support." },
              { v: "5", s: "Zones", t: "Geopolitical zones where our programmes operate, coordinated from Abuja." },
              { v: "10+", s: "Partners", t: "Government and international partners, including the Global Fund, USAID and UNICEF." },
            ].map((s, i) => (
              <div key={s.v} {...reveal(i)} className="rounded-[22px] bg-[var(--ink-2)] p-4 md:rounded-[28px] md:p-8">
                <div className="text-[clamp(30px,5vw,68px)] font-bold leading-none tracking-[-0.05em]">{s.v}</div>
                <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.06em] text-white/60 md:hidden">{s.s}</p>
                <p className="mt-5 hidden text-[16px] leading-relaxed text-white/70 md:block">{s.t}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center md:mt-12">
            <Pill href="/contact?type=partnership" tone="primary">Partner with us</Pill>
          </div>
        </div>
      </Sheet>

      {/* Get involved – continuously moving cards */}
      <Sheet tone="white" z={12} ariaLabel="Get involved">
        <div className="wrap mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-12">
          <div>
            <Eyebrow>Get involved</Eyebrow>
            <h2 {...reveal()} className="t-h2">Work With Us</h2>
          </div>
          <Pill href="/opportunities" tone="ink" className="hidden md:inline-flex">All opportunities</Pill>
        </div>
        <EngageMarquee />
      </Sheet>

      <FinalCTA z={10} />
    </>
  );
}

function EngageMarquee() {
  const row = [...ENGAGE, ...ENGAGE];
  return (
    <div className="marquee-host overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <ul className="marquee-cards flex w-max gap-6 py-2">
        {row.map((e, i) => {
          const dup = i >= ENGAGE.length;
          return (
            <li key={`${e.title}-${i}`} aria-hidden={dup || undefined}>
              <Link href={e.href} tabIndex={dup ? -1 : undefined} className="group block w-[280px] transition-transform duration-500 hover:-translate-y-2 md:w-[380px]">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[28px] md:aspect-video md:rounded-[32px]">
                  <Image src={e.img} alt="" fill sizes="380px" className="kenburns object-cover" style={{ animationDelay: `${-i * 3}s` }} />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                  <span className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <span key={t} className="chip chip-glass !h-7 !px-3 !text-[11px]">{t}</span>
                    ))}
                  </span>
                  <span className="arrow-btn absolute right-4 top-4"><ArrowUpRight /></span>
                </span>
                <span className="mt-4 block text-[12px] font-bold uppercase tracking-[0.08em]">
                  {e.who} <span className="font-medium text-[var(--ink-soft)]">· {e.via}</span>
                </span>
                <span className="mt-1.5 block text-[22px] font-bold leading-[1.15] tracking-[-0.03em] md:text-[26px]">{e.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
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
    <div className="relative mx-auto aspect-square w-full max-w-[340px] md:max-w-[520px]" aria-hidden="true">
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
