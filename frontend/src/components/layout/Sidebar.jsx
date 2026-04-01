import {
  BadgePercent,
  LayoutDashboard,
  MapPinned,
  ShoppingCart,
  UserRound,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";

import BrandLogo from "../brand/BrandLogo";

const navigation = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard
  },
  {
    label: "My Land",
    path: "/my-land",
    icon: MapPinned
  },
  {
    label: "Carbon Credits",
    path: "/carbon-credits",
    icon: BadgePercent
  },
  {
    label: "Marketplace",
    path: "/marketplace",
    icon: ShoppingCart
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserRound
  }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#040907]/95 px-5 py-6 backdrop-blur-2xl transition duration-300 lg:w-80 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-4">
            <BrandLogo size="md" />

            <p className="max-w-xs text-sm leading-6 text-white/60">
              One calm surface for land intelligence, credit generation, and
              marketplace decisions.
            </p>
          </div>

          <button type="button" className="icon-button lg:hidden" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-2xl px-4 py-3 transition duration-200 ${
                    isActive
                      ? "border border-forest-400/20 bg-forest-400/10 text-white"
                      : "border border-transparent text-white/70 hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isActive
                            ? "bg-forest-400/10 text-forest-200"
                            : "bg-white/[0.03] text-white/60"
                        }`}
                      >
                        <Icon size={18} />
                      </span>
                      <span className="font-medium">{item.label}</span>
                    </span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        isActive ? "bg-forest-300" : "bg-transparent"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Network Status
          </p>
          <h3 className="mt-3 font-display text-xl font-semibold text-white">
            Portfolio-ready UI
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Tailwind, routed views, charts, feedback states, and Axios services are
            wired for the backend upgrade path.
          </p>
        </div>
      </aside>
    </>
  );
}
