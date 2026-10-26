"use client";

import "@fontsource-variable/plus-jakarta-sans";
import "./app.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
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
import { ancestorsOf, bestMatch, flatten, NavNode, NavSection, prettify } from "./nav";
import { useLogout } from "./useLogout";
import { useNavSections } from "./useNavSections";
import { Tour, useTourControls } from "./Tour";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type ShellCtx = {
  sections: NavSection[];
  quickActions: { label: string; href: string }[];
  user: any;
  startTour: () => void;
  openSearch: () => void;
};
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

  // ⌘K / Ctrl+K opens search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      write("ahni-sidebar-collapsed", v ? "0" : "1");
      return !v;
    });
  };

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
            "fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--line)] bg-[var(--surface)] transition-[width] duration-200 md:block",
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

        <div className={cx("transition-[padding] duration-200", collapsed ? "md:pl-[var(--sidebar-w-collapsed)]" : "md:pl-[var(--sidebar-w)]")}>
          <AppHeader pathname={pathname} onMenu={() => setDrawer(true)} />
          <main id="app-main" className="mx-auto w-full max-w-[1440px] px-4 pb-16 pt-6 md:px-8 md:pt-8">
            {children}
          </main>
        </div>

        <SearchPalette open={search} onClose={() => setSearch(false)} />
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
  const { sections, user, startTour, openSearch } = useShell();
  const logout = useLogout();

  const allHrefs = useMemo(() => flatten(sections).map((x) => x.href), [sections]);
  const active = useMemo(() => bestMatch(pathname, allHrefs), [pathname, allHrefs]);
  const ancestors = useMemo(() => ancestorsOf(sections, active), [sections, active]);

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
      <div className={cx("flex h-[var(--header-h)] flex-none items-center gap-3 border-b border-[var(--line)]", collapsed ? "justify-center px-2" : "px-4")}>
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3" aria-label="AHNi ERP home">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[var(--line)] bg-white">
            <Image src="/imgs/logo.png" alt="" width={192} height={76} className="h-auto w-8" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold tracking-[-0.01em]">AHNi ERP</span>
              <span className="block truncate text-[12px] text-[var(--muted)]">{department ? `${prettify(String(department))} · ` : ""}Staff workspace</span>
            </span>
          )}
        </Link>
      </div>

      {/* Search */}
      <div className={cx("flex-none pt-3", collapsed ? "px-3" : "px-3")}>
        <button
          type="button"
          onClick={openSearch}
          data-tour="search"
          className={cx(
            "flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[14px] text-[var(--muted)] transition-colors hover:border-[var(--line-strong)]",
            collapsed ? "justify-center" : "px-3"
          )}
          aria-label="Search pages (Ctrl K)"
          title={collapsed ? "Search (Ctrl K)" : undefined}
        >
          <Search className="h-4 w-4 flex-none" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search pages…</span>
              <kbd className="rounded-md border border-[var(--line-strong)] bg-[var(--surface)] px-1.5 text-[11px] font-semibold">Ctrl K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Nav */}
      <nav ref={navRef} className="thin-scroll min-h-0 flex-1 overflow-y-auto px-3 pb-4" aria-label="Sections">
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
              {collapsed ? <div className="mx-3 my-3 h-px bg-[var(--line)]" /> : <p className="nav-label">{sec.label}</p>}
              <ul className="space-y-0.5">
                {sec.items.map((n) => (
                  <NavRow
                    key={n.id}
                    node={n}
                    depth={0}
                    collapsed={collapsed}
                    active={active}
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

      {/* Help card */}
      {!collapsed && (
        <div className="flex-none px-3 pb-3">
          <div className="rounded-2xl bg-[var(--surface-2)] p-4" data-tour="help">
            <p className="flex items-center gap-2 text-[14px] font-bold">
              <Sparkles className="h-4 w-4 text-[var(--brand)]" /> New to the ERP?
            </p>
            <p className="mt-1 text-[13px] leading-snug text-[var(--muted)]">Take a one-minute guided tour of your workspace.</p>
            <button type="button" onClick={startTour} className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-[var(--brand-ink)] hover:underline">
              Start the tour <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* User + collapse */}
      <div className={cx("flex flex-none items-center gap-3 border-t border-[var(--line)] py-3", collapsed ? "flex-col px-2" : "px-4")}>
        <Link href="/dashboard/account" className="flex min-w-0 flex-1 items-center gap-3" title={collapsed ? name : undefined}>
          <Avatar src={user?.profile_picture} initials={initials} />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-bold">{name}</span>
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
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
  const isActive = !!node.href && node.href === active && !ancestors.has(node.id);
  const isAncestor = ancestors.has(node.id);
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
            title={node.label}
            aria-label={node.label}
            onClick={() => {
              if (!open.has(node.id)) toggle(node.id);
              expandSidebar?.();
            }}
          >
            <NavIcon>{node.icon}</NavIcon>
          </button>
        ) : (
          <Link href={node.href} className={common} title={node.label} aria-label={node.label} aria-current={isActive ? "page" : undefined}>
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
        <div className="collapse" data-open={isOpen}>
          <div>
            <ul className="nav-sub my-1 space-y-0.5">
              {/* A group that is also a page gets an explicit "Overview" entry, so the page stays reachable */}
              {node.href && !node.children!.some((c) => c.href === node.href) && (
                <li>
                  <Link href={node.href} className="nav-item" aria-current={node.href === active ? "page" : undefined}>
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
function AppHeader({ pathname, onMenu }: { pathname: string; onMenu: () => void }) {
  const { quickActions, user, startTour, openSearch } = useShell();
  const { theme, setTheme } = useTheme() as { theme?: string; setTheme: (t: any) => void };
  const logout = useLogout();
  const router = useRouter();

  const crumbs = useMemo(() => {
    const parts = pathname.split("?")[0].split("/").filter(Boolean);
    const out: { label: string; href: string }[] = [];
    parts.forEach((p, i) => {
      const href = "/" + parts.slice(0, i + 1).join("/");
      out.push({ label: i === 0 ? "Dashboard" : prettify(p), href });
    });
    return out;
  }, [pathname]);
  const title = crumbs.length > 1 ? crumbs[crumbs.length - 1].label : "Dashboard";

  const isDark =
    theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--app-bg)_85%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-[var(--header-h)] max-w-[1440px] items-center gap-3 px-4 md:px-8">
        <button type="button" onClick={onMenu} className="btn btn-outline btn-icon md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          {crumbs.length > 1 && (
            <nav aria-label="Breadcrumb" className="hidden md:block">
              <ol className="flex items-center gap-1 truncate text-[12px] text-[var(--muted)]">
                {crumbs.slice(0, -1).map((c) => (
                  <li key={c.href} className="flex items-center gap-1">
                    <Link href={c.href} className="hover:text-[var(--ink)] hover:underline">{c.label}</Link>
                    <ChevronRight className="h-3 w-3" />
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <p className="truncate text-[16px] font-bold tracking-[-0.015em] md:text-[18px]">{title}</p>
        </div>

        <button type="button" onClick={openSearch} className="btn btn-outline btn-icon md:hidden" aria-label="Search pages">
          <Search className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="btn btn-outline btn-icon hidden sm:inline-flex"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Light mode" : "Dark mode"}
        >
          {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        </button>

        <div data-tour="notifications" className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] [&_button]:h-10 [&_button]:w-10">
          <NotificationDropdown />
        </div>

        {quickActions.length > 0 && (
          <Menu_ label="New request" icon={<Plus className="h-4 w-4" />} tour="new" className="btn btn-primary hidden sm:inline-flex">
            {quickActions.map((q) => (
              <MenuLink key={q.href} href={q.href}>{q.label}</MenuLink>
            ))}
          </Menu_>
        )}

        <Menu_
          label={<UserButtonLabel user={user} />}
          className="flex items-center rounded-full"
          ariaLabel="Account menu"
          align="right"
        >
          <div className="border-b border-[var(--line)] px-3 pb-3 pt-2">
            <p className="truncate text-[14px] font-bold">{[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Your account"}</p>
            <p className="truncate text-[12px] text-[var(--muted)]">{user?.email}</p>
          </div>
          <MenuLink href="/dashboard/account" icon={<User className="h-4 w-4" />}>Profile & settings</MenuLink>
          <MenuButton onClick={startTour} icon={<HelpCircle className="h-4 w-4" />}>Take the tour</MenuButton>
          <MenuButton onClick={() => setTheme(isDark ? "light" : "dark")} icon={isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}>
            {isDark ? "Light mode" : "Dark mode"}
          </MenuButton>
          <div className="my-1 h-px bg-[var(--line)]" />
          <MenuButton onClick={logout} icon={<LogOut className="h-4 w-4" />} danger>Log out</MenuButton>
        </Menu_>
      </div>
    </header>
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
        const items = Array.from(ref.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);
        const i = items.indexOf(document.activeElement as HTMLElement);
        const n = e.key === "ArrowDown" ? (i + 1) % items.length : (i - 1 + items.length) % items.length;
        items[n]?.focus();
        e.preventDefault();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus(), 10);
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
              "absolute top-[calc(100%+8px)] z-50 w-[248px] rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-2)]",
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
function MenuLink({ href, children, icon }: { href: string; children: ReactNode; icon?: ReactNode }) {
  const close = useContext(MenuCloseCtx);
  return (
    <Link href={href} role="menuitem" onClick={close} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-medium hover:bg-[var(--surface-2)] focus:bg-[var(--surface-2)] focus:outline-none">
      {icon}
      {children}
    </Link>
  );
}
function MenuButton({ onClick, children, icon, danger }: { onClick: () => void; children: ReactNode; icon?: ReactNode; danger?: boolean }) {
  const close = useContext(MenuCloseCtx);
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        close();
        onClick();
      }}
      className={cx(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium hover:bg-[var(--surface-2)] focus:bg-[var(--surface-2)] focus:outline-none",
        danger && "text-[var(--danger)]"
      )}
    >
      {icon}
      {children}
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
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/45 px-4 pt-[12vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search pages"
        className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-2)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Search className="h-5 w-5 text-[var(--muted)]" />
          <input
            ref={inputRef}
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
          <kbd className="rounded-md border border-[var(--line-strong)] px-1.5 text-[11px] font-semibold text-[var(--muted)]">Esc</kbd>
        </div>
        <ul id="search-results" role="listbox" className="thin-scroll max-h-[50vh] overflow-y-auto p-2">
          {!q && <li className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--faint)]">Suggested</li>}
          {results.map((r, k) => (
            <li key={r.href + r.label} id={`sr-${k}`} role="option" aria-selected={k === i}>
              <button
                type="button"
                onMouseEnter={() => setI(k)}
                onClick={() => go(r.href)}
                className={cx("flex w-full items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-left", k === i && "bg-[var(--surface-2)]")}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold">{r.label}</span>
                  <span className="block truncate text-[12px] text-[var(--muted)]">{r.trail.join(" › ")}</span>
                </span>
                <ChevronRight className="h-4 w-4 flex-none text-[var(--faint)]" />
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-[14px] text-[var(--muted)]">
              No pages match “{q}”. Try a shorter word, like “leave” or “vendor”.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
