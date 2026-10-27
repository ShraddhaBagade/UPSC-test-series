import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  LibraryBig,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TestDownloads from "../components/TestDownloads";
import { authFetch } from "../lib/authFetch";
import { useAuth } from "../lib/AuthContext";

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();

  const loadPurchases = useCallback(async (signal) => {
    setLoading(true);
    setError("");

    try {
      const response = await authFetch("/api/my-purchases", {
        cache: "no-store",
        signal,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load your purchases.");
      }

      setPurchases(Array.isArray(result.purchases) ? result.purchases : []);
    } catch (caught) {
      if (caught.name === "AbortError") return;

      setError(
        caught instanceof Error
          ? caught.message
          : "Could not load your purchases. Please try again.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;

    const controller = new AbortController();
    loadPurchases(controller.signal);

    return () => controller.abort();
  }, [authLoading, user?.id, loadPurchases]);

  if (authLoading) {
    return <p className="p-8">Checking your login…</p>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f7f8fc] text-slate-900 dark:bg-slate-950 dark:text-white">
        <Header />

        <main className="flex flex-1 items-center px-4 py-12 sm:px-6">
          <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <LibraryBig size={31} />
            </div>

            <h1 className="mt-6 text-2xl font-extrabold sm:text-3xl">
              My Study Notes
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
              Log in to view your purchased PDFs and download your study
              material.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link
                to="/login?returnTo=/my-purchases"
                className="rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-800 transition hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800">
                Log in
              </Link>

              <Link
                to="/register?returnTo=/my-purchases"
                className="rounded-xl bg-amber-400 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300">
                Create account
              </Link>
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Purchased as a guest? Create an account using the same email
              address entered during checkout. Your verified PDFs will appear
              automatically after email verification.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block text-sm font-bold text-amber-700 hover:text-amber-800 dark:text-amber-300">
              Browse study material
            </Link>
          </section>
        </main>

        <Footer />
      </div>
    );
  }

  const subjectCount = purchases.reduce(
    (total, purchase) =>
      total +
      (Array.isArray(purchase.subjectIds) ? purchase.subjectIds.length : 0),
    0,
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f8fc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <Header />

      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-300">
            <ArrowLeft size={17} />
            Browse study material
          </Link>

          <section className="mt-7 overflow-hidden rounded-[2rem] border border-amber-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-white px-6 py-8 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 sm:px-9 sm:py-10">
              <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/10" />

              <div className="relative flex flex-wrap items-end justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-amber-800 dark:border-slate-700 dark:bg-slate-900/80 dark:text-amber-300">
                    <LibraryBig size={14} />
                    Your study library
                  </div>

                  <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    My Study Notes
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                    Your purchased subjects, together in one place. Open a
                    purchase below to access its study material.
                  </p>

                  <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Signed in as{" "}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {user.email}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loadPurchases()}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300">
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  {loading ? "Refreshing…" : "Refresh library"}
                </button>
              </div>

              <div className="relative mt-7 grid max-w-lg grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/80 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Purchases
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {purchases.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/75 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Subjects
                  </p>
                  <p className="mt-1 text-2xl font-extrabold">{subjectCount}</p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8">
              {loading && (
                <p
                  role="status"
                  className="py-8 text-slate-600 dark:text-slate-300">
                  Loading your study library…
                </p>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                  <p className="font-bold">Your library could not be loaded</p>
                  <p className="mt-1 text-sm">{error}</p>
                  <button
                    type="button"
                    onClick={() => loadPurchases()}
                    className="mt-4 rounded-lg bg-rose-700 px-4 py-2 text-sm font-bold text-white hover:bg-rose-800">
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && purchases.length === 0 && (
                <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-950/40">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm dark:bg-slate-800 dark:text-amber-300">
                    <BookOpen size={26} />
                  </div>
                  <h2 className="mt-5 text-xl font-extrabold">
                    Your library is ready for its first purchase
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Once a payment is verified, your subjects will appear here
                    and stay linked to your account.
                  </p>
                  <Link
                    to="/"
                    className="mt-6 inline-flex rounded-xl bg-amber-400 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-amber-300">
                    Explore study notes
                  </Link>
                </div>
              )}

              {!loading && !error && purchases.length > 0 && (
                <div className="space-y-6">
                  {purchases.map((purchase, index) => {
                    const count = Array.isArray(purchase.subjectIds)
                      ? purchase.subjectIds.length
                      : 0;

                    return (
                      <article
                        key={purchase.orderId || index}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-7">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                <ShieldCheck size={14} />
                                Payment verified
                              </span>
                            </div>

                            <h2 className="mt-3 text-xl font-extrabold sm:text-2xl">
                              {purchase.title || "Study notes"}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              Purchased {formatDate(purchase.capturedAt)}{" "}
                              <span className="mx-1">·</span>
                              {count} {count === 1 ? "subject" : "subjects"}
                            </p>
                          </div>

                          <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Order {purchase.orderId || "—"}
                          </span>
                        </div>

                        <div className="p-5 sm:p-7">
                          <TestDownloads payment={purchase} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <p className="mt-7 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Purchases are linked to your ExamByte account. Download links
                are secure and available only for PDFs included in your verified
                purchase.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
