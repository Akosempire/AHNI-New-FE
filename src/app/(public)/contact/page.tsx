"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ORG } from "@/components/public/content";
import { Heartbeat } from "@/components/public/icons";
import { FinalCTA } from "@/components/public/sections";
import { Aurora, Eyebrow, Sheet, cx, reveal } from "@/components/public/ui";

const TOPICS = [
  { key: "general", label: "General", email: ORG.emails.operations, hint: "Operations and general enquiries" },
  { key: "partnership", label: "Partnership", email: ORG.emails.operations, hint: "Technical assistance & collaboration" },
  { key: "careers", label: "Careers", email: ORG.emails.careers, hint: "Jobs and applications" },
  { key: "procurement", label: "Procurement", email: ORG.emails.procurement, hint: "Vendor and tender enquiries" },
  { key: "support", label: "Portal support", email: ORG.emails.support, hint: "Log-in and technical issues" },
] as const;

const field =
  "field-input w-full text-[16px] outline-none transition-colors placeholder:text-[#9a9aa3]";

function ContactInner() {
  const params = useSearchParams();
  const initial = TOPICS.find((t) => t.key === params?.get("type"))?.key ?? "general";
  const [topic, setTopic] = useState<string>(initial);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const t = TOPICS.find((x) => x.key === topic)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\nTopic: ${t.label}\n\n${form.message}`;
    window.location.href = `mailto:${t.email}?subject=${encodeURIComponent(form.subject || `${t.label} enquiry`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <Sheet tone="white" z={20} className="overflow-hidden !pt-[170px] md:!pt-[220px]" ariaLabel="Contact">
        <Aurora className="-right-32 top-16 h-[460px] w-[560px]" />
        <div className="wrap relative">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="t-display" {...reveal()}>
            Let&apos;s <span className="hl">talk</span>
          </h1>
          <p {...reveal(1)} className="t-body mt-8 max-w-[760px] !text-[clamp(18px,1.8vw,22px)]">
            Partnerships, opportunities, procurement or portal support – choose a topic and your message goes straight
            to the right team.
          </p>
        </div>
      </Sheet>

      <section className="relative z-[19] mt-[calc(var(--radius-sheet)*-1)] rounded-b-[var(--radius-sheet)] bg-[var(--mist)] pb-32 pt-[calc(var(--radius-sheet)+64px)]">
        <div className="wrap grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Office card */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-[var(--radius-card)] bg-[var(--ink)] p-8 text-white md:p-10">
              <span className="chip !bg-[var(--accent)] !text-[var(--ink)]">Abuja · Headquarters</span>
              <p className="mt-8 text-[clamp(24px,2.4vw,30px)] font-bold leading-[1.15] tracking-[-0.03em]">{ORG.address}</p>
              <div className="mt-8 space-y-1">
                {ORG.phones.map((p) => (
                  <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="block text-[22px] font-bold tracking-[-0.02em] hover:text-[var(--accent)]">
                    {p}
                  </a>
                ))}
                <p className="pt-1 text-[14px] text-white/60">Fax {ORG.fax}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ORG.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pill pill-white sm mt-8"
              >
                Get directions ↗
              </a>
              <Heartbeat className="pointer-events-none absolute -right-10 bottom-4 w-[360px] opacity-25" color="var(--primary-text)" />
            </div>

            <div className="rounded-[var(--radius-card)] bg-white p-8">
              <p className="t-eyebrow">Office hours</p>
              <dl className="divide-y divide-[var(--line)]">
                {ORG.hours.map((h) => (
                  <div key={h.d} className="flex justify-between gap-4 py-3 text-[16px]">
                    <dt className="text-[var(--ink-soft)]">{h.d}</dt>
                    <dd className="font-bold">{h.h}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--ink-soft)]">
                We aim to respond within 24 hours on business days. For urgent matters, please call the office.
              </p>
            </div>

            <div className="rounded-[var(--radius-card)] bg-white p-8">
              <p className="t-eyebrow">Direct lines</p>
              <ul className="space-y-3">
                {[
                  { l: "Careers", e: ORG.emails.careers },
                  { l: "Consultants", e: ORG.emails.consultants },
                  { l: "Procurement", e: ORG.emails.procurement },
                  { l: "Vendor support", e: ORG.emails.vendor },
                  { l: "Technical support", e: ORG.emails.support },
                ].map((x) => (
                  <li key={x.e} className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="text-[15px] text-[var(--ink-soft)]">{x.l}</span>
                    <a href={`mailto:${x.e}`} className="break-all text-[16px] font-bold hover:underline">{x.e}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="rounded-[var(--radius-card)] bg-white p-7 md:p-12">
            <h2 className="text-[clamp(30px,3.4vw,44px)] font-bold leading-[1.05] tracking-[-0.04em]">Send us a message</h2>
            <p className="mt-3 text-[var(--ink-soft)]">This opens your email app with your message ready to send.</p>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <fieldset>
                <legend className="mb-3 text-[14px] font-bold">What is it about?</legend>
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((x) => (
                    <button key={x.key} type="button" className="chip" aria-pressed={topic === x.key} onClick={() => setTopic(x.key)}>
                      {x.label}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-[14px] text-[var(--ink-soft)]">
                  {t.hint} · goes to <b className="text-[var(--ink)]">{t.email}</b>
                </p>
              </fieldset>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-[14px] font-bold">Full name</span>
                  <input required className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[14px] font-bold">Email</span>
                  <input required type="email" className={field} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block text-[14px] font-bold">Subject</span>
                <input className={field} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={`${t.label} enquiry`} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[14px] font-bold">Message</span>
                <textarea required rows={6} className={cx(field, "resize-y")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </label>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button type="submit" className="pill pill-ink">Send message</button>
                {sent && <p className="text-[14px] text-[var(--ink-soft)]" role="status">Your email app should now be open.</p>}
              </div>
            </form>
          </div>
        </div>
      </section>

      <FinalCTA z={10} />
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ContactInner />
    </Suspense>
  );
}
