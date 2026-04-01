import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import StatusBadge from "../components/ui/StatusBadge";
import { useAppData } from "../context/AppDataContext";
import { formatCredits, formatDate } from "../utils/formatters";
import { buildCreditRows } from "../utils/transforms";

export default function CarbonCreditsPage() {
  const { credits, errors, lands, loadCredits, loading, sources, user, verifyCredit } =
    useAppData();
  const creditRows = buildCreditRows(lands, credits);

  async function handleVerify(creditId) {
    try {
      await toast.promise(verifyCredit(creditId), {
        loading: "Verifying carbon credit...",
        success: "Credit verified successfully.",
        error: (error) => error.message
      });
    } catch {
      return;
    }
  }

  return (
    <div className="section-shell">
      <PageHeader
        title="Carbon Credits"
        subtitle="Review estimated versus verified credits for each land parcel and keep an eye on verification status."
        action={
          <button type="button" className="secondary-button" onClick={() => loadCredits(lands)}>
            <RefreshCw size={16} />
            Refresh credits
          </button>
        }
      />

      {sources.credits === "derived" ? (
        <div className="rounded-3xl border border-forest-400/20 bg-forest-400/10 px-5 py-4 text-sm text-mist">
          The backend credit ledger is not available yet, so these rows are derived from your
          land portfolio using the same carbon calculation rules.
        </div>
      ) : null}

      {errors.credits && !creditRows.length ? (
        <ErrorState
          title="Carbon credits could not be loaded"
          description={errors.credits.message}
          onAction={() => loadCredits(lands)}
        />
      ) : null}

      <Panel
        title="Credit ledger"
        subtitle="Pending credits remain estimated. Verified credits are ready to participate in marketplace activity."
      >
        {creditRows.length ? (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Land</th>
                  <th>Estimated Credits</th>
                  <th>Verified Credits</th>
                  <th>Status</th>
                  <th>Year</th>
                  <th>Recorded</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {creditRows.map((credit) => (
                  <tr key={credit.id}>
                    <td className="font-medium text-white">{credit.landName}</td>
                    <td>{formatCredits(credit.estimatedCredits)}</td>
                    <td>{formatCredits(credit.verifiedCredits)}</td>
                    <td>
                      <StatusBadge status={credit.status} />
                    </td>
                    <td>{credit.year}</td>
                    <td>{formatDate(credit.createdAt)}</td>
                    <td>
                      {user.role === "admin" && credit.status === "pending" ? (
                        <button
                          type="button"
                          className="secondary-button"
                          disabled={loading.verifyingCredit}
                          onClick={() => handleVerify(credit.id)}
                        >
                          {loading.verifyingCredit ? "Verifying..." : "Verify"}
                        </button>
                      ) : (
                        <span className="text-sm text-white/40">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No credits available"
            description="Credits will appear here once land is added and the generation workflow has data to display."
          />
        )}
      </Panel>
    </div>
  );
}
