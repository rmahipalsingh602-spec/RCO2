const SIZE_STYLES = {
  sm: {
    frame: "h-10 w-10 rounded-2xl",
    icon: "h-6 w-6",
    title: "text-base",
    subtitle: "text-[10px] tracking-[0.24em]"
  },
  md: {
    frame: "h-12 w-12 rounded-2xl",
    icon: "h-7 w-7",
    title: "text-xl",
    subtitle: "text-[11px] tracking-[0.24em]"
  },
  lg: {
    frame: "h-16 w-16 rounded-[22px]",
    icon: "h-10 w-10",
    title: "text-2xl",
    subtitle: "text-xs tracking-[0.28em]"
  }
};

function BrandMark({ iconClassName = "h-7 w-7" }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-forest-300/15 blur-md" />
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
        className={`relative ${iconClassName}`}
        fill="none"
      >
        <defs>
          <linearGradient id="rco2-logo-ring" x1="10" y1="10" x2="54" y2="54">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="rco2-logo-leaf" x1="23" y1="18" x2="42" y2="46">
            <stop offset="0%" stopColor="#f0fdf4" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
        </defs>

        <circle
          cx="32"
          cy="32"
          r="21"
          stroke="url(#rco2-logo-ring)"
          strokeWidth="3.5"
          strokeDasharray="100 18"
          strokeLinecap="round"
        />
        <path
          d="M31.8 18.5c-7 2.6-11.6 8.5-11.6 15.4 0 7.7 4.7 13.9 11.8 16.6 7-2.7 11.7-8.9 11.7-16.6 0-6.9-4.6-12.8-11.9-15.4Z"
          fill="url(#rco2-logo-leaf)"
          fillOpacity="0.95"
        />
        <path
          d="M23.8 37.3c4.1-1.7 8.2-5.7 12.4-11.9"
          stroke="#0b1f16"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <path
          d="M31.8 31.8c1.9 1.4 3.4 3.3 4.4 5.8"
          stroke="#0b1f16"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <circle cx="16.5" cy="22" r="3.2" fill="#d9fbe8" />
        <circle cx="49.2" cy="20.2" r="2.5" fill="#86efac" />
        <circle cx="47.8" cy="45" r="3.4" fill="#bbf7d0" />
      </svg>
    </div>
  );
}

export default function BrandLogo({
  size = "md",
  className = "",
  title = "RCO2",
  subtitle = "Rathore Carbon Network",
  showWordmark = true
}) {
  const styles = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`relative flex items-center justify-center border border-forest-400/20 bg-forest-400/10 shadow-[0_14px_40px_rgba(16,78,46,0.25)] ${styles.frame}`}
      >
        <BrandMark iconClassName={styles.icon} />
      </div>

      {showWordmark ? (
        <div className="min-w-0">
          <p className={`font-display font-semibold tracking-tight text-white ${styles.title}`}>
            {title}
          </p>
          <p className={`uppercase text-white/45 ${styles.subtitle}`}>{subtitle}</p>
        </div>
      ) : null}
    </div>
  );
}
