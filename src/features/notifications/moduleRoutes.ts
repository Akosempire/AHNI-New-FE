/** Where a notification about a given module should take the user */
const ROUTES: Record<string, string> = {
  Project: "/dashboard/projects",
  ExpenseAuthorization: "/dashboard/admin/expense-authorization",
  Agreement: "/dashboard/c-and-g/agreements",
  User: "/account",
  ProcurementPlan: "/dashboard/procurement/procurement-plan",
  PurchaseOrder: "/dashboard/procurement/purchase-order",
  VehicleRequest: "/dashboard/admin/fleet-management/vehicle-request",
  FuelRequest: "/dashboard/admin/fleet-management/fuel-request",
  PaymentRequest: "/dashboard/admin/payment-request",
  AssetMaintenance: "/dashboard/admin/asset-maintenance",
  TravelExpenseReport: "/dashboard/admin/travel-expenses-report",
  ConsultancyReport: "/dashboard/c-and-g/consultancy-report",
  ContractRequest: "/dashboard/c-and-g/contract-request",
  FundRequest: "/dashboard/programs/fund-request",
};

export const moduleRoute = (moduleType?: string) => (moduleType && ROUTES[moduleType]) || "/dashboard/notifications";

/** "PaymentRequest" -> "Payment request" */
export const moduleLabel = (moduleType?: string) =>
  (moduleType || "Update").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^(\w)(.*)$/, (_, a: string, b: string) => a + b.toLowerCase());
