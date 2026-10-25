import type { FocusIconKey } from "./content";

/** Hand-drawn style line icons for focus areas (24x24 grid, currentColor stroke). */
const PATHS: Record<FocusIconKey, JSX.Element> = {
  ribbon: (
    <>
      <path d="M12 3c-2.2 0-3.6 1.6-3.6 3.6 0 2.3 1.6 4.3 3.6 6.8 2-2.5 3.6-4.5 3.6-6.8C15.6 4.6 14.2 3 12 3Z" />
      <path d="M10.2 10.6 5.5 20.5l3.1-.9 1.4 2.9 4.4-9" />
      <path d="M13.8 10.6l4.7 9.9-3.1-.9-1.4 2.9-1.6-3.4" />
    </>
  ),
  lungs: (
    <>
      <path d="M12 3v8m0 0c-1 1.5-2.5 2-3.5 2M12 11c1 1.5 2.5 2 3.5 2" />
      <path d="M8.5 7C5.5 7 3 12 3 17c0 2.5 2 3.5 4 3 2.5-.6 2.5-3 2.5-6V9c0-1.2-.4-2-1-2Z" />
      <path d="M15.5 7c3 0 5.5 5 5.5 10 0 2.5-2 3.5-4 3-2.5-.6-2.5-3-2.5-6V9c0-1.2.4-2 1-2Z" />
    </>
  ),
  mosquito: (
    <>
      <ellipse cx="12" cy="13" rx="2" ry="5" />
      <path d="M12 8V5m0 0-2-2m2 2 2-2M10 11 4 7m10 4 6-4M10 14l-5 4m9-4 5 4M10.5 17l-2.5 4m5.5-4 2.5 4" />
    </>
  ),
  mother: (
    <>
      <circle cx="9" cy="5" r="2.2" />
      <path d="M5 21v-5.5C5 11 6.8 9 9 9s3.4 1.3 4 3" />
      <circle cx="15.5" cy="13" r="1.8" />
      <path d="M11 21c0-3 2-5 4.5-5s4.5 2 4.5 5" />
      <path d="M9 13c1.5 1.2 3.4 1.8 5 1.6" />
    </>
  ),
  building: (
    <>
      <path d="M3 21h18M5 21V8l7-4 7 4v13" />
      <path d="M12 9v5m-2.5-2.5h5" />
      <path d="M9 21v-4h6v4" />
    </>
  ),
  microscope: (
    <>
      <path d="M6 21h12M9 18h6" />
      <path d="M10 4.5 13 3l3 6-3 1.5z" />
      <path d="M11.5 10.5 9 12m8 2a5 5 0 0 1-8 4" />
      <circle cx="9" cy="14.5" r="1.5" />
    </>
  ),
  stethoscope: (
    <>
      <path d="M6 3v5a4 4 0 0 0 8 0V3" />
      <path d="M10 12v3a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="11" r="2" />
    </>
  ),
  community: (
    <>
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="19" cy="10" r="2" />
      <path d="M7.5 20c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5M2 19c0-2.4 1.3-4.3 3-4.3 1 0 1.8.4 2.4 1.2M22 19c0-2.4-1.3-4.3-3-4.3-1 0-1.8.4-2.4 1.2" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18M7 21h10M4 7h16" />
      <path d="M4 7 2 13a3 3 0 0 0 4 0L4 7Zm16 0-2 6a3 3 0 0 0 4 0l-2-6Z" />
    </>
  ),
  spark: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
      <path d="M12 8v3m-1.5-1.5h3" />
    </>
  ),
  book: (
    <>
      <path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1Z" />
      <path d="M12 6v14" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6Z" />
      <path d="M12 8.5v6m-3-3h6" />
    </>
  ),
};

export function FocusIcon({ name, size = 28, className }: { name: FocusIconKey; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

/** ECG / heartbeat line used across the site as the AHNi motif. */
export function Heartbeat({ className, color = "var(--primary)" }: { className?: string; color?: string }) {
  return (
    <svg className={`ecg ${className ?? ""}`} viewBox="0 0 600 80" fill="none" aria-hidden="true">
      <path
        pathLength={1}
        d="M0 50 H170 L188 50 L200 22 L214 70 L230 8 L246 62 L258 50 H330 L342 44 L352 50 H594"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="592" cy="50" r="5" fill={color} />
    </svg>
  );
}

/** Circular hand-drawn ring around the AHNi wordmark. */
export function ScribbleRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" aria-hidden="true">
      <path
        d="M50 4.5C74 3.6 95.5 22 95.6 49.2 95.8 76.5 74.2 96 49 95.6 23.7 95.2 4.3 75.5 4.5 49.6 4.7 26.4 22.6 7.6 47 6.2c18-.9 35.6 9 42.3 25.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M53 8.4c20.8 2.6 37.5 19.6 37.4 41.6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity=".5"
      />
    </svg>
  );
}
