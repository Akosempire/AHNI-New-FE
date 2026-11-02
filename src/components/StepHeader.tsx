import GoBack from "@/components/GoBack";
import { Check } from "lucide-react";

interface Step {
  step: number;
  stepName: string;
}

interface StepHeaderProps {
  steps: Step[];
  currentStep: number;
}

/** Back link, then a compact stepper: done (✓), current (ringed) and upcoming steps. */
const StepHeader = ({ steps, currentStep }: StepHeaderProps) => {
  return (
    <section className="space-y-5">
      <GoBack />
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-3" aria-label="Progress">
        {steps.map((step, index) => {
          const done = index < currentStep - 1;
          const current = index === currentStep - 1;
          return (
            <li key={step.step} className="flex items-center gap-3" aria-current={current ? "step" : undefined}>
              <span
                className={[
                  "grid h-7 w-7 flex-none place-items-center rounded-full text-[12px] font-medium tabular-nums",
                  done
                    ? "bg-[var(--mint-ink,#0f7a55)] text-white"
                    : current
                    ? "bg-[var(--ink,#17171c)] text-[var(--surface,#fff)] ring-4 ring-[var(--brand-soft,#fff0ee)]"
                    : "border border-[var(--line-strong,#e2e1e8)] text-[var(--muted,#64646e)]",
                ].join(" ")}
              >
                {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : step.step}
              </span>
              <span className="leading-tight">
                <span className="ux-label block">Step {step.step}</span>
                <span className={["block text-[14px]", current ? "font-medium text-[var(--ink,#17171c)]" : "text-[var(--ink-2,#3a3a44)]"].join(" ")}>
                  {step.stepName}
                </span>
              </span>
              {index !== steps.length - 1 && <span className="mx-1 hidden h-px w-10 bg-[var(--line-strong,#e2e1e8)] sm:block lg:w-16" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default StepHeader;
