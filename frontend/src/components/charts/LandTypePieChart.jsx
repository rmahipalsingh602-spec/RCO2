import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatAcres } from "../../utils/formatters";
import EmptyState from "../ui/EmptyState";

const COLORS = ["#39d382", "#6ce8aa", "#198754", "#0f5b34"];

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0]?.payload;

  return (
    <div className="chart-tooltip">
      <p className="text-sm font-semibold text-white">{entry.name}</p>
      <p className="mt-2 text-sm text-white/70">{formatAcres(entry.value)}</p>
    </div>
  );
}

export default function LandTypePieChart({ data }) {
  if (!data.length) {
    return (
      <EmptyState
        title="No land distribution yet"
        description="Once parcels are added, the land mix across farming types will appear here."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-center">
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={78}
              outerRadius={118}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<TooltipContent />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((entry, index) => (
          <div
            key={entry.name}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div>
                <p className="text-sm font-semibold text-white">{entry.name}</p>
                <p className="text-xs text-white/40">
                  {(entry.share * 100).toFixed(0)}% of total land
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70">{formatAcres(entry.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
