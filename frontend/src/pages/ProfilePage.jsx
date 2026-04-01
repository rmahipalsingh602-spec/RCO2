import { RefreshCw } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import StatusBadge from "../components/ui/StatusBadge";
import { useAppData } from "../context/AppDataContext";
import { formatAcres, formatCredits, formatCurrency } from "../utils/formatters";

function connectionStatus(error, fallbackState = "live") {
  if (error) {
    return {
      label: "Attention",
      tone: "pending",
      description: error.message
    };
  }

  if (fallbackState === "estimated") {
    return {
      label: "Estimated",
      tone: "available",
      description: "Generated from land records until the dedicated endpoint is connected."
    };
  }

  return {
    label: "Live",
    tone: "verified",
    description: "Connected and responding."
  };
}

export default function ProfilePage() {
  const { credits, earnings, errors, lands, marketListings, refreshAll, sources, summary, user } =
    useAppData();

  const services = [
    {
      label: "Land portfolio",
      ...connectionStatus(errors.lands)
    },
    {
      label: "Credit ledger",
      ...connectionStatus(
        errors.credits,
        sources.credits === "derived" ? "estimated" : "live"
      )
    },
    {
      label: "Earnings engine",
      ...connectionStatus(errors.earnings)
    },
    {
      label: "Marketplace",
      ...connectionStatus(errors.market)
    }
  ];

  return (
    <div className="section-shell">
      <PageHeader
        title="Profile"
        subtitle="Keep account details, network health, and current portfolio totals visible in one place."
        action={
          <button type="button" className="secondary-button" onClick={refreshAll}>
            <RefreshCw size={16} />
            Refresh workspace
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel
          title="Account"
          subtitle="Topbar identity and session context for the current farmer workspace."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Farmer
              </p>
              <p className="mt-3 font-display text-2xl font-semibold text-white">
                {user.name}
              </p>
              <p className="mt-2 text-sm text-white/60">{user.email}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Status
              </p>
              <div className="mt-3">
                <StatusBadge status={user.isVerified ? "verified" : "pending"} />
              </div>
              <p className="mt-2 text-sm text-white/60">{user.role}</p>
            </div>
          </div>
        </Panel>

        <Panel
          title="Portfolio snapshot"
          subtitle="Current totals derived from land, credits, and marketplace data."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Total land
              </p>
              <p className="mt-3 font-display text-2xl font-semibold text-white">
                {formatAcres(summary.totalLand)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Estimated credits
              </p>
              <p className="mt-3 font-display text-2xl font-semibold text-white">
                {formatCredits(summary.estimatedCredits)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Verified credits
              </p>
              <p className="mt-3 font-display text-2xl font-semibold text-white">
                {formatCredits(summary.verifiedCredits)}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Earnings value
              </p>
              <p className="mt-3 font-display text-2xl font-semibold text-white">
                {formatCurrency(summary.totalEarnings)}
              </p>
              <p className="mt-2 text-sm text-white/60">
                {formatCredits(earnings.verifiedCredits)} at {formatCurrency(earnings.marketPrice)} per credit
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        <Panel
          title="Connection health"
          subtitle="A quick check on which backend surfaces are live versus temporarily derived."
        >
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.label}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-base font-semibold text-white">{service.label}</p>
                  <p className="mt-1 text-sm text-white/60">{service.description}</p>
                </div>
                <StatusBadge status={service.tone} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Workspace totals"
          subtitle="Raw counts currently available in the dashboard."
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Land parcels
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">{lands.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Credit records
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {credits.length || lands.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Marketplace listings
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {marketListings.length}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
