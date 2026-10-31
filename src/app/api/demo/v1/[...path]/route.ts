/**
 * PREVIEW-ONLY demo backend.
 *
 * Active only when NEXT_PUBLIC_DEMO_MODE=1 (set on a preview deployment, never on
 * AHNi's real deployments). It answers the same endpoints as the real API with
 * sample data so the dashboard and portals can be clicked through without access
 * to AHNi's servers. Writes are accepted but nothing is stored.
 *
 * To use it, a deployment sets:
 *   NEXT_PUBLIC_DEMO_MODE=1
 *   NEXT_PUBLIC_BASE_URL=/api/demo/v1
 *   NEXT_PUBLIC_API_URL=/api/demo/v1
 */
import { NextRequest, NextResponse } from "next/server";
import { DEMO_LOGINS } from "@/constants/demoMode";

export const dynamic = "force-dynamic";

const enabled = () => process.env.NEXT_PUBLIC_DEMO_MODE === "1";

/* ---------- helpers ---------- */
const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64").replace(/=+$/, "");
const token = (sub: string, hours = 12) =>
  `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub, exp: Math.floor(Date.now() / 1000) + hours * 3600, demo: true })}.demo`;
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const daysAhead = (d: number) => new Date(Date.now() + d * 86400000).toISOString();

const page = (results: any[], req: NextRequest) => {
  const p = Number(req.nextUrl.searchParams.get("page") || 1);
  const size = Number(req.nextUrl.searchParams.get("size") || req.nextUrl.searchParams.get("page_size") || 20);
  const slice = results.slice((p - 1) * size, p * size);
  const total_pages = Math.max(1, Math.ceil(results.length / size));
  return {
    results: slice,
    count: results.length,
    number_of_pages: total_pages,
    next: p < total_pages ? `?page=${p + 1}` : null,
    previous: p > 1 ? `?page=${p - 1}` : null,
    pagination: { count: results.length, page: p, page_size: size, total_pages, next: null, previous: null, next_page_number: p < total_pages ? p + 1 : null, previous_page_number: p > 1 ? p - 1 : null },
  };
};
const ok = (data: any, extra: object = {}) => NextResponse.json({ status: true, message: "OK (preview data)", data, ...extra });
const paged = (rows: any[], req: NextRequest) => {
  const body = page(rows, req);
  // some screens read data.results, some read results at the top level
  return NextResponse.json({ status: true, message: "OK (preview data)", data: body, ...body });
};

/* ---------- sample data ---------- */
const STAFF_USER = {
  id: "demo-staff-1",
  first_name: "Preview",
  last_name: "Admin",
  email: DEMO_LOGINS.staff.email,
  username: "preview.admin",
  is_active: true,
  is_staff: true,
  is_superuser: true,
  user_type: "STAFF",
  department: { id: "dep-prog", name: "PROGRAMS", code: "PRG" },
  position: { id: "pos-po", title: "Programme Manager", code: "PM", level: 5, can_approve: true, can_authorize: true },
  employee: { department: { id: "dep-prog", name: "PROGRAMS" }, position: { title: "Programme Manager" } },
  profile_picture: null,
  permissions: [],
  roles: [{ id: "role-admin", name: "Administrator", code: "ADMIN" }],
  last_login: daysAgo(1),
};

const PROJECTS = [
  ["Global Fund HIV Prevention – Kano", "Active", 120_000_000, "Kano", "Global Fund"],
  ["TB Case Finding Acceleration", "Active", 85_000_000, "Kaduna", "USAID"],
  ["Malaria Bed Net Distribution", "In Progress", 60_000_000, "Benue", "Global Fund"],
  ["RMNCH Quality of Care", "Completed", 40_000_000, "Bauchi", "UNICEF"],
  ["Health Information Systems Upgrade", "Active", 95_000_000, "Abuja", "FCDO"],
  ["Community Outreach for Adolescents", "Pending", 22_000_000, "Lagos", "UNFPA"],
].map(([title, status, budget, loc, donor], i) => ({
  id: `prj-${i + 1}`,
  title,
  name: title,
  status,
  budget,
  currency: "NGN",
  location: [{ name: loc }],
  funding_sources: [{ name: donor }],
  intervention_area: { code: ["HIV", "TB", "MAL", "RMNCH", "HSS", "CH"][i] },
  start_date: daysAgo(400 - i * 30),
  end_date: daysAhead(300 + i * 20),
  goal: `${title} – sample project for the preview.`,
}));

