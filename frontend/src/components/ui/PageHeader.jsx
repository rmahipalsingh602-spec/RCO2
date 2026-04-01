export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-forest-300/70">
          Rathore Carbon Network
        </p>
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-2xl text-sm leading-6 text-white/60">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}
