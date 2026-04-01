export default function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="surface-subtle relative overflow-hidden p-5">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-forest-400/10 blur-3xl" />
      <div className="relative flex h-full min-h-[160px] flex-col justify-between gap-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            {label}
          </p>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-forest-400/20 bg-forest-400/10 text-forest-200">
            <Icon size={18} />
          </span>
        </div>
        <div className="space-y-2">
          <p className="metric-value">{value}</p>
          <p className="text-sm text-white/60">{hint}</p>
        </div>
      </div>
    </div>
  );
}