const FUND_REQUESTS = [
  ["Pending", 4_200_000, 0, 1],
  ["Submitted", 2_800_000, 1, 3],
  ["Pending", 1_900_000, 4, 2],
  ["Approved", 6_500_000, 2, 12],
  ["Approved", 3_100_000, 4, 40],
  ["Rejected", 1_200_000, 5, 70],
  ["Approved", 5_000_000, 3, 100],
  ["Approved", 2_200_000, 1, 130],
].map(([status, amount, p, d], i) => ({
  id: `fr-${i + 1}`,
  uuid_code: `FR-2026-${140 + i}`,
  status,
  amount,
  total_amount: amount,
  currency: "NGN",
  project: { id: PROJECTS[p as number].id, name: PROJECTS[p as number].title },
  project_name: PROJECTS[p as number].title,
  created_datetime: daysAgo(d as number),
  created_at: daysAgo(d as number),
}));

const NOTIFICATIONS = [
  ["Payment request awaiting your approval", "PR-0091 from Musa Danladi", "PaymentRequest", "Pending", 0.02, "high"],
  ["Vehicle request approved", "Trip to Kaduna on Friday", "VehicleRequest", "Pending", 0.15, "medium"],
  ["Purchase order issued", "PO-2026-118 for lab reagents", "PurchaseOrder", "Read", 1, "low"],
  ["Contract request updated", "Consultancy – data quality audit", "ContractRequest", "Read", 2, "low"],
  ["Expense authorization signed", "EA-0442", "ExpenseAuthorization", "Read", 3, "low"],
].map(([title, message, module_type, status, d, priority], i) => ({
  id: `ntf-${i + 1}`,
  user: STAFF_USER.id,
  title,
  message,
  module_type,
  status,
  is_read: status === "Read",
  created_datetime: daysAgo(d as number),
  priority,
}));

const OPPORTUNITIES = [
  ["Senior Technical Officer, HIV Prevention", "JOB", "Abuja"],
  ["M&E Consultant – Malaria Programme", "CONSULTANT", "Kano"],
  ["Data Collectors (Ad-hoc)", "ADHOC", "Lagos"],
  ["EOI: Supply of Laboratory Reagents", "EOI", "Abuja"],
  ["RFQ: Office Furniture for State Offices", "RFQ", "Abuja"],
  ["RFP: Baseline Community Survey", "RFP", "Benue"],
  ["Finance & Grants Manager", "JOB", "Abuja"],
  ["Health Systems Consultant", "CONSULTANT", "Kaduna"],
].map(([name, type, loc], i) => ({
  id: `opp-${i + 1}`,
  name,
  title: name,
  opportunity_type: type,
  type: type === "EOI" ? "NEW_VENDOR" : undefined,
  status: type === "RFQ" || type === "RFP" ? "PUBLISHED" : "OPEN",
  eoi_number: `AHNI/${type}/2026/${100 + i}`,
  rfq_number: type === "RFQ" ? `RFQ-2026-${118 + i}` : undefined,
  rfp_number: type === "RFP" ? `RFP-2026-${22 + i}` : undefined,
  created_at: daysAgo(i * 2),
  opening_date: daysAgo(i * 2),
  closing_date: daysAhead(5 + i * 4),
  location_name: loc,
  categories: [{ parent_category: "Location", name: loc }],
  description: `Sample ${type.toLowerCase()} opportunity shown in preview mode.`,
  consultants_number: 1,
  number_of_positions: 1,
  department: "Programs",
}));

const VENDOR = { id: "demo-vendor-1", company_name: "Preview Medical Supplies Ltd", email: DEMO_LOGINS.vendor.email, status: "APPROVED" };
const CONSULTANT = { id: "demo-consultant-1", full_name: "Preview Consultant", email: DEMO_LOGINS.consultant.email };

