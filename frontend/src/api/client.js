import axios from "axios";

function shouldUseLocalDevProxy() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    import.meta.env.DEV &&
    ["127.0.0.1", "localhost"].includes(window.location.hostname)
  );
}

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// During local Vite development, same-origin proxy requests keep the backend
// session cookie attached reliably across the OAuth redirect round-trip.
export const apiBaseUrl = shouldUseLocalDevProxy() ? "" : configuredApiBaseUrl;

export function getApiBrowserBaseUrl() {
  if (apiBaseUrl) {
    return apiBaseUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "";
}

function getErrorMessage(payload) {
  if (!payload) {
    return "";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload.map(getErrorMessage).filter(Boolean).join(", ");
  }

  if (typeof payload === "object") {
    return getErrorMessage(payload.detail) || payload.message || "";
  }

  return "";
}

export function normalizeApiError(error) {
  const normalizedError = new Error(
    getErrorMessage(error.response?.data) ||
      (error.response
        ? "The API request could not be completed."
        : "Unable to reach the API. Check your backend URL and server status.")
  );

  normalizedError.status = error.response?.status;
  normalizedError.data = error.response?.data;
  normalizedError.isNetworkError = !error.response;

  return normalizedError;
}

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      [401, 403].includes(error.response?.status ?? 0)
    ) {
      window.dispatchEvent(new CustomEvent("rco2:auth-required"));
    }

    return Promise.reject(normalizeApiError(error));
  }
);

export async function requestWithFallback({
  method = "get",
  urls,
  data,
  params,
  signal
}) {
  if (!urls?.length) {
    throw new Error("No endpoint candidates were provided.");
  }

  let lastError = null;

  for (const url of urls) {
    try {
      const response = await apiClient.request({
        method,
        url,
        data,
        params,
        signal
      });

      return response.data;
    } catch (error) {
      lastError = error;

      if (
        ![404, 405].includes(error.status ?? 0) ||
        url === urls[urls.length - 1]
      ) {
        break;
      }
    }
  }

  throw lastError ?? new Error("Request failed.");
}
