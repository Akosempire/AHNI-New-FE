"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  ShoppingCart,
  Car,
  Plane,
  Users,
  Wallet,
} from "lucide-react";
import { useDepartmentFeatures } from "@/hooks/useDepartmentFeatures";
import { useGetAllProjects } from "@/features/projects/controllers/projectController";
import { useGetWorkforces } from "@/features/hr/controllers/workforceController";
import { useGetAllFundRequests } from "@/features/programs/controllers/fundRequestController";
import { useGetNotifications, useGetUnreadCount } from "@/features/notifications/controllers/notificationController";
import { useShell } from "./AppShell";
import { prettify } from "./nav";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const money = (n: number, currency = "NGN") => {
  const sym = currency === "NGN" ? "₦" : currency === "USD" ? "$" : "";
  const abs = Math.abs(n);
  const short = abs >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : abs >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : abs >= 1e3 ? `${(n / 1e3).toFixed(0)}K` : `${Math.round(n)}`;
  return `${sym}${short}`;
};
const ago = (d?: string) => {
  if (!d) return "";
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const days = Math.floor(s / 86400);
  return days === 1 ? "yesterday" : days < 7 ? `${days} days ago` : new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};
const isPending = (s?: string) => /pend|submit|review|await|progress|draft/i.test(s || "");
const isApproved = (s?: string) => /approv|complete|paid|disburs/i.test(s || "");
const isRejected = (s?: string) => /reject|declin|cancel/i.test(s || "");

function StatusBadge({ status }: { status?: string }) {
  const s = status || "Unknown";
  const tone = isRejected(s) ? "danger" : isApproved(s) ? "success" : isPending(s) ? "warning" : "neutral";
  return <span className={`badge badge-${tone}`}>{s.replace(/_/g, " ")}</span>;
}

const QUICK_ICONS: Record<string, JSX.Element> = {
  "Apply for leave": <CalendarDays className="h-5 w-5" />,
  "Submit timesheet": <ClipboardList className="h-5 w-5" />,
  "Payment request": <Banknote className="h-5 w-5" />,
  "Purchase request": <ShoppingCart className="h-5 w-5" />,
  "Vehicle request": <Car className="h-5 w-5" />,
  "Travel request": <Plane className="h-5 w-5" />,
};

