"use client";

import { useMemo } from "react";
import { Bell, FolderKanban, LayoutGrid, ScrollText, Globe2 } from "lucide-react";
import { useSidebarNav } from "@/hooks/useSidebarNav";
import type { SidebarItem } from "@/utils/sidebarItems";
import { NavNode, NavSection } from "./nav";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function fromSidebarItem(item: SidebarItem, parent = ""): NavNode {
  const id = `${parent}/${slug(item.name)}`;
  return {
    id,
    label: item.name,
    href: item.path && item.path !== "/" ? item.path : undefined,
    icon: item.icon,
    children: item.children?.map((c) => fromSidebarItem(c, id)),
  };
}

/** Quick-start actions, offered only when the user actually has that page in their nav. */
const QUICK = [
  { label: "Apply for leave", match: "Apply for Leave" },
  { label: "Submit timesheet", match: "My Timesheet" },
  { label: "Payment request", match: "Payment Request" },
  { label: "Purchase request", match: "Purchase Requests" },
  { label: "Vehicle request", match: "Vehicle Request" },
  { label: "Travel request", match: "Travel Request" },
];

export function useNavSections() {
  const nav = useSidebarNav();

  const sections = useMemo<NavSection[]>(() => {
    const s: NavSection[] = [
      {
        id: "overview",
        label: "Overview",
        items: [
          { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: <LayoutGrid /> },
          { id: "notifications", label: "Notifications", href: "/dashboard/notifications", icon: <Bell /> },
        ],
      },
    ];

    if (nav.showGlobalHub) {
      s.push({
        id: "workspace",
        label: "My workspace",
        items: [
          { id: "hub", label: "Global Hub", href: "/dashboard/global-hub", icon: <Globe2 /> },
          ...nav.globalHub.map((g: any) => ({
            id: `hub/${g.category}`,
            label: g.label,
            icon: g.icon,
            children: g.items.map((it: any) => ({ id: `hub/${g.category}/${slug(it.label)}`, label: it.label, href: it.path })),
          })),
        ],
      });
    }

    if (nav.departmental.length) {
      s.push({
        id: "department",
        label: "Department",
        items: [
          { id: "projects", label: "Projects", href: "/dashboard/projects", icon: <FolderKanban /> },
          ...nav.departmental.map((d) => fromSidebarItem(d, "dept")),
        ],
      });
    }

    const admin: NavNode[] = nav.modules.map((m) => fromSidebarItem(m, "admin"));
    if (nav.canSeeAuditLog) admin.push({ id: "audit", label: "Audit Log", href: "/dashboard/audit-log", icon: <ScrollText /> });
    if (admin.length) s.push({ id: "admin", label: "Administration", items: admin });

    return s;
  }, [nav.showGlobalHub, nav.globalHub, nav.departmental, nav.modules, nav.canSeeAuditLog]);

  const quickActions = useMemo(() => {
    const items: { label: string; href: string }[] = [];
    const all = (nav.globalHub as any[]).flatMap((g) => g.items as { label: string; path: string }[]);
    QUICK.forEach((q) => {
      const hit = all.find((i) => i.label === q.match);
      if (hit) items.push({ label: q.label, href: hit.path });
    });
    return items;
  }, [nav.globalHub]);

  return { ...nav, sections, quickActions };
}
