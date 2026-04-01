import { createContext, useContext, useEffect, useState } from "react";

import { authService } from "../api/services/authService";
import { creditService } from "../api/services/creditService";
import { earningsService } from "../api/services/earningsService";
import { landService } from "../api/services/landService";
import { marketService } from "../api/services/marketService";
import {
  buildCreditsFromLands,
  buildDashboardSummary,
  normalizeCredit,
  normalizeEarnings,
  normalizeLand,
  normalizeMarketListing,
  normalizeUser
} from "../utils/transforms";

const AppDataContext = createContext(null);
const defaultUser = normalizeUser();
const defaultSources = {
  credits: "api"
};
const defaultErrors = {
  user: null,
  lands: null,
  credits: null,
  earnings: null,
  market: null
};
const defaultLoading = {
  bootstrapping: true,
  user: false,
  lands: false,
  credits: false,
  earnings: false,
  market: false,
  submittingLand: false,
  verifyingCredit: false,
  purchasing: false
};
const defaultEarnings = normalizeEarnings();

export function AppDataProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    ready: false,
    error: null
  });
  const [user, setUser] = useState(defaultUser);
  const [lands, setLands] = useState([]);
  const [credits, setCredits] = useState([]);
  const [earnings, setEarnings] = useState(defaultEarnings);
  const [marketListings, setMarketListings] = useState([]);
  const [sources, setSources] = useState(defaultSources);
  const [loading, setLoading] = useState(defaultLoading);
  const [errors, setErrors] = useState(defaultErrors);

  const summary = buildDashboardSummary({ lands, credits, earnings });

  useEffect(() => {
    void initializeApp();
  }, []);

  useEffect(() => {
    function handleAuthRequired() {
      resetSession();
    }

    window.addEventListener("rco2:auth-required", handleAuthRequired);
    return () => window.removeEventListener("rco2:auth-required", handleAuthRequired);
  }, []);

  function resetWorkspaceState() {
    setUser(defaultUser);
    setLands([]);
    setCredits([]);
    setEarnings(defaultEarnings);
    setMarketListings([]);
    setSources(defaultSources);
    setErrors(defaultErrors);
  }

  function resetSession(authError = null) {
    resetWorkspaceState();
    setAuth({
      isAuthenticated: false,
      ready: true,
      error: authError
    });
    setLoading((current) => ({
      ...current,
      bootstrapping: false,
      user: false,
      lands: false,
      credits: false,
      earnings: false,
      market: false,
      submittingLand: false,
      verifyingCredit: false,
      purchasing: false
    }));
  }

  async function initializeApp() {
    setLoading((current) => ({ ...current, bootstrapping: true }));

    const currentUser = await loadUser({ allowGuest: true });
    if (currentUser) {
      await hydrateWorkspace();
    }

    setAuth((current) => ({ ...current, ready: true }));
    setLoading((current) => ({
      ...current,
      bootstrapping: false
    }));
  }

  async function hydrateWorkspace() {
    const loadedLands = await loadLands();

    await Promise.allSettled([
      loadCredits(loadedLands),
      loadEarnings(),
      loadMarket()
    ]);
  }

  async function loadUser({ allowGuest = false } = {}) {
    setLoading((current) => ({ ...current, user: true }));

    try {
      const response = await authService.getProfile();
      const normalized = normalizeUser(response);
      setUser(normalized);
      setAuth({
        isAuthenticated: true,
        ready: true,
        error: null
      });
      setErrors((current) => ({ ...current, user: null }));
      return normalized;
    } catch (error) {
      const isAuthError = [401, 403].includes(error.status ?? 0);

      if (isAuthError) {
        resetWorkspaceState();
        setAuth({
          isAuthenticated: false,
          ready: true,
          error: null
        });
        setErrors((current) => ({ ...current, user: null }));
        return null;
      }

      if (allowGuest) {
        resetWorkspaceState();
        setAuth({
          isAuthenticated: false,
          ready: true,
          error: error
        });
        setErrors((current) => ({ ...current, user: error }));
        return null;
      }

      setUser(defaultUser);
      setAuth({
        isAuthenticated: false,
        ready: true,
        error: error
      });
      setErrors((current) => ({ ...current, user: error }));
      return null;
    } finally {
      setLoading((current) => ({ ...current, user: false }));
    }
  }

  async function loadLands() {
    setLoading((current) => ({ ...current, lands: true }));

    try {
      const response = await landService.getMyLand();
      const normalized = Array.isArray(response) ? response.map(normalizeLand) : [];
      setLands(normalized);
      setErrors((current) => ({ ...current, lands: null }));
      return normalized;
    } catch (error) {
      setLands([]);
      setErrors((current) => ({ ...current, lands: error }));
      return [];
    } finally {
      setLoading((current) => ({ ...current, lands: false }));
    }
  }

  async function loadCredits(referenceLands = lands) {
    setLoading((current) => ({ ...current, credits: true }));

    try {
      const response = await creditService.getMyCredits();
      const normalized = Array.isArray(response)
        ? response.map(normalizeCredit)
        : [];

      setCredits(normalized);
      setSources((current) => ({ ...current, credits: "api" }));
      setErrors((current) => ({ ...current, credits: null }));
      return normalized;
    } catch (error) {
      if ([404, 405].includes(error.status ?? 0)) {
        const derivedCredits = buildCreditsFromLands(referenceLands);
        setCredits(derivedCredits);
        setSources((current) => ({ ...current, credits: "derived" }));
        setErrors((current) => ({ ...current, credits: null }));
        return derivedCredits;
      }

      setCredits([]);
      setSources((current) => ({ ...current, credits: "api" }));
      setErrors((current) => ({ ...current, credits: error }));
      return [];
    } finally {
      setLoading((current) => ({ ...current, credits: false }));
    }
  }

  async function loadEarnings() {
    setLoading((current) => ({ ...current, earnings: true }));

    try {
      const response = await earningsService.getMyEarnings();
      const normalized = normalizeEarnings(response);
      setEarnings(normalized);
      setErrors((current) => ({ ...current, earnings: null }));
      return normalized;
    } catch (error) {
      setEarnings(defaultEarnings);
      setErrors((current) => ({ ...current, earnings: error }));
      return null;
    } finally {
      setLoading((current) => ({ ...current, earnings: false }));
    }
  }

  async function loadMarket() {
    setLoading((current) => ({ ...current, market: true }));

    try {
      const response = await marketService.getListings();
      const normalized = Array.isArray(response)
        ? response.map(normalizeMarketListing)
        : [];

      setMarketListings(normalized);
      setErrors((current) => ({ ...current, market: null }));
      return normalized;
    } catch (error) {
      setMarketListings([]);
      setErrors((current) => ({ ...current, market: error }));
      return [];
    } finally {
      setLoading((current) => ({ ...current, market: false }));
    }
  }

  async function refreshAll() {
    if (!auth.isAuthenticated) {
      return;
    }

    const refreshedUser = await loadUser();
    if (!refreshedUser) {
      return;
    }

    const latestLands = await loadLands();
    await Promise.allSettled([
      loadCredits(latestLands),
      loadEarnings(),
      loadMarket()
    ]);
  }

  async function addLand(payload) {
    setLoading((current) => ({ ...current, submittingLand: true }));

    try {
      const response = await landService.addLand(payload);
      const createdLand = normalizeLand(response);
      const nextLands = [createdLand, ...lands];

      setLands(nextLands);
      setErrors((current) => ({ ...current, lands: null }));
      await Promise.allSettled([loadCredits(nextLands), loadEarnings()]);

      return createdLand;
    } finally {
      setLoading((current) => ({ ...current, submittingLand: false }));
    }
  }

  async function buyCredits(payload) {
    setLoading((current) => ({ ...current, purchasing: true }));

    try {
      const result = await marketService.buyCredits(payload);
      await Promise.allSettled([loadMarket(), loadCredits(), loadEarnings()]);
      return result;
    } finally {
      setLoading((current) => ({ ...current, purchasing: false }));
    }
  }

  async function verifyCredit(creditId) {
    setLoading((current) => ({ ...current, verifyingCredit: true }));

    try {
      const result = await creditService.verifyCredit(creditId);
      await Promise.allSettled([loadCredits(), loadLands(), loadEarnings(), loadMarket()]);
      return result;
    } finally {
      setLoading((current) => ({ ...current, verifyingCredit: false }));
    }
  }

  function login(nextPath = "/") {
    authService.beginGoogleLogin(nextPath);
  }

  async function logout() {
    try {
      await authService.logout();
    } catch {
      // Even if the backend session is already gone, clear the frontend state.
    } finally {
      resetSession();
    }
  }

  return (
    <AppDataContext.Provider
      value={{
        auth,
        user,
        lands,
        credits,
        earnings,
        marketListings,
        summary,
        sources,
        loading,
        errors,
        login,
        loadUser,
        loadLands,
        loadCredits,
        loadEarnings,
        loadMarket,
        refreshAll,
        addLand,
        verifyCredit,
        buyCredits,
        logout
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider.");
  }

  return context;
}
