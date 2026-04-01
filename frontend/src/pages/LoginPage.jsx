import { ArrowRight, Leaf, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";

import { useAppData } from "../context/AppDataContext";
import BrandLogo from "../components/brand/BrandLogo";

function getFriendlyAuthError(errorCode) {
  switch (errorCode) {
    case "oauth_not_configured":
      return "Google OAuth is not configured yet. Add a valid GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your local backend env file.";
    case "google_login_failed":
      return "Google sign-in could not be completed. Please try again.";
    case "login_failed":
      return "Your session could not be established. Please sign in again.";
    default:
      return "";
  }
}

function resolveNextPath(location) {
  const stateNext = location.state?.from?.pathname;
  const queryNext = new URLSearchParams(location.search).get("next");
  const candidate = stateNext || queryNext || "/";
  return candidate.startsWith("/") && !candidate.startsWith("//") ? candidate : "/";
}

export default function LoginPage() {
  const location = useLocation();
  const { auth, loading, login } = useAppData();
  const nextPath = resolveNextPath(location);
  const queryError = new URLSearchParams(location.search).get("error");
  const authMessage = getFriendlyAuthError(queryError) || auth.error?.message;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-80 w-80 rounded-full bg-forest-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-forest-300/10 blur-3xl" />
        <div className="absolute inset-0 grid-trace opacity-35" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="surface space-y-8 p-8 sm:p-10">
            <BrandLogo
              size="lg"
              className="pb-2"
              title="RCO2"
              subtitle="Rathore Carbon Network"
            />

            <div className="inline-flex items-center gap-2 rounded-full border border-forest-400/20 bg-forest-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-forest-100">
              <Leaf size={14} />
              Google-secured workspace access
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Sign in to your real carbon operations dashboard.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                Use your live Google account to access land records, carbon credits,
                and the marketplace APIs already connected in your environment.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/65">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                Secure OAuth callback
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                HttpOnly session cookie
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
                Protected API routes
              </span>
            </div>

            {authMessage ? (
              <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 px-5 py-4 text-sm text-amber-100">
                {authMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="primary-button"
                disabled={loading.bootstrapping}
                onClick={() => login(nextPath)}
              >
                Continue with Google
                <ArrowRight size={16} />
              </button>
              <p className="text-sm text-white/50">
                You'll return to your dashboard after Google verifies the session.
              </p>
            </div>
          </section>

          <aside className="surface-subtle flex flex-col justify-between gap-6 p-8 sm:p-10">
            <div className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-forest-400/20 bg-forest-400/10 text-forest-100">
                <ShieldCheck size={20} />
              </div>
              <h2 className="font-display text-2xl font-semibold text-white">
                Session-backed API access
              </h2>
              <p className="text-sm leading-7 text-white/60">
                Once signed in, the frontend reads your profile from the backend and
                all protected requests reuse the secure session automatically.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                  Backend
                </p>
                <p className="mt-2 text-sm text-white">Google OAuth + session cookie</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
                  Frontend
                </p>
                <p className="mt-2 text-sm text-white">
                  Protected routes + live profile bootstrapping
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
