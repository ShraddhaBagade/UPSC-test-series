import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, BookOpen, RefreshCw } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TestDownloads from "../components/TestDownloads";
import { authFetch } from "../lib/authFetch";
import { useAuth } from "../lib/AuthContext";

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();

  async function loadPurchases() {
    setLoading(true);
    setError("");

    try {
      const response = await authFetch("/api/my-purchases", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not load purchases.");
      }
      setPurchases(result.purchases);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user) loadPurchases();
  }, [authLoading, user?.id]);

  if (authLoading) {
    return <p className="p-8">Checking your login…</p>;
  }

  if (!user) {
    return <Navigate to="/login?returnTo=/my-purchases" replace />;
  }
  return (
    <div className="flex min-h-screen flex-col bg-[#FBFCFF] text-slate-900 dark:bg-slate-950 dark:text-white">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-amber-700 dark:text-slate-300">
            <ArrowLeft size={17} /> Browse notes
          </Link>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-700 dark:text-amber-300">
                Your collection
              </p>
              <h1 className="mt-2 text-3xl font-extrabold">My Study Notes</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Your verified Test Mode purchases in this browser.
              </p>
            </div>

            <button
              type="button"
              onClick={loadPurchases}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {loading && (
            <p
              role="status"
              className="mt-8 text-slate-600 dark:text-slate-300">
              Loading your purchases…
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-8 rounded-xl bg-rose-50 p-4 text-rose-700 dark:bg-rose-950 dark:text-rose-200">
              {error}
            </p>
          )}

          {!loading && !error && purchases.length === 0 && (
            <div className="mt-8 rounded-3xl border border-amber-100 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <BookOpen size={38} className="mx-auto text-amber-500" />
              <h2 className="mt-4 text-xl font-bold">
                No purchases on this browser yet
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Choose a PDF or bundle and complete a new Test Mode payment.
              </p>
              <Link
                to="/"
                className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950">
                Explore subjects
              </Link>
            </div>
          )}

          <div className="mt-8 space-y-5">
            {purchases.map((purchase) => (
              <article
                key={purchase.orderId}
                className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      Test purchase
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold">
                      {purchase.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                      {new Date(purchase.capturedAt).toLocaleDateString()} ·{" "}
                      {purchase.subjectIds.length}{" "}
                      {purchase.subjectIds.length === 1
                        ? "subject"
                        : "subjects"}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Verified
                  </span>
                </div>

                <TestDownloads payment={purchase} />
              </article>
            ))}
          </div>

          <p className="mt-7 text-xs text-slate-500 dark:text-slate-400">
            Access works on this browser while its cookies are kept. Test
            payments download sample receipts, not the full PDFs.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
