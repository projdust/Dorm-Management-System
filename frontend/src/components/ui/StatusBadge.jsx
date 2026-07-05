const COLOR_MAP = {
  // Room / Bed status
  FULL: "bg-red-50 text-red-600",
  PARTIAL: "bg-amber-50 text-amber-600",
  AVAILABLE: "bg-emerald-50 text-emerald-600",
  MAINTENANCE: "bg-slate-100 text-slate-600",
  // Generic active/inactive
  ACTIVE: "bg-emerald-50 text-emerald-600",
  INACTIVE: "bg-slate-100 text-slate-500",
  // Payment / Bill status
  PAID: "bg-emerald-50 text-emerald-600",
  PENDING: "bg-amber-50 text-amber-600",
  UNPAID: "bg-amber-50 text-amber-600",
  OVERDUE: "bg-red-50 text-red-600",
  REFUNDED: "bg-slate-100 text-slate-600",
  // Maintenance
  OPEN: "bg-amber-50 text-amber-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  RESOLVED: "bg-emerald-50 text-emerald-600",
  CLOSED: "bg-slate-100 text-slate-600",
  CANCELLED: "bg-slate-100 text-slate-500",
};

export default function StatusBadge({ status }) {
  const colorClasses = COLOR_MAP[status] || "bg-slate-100 text-slate-600";
  const label = status
    ?.toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");

  return <span className={`badge ${colorClasses}`}>{label}</span>;
}