export default function DashboardHome() {
  const { user, quickActions } = useShell();
  const { canAccessProgramsFeatures, canAccessFinanceFeatures, canAccessHRFeatures } = useDepartmentFeatures();
  const [client, setClient] = useState(false);
  useEffect(() => setClient(true), []);

  const projectsQ = useGetAllProjects({ page: 1, size: 100, enabled: client && (canAccessProgramsFeatures || canAccessFinanceFeatures), retry: false, refetchOnWindowFocus: false } as any);
  const workforceQ = useGetWorkforces({ page: 1, size: 50, enabled: client && canAccessHRFeatures, retry: false, refetchOnWindowFocus: false } as any);
  const fundQ = useGetAllFundRequests({ enabled: client && canAccessProgramsFeatures, retry: false, refetchOnWindowFocus: false } as any);
  const notifQ = useGetNotifications({ page: 1, size: 8, enabled: client } as any);
  const unreadQ = useGetUnreadCount(client);

  const projects: any[] = (projectsQ.data as any)?.data?.results ?? [];
  const workforce: any[] = (workforceQ.data as any)?.data?.results ?? [];
  const workforceTotal: number = (workforceQ.data as any)?.data?.pagination?.count ?? (workforceQ.data as any)?.data?.count ?? workforce.length;
  const funds: any[] = (fundQ.data as any)?.data?.results ?? [];
  const notifications: any[] = (notifQ.data as any)?.results ?? [];
  const unread = unreadQ.data?.count ?? 0;

  const stats = useMemo(() => {
    const active = projects.filter((p) => /active|progress|ongoing/i.test(p.status || "")).length;
    const budget = projects.reduce((s, p) => s + (Number(p.budget) || 0), 0);
    const pendingFunds = funds.filter((f) => isPending(f.status));
    const pendingAmount = pendingFunds.reduce((s, f) => s + (Number(f.amount ?? f.total_amount) || 0), 0);
    return { active, budget, pendingFunds, pendingAmount };
  }, [projects, funds]);

  // Six-month bar series of fund-request value (falls back to counts when amounts are missing)
  const series = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, k) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + k, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GB", { month: "short" }), value: 0, count: 0 };
    });
    funds.forEach((f) => {
      const d = new Date(f.created_datetime || f.created_at);
      const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) {
        m.value += Number(f.amount ?? f.total_amount) || 0;
        m.count += 1;
      }
    });
    const useCount = months.every((m) => m.value === 0);
    const max = Math.max(1, ...months.map((m) => (useCount ? m.count : m.value)));
    return { months, useCount, max };
  }, [funds]);

  const byStatus = useMemo(() => {
    const m = new Map<string, number>();
    projects.forEach((p) => m.set(p.status || "Unknown", (m.get(p.status || "Unknown") ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [projects]);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = user?.first_name || "there";
  const role = user?.position?.title || user?.employee?.position?.title;
  const deptRaw = user?.department?.name || user?.employee?.department?.name;
  const dept = deptRaw ? prettify(String(deptRaw)) : undefined;

  type Kpi = { label: string; value: string; sub: string; icon: JSX.Element; tint: string; href: string; loading: boolean };
  const kpis: Kpi[] = [];
  if (canAccessProgramsFeatures || canAccessFinanceFeatures)
    kpis.push(
      { label: "Projects", value: String(projects.length), sub: `${stats.active} active`, icon: <FolderKanban className="h-5 w-5" />, tint: "text-[var(--lilac-ink)] bg-[var(--lilac-soft)]", href: "/dashboard/projects", loading: projectsQ.isLoading },
      { label: "Total project budget", value: money(stats.budget), sub: `Across ${projects.length} projects`, icon: <Wallet className="h-5 w-5" />, tint: "text-[var(--mint-ink)] bg-[var(--mint-soft)]", href: "/dashboard/projects", loading: projectsQ.isLoading }
    );
  if (canAccessProgramsFeatures)
    kpis.push({ label: "Fund requests awaiting action", value: String(stats.pendingFunds.length), sub: `${money(stats.pendingAmount)} pending · ${funds.length} total`, icon: <Banknote className="h-5 w-5" />, tint: "text-[var(--butter-ink)] bg-[rgba(255,231,168,.35)]", href: "/dashboard/programs/fund-request", loading: fundQ.isLoading });
  if (canAccessHRFeatures)
    kpis.push({ label: "Workforce", value: String(workforceTotal), sub: "Staff records", icon: <Users className="h-5 w-5" />, tint: "text-[var(--brand-ink)] bg-[var(--brand-soft)]", href: "/dashboard/hr/workforce-database", loading: workforceQ.isLoading });
  kpis.push({ label: "Unread notifications", value: String(unread), sub: unread ? "Approvals and updates waiting" : "You're all caught up", icon: <Bell className="h-5 w-5" />, tint: "text-[var(--ink)] bg-[var(--surface-2)]", href: "/dashboard/notifications", loading: unreadQ.isLoading });
  const shownKpis = kpis.slice(0, 4);

  const attention = [
    ...stats.pendingFunds.slice(0, 4).map((f) => ({
      key: `f-${f.id}`,
      title: `${f.uuid_code || "Fund request"} · ${f.project?.name || f.project_name || "Project"}`,
      sub: `Submitted ${ago(f.created_datetime || f.created_at)}`,
      amount: money(Number(f.amount ?? f.total_amount) || 0, f.currency || "NGN"),
      status: f.status,
      href: `/dashboard/programs/fund-request`,
    })),
    ...notifications
      .filter((n) => !n.is_read || n.status === "Pending")
      .slice(0, 4)
      .map((n) => ({ key: `n-${n.id}`, title: n.title, sub: n.message, amount: "", status: n.priority === "urgent" || n.priority === "high" ? "Urgent" : "New", href: n.action_url || "/dashboard/notifications" })),
  ].slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">
            {greet}, {first}
          </h1>
          <p className="mt-3 text-[15px] text-[var(--muted)]">
            {[role, dept].filter(Boolean).join(" · ") || "Here's what's happening across your work"} ·{" "}
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Quick start */}
      {quickActions.length > 0 && (
        <section className="app-card overflow-hidden" aria-labelledby="qs-title">
          <div className="flex items-baseline justify-between gap-4 px-5 pb-3 pt-4">
            <h2 id="qs-title" className="text-[15px] font-semibold">Start something</h2>
            <span className="hidden text-[13px] text-[var(--muted)] sm:block">Your most-used requests</span>
          </div>
          <ul className="grid grid-cols-2 gap-1 p-1 pt-0 sm:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((q) => (
              <li key={q.href}>
                <Link href={q.href} className="group flex h-full items-center gap-3 rounded-[8px] bg-[var(--surface)] px-3 py-3 ring-1 ring-transparent transition hover:ring-[var(--line-strong)]">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-[6px] bg-[var(--surface-2)] text-[var(--ink-2)] [&_svg]:h-[17px] [&_svg]:w-[17px] group-hover:text-[var(--ink)]">
                    {QUICK_ICONS[q.label] ?? <ArrowRight className="h-5 w-5" />}
                  </span>
                  <span className="text-[14px] font-medium leading-tight">{q.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* KPIs */}
      <section aria-label="Key figures" data-tour="kpis" className="grid grid-cols-2 gap-1 xl:grid-cols-4">
        {shownKpis.map((k) => (
          <Link key={k.label} href={k.href} className="app-card group flex min-w-0 flex-col p-4 md:p-5">
            <span className="flex items-start justify-between gap-3">
              <span className="text-[13px] font-medium leading-snug text-[var(--ink-2)] md:text-[14px]">{k.label}</span>
              <span className="flex-none text-[var(--muted)] [&_svg]:h-[17px] [&_svg]:w-[17px]" aria-hidden="true">{k.icon}</span>
            </span>
            {k.loading ? (
              <span className="skeleton mt-4 h-8 w-24" aria-label="Loading" />
            ) : (
              <span className="mt-4 truncate text-[24px] font-semibold leading-none tracking-[-0.02em] tabular-nums md:text-[28px]">{k.value}</span>
            )}
            <span className="mt-2 flex items-center justify-between text-[12px] text-[var(--muted)] md:text-[13px]">
              {k.sub}
              <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </Link>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr] [&>*]:min-w-0">
        <div className="space-y-6">
          {/* Needs attention */}
          <section aria-labelledby="att-title" data-tour="attention">
            <div className="app-panel-head mb-2 flex items-center justify-between">
              <h2 id="att-title" className="text-[15px] font-semibold">
                Needs attention <span className="font-medium text-[var(--muted)]">({attention.length})</span>
              </h2>
            </div>
            <div className="app-card divide-y divide-[var(--line)]">
              {notifQ.isLoading && fundQ.isLoading ? (
                <div className="space-y-3 p-5">
                  <div className="skeleton h-5 w-2/3" />
                  <div className="skeleton h-5 w-1/2" />
                </div>
              ) : attention.length ? (
                attention.map((a) => (
                  <Link key={a.key} href={a.href} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[var(--hover)]">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{a.title}</span>
                      <span className="block truncate text-[13px] text-[var(--muted)]">{a.sub}</span>
                    </span>
                    {a.amount && <span className="hidden text-[15px] font-bold sm:block">{a.amount}</span>}
                    <StatusBadge status={a.status} />
                  </Link>
                ))
              ) : (
                <div className="flex items-center gap-3 px-5 py-8 text-[15px] text-[var(--muted)]">
                  <CheckCircle2 className="h-5 w-5 text-[var(--mint-ink)]" /> You&apos;re all caught up – nothing is waiting on you.
                </div>
              )}
            </div>
          </section>

          {/* Fund request trend */}
          {canAccessProgramsFeatures && (
            <section className="app-card" aria-labelledby="trend-title">
              <div className="border-b border-[var(--line)] px-5 py-4">
                <h2 id="trend-title" className="text-[16px] font-bold">Fund requests</h2>
                <p className="text-[13px] text-[var(--muted)]">{series.useCount ? "Requests submitted" : "Value requested"}, last 6 months</p>
              </div>
              <div className="flex h-[220px] items-end gap-3 px-5 pb-4 pt-6 sm:gap-6" role="img" aria-label={`Fund requests per month: ${series.months.map((m) => `${m.label} ${series.useCount ? m.count : money(m.value)}`).join(", ")}`}>
                {series.months.map((m, k) => {
                  const v = series.useCount ? m.count : m.value;
                  const h = Math.max(4, (v / series.max) * 140);
                  const current = k === series.months.length - 1;
                  return (
                    <div key={m.key} className="flex flex-1 flex-col items-center justify-end gap-2">
                      <span className="text-[11px] font-semibold text-[var(--muted)]">{series.useCount ? v : money(v)}</span>
                      <span className="w-full max-w-[48px] rounded-t-xl" style={{ height: h, background: current ? "var(--brand)" : "var(--brand-soft)", border: current ? "none" : "1px solid rgba(242,86,77,.25)" }} />
                      <span className="text-[12px] text-[var(--muted)]">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {/* Recent activity */}
          <section aria-labelledby="act-title">
            <div className="app-panel-head mb-2">
              <h2 id="act-title" className="text-[15px] font-semibold">Recent activity</h2>
            </div>
            <div className="app-card">
              <ol className="space-y-4 p-5">
                {notifQ.isLoading &&
                  [0, 1, 2, 3].map((k) => (
                    <li key={k} className="space-y-2">
                      <div className="skeleton h-4 w-4/5" />
                      <div className="skeleton h-3 w-1/4" />
                    </li>
                  ))}
                {!notifQ.isLoading && notifications.length === 0 && <li className="text-[14px] text-[var(--muted)]">No recent activity yet.</li>}
                {notifications.slice(0, 7).map((n) => (
                  <li key={n.id} className="flex gap-3">
                    <span className={cx("mt-1.5 h-2 w-2 flex-none rounded-full", !n.is_read || n.status === "Pending" ? "bg-[var(--brand)]" : "bg-[var(--line-strong)]")} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-[14px] leading-snug">
                        <b className="font-semibold">{n.title}</b>
                        {n.module_type && <span className="ml-1.5 rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--muted)]">{n.module_type}</span>}
                      </span>
                      <span className="block text-[12px] text-[var(--muted)]">{ago(n.created_datetime)}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <Link href="/dashboard/notifications" className="flex items-center justify-between border-t border-[var(--line)] px-5 py-3.5 text-[14px] font-semibold text-[var(--brand-ink)] hover:bg-[var(--hover)]">
                All notifications <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Projects by status */}
          {byStatus.length > 0 && (
            <section className="app-card p-5" aria-labelledby="ps-title">
              <h2 id="ps-title" className="text-[16px] font-bold">Projects by status</h2>
              <ul className="mt-4 space-y-3">
                {byStatus.map(([s, n]) => (
                  <li key={s}>
                    <div className="flex justify-between text-[13px]">
                      <span className="font-semibold">{s}</span>
                      <span className="text-[var(--muted)]">{n}</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-[var(--surface-2)]">
                      <div className="h-2 rounded-full bg-[var(--ink)]" style={{ width: `${(n / projects.length) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/projects" className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--brand-ink)] hover:underline">
                View projects <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
          )}

          {!canAccessProgramsFeatures && !canAccessFinanceFeatures && !canAccessHRFeatures && (
            <section className="app-card flex items-start gap-3 p-5">
              <BriefcaseBusiness className="mt-0.5 h-5 w-5 text-[var(--muted)]" />
              <p className="text-[14px] text-[var(--muted)]">
                Department figures appear here once your profile is linked to a department. Contact HR if something looks missing.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
