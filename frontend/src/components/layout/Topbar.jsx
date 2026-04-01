import { LogOut, Menu, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

import { useAppData } from "../../context/AppDataContext";
import { formatCurrency } from "../../utils/formatters";
import BrandLogo from "../brand/BrandLogo";

export default function Topbar({ onMenuToggle }) {
  const { logout, sources, summary, user } = useAppData();

  async function handleLogout() {
    await logout();
    toast.success("Signed out successfully.");
  }

  return (
    <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 lg:px-10">
      <div className="surface-subtle flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <button type="button" className="icon-button lg:hidden" onClick={onMenuToggle}>
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-3">
            <BrandLogo size="sm" showWordmark={false} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                Carbon Operations
              </p>
              <h2 className="font-display text-lg font-semibold text-white">
                Farmer command center
              </h2>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-forest-400/20 bg-forest-400/10 px-4 py-2 md:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-forest-400/10 text-forest-200">
              <ShieldCheck size={16} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                Portfolio value
              </p>
              <p className="text-sm font-semibold text-white">
                {formatCurrency(summary.totalEarnings)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-white/40">
              {sources.credits === "derived" ? "Estimated from land records" : "Live API data"}
            </p>
          </div>

          <button type="button" className="secondary-button" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
