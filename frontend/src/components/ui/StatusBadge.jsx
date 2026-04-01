import { toLabel } from "../../utils/formatters";

const variants = {
  verified: "border-forest-400/20 bg-forest-400/10 text-forest-200",
  completed: "border-forest-400/20 bg-forest-400/10 text-forest-200",
  available: "border-sky-400/20 bg-sky-400/10 text-sky-100",
  pending: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  rejected: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  cancelled: "border-rose-400/20 bg-rose-400/10 text-rose-100",
  draft: "border-white/10 bg-white/[0.06] text-white/70"
};

export default function StatusBadge({ status }) {
  const tone = variants[String(status || "draft").toLowerCase()] ?? variants.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${tone}`}
    >
      {toLabel(status || "draft")}
    </span>
  );
}
