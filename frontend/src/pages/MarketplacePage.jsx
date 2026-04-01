import { RefreshCw, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";

import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import StatusBadge from "../components/ui/StatusBadge";
import { useAppData } from "../context/AppDataContext";
import { formatCredits, formatCurrency } from "../utils/formatters";

export default function MarketplacePage() {
  const { buyCredits, errors, loadMarket, loading, marketListings, user } = useAppData();

  async function handleBuy(listing) {
    try {
      await toast.promise(
        buyCredits({
          carbonCreditId: listing.carbonCreditId,
          buyerId: user.id,
          credits: listing.credits,
          amount: listing.price
        }),
        {
          loading: "Processing purchase...",
          success: "Credits purchased successfully.",
          error: (error) => error.message
        }
      );
    } catch {
      return;
    }
  }

  return (
    <div className="section-shell">
      <PageHeader
        title="Marketplace"
        subtitle="Browse available carbon credit lots, compare prices, and purchase verified supply directly from the network."
        action={
          <button type="button" className="secondary-button" onClick={loadMarket}>
            <RefreshCw size={16} />
            Refresh market
          </button>
        }
      />

      {errors.market && !marketListings.length ? (
        <ErrorState
          title="Marketplace data could not be loaded"
          description={errors.market.message}
          onAction={loadMarket}
        />
      ) : null}

      <Panel
        title="Available credits"
        subtitle="Each listing shows the seller, credit volume, price, and a direct purchase action."
      >
        {marketListings.length ? (
          <div className="space-y-4">
            {marketListings.map((listing) => (
              <div
                key={listing.id}
                className="grid gap-4 rounded-[26px] border border-white/10 bg-white/[0.03] p-5 lg:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      Seller
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">{listing.seller}</p>
                    <p className="mt-1 text-sm text-white/40">{listing.landName}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      Credits
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {formatCredits(listing.credits)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      Price
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      {formatCurrency(listing.price)}
                    </p>
                    <p className="mt-1 text-sm text-white/40">
                      {listing.credits
                        ? `${formatCurrency(listing.price / listing.credits)} per credit`
                        : "Custom price"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                      Status
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={listing.status} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-start lg:justify-end">
                  <button
                    type="button"
                    className="primary-button"
                    disabled={loading.purchasing || listing.sellerId === user.id}
                    onClick={() => handleBuy(listing)}
                  >
                    <ShoppingBag size={16} />
                    {listing.sellerId === user.id
                      ? "Your Listing"
                      : loading.purchasing
                        ? "Buying..."
                        : "Buy Credits"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No credits listed right now"
            description="When verified credit lots become available, they will be listed here with pricing and seller details."
          />
        )}
      </Panel>
    </div>
  );
}
