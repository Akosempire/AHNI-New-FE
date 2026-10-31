"use client";

import "@fontsource-variable/dm-sans";
import "@fontsource-variable/playfair-display";
import "./app.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Keyboard,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
  Sun,
  User,
  X,
} from "lucide-react";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useTheme } from "@/configs/theme-provider";
import { activeIdOf, ancestorsOfId, bestMatch, flatten, NavNode, NavSection, prettify } from "./nav";
import { useLogout } from "./useLogout";
import { useNavSections } from "./useNavSections";
import { Tour, useTourControls } from "./Tour";
import { DEMO_MODE } from "@/constants/demoMode";
import PullToRefresh from "@/components/ux/PullToRefresh";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type ShellCtx = {
  sections: NavSection[];
  quickActions: { label: string; href: string }[];
  user: any;
  startTour: () => void;
  openSearch: () => void;
  openKeys: () => void;
};

/* Single-key jumps (only when not typing). Shown in the "?" sheet and in tooltips. */
const SHORTCUTS = [
  { key: "h", label: "Home", href: "/dashboard" },
  { key: "n", label: "Notifications", href: "/dashboard/notifications" },
  { key: "p", label: "Projects", href: "/dashboard/projects" },
  { key: "f", label: "Fund requests", href: "/dashboard/programs/fund-request" },
  { key: "l", label: "Audit log", href: "/dashboard/audit-log" },
  { key: "s", label: "Profile & settings", href: "/dashboard/account" },
];
const keyFor = (href?: string) => SHORTCUTS.find((x) => x.href === href)?.key.toUpperCase();
const Ctx = createContext<ShellCtx | null>(null);
export const useShell = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useShell must be used inside <AppShell>");
  return c;
};

const read = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const write = (k: string, v: string) => {
  try {
    localStorage.setItem(k, v);
  } catch {}
};

