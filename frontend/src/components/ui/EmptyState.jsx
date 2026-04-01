import { Sprout } from "lucide-react";

export default function EmptyState({
  title,
  description,
  action
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-400/10 text-forest-200">
        <Sprout size={22} />
      </div>
      <div className="mx-auto mt-5 max-w-md space-y-2">
        <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
        <p className="text-sm leading-6 text-white/60">{description}</p>
      </div>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
