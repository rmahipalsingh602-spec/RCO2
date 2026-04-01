import { apiClient, getApiBrowserBaseUrl, requestWithFallback } from "../client";
import { endpoints } from "../endpoints";

function sanitizeNextPath(nextPath = "/") {
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/";
  }

  return nextPath;
}

export const authService = {
  getProfile() {
    return requestWithFallback({ urls: endpoints.profile });
  },

  beginGoogleLogin(nextPath = "/") {
    const loginUrl = new URL("/auth/google-login", getApiBrowserBaseUrl());
    loginUrl.searchParams.set("next", sanitizeNextPath(nextPath));
    window.location.assign(loginUrl.toString());
  },

  logout() {
    return apiClient.post("/auth/logout");
  }
};
