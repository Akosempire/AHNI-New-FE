"use client";

/**
 * Recent activity, grouped by day. Each entry says what happened and where;
 * opening one marks it read and takes you to the record.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bell,
  Car,
  FileSignature,
  FileText,
  FolderKanban,
  Fuel,
  Package,
  Plane,
  ShoppingCart,
  UserRound,
  Wrench,
} from "lucide-react";
import { ReactNode, useMemo } from "react";
import { moduleLabel, moduleRoute } from "@/features/notifications/moduleRoutes";
import { useBulkMarkAsRead, useMarkNotificationAsRead } from "@/features/notifications/controllers/notificationController";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

const ICONS: Record<string, ReactNode> = {
  PaymentRequest: <Banknote />,
  FundRequest: <Banknote />,
  ExpenseAuthorization: <FileSignature />,
  VehicleRequest: <Car />,
  FuelRequest: <Fuel />,
  PurchaseOrder: <ShoppingCart />,
  ProcurementPlan: <Package />,
  ContractRequest: <FileText />,
  Agreement: <FileSignature />,
  ConsultancyReport: <FileText />,
  TravelExpenseReport: <Plane />,
  AssetMaintenance: <Wrench />,
  Project: <FolderKanban />,
  User: <UserRound />,
};

type Note = {
  id: string;
  title: string;
  message?: string;
  module_type?: string;
  action_url?: string;
  is_read?: boolean;
  status?: string;
  created_datetime?: string;
};

const dayKey = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
function groupLabel(d: Date) {
  const today = dayKey(new Date());
  const k = dayKey(d);
  const diff = Math.round((today - k) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString("en-GB", { weekday: "long" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}
const timeOf = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", " ");

export default function ActivityFeed({ items, loading, limit = 8 }: { items: Note[]; loading?: boolean; limit?: number }) {
  const router = useRouter();
  const markOne = useMarkNotificationAsRead();
  const markAll = useBulkMarkAsRead();
  const unreadIds = items.filter((n) => !n.is_read || n.status === "Pending").map((n) => n.id);

  const groups = useMemo(() => {
    const out: { label: string; items: (Note & { when: Date })[] }[] = [];
    items.slice(0, limit).forEach((n) => {
      const when = new Date(n.created_datetime || Date.now());
      const label = groupLabel(when);
      const g = out.find((x) => x.label === label);
      g ? g.items.push({ ...n, when }) : out.push({ label, items: [{ ...n, when }] });
    });
    return out;
  }, [items, limit]);

  const open = (n: Note) => {
    if (!n.is_read || n.status === "Pending") markOne.mutate(n.id);
    router.push(n.action_url || moduleRoute(n.module_type));
  };

  return (
    <section aria-labelledby="act-title" className="min-w-0">
      <div className="flex items-end justify-between gap-3 border-b border-[var(--line-strong)] pb-3">
        <h2 id="act-title" className="text-[17px] font-semibold">
          Activity
          {unreadIds.length > 0 && <span className="ml-2 text-[13px] font-medium text-[var(--muted)]">{unreadIds.length} new</span>}
        </h2>
        {unreadIds.length > 0 && (
          <button
            type="button"
            onClick={() => markAll.mutate(unreadIds)}
            disabled={markAll.isPending}
            className="text-[13px] font-medium text-[var(--muted)] hover:text-[var(--ink)] disabled:opacity-50"
          >
            {markAll.isPending ? "Marking…" : "Mark all read"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4 pt-4" aria-hidden="true">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="flex gap-3">
              <div className="skeleton h-8 w-8 flex-none" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3.5 w-3/4" />
                <div className="skeleton h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="py-10 text-[14px] text-[var(--muted)]">
          No activity yet. Updates on your requests and approvals will appear here.
        </p>
      ) : (
        groups.map((g) => (
          <div key={g.label} className="pt-4">
            <h3 className="mb-1 text-[12.5px] font-medium text-[var(--faint)]">{g.label}</h3>
            <ol>
              {g.items.map((n) => {
                const unread = !n.is_read || n.status === "Pending";
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => open(n)}
                      className="group -mx-2 flex w-[calc(100%+16px)] items-start gap-3 rounded-[8px] px-2 py-2.5 text-left transition-colors hover:bg-[var(--hover)]"
                    >
                      <span
                        className={cx(
                          "relative grid h-8 w-8 flex-none place-items-center rounded-[8px] [&_svg]:h-[16px] [&_svg]:w-[16px] [&_svg]:stroke-[1.7]",
                          unread ? "bg-[var(--ink)] text-white dark:text-[var(--app-bg)]" : "bg-[var(--surface-2)] text-[var(--ink-2)]"
                        )}
                        aria-hidden="true"
                      >
                        {ICONS[n.module_type || ""] ?? <Bell />}
                        {unread && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface)] bg-[var(--brand)]" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cx("block text-[14px] leading-snug", unread ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]")}>
                          {unread && <span className="sr-only">New: </span>}
                          {n.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-[var(--muted)]">
                          {n.message ? n.message : moduleLabel(n.module_type)}
                        </span>
                      </span>
                      <time dateTime={n.when.toISOString()} className="flex-none pt-0.5 text-[12px] tabular-nums text-[var(--faint)]">
                        {g.label === "Today" || g.label === "Yesterday" ? timeOf(n.when) : n.when.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </time>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ))
      )}

      <div className="mt-2 border-t border-[var(--line)] pt-3 text-[13px]">
        <Link href="/dashboard/notifications" className="font-medium text-[var(--ink)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-[var(--ink)]">
          See all notifications
        </Link>
      </div>
    </section>
  );
}
