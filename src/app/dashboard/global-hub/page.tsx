"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { globalHubLinks, globalHubCategories } from "@/utils/sidebarItems";
import { useDepartmentFeatures } from "@/hooks/useDepartmentFeatures";
import { usePermissions } from "@/hooks/usePermissions";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  FileBarChart,
  MapPin,
  Clock,
  ChevronRight,
  Building2
} from "lucide-react";

export default function GlobalHubPage() {
  const authState = useAppSelector((state) => state.auth);
  const { user } = authState;
  const [isHydrated, setIsHydrated] = useState(false);

  const { hasPermission, hasAnyPermission, user: currentUser } = usePermissions();
  const {
    canAccessAdminFeatures,
    canAccessProcurementFeatures,
    canAccessFinanceFeatures,
    canAccessContractsGrantsFeatures,
    canAccessProgramsFeatures
  } = useDepartmentFeatures();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Filter Global Hub items based on user permissions
  const getAccessibleItems = () => {
    if (!isHydrated) return [];

    return globalHubLinks.filter((item: any) => {
      // Universal access items (no permissions required)
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      // For staff users and superusers, grant access to everything
      if (user?.is_staff || user?.is_superuser) {
        return true;
      }

      // Check item-specific permissions
      // Since we don't have hasPermissionByCodename, we'll use a simpler check
      // This allows all authenticated users to see Global Hub items for now
      // TODO: Implement proper granular permission checking if needed
      const hasItemPermission = item.permissions.length === 0 || user !== null;

      return hasItemPermission;
    });
  };

  // Group items by category
  const getGroupedItems = () => {
    const accessibleItems = getAccessibleItems();
    const grouped: { [key: string]: any[] } = {};

    accessibleItems.forEach((item: any) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    return grouped;
  };

  const groupedItems = getGroupedItems();
  const currentTime = new Date().toLocaleString();

  // Quick stats
  const totalAccessibleItems = getAccessibleItems().length;
  const categoryCount = Object.keys(groupedItems).length;

  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const visible = Object.entries(groupedItems)
    .map(([key, items]) => {
      const category = globalHubCategories[key as keyof typeof globalHubCategories];
      const list = (items as any[]).filter((it) => !q || it.label.toLowerCase().includes(q) || category?.label.toLowerCase().includes(q));
      return { key, category, list };
    })
    .filter((g) => g.category && g.list.length);

  if (!isHydrated) {
    return <div className="py-10 text-[14px] text-[var(--muted)]">Loading services…</div>;
  }

  return (
    <div className="space-y-6">
      {/* One page, one job: find a service. Everything fits on one screen. */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Global Hub</h1>
          <p className="mt-1 text-[14px] text-[var(--muted)]">
            {totalAccessibleItems} services across {categoryCount} areas. Start typing to find one.
          </p>
        </div>
        <label className="flex h-9 w-full items-center gap-2 rounded-[6px] border border-[var(--line-strong)] px-3 focus-within:border-[var(--ink-2)] sm:w-[320px]">
          <span className="sr-only">Find a service</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="flex-none text-[var(--muted)]" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a service, e.g. leave, vehicle"
            className="h-full w-full min-w-0 border-none bg-transparent text-[14px] outline-none"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-10 text-[14px] text-[var(--muted)]">No services match “{query}”. Try a shorter word.</p>
      ) : (
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map(({ key, category, list }) => (
            <section key={key} aria-labelledby={`hub-${key}`} className="min-w-0">
              <h2 id={`hub-${key}`} className="mb-1.5 flex items-center gap-2 border-b border-[var(--line-strong)] pb-2 text-[13.5px] font-medium [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[var(--muted)]">
                {category!.icon}
                {category!.label}
                <span className="ml-auto text-[12px] font-normal tabular-nums text-[var(--faint)]">{list.length}</span>
              </h2>
              <ul>
                {list.map((item: any) => (
                  <li key={item.path + item.label}>
                    <Link
                      href={item.path}
                      className="group -mx-2 flex h-8 items-center justify-between gap-2 rounded-[6px] px-2 text-[13.5px] text-[var(--ink-2)] transition-colors hover:bg-[var(--hover)] hover:text-[var(--ink)]"
                    >
                      <span className="truncate">{item.label}</span>
                      <ChevronRight className="h-3.5 w-3.5 flex-none text-[var(--faint)] opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
