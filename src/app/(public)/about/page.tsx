"use client";

import Image from "next/image";
import { STORIES } from "@/components/public/content";
import { FocusIcon, Heartbeat } from "@/components/public/icons";
import { FinalCTA, PartnerMarquee, StoryCard } from "@/components/public/sections";
import { Aurora, Eyebrow, Pill, Rail, Sheet, reveal } from "@/components/public/ui";

const PILLARS = [
  {
    icon: "community" as const,
    title: "Community impact",
    body: "Strengthening healthcare delivery in communities across Nigeria through targeted interventions and sustainable programmes.",
  },
  {
    icon: "spark" as const,
    title: "Innovation",
    body: "Advancing modern healthcare solutions and best practice through research, technology and evidence-based approaches.",
  },
  {
    icon: "scale" as const,
    title: "Sustainable development",
    body: "Creating lasting change in health outcomes through strategic partnerships and capacity building.",
  },
];

const APPROACH = [
  {
    n: "01",
    title: "System strengthening",
    body: "Building robust healthcare infrastructure and institutional capacity to support long-term health outcomes.",
  },
  {
    n: "02",
    title: "Community engagement",
    body: "Working directly with communities to understand needs and implement culturally appropriate health solutions.",
  },
  {
    n: "03",
    title: "Strategic partnerships",
    body: "Collaborating with government, NGOs and international partners to maximise impact and resource efficiency.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Split hero */}
      <Sheet tone="white" z={20} className="!pt-[170px] md:!pt-[210px]" ariaLabel="About AHNi">
        <div className="wrap grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Eyebrow>About AHNi</Eyebrow>
            <h1 className="t-display !text-[clamp(46px,6.2vw,86px)]">
              <span className="block" {...reveal(0)}>Healthier lives,</span>
              <span className="block" {...reveal(1)}>
                led by <span className="hl">communities</span>
              </span>
            </h1>
            <p {...reveal(2)} className="t-body mt-8 max-w-[540px]">
              Achieving Health Nigeria Initiative (AHNi) provides health technical assistance to Nigeria&apos;s public
              health sector. Since 2009 we have worked with government, donors and communities to strengthen health
              systems and improve outcomes for people across the country.
            </p>
            <div {...reveal(3)} className="mt-10 flex flex-wrap gap-3">
              <Pill href="/contact?type=partnership" tone="primary">Partner with us</Pill>
              <Pill href="/opportunities" tone="chip">Join the team</Pill>
            </div>
          </div>
          <div className="relative">
            <Aurora className="-inset-10" />
            <div {...reveal(1)} className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-img)] md:aspect-[5/6]">
              <Image src="/img/healthcare-safety.jpg" alt="AHNi staff and health workers outside a facility" fill priority sizes="(max-width: 1024px) 92vw, 520px" className="object-cover" />
            </div>
            <div className="glass absolute -bottom-6 left-4 right-4 flex items-center gap-4 px-6 py-5 md:-left-10 md:right-auto">
              <span className="text-[44px] font-bold leading-none tracking-[-0.05em]">2009</span>
              <span className="text-[14px] font-medium leading-snug text-[var(--ink-soft)]">
                Serving Nigeria&apos;s
                <br />
                public health sector
              </span>
            </div>
          </div>
        </div>
      </Sheet>

      {/* Trusted to deliver */}
      <Sheet tone="mist" z={19} ariaLabel="Trusted to deliver">
        <div className="wrap grid gap-12 lg:grid-cols-[260px_1fr]">
          <div {...reveal()} className="relative h-[260px] w-[220px] overflow-hidden rounded-[32px]">
            <Image src="/img/education.jpg" alt="" fill sizes="220px" className="object-cover" />
          </div>
          <div>
            <Eyebrow>Trusted to deliver</Eyebrow>
            <h2 {...reveal()} className="text-[clamp(38px,5vw,68px)] font-bold leading-[1] tracking-[-0.05em]">
              Technical depth. <span className="hl">Local trust.</span>
            </h2>
            <p {...reveal(1)} className="t-body mt-8 max-w-[760px]">
              We are dedicated to advancing healthcare delivery across Nigeria through innovative solutions and
              community engagement. From our Abuja headquarters, our teams operate across five geopolitical zones,
              alongside partners including the Global Fund, USAID, CDC, UNICEF and FCDO, to combat HIV/AIDS, TB and
              malaria and to strengthen the systems that keep people healthy.
            </p>
            <ul className="mt-12 grid gap-4 md:grid-cols-3">
              {PILLARS.map((p, i) => (
                <li key={p.title} {...reveal(i)} className="rounded-[28px] bg-white p-7">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)]">
                    <FocusIcon name={p.icon} size={28} />
                  </span>
                  <h3 className="mt-6 text-[22px] font-bold tracking-[-0.025em]">{p.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-soft)]">{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Sheet>

      {/* Mission & vision */}
      <Sheet tone="ink" z={18} id="mission" ariaLabel="Mission and vision">
        <div className="wrap">
          <Eyebrow>Why we exist</Eyebrow>
          <div className="grid gap-5 lg:grid-cols-2">
            {[
              { k: "Our vision", v: "A healthy and safe society where everyone thrives, with equitable access to quality healthcare and opportunities for sustainable development." },
              { k: "Our mission", v: "To enable socio-economic development through health system strengthening, research and evidence-based interventions that improve quality of life." },
            ].map((x, i) => (
              <div key={x.k} {...reveal(i)} className="relative overflow-hidden rounded-[36px] bg-[var(--ink-2)] p-8 md:p-12">
                <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-[var(--primary-text)]">{x.k}</p>
                <p className="mt-6 text-[clamp(26px,2.8vw,38px)] font-bold leading-[1.15] tracking-[-0.03em]">{x.v}</p>
              </div>
            ))}
          </div>
          <Heartbeat className="mt-16 w-full opacity-50" color="var(--primary-text)" />
        </div>
      </Sheet>

      {/* Approach */}
      <Sheet tone="white" z={17} id="approach" ariaLabel="Our approach">
        <div className="wrap">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <Eyebrow>Our approach</Eyebrow>
              <h2 {...reveal()} className="t-h2">How we work</h2>
            </div>
            <p {...reveal(1)} className="t-body max-w-[520px]">
              We take a comprehensive approach to health development – tackling systemic challenges while building local
              capacity, so impact is sustained long after a programme closes.
            </p>
          </div>
          <ol className="mt-16 grid gap-4 md:grid-cols-3">
            {APPROACH.map((a, i) => (
              <li key={a.n} {...reveal(i)} className="group flex min-h-[320px] flex-col rounded-[32px] bg-[var(--mist)] p-8 transition-colors duration-300 hover:bg-[var(--ink)] hover:text-white">
                <span className="text-[14px] font-bold tracking-[0.08em] text-[var(--ink-soft)] group-hover:text-[var(--primary-text)]">{a.n}</span>
                <h3 className="mt-auto text-[30px] font-bold leading-[1.05] tracking-[-0.03em]">{a.title}</h3>
                <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-soft)] group-hover:text-white/70">{a.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Sheet>

      {/* Stories */}
      <Sheet tone="mist" z={16} ariaLabel="Stories">
        <div className="wrap mb-12">
          <Eyebrow>In the field</Eyebrow>
          <h2 {...reveal()} className="t-h2">Our Work</h2>
        </div>
        <Rail label="Stories from our work">
          {STORIES.map((s) => (
            <StoryCard key={s.title} s={s} className="w-[min(1000px,calc(100vw-32px))]" />
          ))}
        </Rail>
      </Sheet>

      {/* Partners */}
      <Sheet tone="white" z={15} id="partners" ariaLabel="Partners">
        <div className="wrap text-center">
          <Eyebrow>Partners & funders</Eyebrow>
          <p {...reveal()} className="t-statement mx-auto max-w-[900px]">
            We work alongside government agencies and international partners to strengthen Nigeria&apos;s health
            systems.
          </p>
        </div>
        <div className="mt-14 [&_li]:bg-[var(--mist)]">
          <PartnerMarquee />
        </div>
        <p className="wrap mt-10 text-center text-[15px] text-[var(--ink-soft)]">
          Plus partners including CDC, FCDO, TAConnect and other international development organisations.
        </p>
      </Sheet>

      <FinalCTA z={10} eyebrow="Join our mission" />
    </>
  );
}
