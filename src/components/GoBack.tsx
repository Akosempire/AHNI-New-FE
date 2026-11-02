"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const GoBack = () => {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="ux-back inline-flex h-8 items-center gap-1.5 rounded-[6px] px-2 -ml-2 text-[13.5px] text-[var(--muted,#64646e)] transition-colors hover:bg-[var(--hover,#f6f5f9)] hover:text-[var(--ink,#17171c)]"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </button>
  );
};

export default GoBack;
