import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { AppDataProvider, useAppData } from "./context/AppDataContext";
import LoginPage from "./pages/LoginPage";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const MyLandPage = lazy(() => import("./pages/MyLandPage"));
const CarbonCreditsPage = lazy(() => import("./pages/CarbonCreditsPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function RouteLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner label="Loading view" />
    </div>
  );
}

function ProtectedAppShell() {
  const location = useLocation();
  const { auth, loading } = useAppData();

  if (loading.bootstrapping || !auth.ready) {
    return <RouteLoader />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <AppShell />;
}

function PublicOnlyRoute({ children }) {
  const location = useLocation();
  const { auth, loading } = useAppData();

  if (loading.bootstrapping || !auth.ready) {
    return <RouteLoader />;
  }

  if (auth.isAuthenticated) {
    const nextPath = location.state?.from?.pathname || "/";
    return <Navigate to={nextPath} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route element={<ProtectedAppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="/my-land" element={<MyLandPage />} />
        <Route path="/carbon-credits" element={<CarbonCreditsPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <Suspense fallback={<RouteLoader />}>
        <AppRoutes />
      </Suspense>
    </AppDataProvider>
  );
}