/* ============================================================ */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/dashboard";
  const nav = useNavSections();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [search, setSearch] = useState(false);
  const tour = useTourControls(nav.user?.id, nav.ready);

  useEffect(() => setCollapsed(read("ahni-sidebar-collapsed") === "1"), []);
  useEffect(() => setDrawer(false), [pathname]);

  const [keys, setKeys] = useState(false);
  const router = useRouter();

  // New page starts at the top (scroll position shouldn't carry over between pages)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      write("ahni-sidebar-collapsed", v ? "0" : "1");
      return !v;
    });
  }, []);

  // Keyboard map: Ctrl+K search · Ctrl+B sidebar · single keys jump to modules · ? shows the map
  useEffect(() => {
    const typing = (t: EventTarget | null) =>
      t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === "k") {
        e.preventDefault();
        setSearch((v) => !v);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && k === "b") {
        e.preventDefault();
        toggleCollapsed();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      const layerOpen = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"], [role="alertdialog"], [role="menu"]')).some(
        (el) => !el.closest('[aria-hidden="true"]') && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"
      );
      if (layerOpen) return;
      if (e.key === "?") {
        e.preventDefault();
        setKeys(true);
        return;
      }
      const hit = SHORTCUTS.find((x) => x.key === k);
      if (hit) {
        e.preventDefault();
        router.push(hit.href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, toggleCollapsed]);

  const ctx = useMemo<ShellCtx>(
    () => ({
      sections: nav.sections,
      quickActions: nav.quickActions,
      user: nav.user,
      startTour: () => {
        setDrawer(false);
        tour.start();
      },
      openSearch: () => setSearch(true),
      openKeys: () => setKeys(true),
    }),
    [nav.sections, nav.quickActions, nav.user, tour]
  );

  return (
    <Ctx.Provider value={ctx}>
      <div className="ahni-app">
        <a href="#app-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-xl focus:bg-[var(--surface)] focus:px-4 focus:py-3 focus:font-bold">
          Skip to content
        </a>

        {/* Desktop sidebar */}
        <aside
          data-tour="sidebar"
          className={cx(
            "fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--line)] bg-[var(--surface)] transition-[width] duration-[180ms] ease-[cubic-bezier(.2,0,0,1)] md:block",
            collapsed ? "w-[var(--sidebar-w-collapsed)]" : "w-[var(--sidebar-w)]"
          )}
          aria-label="Main navigation"
        >
          <SidebarContent collapsed={collapsed} onToggle={toggleCollapsed} pathname={pathname} ready={nav.ready} department={nav.userDepartment} />
        </aside>

        {/* Mobile drawer */}
        <div className={cx("fixed inset-0 z-[70] md:hidden", drawer ? "" : "pointer-events-none")} aria-hidden={!drawer}>
          <div
            className={cx("absolute inset-0 bg-black/45 transition-opacity", drawer ? "opacity-100" : "opacity-0")}
            onClick={() => setDrawer(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className={cx(
              "absolute inset-y-0 left-0 w-[86vw] max-w-[320px] bg-[var(--surface)] shadow-[var(--shadow-2)] transition-transform duration-200",
              drawer ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="btn btn-ghost btn-icon absolute right-3 top-4 z-10">
              <X className="h-5 w-5" />
            </button>
            {drawer && <SidebarContent collapsed={false} pathname={pathname} ready={nav.ready} department={nav.userDepartment} />}
          </div>
        </div>

        <div className={cx("transition-[padding] duration-[180ms] ease-[cubic-bezier(.2,0,0,1)]", collapsed ? "md:pl-[var(--sidebar-w-collapsed)]" : "md:pl-[var(--sidebar-w)]")}>
          <AppHeader pathname={pathname} onMenu={() => setDrawer(true)} />
          <main id="app-main" className="relative mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 md:px-8 md:pt-8">
            <PageTitle pathname={pathname} />
            {children}
          </main>
        </div>

        <PullToRefresh />
        <SearchPalette open={search} onClose={() => setSearch(false)} />
        <ShortcutSheet open={keys} onClose={() => setKeys(false)} />
        <TooltipLayer />
        <Tour {...tour} openDrawer={() => setDrawer(true)} closeDrawer={() => setDrawer(false)} />
      </div>
    </Ctx.Provider>
  );
}

/* ============================================================ */
function SidebarContent({
  collapsed,
  onToggle,
  pathname,
  ready,
  department,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  pathname: string;
  ready: boolean;
  department?: string | null;
}) {
  const { sections, user, startTour, openKeys, openSearch } = useShell();
  const logout = useLogout();

  const allHrefs = useMemo(() => flatten(sections).map((x) => x.href), [sections]);
  const active = useMemo(() => bestMatch(pathname, allHrefs), [pathname, allHrefs]);
  const activeId = useMemo(() => activeIdOf(sections, active), [sections, active]);
  const ancestors = useMemo(() => ancestorsOfId(sections, activeId), [sections, activeId]);

  // Groups the user opened by hand; groups containing the current page are always open
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // Keep the current page visible in a long sidebar
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const t = setTimeout(() => navRef.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: "nearest" }), 260);
    return () => clearTimeout(t);
  }, [active, ready]);

  const name = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Staff member";
  const role = user?.position?.title || user?.employee?.position?.title || (department ? prettify(String(department)) : "AHNi staff");
  const initials = (user?.first_name?.[0] || "") + (user?.last_name?.[0] || "") || "A";

  return (
    <div className="flex h-full flex-col">
      {/* Brand / workspace */}
      <div className={cx("flex h-[var(--header-h)] flex-none items-center gap-3", collapsed ? "justify-center px-2" : "px-4")}>
        <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 rounded-[var(--r-control)]" aria-label="AHNi ERP home">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-[6px] border border-[var(--line-strong)] bg-white">
            <Image src="/imgs/logo.png" alt="" width={192} height={76} className="h-auto w-6" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold">AHNi ERP</span>
              <span className="block truncate text-[12px] text-[var(--muted)]">{department ? `${prettify(String(department))} · ` : ""}Staff workspace</span>
            </span>
          )}
        </Link>
      </div>

      {/* Search inside the phone drawer (on desktop it sits in the top bar) */}
      {!onToggle && (
        <div className="flex-none px-3 pb-1">
          <button
            type="button"
            onClick={openSearch}
            data-tour="search"
            className="flex h-10 w-full items-center gap-2 rounded-[var(--r-control)] bg-[var(--surface-2)] px-3 text-[14px] text-[var(--muted)]"
            aria-label="Search pages"
          >
            <Search className="h-4 w-4 flex-none" />
            <span className="flex-1 text-left">Search pages…</span>
          </button>
        </div>
      )}

      {/* Nav */}
      <nav ref={navRef} className={cx("thin-scroll min-h-0 flex-1 overflow-y-auto pb-4", collapsed ? "px-2" : "px-3")} aria-label="Sections">
        {!ready && (
          <div className="space-y-2 pt-4" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-9" />
            ))}
          </div>
        )}
        {ready &&
          sections.map((sec) => (
            <div key={sec.id} data-tour={`nav-${sec.id}`}>
              {collapsed ? <div className="mx-2 my-3 h-px bg-[var(--line-strong)]" /> : <p className="nav-label">{sec.label}</p>}
              <ul className="space-y-0.5">
                {sec.items.map((n) => (
                  <NavRow
                    key={n.id}
                    node={n}
                    depth={0}
                    collapsed={collapsed}
                    active={activeId}
                    ancestors={ancestors}
                    open={open}
                    toggle={toggle}
                    expandSidebar={onToggle}
                  />
                ))}
              </ul>
            </div>
          ))}
      </nav>

      {/* Help pinned to the bottom */}
      <div className={cx("flex-none space-y-0.5 pb-2", collapsed ? "px-2" : "px-3")} data-tour="help">
        <button
          type="button"
          onClick={startTour}
          className={cx("nav-item", collapsed && "justify-center !px-0")}
          aria-label="Take the tour"
          data-tip={collapsed ? "Take the tour" : undefined}
        >
          <NavIcon><Sparkles /></NavIcon>
          {!collapsed && <span className="flex-1">Take the tour</span>}
        </button>
        <button
          type="button"
          onClick={openKeys}
          className={cx("nav-item", collapsed && "justify-center !px-0")}
          aria-label="Keyboard shortcuts"
          data-tip={collapsed ? "Keyboard shortcuts  ?" : undefined}
        >
          <NavIcon><Keyboard /></NavIcon>
          {!collapsed && (
            <>
              <span className="flex-1">Shortcuts</span>
              <kbd>?</kbd>
            </>
          )}
        </button>
      </div>

      {/* User + collapse */}
      <div className={cx("flex flex-none items-center gap-2 border-t border-[var(--line)] py-3", collapsed ? "flex-col px-2" : "px-3")}>
        <Link href="/dashboard/account" className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[var(--r-control)]" data-tip={collapsed ? name : undefined}>
          <Avatar src={user?.profile_picture} initials={initials} size={30} />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[13.5px] font-semibold">{name}</span>
              <span className="block truncate text-[12px] text-[var(--muted)]">{role}</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button type="button" onClick={logout} className="btn btn-ghost btn-icon" aria-label="Log out" title="Log out">
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        )}
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="btn btn-ghost btn-icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-tip={collapsed ? "Expand sidebar  Ctrl B" : undefined}
            title={collapsed ? undefined : "Collapse sidebar (Ctrl B)"}
          >
            {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" /> : <PanelLeftClose className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
    </div>
  );
}

