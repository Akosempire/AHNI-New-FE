/**
 * Preview demo mode. Only on when a deployment sets NEXT_PUBLIC_DEMO_MODE=1
 * (see src/app/api/demo/v1/[...path]/route.ts). AHNi's real deployments never set it.
 * These are not real accounts: they only work against the built-in demo backend.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

export const DEMO_LOGINS = {
  staff: { email: "demo@ahni.preview", password: "Preview2026" },
  vendor: { email: "vendor@ahni.preview", password: "Preview2026" },
  consultant: { email: "consultant@ahni.preview", password: "Preview2026" },
} as const;
