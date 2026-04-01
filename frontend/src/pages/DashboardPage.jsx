import { Banknote, Leaf, MapPinned, Sparkles } from "lucide-react";

import CreditsLineChart from "../components/charts/CreditsLineChart";
import LandTypePieChart from "../components/charts/LandTypePieChart";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import StatTile from "../components/ui/StatTile";
import { useAppData } from "../context/AppDataContext";
import {
  formatAcres,
  formatCredits,
  formatCurrency,
  formatDate
} from "../utils/formatters";
import {
  buildCreditRows,
  buildCreditsTimeline,
  buildLandTypeDistribution
} from "../utils/transforms";

export default function DashboardPage() {
  const { credits, errors, lands, refreshAll, sources, summary } = useAppData();
  const lineChartData = buildCreditsTimeline(credits, lands);
  const landTypeData = buildLandTypeDistribution(lands);
  const creditRows = buildCreditRows(lands, credits);
  const recentParcels = [...lands].slice(0, 4);

  return (
    <div className="section-shell">
      <PageHeader
        title="Dashboard"
        subtitle="Track your land footprint, carbon generation, and current earnings position from a single dark-mode control room."
        action={
          <button type="button" className="secondary-button" onClick={refreshAll}>
            Refresh data
          </button>
        }
      />

      {sources.credits === "derived" ? (
        <div className="rounded-3xl border border-forest-400/20 bg-forest-400/10 px-5 py-4 text-sm text-mist">
          Credits are currently being estimated from land records because the dedicated
          credits endpoint is not live yet.
        </div>
      ) : null}

      {errors.lands && !lands.length ? (
        <ErrorState
          title="Unable to load your land portfolio"
          description={errors.lands.message}
          onAction={refreshAll}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <StatTile
          icon={MapPinned}
          label="Total Land"
          value={formatAcres(summary.totalLand)}
          hint={`${lands.length} registered parcels`}
        />
        <StatTile
          icon={Sparkles}
          label="Estimated Credits"
          value={formatCredits(summary.estimatedCredits)}
          hint="Calculated from acreage and farming type"
        />
        <StatTile
          icon={Leaf}
          label="Verified Credits"
          value={formatCredits(summary.verifiedCredits)}
          hint="Credits marked ready for sale"
        />
        <StatTile
          icon={Banknote}
          label="Total Earnings"
          value={formatCurrency(summary.totalEarnings)}
          hint="Verified credits valued at the live INR market price"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel
          title="Credits over time"
          subtitle="Estimated and verified volumes by activity period."
        >
          <CreditsLineChart data={lineChartData} />
        </Panel>

        <Panel
          title="Land type distribution"
          subtitle="Acreage split across your declared farming types."
        >
          <LandTypePieChart data={landTypeData} />
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Panel
          title="Recent land activity"
          subtitle="Newest parcels in your network."
        >
          {recentParcels.length ? (
            <div className="space-y-3">
              {recentParcels.map((land) => (
                <div
                  key={land.id}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-white">{land.locationName}</p>
                    <p className="text-sm text-white/50">
                      {land.farmingType} • {formatAcres(land.area)}
                    </p>
                  </div>
                  <div className="text-sm text-white/60">{formatDate(land.createdAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">
              Add your first land parcel to unlock activity tracking.
            </p>
          )}
        </Panel>

        <Panel
          title="Portfolio pulse"
          subtitle="Fast signals for your current carbon position."
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Average yield
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {lands.length
                  ? formatCredits(summary.estimatedCredits / lands.length)
                  : formatCredits(0)}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Estimated credits per registered parcel.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Verification ratio
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {summary.estimatedCredits
                  ? `${Math.round(
                      (summary.verifiedCredits / summary.estimatedCredits) * 100
                    )}%`
                  : "0%"}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Share of generated credits already verified.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Credit ledger
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {creditRows.length}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Credit records currently visible in your workspace.
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