function NavIcon({ children }: { children?: ReactNode }) {
  return (
    <span aria-hidden="true" className="grid h-5 w-5 flex-none place-items-center [&_img]:h-5 [&_img]:w-5 [&_svg]:h-[18px] [&_svg]:w-[18px]">
      {children ?? <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />}
    </span>
  );
}

function NavRow({
  node,
  depth,
  collapsed,
  active,
  ancestors,
  open,
  toggle,
  expandSidebar,
}: {
  node: NavNode;
  depth: number;
  collapsed: boolean;
  active: string | null;
  ancestors: Set<string>;
  open: Set<string>;
  toggle: (id: string) => void;
  expandSidebar?: () => void;
}) {
  const hasKids = !!node.children?.length;
  const isActive = node.id === active && !hasKids;
  const isAncestor = ancestors.has(node.id) || (hasKids && node.id === active);
  const isOpen = open.has(node.id) || isAncestor;

  if (collapsed && depth === 0) {
    // Icon rail: leaf = link; group = expands the sidebar and opens the group
    const common = cx("nav-item justify-center !px-0", (isActive || isAncestor) && "is-ancestor");
    return (
      <li>
        {hasKids || !node.href ? (
          <button
            type="button"
            className={common}
            data-tip={node.label}
            aria-label={node.label}
            onClick={() => {
              if (!open.has(node.id)) toggle(node.id);
              expandSidebar?.();
            }}
          >
            <NavIcon>{node.icon}</NavIcon>
          </button>
        ) : (
          <Link
            href={node.href}
            className={common}
            data-tip={keyFor(node.href) ? `${node.label}  ${keyFor(node.href)}` : node.label}
            aria-label={node.label}
            aria-current={isActive ? "page" : undefined}
          >
            <NavIcon>{node.icon}</NavIcon>
          </Link>
        )}
      </li>
    );
  }

  return (
    <li>
      {hasKids ? (
        <button
          type="button"
          className={cx("nav-item", isAncestor && "is-ancestor")}
          aria-expanded={isOpen}
          onClick={() => toggle(node.id)}
        >
          {depth === 0 && <NavIcon>{node.icon}</NavIcon>}
          <span className="min-w-0 flex-1 truncate">{node.label}</span>
          <ChevronDown className={cx("h-4 w-4 flex-none text-[var(--faint)] transition-transform", isOpen && "rotate-180")} />
        </button>
      ) : node.href ? (
        <Link href={node.href} className="nav-item" aria-current={isActive ? "page" : undefined}>
          {depth === 0 && <NavIcon>{node.icon}</NavIcon>}
          <span className="min-w-0 flex-1 truncate">{node.label}</span>
        </Link>
      ) : null}

      {hasKids && (
        <div className="nav-collapse" data-open={isOpen}>
          <div>
            <ul className="nav-sub my-1 space-y-0.5">
              {/* A group that is also a page gets an explicit "Overview" entry, so the page stays reachable */}
              {node.href && !node.children!.some((c) => c.href === node.href) && (
                <li>
                  <Link href={node.href} className="nav-item" aria-current={node.id === active ? "page" : undefined}>
                    Overview
                  </Link>
                </li>
              )}
              {node.children!.map((c) => (
                <NavRow key={c.id} node={c} depth={depth + 1} collapsed={false} active={active} ancestors={ancestors} open={open} toggle={toggle} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}

function Avatar({ src, initials, size = 36 }: { src?: string | null; initials: string; size?: number }) {
  const [err, setErr] = useState(false);
  return (
    <span
      className="relative grid flex-none place-items-center overflow-hidden rounded-full bg-[var(--ink)] text-[13px] font-bold uppercase text-[var(--surface)]"
      style={{ width: size, height: size }}
    >
      {src && !err ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setErr(true)} />
      ) : (
        initials
      )}
    </span>
  );
}

/* ============================================================ */
/** Readable crumbs from the URL; id-like segments become "Details" */
const isIdSeg = (p: string) => /^[0-9a-f-]{8,}$/i.test(p) || /\d/.test(p) && /^[a-z]{0,4}-?\d+$/i.test(p) || /^\d+$/.test(p);
function crumbsOf(pathname: string) {
  const parts = pathname.split("?")[0].split("/").filter(Boolean);
  const out: { label: string; href: string }[] = [];
  parts.forEach((p, i) => {
    const href = "/" + parts.slice(0, i + 1).join("/");
    out.push({ label: i === 0 ? "Dashboard" : isIdSeg(p) ? "Details" : prettify(p), href });
  });
  return out;
}

/** Serif page title at the top of every page (skipped where the page brings its own h1) */
function PageTitle({ pathname }: { pathname: string }) {
  const crumbs = useMemo(() => crumbsOf(pathname), [pathname]);
  const [hidden, setHidden] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const last = crumbs[crumbs.length - 1];
  const title = last?.label === "Details" && crumbs.length > 2 ? `${crumbs[crumbs.length - 2].label} details` : last?.label;

  useEffect(() => {
    setHidden(true);
    if (pathname === "/dashboard") return;
    let lifted: HTMLElement | null = null;
    // Wait for the page to render, then hide ours if the page has its own main heading
    const check = () => {
      const own = document.querySelector("#app-main h1:not([data-shell-title])");
      setHidden(!!own);
      if (own || !window.matchMedia("(min-width: 768px)").matches) return;
      // One page, one job: the page's action row (right-aligned buttons right under the title)
      // moves up beside the title.
      const title = ref.current;
      const main = document.getElementById("app-main");
      if (!title || !main || lifted) return;
      const tb = title.getBoundingClientRect();
      const row = Array.from(main.querySelectorAll<HTMLElement>(".justify-end")).find((el) => {
        const r = el.getBoundingClientRect();
        const btns = el.querySelectorAll("button, a");
        return (
          r.top >= tb.bottom - 2 &&
          r.top - tb.bottom < 40 &&
          btns.length > 0 &&
          btns.length <= 3 &&
          r.height < 72 &&
          !el.closest("table, [role=dialog], form")
        );
      });
      if (row) {
        lifted = row;
        row.classList.add("ux-title-actions");
        row.style.top = `${title.offsetTop + Math.max(0, (tb.height - row.getBoundingClientRect().height) / 2)}px`;
        title.style.paddingRight = `${row.getBoundingClientRect().width + 24}px`;
      }
    };
    const t1 = setTimeout(check, 60);
    const t2 = setTimeout(check, 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      lifted?.classList.remove("ux-title-actions");
      if (lifted) lifted.style.top = "";
      if (ref.current) ref.current.style.paddingRight = "";
    };
  }, [pathname]);

  if (pathname === "/dashboard" || !title) return null;
  return (
    <div ref={ref} className={cx("mb-6 md:mb-8", hidden && "hidden")}>
      <h1 data-shell-title className="page-title">
        {title}
      </h1>
    </div>
  );
}

function AppHeader({ pathname, onMenu }: { pathname: string; onMenu: () => void }) {
  const { quickActions, user, startTour, openSearch, openKeys } = useShell();
  const { theme, setTheme } = useTheme() as { theme?: string; setTheme: (t: any) => void };
  const logout = useLogout();

  const crumbs = useMemo(() => crumbsOf(pathname), [pathname]);

  const isDark =
    theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--app-bg)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto grid h-[var(--header-h)] max-w-[1440px] grid-cols-[1fr_auto] items-center gap-3 px-4 md:grid-cols-[1fr_minmax(260px,420px)_1fr] md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onMenu} className="btn btn-outline btn-icon md:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-1 text-[13px] text-[var(--muted)]">
              {crumbs.map((c, i) => {
                const last = i === crumbs.length - 1;
                return (
                  <li key={c.href} className={cx("flex min-w-0 items-center gap-1", !last && "hidden md:flex")}>
                    {last ? (
                      <span aria-current="page" className="truncate font-medium text-[var(--ink)]">{c.label}</span>
                    ) : (
                      <>
                        <Link href={c.href} className="truncate hover:text-[var(--ink)]">{c.label}</Link>
                        <ChevronRight className="h-3 w-3 flex-none" />
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
          {DEMO_MODE && (
            <span className="hidden flex-none rounded-[4px] bg-[var(--butter-soft)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--butter-ink)] lg:inline" title="Sample data – not connected to AHNi's servers">
              Preview data
            </span>
          )}
        </div>

        {/* Centred search (Ctrl K) */}
        <button
          type="button"
          onClick={openSearch}
          data-tour="search"
          className="hidden h-9 w-full items-center gap-2 rounded-[var(--r-control)] bg-[var(--surface-2)] px-3 text-[14px] text-[var(--muted)] transition-colors hover:bg-[var(--line-strong)] md:flex"
          aria-label="Search (Ctrl K)"
        >
          <Search className="h-4 w-4 flex-none" />
          <span className="flex-1 truncate text-left">Search pages and actions</span>
          <kbd>Ctrl K</kbd>
        </button>

        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={openSearch} className="btn btn-ghost btn-icon md:hidden" aria-label="Search">
            <Search className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="btn btn-ghost btn-icon hidden sm:inline-flex"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            data-tip={isDark ? "Light mode" : "Dark mode"}
            data-tip-below
          >
            {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          <div data-tour="notifications" className="grid h-9 w-9 place-items-center rounded-[var(--r-control)] hover:bg-[var(--hover)] [&_button]:h-9 [&_button]:w-9">
            <NotificationDropdown />
          </div>

          {quickActions.length > 0 && (
            <Menu_ label="New request" icon={<Plus className="h-4 w-4" />} tour="new" className="btn btn-brand ml-1 hidden sm:inline-flex">
              {quickActions.map((q) => (
                <MenuLink key={q.href} href={q.href}>{q.label}</MenuLink>
              ))}
            </Menu_>
          )}

          <Menu_
            label={<UserButtonLabel user={user} />}
            className="ml-1 flex items-center rounded-full"
            ariaLabel="Account menu"
            align="right"
          >
            <div className="border-b border-[var(--line)] px-3 pb-3 pt-2">
              <p className="truncate text-[14px] font-semibold">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Your account"}</p>
              <p className="truncate text-[12px] text-[var(--muted)]">{user?.email}</p>
            </div>
            <MenuLink href="/dashboard/account" icon={<User className="h-4 w-4" />} kbdKey="S">Profile & settings</MenuLink>
            <MenuButton onClick={() => setTheme(isDark ? "light" : "dark")} icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}>
              {isDark ? "Light mode" : "Dark mode"}
            </MenuButton>
            <DensityToggle />
            <MenuButton onClick={openKeys} icon={<Keyboard className="h-4 w-4" />} kbdKey="?">Keyboard shortcuts</MenuButton>
            <MenuButton onClick={startTour} icon={<HelpCircle className="h-4 w-4" />}>Take the tour</MenuButton>
            <div className="my-1 h-px bg-[var(--line)]" />
            <MenuButton onClick={logout} icon={<LogOut className="h-4 w-4" />} danger>Log out</MenuButton>
          </Menu_>
        </div>
      </div>
    </header>
  );
}

/** Compact tables (36px rows) for people who live in lists all day; remembered on this device */
function DensityToggle() {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const v = read("ahni-density") === "compact";
    setCompact(v);
    document.documentElement.dataset.density = v ? "compact" : "comfortable";
  }, []);
  return (
    <MenuButton
      keepOpen
      onClick={() => {
        const v = !compact;
        setCompact(v);
        write("ahni-density", v ? "compact" : "comfortable");
        document.documentElement.dataset.density = v ? "compact" : "comfortable";
      }}
      icon={<span className="grid h-4 w-4 place-items-center"><span className={cx("block w-3 rounded-sm border-y border-current", compact ? "h-2" : "h-3")} /></span>}
      aria-checked={compact}
      role="menuitemcheckbox"
    >
      <span className="flex-1">Compact tables</span>
      <span className={cx("relative h-5 w-9 rounded-full transition-colors", compact ? "bg-[var(--brand)]" : "bg-[var(--line-strong)]")} aria-hidden="true">
        <span className={cx("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left]", compact ? "left-[18px]" : "left-0.5")} />
      </span>
    </MenuButton>
  );
}

/**
 * One tooltip for the whole shell: any element with data-tip="Label  K" shows a dark pill
 * after 80ms (label, then a key chip if given after two spaces). Fixed-positioned so it's never clipped.
 */
function TooltipLayer() {
  const [tip, setTip] = useState<{ text: string; key?: string; x: number; y: number; below: boolean } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const show = (e: Event) => {
      const el = (e.target as HTMLElement)?.closest?.<HTMLElement>("[data-tip]");
      clearTimeout(timer);
      if (!el || !el.dataset.tip) return setTip(null);
      timer = setTimeout(() => {
        const r = el.getBoundingClientRect();
        const [text, key] = el.dataset.tip!.split(/\s{2,}/);
        const below = el.hasAttribute("data-tip-below");
        setTip(below ? { text, key, x: r.left + r.width / 2, y: r.bottom + 8, below } : { text, key, x: r.right + 10, y: r.top + r.height / 2, below });
      }, 80);
    };
    const hide = () => {
      clearTimeout(timer);
      setTip(null);
    };
    document.addEventListener("mouseover", show);
    document.addEventListener("focusin", show);
    document.addEventListener("mousedown", hide);
    window.addEventListener("scroll", hide, true);
    return () => {
      document.removeEventListener("mouseover", show);
      document.removeEventListener("focusin", show);
      document.removeEventListener("mousedown", hide);
      window.removeEventListener("scroll", hide, true);
    };
  }, []);
  if (!tip) return null;
  return (
    <div
      className="ahni-tip"
      role="tooltip"
      style={tip.below ? { left: tip.x, top: tip.y, translate: "-50% 0" } : { left: tip.x, top: tip.y, translate: "0 -50%" }}
    >
      {tip.text}
      {tip.key && <kbd>{tip.key}</kbd>}
    </div>
  );
}

/** "?" sheet listing every shortcut */
function ShortcutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const rows: [string, string][] = [
    ["Search pages and actions", "Ctrl K"],
    ["Collapse or expand the sidebar", "Ctrl B"],
    ...SHORTCUTS.map((x) => [`Go to ${x.label}`, x.key.toUpperCase()] as [string, string]),
    ["Show this list", "?"],
    ["Close the top layer", "Esc"],
  ];
  return (
    <div className="fixed inset-0 z-[1100] grid place-items-center bg-[var(--overlay)] px-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="keys-title"
        className="ux-pop w-full max-w-[440px] rounded-[var(--r-dialog)] bg-[var(--surface)] p-6 shadow-[var(--shadow-dialog)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="keys-title" className="text-[18px] font-semibold">Keyboard shortcuts</h2>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon -mr-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <ul className="divide-y divide-[var(--line)]">
          {rows.map(([label, key]) => (
            <li key={label} className="flex items-center justify-between py-2.5 text-[14px]">
              <span className="text-[var(--ink-2)]">{label}</span>
              <span className="flex gap-1">
                {key.split(" ").map((k) => (
                  <kbd key={k}>{k}</kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[12.5px] text-[var(--muted)]">Single-letter keys work whenever you're not typing in a field.</p>
      </div>
    </div>
  );
}

function UserButtonLabel({ user }: { user: any }) {
  const initials = (user?.first_name?.[0] || "") + (user?.last_name?.[0] || "") || "A";
  return <Avatar src={user?.profile_picture} initials={initials} size={38} />;
}

/* Small accessible dropdown (button + menu, Esc / outside click to close, arrow keys) */
const MenuCloseCtx = createContext<() => void>(() => {});
function Menu_({
  label,
  icon,
  children,
  className,
  ariaLabel,
  tour,
  align = "right",
}: {
  label: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  tour?: string;
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const items = Array.from(ref.current?.querySelectorAll<HTMLElement>("[role^=menuitem]") ?? []);
        const i = items.indexOf(document.activeElement as HTMLElement);
        const n = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
        items[n]?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>("[role^=menuitem]")?.focus(), 10);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative" data-tour={tour}>
      <button type="button" className={className} aria-haspopup="menu" aria-expanded={open} aria-label={ariaLabel} onClick={() => setOpen((v) => !v)}>
        {icon}
        {label}
        {icon && <ChevronDown className="h-4 w-4 opacity-70" />}
      </button>
      {open && (
        <MenuCloseCtx.Provider value={close}>
          <div
            role="menu"
            className={cx(
              "ux-pop absolute top-[calc(100%+8px)] z-50 w-[256px] rounded-[8px] border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-menu)]",
              align === "right" ? "right-0" : "left-0"
            )}
          >
            {children}
          </div>
        </MenuCloseCtx.Provider>
      )}
    </div>
  );
}
function MenuLink({ href, children, icon, kbdKey }: { href: string; children: ReactNode; icon?: ReactNode; kbdKey?: string }) {
  const close = useContext(MenuCloseCtx);
  return (
    <Link href={href} role="menuitem" onClick={close} className="flex items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-[14px] hover:bg-[var(--hover)] focus:bg-[var(--hover)] focus:outline-none">
      {icon}
      <span className="flex-1">{children}</span>
      {kbdKey && <kbd>{kbdKey}</kbd>}
    </Link>
  );
}
function MenuButton({
  onClick,
  children,
  icon,
  danger,
  kbdKey,
  keepOpen,
  role = "menuitem",
  ...aria
}: {
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  danger?: boolean;
  kbdKey?: string;
  keepOpen?: boolean;
  role?: string;
  "aria-checked"?: boolean;
}) {
  const close = useContext(MenuCloseCtx);
  return (
    <button
      type="button"
      role={role}
      {...aria}
      onClick={() => {
        if (!keepOpen) close();
        onClick();
      }}
      className={cx(
        "flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-[14px] hover:bg-[var(--hover)] focus:bg-[var(--hover)] focus:outline-none",
        danger && "text-[var(--danger)]"
      )}
    >
      {icon}
      {kbdKey ? <span className="flex-1">{children}</span> : children}
      {kbdKey && <kbd>{kbdKey}</kbd>}
    </button>
  );
}

/* ============================================================ */
function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sections, quickActions } = useShell();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const pages = useMemo(() => flatten(sections), [sections]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [...quickActions.map((a) => ({ label: a.label, href: a.href, trail: ["Quick action"] })), ...pages.slice(0, 6)];
    return pages
      .map((p) => {
        const hay = (p.label + " " + p.trail.join(" ")).toLowerCase();
        const score = p.label.toLowerCase().startsWith(t) ? 3 : p.label.toLowerCase().includes(t) ? 2 : hay.includes(t) ? 1 : 0;
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((x) => x.p);
  }, [q, pages, quickActions]);

  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);
  useEffect(() => setI(0), [q]);

  if (!open) return null;
  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-start justify-center bg-[var(--overlay)] px-4 pt-[12vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search pages"
        className="ux-pop flex max-h-[525px] w-full max-w-[760px] flex-col overflow-hidden rounded-[var(--r-sheet)] bg-[var(--surface)] shadow-[var(--shadow-dialog)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Search className="h-5 w-5 text-[var(--muted)]" />
          <input
            ref={inputRef}
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setI((x) => Math.min(results.length - 1, x + 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setI((x) => Math.max(0, x - 1));
              }
              if (e.key === "Enter" && results[i]) go(results[i].href);
            }}
            placeholder="Search pages, e.g. leave, payment, vendor…"
            aria-label="Search pages"
            aria-controls="search-results"
            aria-activedescendant={results[i] ? `sr-${i}` : undefined}
            className="h-14 w-full bg-transparent text-[16px] outline-none placeholder:text-[var(--faint)]"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)]">
              Clear
            </button>
          )}
        </div>
        <ul id="search-results" role="listbox" className="thin-scroll min-h-0 flex-1 overflow-y-auto p-2">
          {!q && <li className="px-3 pb-1 pt-2 text-[12px] font-medium text-[var(--faint)]">Suggested</li>}
          {results.map((r, k) => (
            <li key={r.href + r.label} id={`sr-${k}`} role="option" aria-selected={k === i}>
              <button
                type="button"
                onMouseEnter={() => setI(k)}
                onClick={() => go(r.href)}
                className={cx("flex w-full items-center justify-between gap-4 rounded-[6px] px-3 py-2.5 text-left", k === i && "bg-[var(--surface-2)]")}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium">{r.label}</span>
                  <span className="block truncate text-[12px] text-[var(--muted)]">{r.trail.join(" › ")}</span>
                </span>
                <span className={cx("flex-none text-[12px] text-[var(--muted)]", k === i ? "opacity-100" : "opacity-0")} aria-hidden="true">→</span>
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-10 text-center">
              <p className="text-[14px] font-semibold">No results found</p>
              <p className="mt-1 text-[13px] text-[var(--muted)]">Try another keyword, like “leave” or “vendor”.</p>
            </li>
          )}
        </ul>
        <div className="hidden flex-none items-center gap-4 border-t border-[var(--line)] px-4 py-2.5 text-[12px] text-[var(--muted)] sm:flex">
          <span className="flex items-center gap-1.5">Navigate <kbd>↑</kbd><kbd>↓</kbd></span>
          <span className="flex items-center gap-1.5">Open <kbd>Enter</kbd></span>
          <span className="flex items-center gap-1.5">Close <kbd>Esc</kbd></span>
        </div>
      </div>
    </div>
  );
}
