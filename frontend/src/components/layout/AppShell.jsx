import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useAppData } from "../../context/AppDataContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading } = useAppData();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-80 bg-forest-400/6 blur-3xl" />
        <div className="absolute inset-0 grid-trace opacity-35" />
      </div>

      <div className="relative flex min-h-screen">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-80">
          <Topbar onMenuToggle={() => setSidebarOpen((current) => !current)} />

          <main className="flex-1 px-4 pb-8 pt-4 sm:px-6 lg:px-10">
            {loading.bootstrapping ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner label="Loading your carbon portfolio" />
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
