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
import AttentionTable, { AttentionItem, waitingFor } from "./home/AttentionTable";
import ActivityFeed from "./home/ActivityFeed";
import StatStrip, { Stat } from "./home/StatStrip";
import QuickStart from "./home/QuickStart";
import { moduleLabel, moduleRoute } from "@/features/notifications/moduleRoutes";
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

  const stats_ = useMemo(() => {
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

  const stats: Stat[] = [];
  if (canAccessProgramsFeatures || canAccessFinanceFeatures)
    stats.push(
      { label: "Projects", value: String(projects.length), note: byStatus.length ? byStatus.slice(0, 2).map(([st, n]) => `${n} ${st.toLowerCase()}`).join(", ") : `${stats_.active} active`, href: "/dashboard/projects", loading: projectsQ.isLoading },
      { label: "Project budget", value: money(stats_.budget), note: `Across ${projects.length} projects`, href: "/dashboard/projects", loading: projectsQ.isLoading }
    );
  if (canAccessProgramsFeatures)
    stats.push({ label: "Fund requests open", value: String(stats_.pendingFunds.length), note: `${money(stats_.pendingAmount)} requested`, href: "/dashboard/programs/fund-request", loading: fundQ.isLoading });
  if (canAccessHRFeatures)
    stats.push({ label: "Workforce", value: String(workforceTotal), note: "Staff records", href: "/dashboard/hr/workforce-database", loading: workforceQ.isLoading });
  stats.push({ label: "Unread updates", value: String(unread), note: unread ? "Approvals and changes" : "All caught up", href: "/dashboard/notifications", loading: unreadQ.isLoading });
  const shownStats = stats.slice(0, 4);

  const queue: AttentionItem[] = [
    ...stats_.pendingFunds.map((f) => ({
      id: `f-${f.id}`,
      ref: f.uuid_code || undefined,
      title: f.project?.name || f.project_name || "Fund request",
      type: "Fund request",
      amount: Number(f.amount ?? f.total_amount) || 0,
      currency: f.currency || "NGN",
      date: f.created_datetime || f.created_at,
      status: f.status,
      href: f.project?.id ? `/dashboard/programs/fund-request/${f.project.id}` : "/dashboard/programs/fund-request",
    })),
    ...notifications
      .filter((n) => (!n.is_read || n.status === "Pending") && /approv|await|review|sign/i.test(`${n.title} ${n.message}`))
      .map((n) => ({
        id: `n-${n.id}`,
        ref: n.message || undefined,
        title: n.title,
        type: moduleLabel(n.module_type),
        date: n.created_datetime,
        status: "Awaiting you",
        urgent: n.priority === "urgent" || n.priority === "high",
        href: n.action_url || moduleRoute(n.module_type),
      })),
  ];
  const queueTotal = queue.reduce((t, q) => t + (q.amount ?? 0), 0);

  // Say what matters first: how many things need you, and how long the oldest has waited
  const oldest = queue.reduce<string | undefined>((o, q) => (q.date && (!o || q.date < o) ? q.date : o), undefined);
  const urgentCount = queue.filter((q) => q.urgent).length;
  const summary = queue.length
    ? `${queue.length} ${queue.length === 1 ? "item needs" : "items need"} your attention${queueTotal ? `, ${money(queueTotal)} in total` : ""}.`
    : "You're all caught up.";
  const subline = queue.length
    ? [urgentCount ? `${urgentCount} marked urgent` : null, oldest ? `the oldest has waited ${waitingFor(oldest)}` : null].filter(Boolean).join(", ")
    : "New approvals and updates will appear here as they arrive.";

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100dvh-var(--topbar-h)-80px)] lg:min-h-[600px]">
      {/* 1. What needs you – one sentence, then the quickest way to start something */}
      <header className="flex flex-none flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 xl:flex-1">
          <p className="text-[13px] text-[var(--muted)]">
            {greet}, {first} <span aria-hidden="true">–</span> {today}
          </p>
          <h1 className="mt-1.5 text-[26px] font-medium leading-[34px] tracking-[-0.015em]">{summary}</h1>
          <p className="mt-0.5 text-[14px] text-[var(--muted)]">{subline.charAt(0).toUpperCase() + subline.slice(1)}{queue.length ? "." : ""}</p>
        </div>
        <QuickStart actions={quickActions} icons={QUICK_ICONS} />
      </header>

      {/* 2. Key figures */}
      <div className="flex-none">
        <StatStrip stats={shownStats} />
      </div>

      {/* 3. The work: queue on the left, what changed + trend on the right. Fills the rest of the screen. */}
      <div className="grid gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-10">
        <AttentionTable items={queue} loading={(notifQ.isLoading && fundQ.isLoading) || !client} className="lg:min-h-0" />
        <div className="flex min-h-0 flex-col gap-6">
          <ActivityFeed items={notifications} loading={notifQ.isLoading} className="lg:min-h-0 lg:flex-1" />
          {canAccessProgramsFeatures && (
            <section aria-labelledby="trend-title" className="flex-none">
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="trend-title" className="text-[14px] font-medium">Fund requests</h2>
                <span className="text-[12.5px] text-[var(--muted)]">{series.useCount ? "Submitted" : "Value"}, last 6 months</span>
              </div>
              <div
                className="mt-3 flex h-[96px] items-end gap-2"
                role="img"
                aria-label={`Fund requests per month: ${series.months.map((m) => `${m.label} ${series.useCount ? m.count : money(m.value)}`).join(", ")}`}
              >
                {series.months.map((m, k) => {
                  const v = series.useCount ? m.count : m.value;
                  const h = Math.max(3, (v / series.max) * 58);
                  const current = k === series.months.length - 1;
                  return (
                    <div key={m.key} className="group flex flex-1 flex-col items-center justify-end gap-1.5" title={`${m.label}: ${series.useCount ? v : money(v)}`}>
                      <span className={cx("text-[11px] tabular-nums", current ? "text-[var(--ink)]" : "text-transparent group-hover:text-[var(--muted)]")}>
                        {v ? (series.useCount ? v : money(v)) : ""}
                      </span>
                      <span className="w-full max-w-[34px] rounded-t-[3px]" style={{ height: h, background: current ? "var(--ink)" : "var(--line-strong)" }} />
                      <span className="text-[11px] text-[var(--muted)]">{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      {!canAccessProgramsFeatures && !canAccessFinanceFeatures && !canAccessHRFeatures && (
        <p className="flex flex-none items-start gap-3 text-[14px] text-[var(--muted)]">
          <BriefcaseBusiness className="mt-0.5 h-5 w-5 flex-none" />
          Department figures appear here once your profile is linked to a department. Contact HR if something looks missing.
        </p>
      )}
    </div>
  );
}
