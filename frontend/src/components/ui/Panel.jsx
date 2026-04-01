export default function Panel({ title, subtitle, action, className = "", children }) {
  return (
    <section className={`surface p-5 sm:p-6 ${className}`}>
      {title || subtitle || action ? (
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            {title ? (
              <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="text-sm leading-6 text-white/60">{subtitle}</p>
            ) : null}
          </div>
          {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
