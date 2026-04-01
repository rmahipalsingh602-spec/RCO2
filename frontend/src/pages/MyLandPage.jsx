import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import Panel from "../components/ui/Panel";
import StatusBadge from "../components/ui/StatusBadge";
import { useAppData } from "../context/AppDataContext";
import { calculateCarbonCredits } from "../utils/carbon";
import { formatAcres, formatCredits, formatDate, toLabel } from "../utils/formatters";

const initialForm = {
  locationName: "",
  area: "",
  farmingType: "trees"
};

export default function MyLandPage() {
  const { addLand, errors, lands, loading, refreshAll } = useAppData();
  const [form, setForm] = useState(initialForm);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.locationName.trim() || !Number(form.area)) {
      toast.error("Enter a location and a valid acreage before saving.");
      return;
    }

    try {
      await toast.promise(
        addLand({
          ...form,
          area: Number(form.area)
        }),
        {
          loading: "Saving land parcel...",
          success: "Land parcel added successfully.",
          error: (error) => error.message
        }
      );

      setForm(initialForm);
    } catch {
      return;
    }
  }

  return (
    <div className="section-shell">
      <PageHeader
        title="My Land"
        subtitle="Register land parcels, keep acreage organized, and see the estimated carbon potential for each plot."
        action={
          <button type="button" className="secondary-button" onClick={refreshAll}>
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      {errors.lands && !lands.length ? (
        <ErrorState
          title="Land data could not be loaded"
          description={errors.lands.message}
          onAction={refreshAll}
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel
          title="Add new parcel"
          subtitle="Use the farming type to calculate expected credits immediately."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70" htmlFor="locationName">
                Location name
              </label>
              <input
                id="locationName"
                name="locationName"
                value={form.locationName}
                onChange={updateField}
                placeholder="Neem Valley Block A"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70" htmlFor="area">
                Area (acres)
              </label>
              <input
                id="area"
                name="area"
                type="number"
                min="0"
                step="0.1"
                value={form.area}
                onChange={updateField}
                placeholder="25"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70" htmlFor="farmingType">
                Farming type
              </label>
              <select
                id="farmingType"
                name="farmingType"
                value={form.farmingType}
                onChange={updateField}
              >
                <option value="trees">Trees</option>
                <option value="organic">Organic</option>
                <option value="mixed">Mixed</option>
                <option value="crops">Crops</option>
              </select>
            </div>

            <div className="rounded-2xl border border-forest-400/20 bg-forest-400/10 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                Live estimate
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {formatCredits(calculateCarbonCredits(form.area, form.farmingType))}
              </p>
              <p className="mt-1 text-sm text-white/60">
                Based on the current acreage and farming profile.
              </p>
            </div>

            <button
              type="submit"
              className="primary-button w-full"
              disabled={loading.submittingLand}
            >
              <Plus size={16} />
              {loading.submittingLand ? "Saving parcel..." : "Add land"}
            </button>
          </form>
        </Panel>

        <Panel
          title="Registered land"
          subtitle="Each parcel shows its acreage, farming profile, and current estimated carbon credits."
        >
          {lands.length ? (
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Area</th>
                    <th>Farming Type</th>
                    <th>Calculated Credits</th>
                    <th>Status</th>
                    <th>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {lands.map((land) => (
                    <tr key={land.id}>
                      <td>
                        <div>
                          <p className="font-medium text-white">{land.locationName}</p>
                          <p className="mt-1 text-xs text-white/40">Parcel ID: {land.id}</p>
                        </div>
                      </td>
                      <td>{formatAcres(land.area)}</td>
                      <td>{toLabel(land.farmingType)}</td>
                      <td>{formatCredits(calculateCarbonCredits(land.area, land.farmingType))}</td>
                      <td>
                        <StatusBadge status={land.verified ? "verified" : "pending"} />
                      </td>
                      <td>{formatDate(land.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No land parcels yet"
              description="Register your first parcel to begin calculating potential carbon credits."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
