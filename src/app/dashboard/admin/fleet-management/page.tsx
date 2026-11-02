import { redirect } from "next/navigation";

/** The group has no page of its own; open its first section. */
export default function Index() {
  redirect("/dashboard/admin/fleet-management/vehicle-request");
}