/* ---------- router ---------- */
async function handle(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  if (!enabled()) return NextResponse.json({ detail: "Not found" }, { status: 404 });

  const { path: parts } = await params;
  const path = parts.join("/").replace(/\/+$/, "");
  const method = req.method.toUpperCase();
  let body: any = {};
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }
  const creds = (k: keyof typeof DEMO_LOGINS) =>
    String(body.email || "").trim().toLowerCase() === DEMO_LOGINS[k].email && body.password === DEMO_LOGINS[k].password;
  const bad = (k: keyof typeof DEMO_LOGINS) =>
    NextResponse.json(
      { status: false, message: `Preview mode: sign in with ${DEMO_LOGINS[k].email} / ${DEMO_LOGINS[k].password}` },
      { status: 401 }
    );

  /* --- staff auth --- */
  if (path === "auth/login" && method === "POST") {
    if (!creds("staff")) return bad("staff");
    return NextResponse.json({
      status: "success",
      message: "Login successful (preview)",
      data: { access_token: token(STAFF_USER.id), refresh_token: token(STAFF_USER.id, 24 * 7), user: STAFF_USER, permissions: [], roles: STAFF_USER.roles },
    });
  }
  if (path === "auth/token/refresh") return ok({ access: token(STAFF_USER.id), refresh: token(STAFF_USER.id, 24 * 7) }, { access: token(STAFF_USER.id) });
  if (path.startsWith("auth/")) return ok({}, { message: "Done (preview mode – no email is sent)" });
  if (path === "users/profile") return ok(STAFF_USER);

  /* --- vendor auth --- */
  if (path === "procurements/vendor/auth/login" && method === "POST") {
    if (!creds("vendor")) return bad("vendor");
    return NextResponse.json({ status: "success", data: { access_token: token(VENDOR.id), refresh_token: token(VENDOR.id, 168), user: { email: VENDOR.email, vendor: VENDOR } } });
  }
  if (path === "procurements/vendor/auth/profile") return NextResponse.json({ status: "success", data: { ...VENDOR, user: { vendor: VENDOR } } });
  if (path.startsWith("procurements/vendor/auth/")) return ok({ access: token(VENDOR.id) });

  /* --- consultant auth --- */
  if (path === "consultant-portal/auth/login" && method === "POST") {
    if (!creds("consultant")) return bad("consultant");
    return NextResponse.json({ status: true, data: { access_token: token(CONSULTANT.id), refresh_token: token(CONSULTANT.id, 168), consultant: CONSULTANT } });
  }
  if (path === "consultant-portal/auth/profile") return ok({ ...CONSULTANT, consultant: CONSULTANT });
  if (path.startsWith("consultant-portal/auth/")) return ok({ access: token(CONSULTANT.id) });

  /* --- data --- */
  if (method === "GET") {
    if (path === "notifications") {
      const pendingOnly = req.nextUrl.searchParams.get("status") === "Pending";
      const rows = pendingOnly ? NOTIFICATIONS.filter((n) => n.status === "Pending") : NOTIFICATIONS;
      return NextResponse.json({ count: rows.length, next: null, previous: null, results: rows });
    }
    if (path === "projects") return paged(PROJECTS, req);
    if (/^projects\/[^/]+$/.test(path)) return ok(PROJECTS.find((p) => p.id === parts[1]) ?? PROJECTS[0]);
    if (path === "programs/fund-requests") return paged(FUND_REQUESTS, req);
    if (path === "hr/employees")
      return paged(
        Array.from({ length: 42 }, (_, i) => ({ id: `emp-${i + 1}`, department: ["Programs", "Finance", "HR", "Admin"][i % 4], position: "Officer" })),
        req
      );
    if (path === "public/opportunities") {
      const t = req.nextUrl.searchParams.get("opportunity_type");
      const q = (req.nextUrl.searchParams.get("search") || "").toLowerCase();
      return paged(OPPORTUNITIES.filter((o) => (!t || o.opportunity_type === t) && (!q || o.name.toLowerCase().includes(q))), req);
    }
    if (/^public\/opportunities\/[^/]+$/.test(path)) {
      const o = OPPORTUNITIES.find((x) => x.id === parts[2]);
      return o ? ok(o) : NextResponse.json({ status: false, message: "Not found" }, { status: 404 });
    }
    // Any other list/detail screen: an empty, well-formed page so screens render their empty states
    return paged([], req);
  }

  // Writes are accepted but not stored
  return NextResponse.json({
    status: true,
    message: "Saved (preview mode – nothing is stored)",
    data: { id: `demo-${Date.now()}`, ...body },
  });
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
