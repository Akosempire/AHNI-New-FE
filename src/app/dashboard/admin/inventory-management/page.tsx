import { redirect } from "next/navigation";

/** The group has no page of its own; open its first section. */
export default function InventoryManagementIndex() {
  redirect("/dashboard/admin/inventory-management/consumable");
}
