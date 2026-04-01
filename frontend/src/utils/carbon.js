const CARBON_RATES = {
  trees: 5,
  organic: 2,
  mixed: 3,
  crops: 3
};

export function calculateCarbonCredits(area, farmingType) {
  const safeArea = Number(area);
  const safeType = String(farmingType || "").toLowerCase();

  if (!Number.isFinite(safeArea)) {
    return 0;
  }

  return safeArea * (CARBON_RATES[safeType] ?? 0);
}
