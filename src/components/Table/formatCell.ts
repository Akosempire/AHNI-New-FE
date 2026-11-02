/** Default display for plain table values: readable dates, grouped numbers, "—" for empty. */
const ISO = /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

export function formatCellValue(v: unknown, columnId = ""): string {
  const isCode = /(^|_)(id|code|no|number|year|phone|account)$|_id$|^id$/i.test(columnId);
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "number") return isCode ? String(v) : Number.isFinite(v) ? v.toLocaleString("en-NG", { maximumFractionDigits: 2 }) : "—";
  if (typeof v === "string") {
    const t = v.trim();
    if (ISO.test(t)) {
      const d = new Date(t.length === 10 ? `${t}T00:00:00` : t);
      if (!isNaN(d.getTime())) return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
    if (/^(undefined|null)( (undefined|null))*$/i.test(t)) return "—";
    return t;
  }
  if (Array.isArray(v)) return v.length ? v.map((x) => (typeof x === "object" ? x?.name ?? x?.title ?? "" : String(x))).filter(Boolean).join(", ") : "—";
  if (typeof v === "object") return (v as any).name ?? (v as any).title ?? (v as any).label ?? "—";
  return String(v);
}
