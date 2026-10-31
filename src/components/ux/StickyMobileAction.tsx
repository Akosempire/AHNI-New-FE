import { ReactNode } from "react";

/**
 * Wrap a page's main action (e.g. "New request"). On desktop it stays where it is;
 * on phones it becomes a full-width bar at the bottom, in thumb reach (Fitts's law).
 */
export default function StickyMobileAction({ children }: { children: ReactNode }) {
  return <div className="ux-sticky-mobile">{children}</div>;
}
