import { calculateCarbonCredits } from "./carbon";

const FALLBACK_CREDIT_PRICE = Number(import.meta.env.VITE_CREDIT_PRICE ?? 22);

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIsoDate(value) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.valueOf())
    ? new Date().toISOString()
    : parsed.toISOString();
}

function createLocalId(prefix = "item") {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeUser(raw = {}) {
  return {
    id: raw.id ?? "local-farmer",
    name: raw.name ?? raw.full_name ?? raw.username ?? "Rathore Farmer",
    email: raw.email ?? "farmer@rco2.local",
    role: raw.role ?? "Farmer",
    isVerified: Boolean(raw.is_verified ?? raw.isVerified ?? false),
    totalEarnings: toNumber(raw.total_earnings ?? raw.totalEarnings)
  };
}

export function normalizeLand(raw = {}) {
  return {
    id: raw.id ?? createLocalId("land"),
    userId: raw.user_id ?? raw.userId ?? "local-farmer",
    locationName:
      raw.location_name ?? raw.locationName ?? raw.name ?? "Unnamed parcel",
    area: toNumber(raw.area_acres ?? raw.area),
    farmingType: raw.farming_type ?? raw.farmingType ?? "mixed",
    verified: Boolean(raw.verified),
    createdAt: toIsoDate(raw.created_at ?? raw.createdAt)
  };
}

export function normalizeEarnings(raw = {}) {
  return {
    estimatedCredits: toNumber(raw.estimated_credits ?? raw.estimatedCredits),
    verifiedCredits: toNumber(raw.verified_credits ?? raw.verifiedCredits),
    marketPrice: toNumber(raw.market_price ?? raw.marketPrice ?? FALLBACK_CREDIT_PRICE),
    totalEarnings: toNumber(raw.total_earnings ?? raw.totalEarnings),
    currency: raw.currency ?? "INR"
  };
}

export function normalizeCredit(raw = {}) {
  const estimatedCredits = toNumber(
    raw.estimated_credits ?? raw.estimatedCredits ?? raw.credits
  );
  const verifiedCredits = toNumber(
    raw.verified_credits ?? raw.verifiedCredits
  );

  return {
    id: raw.id ?? raw.carbon_credit_id ?? createLocalId("credit"),
    landId: raw.land_id ?? raw.landId ?? raw.land?.id ?? "",
    landName:
      raw.land_name ??
      raw.landName ??
      raw.land?.location_name ??
      raw.land?.locationName ??
      "",
    estimatedCredits,
    verifiedCredits,
    status:
      String(
        raw.status ??
          (verifiedCredits > 0 ? "verified" : estimatedCredits > 0 ? "pending" : "draft")
      ).toLowerCase(),
    year: toNumber(raw.year) || new Date().getFullYear(),
    createdAt: toIsoDate(raw.created_at ?? raw.createdAt),
    seller: raw.seller_name ?? raw.sellerName ?? raw.seller ?? "Verified seller",
    price: toNumber(raw.price ?? raw.amount) || estimatedCredits * FALLBACK_CREDIT_PRICE
  };
}

export function normalizeMarketListing(raw = {}) {
  const credits = toNumber(
    raw.credits ??
      raw.available_credits ??
      raw.availableCredits ??
      raw.estimated_credits ??
      raw.estimatedCredits
  );

  return {
    id: raw.id ?? createLocalId("market"),
    carbonCreditId:
      raw.carbon_credit_id ?? raw.carbonCreditId ?? raw.id ?? createLocalId("credit"),
    sellerId: raw.seller_id ?? raw.sellerId ?? "",
    seller: raw.seller_name ?? raw.sellerName ?? raw.seller ?? "Verified seller",
    credits,
    price: toNumber(raw.price ?? raw.amount) || credits * FALLBACK_CREDIT_PRICE,
    landName:
      raw.land_name ??
      raw.landName ??
      raw.land?.location_name ??
      raw.land?.locationName ??
      "Verified portfolio",
    status: String(raw.status ?? "available").toLowerCase()
  };
}

export function buildCreditsFromLands(lands = []) {
  return lands.map((land) => {
    const estimatedCredits = calculateCarbonCredits(land.area, land.farmingType);

    return normalizeCredit({
      id: `estimated-${land.id}`,
      land_id: land.id,
      land_name: land.locationName,
      estimated_credits: estimatedCredits,
      verified_credits: land.verified ? estimatedCredits : 0,
      status: land.verified ? "verified" : "pending",
      year: new Date(land.createdAt).getFullYear(),
      created_at: land.createdAt
    });
  });
}

export function buildCreditRows(lands = [], credits = []) {
  const landMap = new Map(lands.map((land) => [land.id, land.locationName]));
  const source = credits.length ? credits : buildCreditsFromLands(lands);

  return source.map((credit, index) => ({
    ...credit,
    landName: credit.landName || landMap.get(credit.landId) || `Parcel ${index + 1}`
  }));
}

export function buildCreditsTimeline(credits = [], lands = []) {
  const source = buildCreditRows(lands, credits);
  const buckets = new Map();

  source.forEach((credit) => {
    const parsedDate = new Date(credit.createdAt);
    const safeDate = Number.isNaN(parsedDate.valueOf()) ? new Date() : parsedDate;
    const key = `${safeDate.getFullYear()}-${safeDate.getMonth()}`;
    const existing = buckets.get(key) ?? {
      label: safeDate.toLocaleString("en-US", {
        month: "short",
        year: "2-digit"
      }),
      sortKey: safeDate.getTime(),
      estimated: 0,
      verified: 0
    };

    existing.estimated += credit.estimatedCredits;
    existing.verified += credit.verifiedCredits;
    buckets.set(key, existing);
  });

  return Array.from(buckets.values())
    .sort((left, right) => left.sortKey - right.sortKey)
    .slice(-6)
    .map(({ sortKey, ...entry }) => entry);
}

export function buildLandTypeDistribution(lands = []) {
  const distribution = new Map();

  lands.forEach((land) => {
    distribution.set(
      land.farmingType,
      (distribution.get(land.farmingType) ?? 0) + land.area
    );
  });

  const total = Array.from(distribution.values()).reduce(
    (sum, value) => sum + value,
    0
  );

  return Array.from(distribution.entries())
    .map(([name, value]) => ({
      name: String(name || "mixed").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      value,
      share: total ? value / total : 0
    }))
    .sort((left, right) => right.value - left.value);
}

export function buildDashboardSummary({ lands = [], credits = [], earnings = {} }) {
  const creditRows = buildCreditRows(lands, credits);
  const marketPrice = toNumber(earnings.marketPrice) || FALLBACK_CREDIT_PRICE;

  return {
    totalLand: lands.reduce((sum, land) => sum + land.area, 0),
    estimatedCredits: creditRows.reduce(
      (sum, credit) => sum + credit.estimatedCredits,
      0
    ),
    verifiedCredits: creditRows.reduce(
      (sum, credit) => sum + credit.verifiedCredits,
      0
    ),
    totalEarnings:
      toNumber(earnings.totalEarnings) ||
      creditRows.reduce((sum, credit) => sum + credit.verifiedCredits, 0) * marketPrice
  };
}
