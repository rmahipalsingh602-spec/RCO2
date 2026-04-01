export default function LoadingSpinner({
  label = "Loading",
  compact = false
}) {
  return (
    <div
      className={`flex items-center ${
        compact ? "gap-3" : "flex-col gap-4"
      }`}
    >
      <span className="relative inline-flex h-10 w-10">
        <span className="absolute inset-0 rounded-full border border-white/10" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-forest-400 border-r-forest-300" />
      </span>
      <div className={compact ? "text-sm text-white/70" : "text-sm text-white/70"}>
        {label}
      </div>
    </div>
  );
}
