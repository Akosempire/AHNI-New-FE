"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
      className="grid scroll-mt-32 overflow-hidden rounded-[var(--radius-img)] bg-white shadow-[0_-12px_40px_rgba(23,23,28,.08)] md:h-[460px] md:grid-cols-[1.15fr_0.85fr]"
    >
      <div className="flex flex-col p-7 md:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--ink)] text-white">
            <FocusIcon name={f.icon} size={28} />
          </span>
          <span className="chip">{f.group}</span>
        </div>
        <h2 className="mt-6 text-[clamp(28px,4vw,52px)] md:mt-8 font-bold leading-[1] tracking-[-0.045em]">{f.title}</h2>
        <p className="t-body mt-3 max-w-[560px] !text-[16px] md:mt-5 md:!text-[18px]">{f.summary}</p>
        {f.points && (
          <ul className="mt-6 hidden flex-wrap gap-2 md:mt-8 md:flex">
            {f.points.map((p) => (
              <li key={p} className="rounded-full border border-[var(--line)] px-4 py-2 text-[14px] font-semibold">
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={cx("relative h-[150px] md:h-auto", !photo && PANEL[i % PANEL.length])}>
        {photo ? (
          <Image src={photo} alt="" fill sizes="(max-width: 768px) 92vw, 480px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-[var(--ink)]">
            <FocusIcon name={f.icon} size={180} className="h-[90px] w-[90px] opacity-80 md:h-[180px] md:w-[180px]" />
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Scroll-stacking deck: every card sticks under the header and the next card slides up
 * over it. Covered cards shrink and dim slightly so the stack reads as depth.
 */
function StackedCards({ children }: { children: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-stack-item]"));
    let raf = 0;
    const update = () => {
      raf = 0;
      items.forEach((el, i) => {
        const next = items[i + 1];
        const card = el.firstElementChild as HTMLElement | null;
        if (!card) return;
        if (!next) {
          card.style.transform = "";
          card.style.filter = "";
          return;
        }
        const a = el.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        // 0 when the next card is a full card-height below, 1 when it fully covers this one
        const p = Math.min(1, Math.max(0, 1 - (b.top - a.top) / Math.max(a.height, 1)));
        card.style.transform = `scale(${1 - p * 0.06})`;
        card.style.filter = `brightness(${1 - p * 0.12})`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="mt-10" aria-live="polite">
      {children.map((child, i) => (
        <div
          key={i}
          data-stack-item=""
          className="sticky pb-6 md:pb-10 [&>*]:origin-top [&>*]:transition-[transform,filter] [&>*]:duration-75 [&>*]:will-change-transform"
          style={{ top: `calc(100px + ${i * 14}px)` }}
        >
          {child}
        </div>
      ))}
    </div>
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
          <StackedCards key={group}>
            {list.map((f, i) => (
              <AreaCard key={f.slug} f={f} i={i} />
            ))}
          </StackedCards>
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
