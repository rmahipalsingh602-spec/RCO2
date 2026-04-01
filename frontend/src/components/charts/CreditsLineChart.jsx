import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatCredits } from "../../utils/formatters";
import EmptyState from "../ui/EmptyState";

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  const estimated = payload.find((entry) => entry.dataKey === "estimated")?.value ?? 0;
  const verified = payload.find((entry) => entry.dataKey === "verified")?.value ?? 0;

  return (
    <div className="chart-tooltip">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        {label}
      </p>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-8">
          <span className="text-white/60">Estimated</span>
          <span className="font-semibold text-white">{formatCredits(estimated)}</span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-white/60">Verified</span>
          <span className="font-semibold text-white">{formatCredits(verified)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CreditsLineChart({ data }) {
  if (!data.length) {
    return (
      <EmptyState
        title="No credit history yet"
        description="Add land parcels to start tracking estimated and verified credits over time."
      />
    );
  }

  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<TooltipContent />} cursor={{ stroke: "rgba(57,211,130,0.3)" }} />
          <Line
            type="monotone"
            dataKey="estimated"
            stroke="#6ce8aa"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#6ce8aa" }}
          />
          <Line
            type="monotone"
            dataKey="verified"
            stroke="#39d382"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#39d382" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
