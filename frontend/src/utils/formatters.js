const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export function formatAcres(value) {
  return `${numberFormatter.format(value || 0)} acres`;
}

export function formatCredits(value) {
  return `${numberFormatter.format(value || 0)} tCO2e`;
}

export function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

export function formatDate(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.valueOf())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function toLabel(value) {
  return String(value || "")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
