"use client";

import Image from "next/image";
import { useState } from "react";
import { FOCUS_AREAS, FocusArea } from "@/components/public/content";
import { FocusIcon } from "@/components/public/icons";
import { FinalCTA } from "@/components/public/sections";
import { Aurora, Eyebrow, Pill, Sheet, cx, reveal } from "@/components/public/ui";

const GROUPS = ["All", "Disease control", "Systems", "Communities", "Evidence"] as const;

const PHOTO: Record<string, string> = {
  "hiv-tb-malaria": "/img/healthcare-safety.jpg",
  "health-systems": "/img/leadership-conference.jpg",
  "education-training": "/img/education.jpg",
  "health-research": "/img/login.jpeg",
};

const PANEL = ["bg-[var(--accent)]", "bg-[var(--a-butter)]", "bg-[var(--a-blush)]", "bg-[var(--a-lilac)]"];

function AreaCard({ f, i }: { f: FocusArea; i: number }) {
  const photo = PHOTO[f.slug];
  return (
    <article
      id={f.slug}
      className="grid scroll-mt-32 overflow-hidden rounded-[var(--radius-img)] bg-white md:min-h-[440px] md:grid-cols-[1.15fr_0.85fr]"
    >
      <div className="flex flex-col p-7 md:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--ink)] text-white">
            <FocusIcon name={f.icon} size={28} />
          </span>
          <span className="chip">{f.group}</span>
        </div>
        <h2 className="mt-8 text-[clamp(32px,4vw,52px)] font-bold leading-[1] tracking-[-0.045em]">{f.title}</h2>
        <p className="t-body mt-5 max-w-[560px] !text-[18px]">{f.summary}</p>
        {f.points && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {f.points.map((p) => (
              <li key={p} className="rounded-full border border-[var(--line)] px-4 py-2 text-[14px] font-semibold">
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={cx("relative min-h-[240px]", !photo && PANEL[i % PANEL.length])}>
        {photo ? (
          <Image src={photo} alt="" fill sizes="(max-width: 768px) 92vw, 480px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[var(--ink)]">
            <FocusIcon name={f.icon} size={180} className="opacity-80" />
          </div>
        )}
      </div>
    </article>
  );
}

export default function FocusAreasPage() {
  const [group, setGroup] = useState<(typeof GROUPS)[number]>("All");
  const list = FOCUS_AREAS.filter((f) => group === "All" || f.group === group);

  return (
    <>
      <Sheet tone="white" z={20} className="overflow-hidden !pt-[170px] md:!pt-[220px]" ariaLabel="Focus areas">
        <Aurora className="-right-40 top-24 h-[520px] w-[620px]" />
        <div className="wrap relative">
          <Eyebrow>What we do</Eyebrow>
          <h1 className="t-display" {...reveal()}>Focus Areas</h1>
          <p {...reveal(1)} className="t-body mt-8 max-w-[880px] !text-[clamp(18px,1.8vw,22px)]">
            Strategic areas where we create sustainable impact across Nigeria&apos;s healthcare landscape. Our approach
            tackles systemic challenges while building local capacity for long-term success.
          </p>
        </div>
      </Sheet>

      <section className="relative z-[19] mt-[calc(var(--radius-sheet)*-1)] rounded-b-[var(--radius-sheet)] bg-[var(--mist)] pb-32 pt-[calc(var(--radius-sheet)+64px)]">
        <div className="wrap">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter focus areas">
            {GROUPS.map((g) => (
              <button key={g} type="button" className="chip" aria-pressed={group === g} onClick={() => setGroup(g)}>
                {g}
              </button>
            ))}
          </div>
          <div className="mt-10 space-y-10" aria-live="polite">
            {list.map((f, i) => (
              <div key={f.slug} className="page-in">
                <AreaCard f={f} i={i} />
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            <Pill href="/opportunities" tone="ink">Explore opportunities</Pill>
            <Pill href="/contact?type=partnership" tone="primary">Partner with us</Pill>
          </div>
        </div>
      </section>

      <FinalCTA z={10} />
    </>
  );
}
