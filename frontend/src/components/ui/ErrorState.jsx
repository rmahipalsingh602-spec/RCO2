import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorState({
  title = "Something went wrong",
  description,
  actionLabel = "Try again",
  onAction
}) {
  return (
    <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-100">
            <AlertTriangle size={18} />
          </span>
          <div className="space-y-1">
            <h3 className="font-display text-lg font-semibold text-rose-50">{title}</h3>
            <p className="max-w-2xl text-sm leading-6 text-rose-100/75">
              {description}
            </p>
          </div>
        </div>
        {onAction ? (
          <button type="button" className="secondary-button" onClick={onAction}>
            <RotateCcw size={16} />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
