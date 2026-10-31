"use client";

/**
 * Compact progress stepper for approval chains (goal-gradient effect: people can
 * see how close a request is to done). Works with any list of steps.
 */
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepState = "done" | "current" | "todo" | "rejected";
export interface ProgressStep {
  label: string;
  sub?: string;
  state: StepState;
}

export function toStepState(status?: string): StepState {
  const s = (status || "").toUpperCase();
  if (/APPROV|AUTHORI[SZ]|SIGNED|COMPLETE|REVIEWED|DONE|PAID/.test(s)) return "done";
  if (/REJECT|DECLIN|CANCEL/.test(s)) return "rejected";
  return "todo";
}

export default function ApprovalProgress({ steps, className }: { steps: ProgressStep[]; className?: string }) {
  if (!steps.length) return null;
  // First not-done step becomes "current" unless the chain was rejected
  const rejected = steps.some((s) => s.state === "rejected");
  const firstOpen = steps.findIndex((s) => s.state === "todo");
  const list = steps.map((s, i) => ({ ...s, state: !rejected && i === firstOpen ? ("current" as StepState) : s.state }));
  const done = list.filter((s) => s.state === "done").length;
  const pct = Math.round((done / list.length) * 100);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold text-[var(--ink,#17171c)]">
          {rejected ? "Returned during approval" : done === list.length ? "Fully approved" : `${done} of ${list.length} approvals done`}
        </p>
        <p className="text-[12px] font-semibold text-[var(--muted,#6b6b76)]">{pct}%</p>
      </div>
      <div
        className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2,#f3f2f7)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={list.length}
        aria-valuenow={done}
        aria-label="Approval progress"
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", rejected ? "bg-[var(--danger,#c62828)]" : "bg-[var(--brand,#f2564d)]")}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
      <ol className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {list.map((s, i) => (
          <li key={i} className="flex min-w-[96px] flex-1 items-start gap-2">
            <span
              className={cn(
                "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                s.state === "done" && "bg-[var(--mint,#89f0ca)] text-[#0b3d2c]",
                s.state === "current" && "bg-[var(--ink,#17171c)] text-white ring-4 ring-[var(--brand-soft,#fff0ee)]",
                s.state === "todo" && "border border-[var(--line-strong,#d9d8e2)] text-[var(--muted,#6b6b76)]",
                s.state === "rejected" && "bg-[var(--danger,#c62828)] text-white"
              )}
              aria-hidden="true"
            >
              {s.state === "done" ? <Check className="h-3.5 w-3.5" /> : s.state === "rejected" ? <X className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className={cn("block truncate text-[12.5px] font-semibold", s.state === "todo" ? "text-[var(--muted,#6b6b76)]" : "text-[var(--ink,#17171c)]")}>
                {s.label}
              </span>
              {s.sub && <span className="block truncate text-[11.5px] text-[var(--faint,#9a9aa5)]">{s.sub}</span>}
              <span className="sr-only">
                {s.state === "done" ? "completed" : s.state === "current" ? "in progress" : s.state === "rejected" ? "rejected" : "not started"}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
