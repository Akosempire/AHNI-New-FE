import { DEMO_LOGINS, DEMO_MODE } from "@/constants/demoMode";

/** Shown on sign-in pages only in preview demo mode (NEXT_PUBLIC_DEMO_MODE=1). */
export default function DemoLoginHint({ kind }: { kind: keyof typeof DEMO_LOGINS }) {
  if (!DEMO_MODE) return null;
  const d = DEMO_LOGINS[kind];
  return (
    <div role="note" className="mb-6 rounded-[8px] border border-[color-mix(in_srgb,var(--butter-ink,#8a5a00)_25%,transparent)] bg-[var(--butter-soft,#fdf6e3)] p-3 text-[13px] leading-relaxed text-[var(--butter-ink,#8a5a00)]">
      <b>Preview mode</b> – sample data, not connected to AHNi&apos;s servers. Sign in with{" "}
      <code className="font-semibold">{d.email}</code> / <code className="font-semibold">{d.password}</code>
    </div>
  );
}
