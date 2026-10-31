"use client";

/**
 * Pull down at the top of the page on a phone to refresh the data on screen
 * (Jakob's law – works like every mobile app people already use).
 * Refetches the React Query data that is currently on screen; no full page reload.
 */
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TRIGGER = 72;

export default function PullToRefresh() {
  const qc = useQueryClient();
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);

  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const blocked = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('[role="dialog"],[role="alertdialog"],[data-radix-popper-content-wrapper],input,textarea,select');

    const onStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || busy || blocked(e.target) || document.body.style.overflow === "hidden") return;
      startY.current = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const d = e.touches[0].clientY - startY.current;
      if (d <= 0 || window.scrollY > 0) {
        pullRef.current = 0;
        setPull(0);
        return;
      }
      const eased = Math.min(110, d * 0.5);
      pullRef.current = eased;
      setPull(eased);
    };
    const onEnd = async () => {
      if (startY.current == null) return;
      startY.current = null;
      if (pullRef.current >= TRIGGER) {
        setBusy(true);
        setPull(TRIGGER);
        try {
          await qc.refetchQueries({ type: "active" });
        } finally {
          setBusy(false);
          setPull(0);
          pullRef.current = 0;
        }
      } else {
        setPull(0);
        pullRef.current = 0;
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [qc, busy]);

  if (!pull && !busy) return null;
  const ready = pull >= TRIGGER;
  return (
    <div
      className="ux-ptr"
      style={{ transform: `translateY(${Math.max(8, pull)}px)`, opacity: Math.min(1, pull / 40) }}
      role="status"
      aria-live="polite"
    >
      <RefreshCw
        className={busy ? "h-5 w-5 animate-spin" : "h-5 w-5"}
        style={busy ? undefined : { transform: `rotate(${pull * 3}deg)`, color: ready ? "var(--brand, #f2564d)" : undefined }}
        aria-hidden="true"
      />
      <span className="sr-only">{busy ? "Refreshing" : ready ? "Release to refresh" : "Pull to refresh"}</span>
    </div>
  );
}
