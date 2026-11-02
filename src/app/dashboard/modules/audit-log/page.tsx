import { redirect } from "next/navigation";

/** The audit log lives at /dashboard/audit-log. */
export default function ModulesAuditLog() {
  redirect("/dashboard/audit-log");
}
