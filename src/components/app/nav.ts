import type { ReactNode } from "react";

export type NavNode = {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: NavNode[];
};

export type NavSection = { id: string; label: string; items: NavNode[] };

/** Flatten every navigable page (used by the search palette and active-route matching). */
export function flatten(sections: NavSection[]): { label: string; href: string; trail: string[] }[] {
  const out: { label: string; href: string; trail: string[] }[] = [];
  const seen = new Set<string>();
  const walk = (n: NavNode, trail: string[]) => {
    if (n.href && n.href !== "/" && !seen.has(n.href + n.label)) {
      seen.add(n.href + n.label);
      out.push({ label: n.label, href: n.href, trail });
    }
    n.children?.forEach((c) => walk(c, [...trail, n.label]));
  };
  sections.forEach((s) => s.items.forEach((n) => walk(n, [s.label])));
  return out;
}

/**
 * Pick the single best-matching nav href for the current path (longest prefix match),
 * so only one item is ever highlighted even when parents share a path with a child.
 */
export function bestMatch(pathname: string, hrefs: string[]): string | null {
  let best: string | null = null;
  for (const h of hrefs) {
    if (!h || h === "/") continue;
    const exact = pathname === h;
    const prefix = h !== "/dashboard" && pathname.startsWith(h.endsWith("/") ? h : h + "/");
    if ((exact || prefix) && (!best || h.length > best.length)) best = h;
  }
  return best;
}

/** ids of every ancestor of the node whose href is `active` */
export function ancestorsOf(sections: NavSection[], active: string | null): Set<string> {
  const found = new Set<string>();
  if (!active) return found;
  const walk = (n: NavNode, chain: string[]): boolean => {
    if (n.href === active) {
      chain.forEach((c) => found.add(c));
      return true;
    }
    return !!n.children?.some((c) => walk(c, [...chain, n.id]));
  };
  sections.forEach((s) => s.items.forEach((n) => walk(n, [])));
  return found;
}

const SMALL = new Set(["and", "of", "&", "vs", "for", "to", "the"]);
export function prettify(segment: string) {
  const s = decodeURIComponent(segment).replace(/[-_]+/g, " ").trim();
  if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) return "Details";
  return s
    .split(" ")
    .map((w, i) => {
      const lw = w.toLowerCase();
      if (i > 0 && SMALL.has(lw)) return lw;
      if (["hr", "rfq", "rfp", "eoi", "cba", "po", "c", "g", "ap", "ar"].includes(lw)) return lw.toUpperCase();
      return lw.charAt(0).toUpperCase() + lw.slice(1);
    })
    .join(" ");
}
