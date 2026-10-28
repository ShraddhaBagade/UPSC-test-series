import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CircleAlert,
  Mail,
  Pencil,
  Phone,
  ReceiptText,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
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

function formatAmount(amountPaise, currency = "INR") {
  const amount = Number(amountPaise);

  if (!Number.isFinite(amount)) return "Amount unavailable";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

async function getJson(url, signal) {
  const response = await authFetch(url, {
    cache: "no-store",
    signal,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Could not load your account.");
  }

  return result;
}

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export default function Account() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({ fullName: "", mobile: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendingOrderId, setResendingOrderId] = useState("");
  const [receiptMessage, setReceiptMessage] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    const controller = new AbortController();

    async function loadAccount() {
      setLoading(true);
      setError("");

      try {
        const [profileResult, purchasesResult] = await Promise.all([
          getJson("/api/my-profile", controller.signal),
          getJson("/api/my-purchases", controller.signal),
        ]);

        const nextProfile = profileResult.profile || {
          fullName: "",
          email: user.email || "",
          mobile: "",
        };

        setProfile(nextProfile);
        setForm({
          fullName: nextProfile.fullName || "",
          mobile: nextProfile.mobile || "",
        });
        setPurchases(
          Array.isArray(purchasesResult.purchases)
            ? purchasesResult.purchases
            : [],
        );
      } catch (caught) {
        if (caught.name !== "AbortError") {
          setError(
            caught instanceof Error
              ? caught.message
              : "Could not load your account.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAccount();

    return () => controller.abort();
  }, [authLoading, user?.id]);

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await authFetch("/api/my-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not save your profile.");
      }

      setProfile(result.profile);
      setForm({
        fullName: result.profile.fullName || "",
        mobile: result.profile.mobile || "",
      });
      setSuccess("Your profile has been updated.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function resendReceipt(orderId) {
    setResendingOrderId(orderId);
    setReceiptMessage("");
    setError("");

    try {
      const response = await authFetch("/api/resend-receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not resend your receipt.");
      }

      setReceiptMessage(result.message || "Your receipt has been sent.");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not resend your receipt.",
      );
    } finally {
      setResendingOrderId("");
    }
  }

  if (authLoading) {
    return <p className="p-8">Checking your account...</p>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FBFCFF] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Header />
        <main className="flex flex-1 items-center px-4 py-12">
          <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <UserRound className="mx-auto h-12 w-12 text-amber-500" />
            <h1 className="mt-5 text-2xl font-extrabold">
              Your ExamByte account
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Sign in using the email used at checkout to manage your profile,
              orders, and purchased study notes.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Link
                to="/login?returnTo=%2Faccount"
                className="rounded-xl bg-slate-900 px-5 py-3 font-extrabold text-white dark:bg-amber-400 dark:text-slate-950">
                Log in
              </Link>
              <Link
                to="/register?returnTo=%2Faccount"
                className="rounded-xl border border-slate-200 px-5 py-3 font-extrabold text-slate-800 dark:border-slate-700 dark:text-white">
                Register
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPdfs = purchases.reduce(
    (total, purchase) => total + (purchase.subjects?.length || 0),
    0,
  );

  const totalSpent = purchases.reduce(
    (total, purchase) => total + Number(purchase.amountPaise || 0),
    0,
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFCFF] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-600">
                My Account
              </p>
              <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
                Welcome, {profile?.fullName || "ExamByte learner"}
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-300">
                Manage your details, orders, and study material.
              </p>
            </div>

            <Link
              to="/my-purchases"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-extrabold text-white transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300">
              <BookOpen size={18} />
              My Study Notes
            </Link>
          </div>

          {receiptMessage ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
              {receiptMessage}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <CircleAlert className="mt-0.5 shrink-0" size={19} />
              <p>{error}</p>
            </div>
          ) : null}

          {loading ? (
            <p className="py-14 text-center text-slate-500">
              Loading your account...
            </p>
          ) : (
            <>
              <section className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <ReceiptText className="text-amber-500" size={22} />
                  <p className="mt-4 text-2xl font-extrabold">
                    {purchases.length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Verified orders
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <BookOpen className="text-amber-500" size={22} />
                  <p className="mt-4 text-2xl font-extrabold">{totalPdfs}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    PDFs in your library
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                  <ShieldCheck className="text-amber-500" size={22} />
                  <p className="mt-4 text-2xl font-extrabold">
                    {formatAmount(totalSpent)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Total verified purchases
                  </p>
                </div>
              </section>

              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
                      <UserRound size={22} />
                    </span>
                    <div>
                      <h2 className="text-xl font-extrabold">
                        Profile settings
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Keep your contact details up to date.
                      </p>
                    </div>
                  </div>

                  <form className="mt-7 space-y-5" onSubmit={saveProfile}>
                    <label className="block text-sm font-bold">
                      Full name
                      <input
                        value={form.fullName}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            fullName: event.target.value,
                          }))
                        }
                        maxLength={80}
                        className={inputClass}
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label className="block text-sm font-bold">
                      Email address
                      <span className="relative mt-2 block">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          value={profile?.email || user.email || ""}
                          className={`${inputClass} cursor-not-allowed pl-11 opacity-70`}
                          readOnly
                        />
                      </span>
                      <span className="mt-2 block text-xs font-normal text-slate-500">
                        Your email is verified through secure OTP sign-in. Email
                        changes will require separate verification.
                      </span>
                    </label>

                    <label className="block text-sm font-bold">
                      Mobile number
                      <span className="relative mt-2 block">
                        <Phone
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          value={form.mobile}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              mobile: event.target.value,
                            }))
                          }
                          inputMode="numeric"
                          maxLength={15}
                          autoComplete="tel"
                          className={`${inputClass} pl-11`}
                          placeholder="10-digit mobile number"
                          required
                        />
                      </span>
                    </label>

                    {success ? (
                      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                        {success}
                      </p>
                    ) : null}

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3.5 font-extrabold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60">
                      <Save size={18} />
                      {saving ? "Saving profile..." : "Save profile"}
                    </button>
                  </form>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-extrabold">Order history</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Your verified ExamByte purchases.
                      </p>
                    </div>

                    <ReceiptText className="text-amber-500" size={24} />
                  </div>

                  {purchases.length ? (
                    <div className="mt-6 space-y-4">
                      {purchases.map((purchase) => (
                        <article
                          key={purchase.orderId}
                          className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                <ShieldCheck size={13} />
                                Payment verified
                              </span>
                              <h3 className="mt-3 font-extrabold">
                                {purchase.title || "Study notes"}
                              </h3>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {formatDate(purchase.capturedAt)}
                              </p>
                            </div>

                            <p className="font-extrabold text-slate-900 dark:text-white">
                              {formatAmount(
                                purchase.amountPaise,
                                purchase.currency,
                              )}
                            </p>
                          </div>

                          <p className="mt-4 text-sm font-medium text-slate-700 dark:text-slate-200">
                            {purchase.subjects?.join(", ") || "Purchased PDF"}
                          </p>

                          <p className="mt-3 break-all text-xs text-slate-500 dark:text-slate-400">
                            Order reference: {purchase.orderId}
                          </p>
                          <button
                            type="button"
                            onClick={() => resendReceipt(purchase.orderId)}
                            disabled={resendingOrderId === purchase.orderId}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                            <Mail size={15} />
                            {resendingOrderId === purchase.orderId
                              ? "Sending receipt..."
                              : "Resend receipt"}
                          </button>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
                      <BookOpen className="mx-auto text-amber-500" size={28} />
                      <h3 className="mt-3 font-extrabold">
                        No verified purchases yet
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        If you bought as a guest, sign in with the same email
                        used during checkout. Your purchases will appear here
                        automatically after verification.
                      </p>
                      <Link
                        to="/"
                        className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-extrabold text-white dark:bg-amber-400 dark:text-slate-950">
                        Explore study material
                      </Link>
                    </div>
                  )}

                  <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
                    <Pencil size={17} className="text-amber-600" />
                    <Link
                      to="/contact"
                      className="font-bold text-blue-700 hover:underline dark:text-blue-300">
                      Need help with an order or account?
                    </Link>
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
