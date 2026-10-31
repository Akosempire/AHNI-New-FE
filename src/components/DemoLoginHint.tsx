import { DEMO_LOGINS, DEMO_MODE } from "@/constants/demoMode";

/** Shown on sign-in pages only in preview demo mode (NEXT_PUBLIC_DEMO_MODE=1). */
export default function DemoLoginHint({ kind }: { kind: keyof typeof DEMO_LOGINS }) {
  if (!DEMO_MODE) return null;
  const d = DEMO_LOGINS[kind];
  return (
    <div role="note" className="mb-6 rounded-xl border border-dashed border-amber-400 bg-amber-50 p-3 text-[13px] leading-relaxed text-amber-900">
      <b>Preview mode</b> – sample data, not connected to AHNi&apos;s servers. Sign in with{" "}
      <code className="font-semibold">{d.email}</code> / <code className="font-semibold">{d.password}</code>
    </div>
  );
}
