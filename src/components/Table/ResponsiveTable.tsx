"use client";

/**
 * Shared renderer used by every DataTable in the app.
 *
 * UX laws applied here, once, for all ~200 tables:
 *  - Mobile: rows become cards (no sideways scrolling), key fields first, the rest
 *    behind "More details" (Miller's law – chunking).
 *  - Swipe a card left to open it, like mail apps (Jakob's law).
 *  - Large tap targets for actions and pagination (Fitts's law).
 *  - Skeletons shaped like the real content instead of a spinner (Doherty threshold).
 *  - Friendly empty state with an optional single next action (Peak-end rule).
 *  - Overdue / urgent / rejected rows get a coral marker (Von Restorff effect).
 */
import { Cell, flexRender, Row, Table } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Inbox } from "lucide-react";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";

/** Current search text from the surrounding TableFilters, so empty states can say "no results for …" */
export const SearchTermContext = createContext("");
import { cn } from "@/lib/utils";
import {
  Table as ShadTable,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ---------- helpers ---------- */

export function useIsPhone(query = "(max-width: 767px)") {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

const prettify = (id: string) =>
  id
    .replace(/[_.-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());

function labelOf<T>(cell: Cell<T, unknown>) {
  const def = cell.column.columnDef as any;
  if (def.meta?.label) return String(def.meta.label);
  if (typeof def.header === "string") return def.header;
  return prettify(cell.column.id);
}

const isActionCol = (id: string, header: unknown) =>
  /action/i.test(id) || (typeof header === "string" && /^\s*actions?\s*$/i.test(header));
const isSelectCol = (id: string) => id === "select" || id === "selection";

const URGENT = /\b(overdue|urgent|expired|rejected|declined|critical|high priority|past due)\b/i;

/** True when any plain value on the row signals something that needs attention */
export function isUrgentRow(original: unknown): boolean {
  if (!original || typeof original !== "object") return false;
  for (const v of Object.values(original as Record<string, unknown>)) {
    if (typeof v === "string" && v.length < 40 && URGENT.test(v.replace(/_/g, " "))) return true;
  }
  const o = original as Record<string, unknown>;
  return o.is_overdue === true || o.overdue === true || o.is_urgent === true;
}

/* ---------- skeletons & empty ---------- */

export function TableSkeleton({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent" aria-hidden="true">
          {Array.from({ length: Math.max(cols, 1) }).map((__, c) => (
            <TableCell key={c}>
              <div
                className="ux-skel h-3.5 rounded-full"
                style={{ width: `${c === 0 ? 70 : 40 + ((r * 7 + c * 13) % 45)}%` }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ux-card p-4">
          <div className="ux-skel mb-3 h-4 w-2/3 rounded-full" />
          <div className="grid gap-2">
            <div className="ux-skel h-3 w-1/2 rounded-full" />
            <div className="ux-skel h-3 w-3/5 rounded-full" />
            <div className="ux-skel h-3 w-2/5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title = "Nothing here yet",
  message = "When records are added they'll show up here.",
  action,
  icon,
}: {
  title?: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface-2,#f3f2f7)] text-[var(--muted,#6b6b76)]">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </span>
      <p className="text-[15px] font-bold text-[var(--ink,#17171c)]">{title}</p>
      <p className="mt-1 max-w-[320px] text-[13px] leading-relaxed text-[var(--muted,#6b6b76)]">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- mobile card ---------- */

const VISIBLE_FIELDS = 3;

function RowCard<T>({ row, onOpen: onOpenProp }: { row: Row<T>; onOpen?: () => void }) {
  const [more, setMore] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  // No row click handler? Swipe follows the row's single "View"/open link if it has one.
  const [linkOpen, setLinkOpen] = useState(false);
  useEffect(() => {
    if (onOpenProp) return;
    const links = actionsRef.current?.querySelectorAll("a[href]") ?? [];
    setLinkOpen(links.length === 1);
  }, [onOpenProp]);
  const onOpen =
    onOpenProp ?? (linkOpen ? () => (actionsRef.current?.querySelector("a[href]") as HTMLAnchorElement | null)?.click() : undefined);
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number; locked?: "x" | "y" } | null>(null);

  const cells = row.getVisibleCells();
  const actions = cells.filter((c) => isActionCol(c.column.id, c.column.columnDef.header));
  const select = cells.find((c) => isSelectCol(c.column.id));
  const fields = cells.filter((c) => !actions.includes(c) && c !== select);
  // Title = first column that actually has a value (skips S/N and empty columns)
  const hasValue = (c: Cell<T, unknown>) => {
    if (/^(s\/?n|sn|no|#|index|serial)$/i.test(c.column.id)) return false;
    try {
      const v = c.getValue();
      return v !== null && v !== undefined && v !== "" && !(typeof v === "string" && /^n\/?a$/i.test(v));
    } catch {
      return false;
    }
  };
  const titleIdx = Math.max(0, fields.findIndex(hasValue));
  const title = fields[titleIdx];
  const rest = fields.filter((_, i) => i !== titleIdx);
  const shown = rest.slice(0, VISIBLE_FIELDS);
  const hidden = rest.slice(VISIBLE_FIELDS);
  const urgent = isUrgentRow(row.original);

  // Swipe left to open (only when the row can be opened)
  const onTouchStart = (e: React.TouchEvent) => {
    if (!onOpen) return;
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const s = start.current;
    if (!s) return;
    const t = e.touches[0];
    const mx = t.clientX - s.x;
    const my = t.clientY - s.y;
    if (!s.locked) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      s.locked = Math.abs(mx) > Math.abs(my) ? "x" : "y";
    }
    if (s.locked === "x") setDx(Math.max(-110, Math.min(0, mx)));
  };
  const onTouchEnd = () => {
    if (dx < -80 && onOpen) onOpen();
    setDx(0);
    start.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-[16px]">
      {onOpen && (
        <div
          className="absolute inset-y-0 right-0 flex w-[110px] items-center justify-center gap-1 bg-[var(--ink,#17171c)] text-[13px] font-bold text-white"
          aria-hidden="true"
          style={{ opacity: Math.min(1, -dx / 60) }}
        >
          Open <ChevronRight className="h-4 w-4" />
        </div>
      )}
      <article
        className="ux-card relative p-4"
        style={{ transform: dx ? `translateX(${dx}px)` : undefined, transition: dx ? "none" : "transform .25s ease" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-start gap-3">
          {select && <div className="pt-0.5">{flexRender(select.column.columnDef.cell, select.getContext())}</div>}
          <div className="min-w-0 flex-1">
            {title && (
              <button
                type="button"
                onClick={onOpen}
                disabled={!onOpen}
                className="block w-full text-left text-[15px] font-bold leading-snug text-[var(--ink,#17171c)] disabled:cursor-default [&_*]:!text-[15px]"
              >
                <span className="sr-only">{labelOf(title)}: </span>
                {flexRender(title.column.columnDef.cell, title.getContext())}
              </button>
            )}
            {urgent && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--brand-soft,#fff0ee)] px-2 py-0.5 text-[12px] font-semibold text-[var(--brand-ink,#b8302a)]">
                Needs attention
              </span>
            )}
          </div>
          {actions.length > 0 && (
            <div ref={actionsRef} className="ux-actions -mr-1 -mt-1 flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {actions.map((c) => (
                <div key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</div>
              ))}
            </div>
          )}
        </div>

        {shown.length > 0 && (
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
            {shown.map((c) => (
              <Field key={c.id} cell={c} />
            ))}
            {more && hidden.map((c) => <Field key={c.id} cell={c} />)}
          </dl>
        )}

        {hidden.length > 0 && (
          <button
            type="button"
            onClick={() => setMore((v) => !v)}
            aria-expanded={more}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1 text-[13px] font-semibold text-[var(--ink-2,#3a3a44)]"
          >
            {more ? "Fewer details" : `More details (${hidden.length})`}
            <ChevronDown className={cn("h-4 w-4 transition-transform", more && "rotate-180")} aria-hidden="true" />
          </button>
        )}
      </article>
    </div>
  );
}

function Field<T>({ cell }: { cell: Cell<T, unknown> }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--faint,#9a9aa5)]">{labelOf(cell)}</dt>
      <dd className="mt-0.5 break-words text-[13.5px] text-[var(--ink-2,#3a3a44)]">
        {flexRender(cell.column.columnDef.cell, cell.getContext()) ?? "—"}
      </dd>
    </div>
  );
}

/* ---------- main ---------- */

export interface ResponsiveTableProps<T> {
  table: Table<T>;
  columnsCount: number;
  isLoading?: boolean;
  onRowClick?: (row: Row<T>) => void;
  footer?: boolean;
  headClass?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
}

export default function ResponsiveTable<T>({
  table,
  columnsCount,
  isLoading,
  onRowClick,
  footer,
  headClass,
  emptyTitle,
  emptyMessage,
  emptyAction,
}: ResponsiveTableProps<T>) {
  const phone = useIsPhone();
  const term = useContext(SearchTermContext).trim();
  let rows: Row<T>[] = [];
  let failed = false;
  try {
    rows = table.getRowModel()?.rows ?? [];
  } catch (e) {
    console.error("DataTable render error:", e);
    failed = true;
  }

  const empty = (
    <EmptyState
      title={failed ? "We couldn't show this list" : term ? `No results for “${term}”` : emptyTitle}
      message={
        failed
          ? "Please refresh the page. If it keeps happening, contact support."
          : term
          ? "Check the spelling or try a shorter search."
          : emptyMessage
      }
      action={failed || term ? undefined : emptyAction}
    />
  );

  if (phone) {
    if (isLoading) return <CardSkeleton />;
    if (!rows.length) return <div className="ux-card">{empty}</div>;
    return (
      <div className="grid gap-3" role="list" aria-label="Records">
        {rows.map((row) => (
          <div role="listitem" key={row.id}>
            <RowCard row={row} onOpen={onRowClick ? () => onRowClick(row) : undefined} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <ShadTable aria-busy={isLoading || undefined}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableCell
                key={header.id}
                colSpan={header.colSpan}
                className={`font-semibold text-black cursor-pointer dark:text-gray-300 text-center ${headClass ?? ""}`}
                style={{
                  minWidth: header.column.columnDef.size,
                  maxWidth: header.column.columnDef.size,
                }}
              >
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableSkeleton cols={columnsCount} />
        ) : rows.length ? (
          rows.map((row) => (
            <TableRow
              className={cn(
                "text-gray-text text-sm dark:text-white",
                onRowClick && "cursor-pointer",
                isUrgentRow(row.original) && "ux-urgent-row"
              )}
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columnsCount}>{empty}</TableCell>
          </TableRow>
        )}
      </TableBody>
      {footer && (
        <TableFooter>
          {table.getFooterGroups().map((footerGroup) => (
            <TableRow key={footerGroup.id}>
              {footerGroup.headers.map((f) => (
                <TableCell
                  key={f.id}
                  colSpan={f.colSpan}
                  className="font-semibold text-black cursor-pointer dark:text-gray-300"
                  style={{ minWidth: f.column.columnDef.size, maxWidth: f.column.columnDef.size }}
                >
                  {f.isPlaceholder ? null : flexRender(f.column.columnDef.footer, f.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableFooter>
      )}
    </ShadTable>
  );
}
