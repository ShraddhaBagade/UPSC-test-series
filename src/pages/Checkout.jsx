import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { authFetch } from "../lib/authFetch";
import { useAuth } from "../lib/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

function readPendingPurchase() {
  try {
    const saved = sessionStorage.getItem("examBytePendingPurchase");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

function loadCashfree() {
  if (typeof window.Cashfree === "function") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          "Could not load secure checkout. Please check your connection and try again.",
        ),
      );

    document.body.appendChild(script);
  });
}

/*
  Guests use normal fetch.
  Signed-in buyers send their Supabase access token with the request.
*/
async function postJson(url, body, signedIn) {
  const request = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };

  const response = signedIn
    ? await authFetch(url, request)
    : await fetch(url, request);

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

export default function Checkout() {
  const { user } = useAuth();
  const [purchase] = useState(readPendingPurchase);

  const [customer, setCustomer] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("examByteCheckoutDraft"))
          ?.customer || { fullName: "", email: "", mobile: "" }
      );
    } catch {
      return { fullName: "", email: "", mobile: "" };
    }
  });

  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedSubjects =
    Array.isArray(purchase?.subjects) && purchase.subjects.length
      ? purchase.subjects
      : purchase?.title
        ? [purchase.title]
        : [];

  /*
    A logged-in buyer gets their previously saved checkout details.
    If the profile does not exist yet, their account email is still filled in.
  */
  useEffect(() => {
    if (!user?.email) return;

    let cancelled = false;

    async function loadSavedDetails() {
      try {
        const response = await authFetch("/api/my-profile");
        const result = await response.json();

        if (!response.ok || cancelled) return;

        const profile = result.profile;

        setCustomer((current) => ({
          fullName: profile?.fullName || current.fullName,
          email: user.email.trim().toLowerCase(),
          mobile: profile?.mobile || current.mobile,
        }));
      } catch {
        if (!cancelled) {
          setCustomer((current) => ({
            ...current,
            email: user.email.trim().toLowerCase(),
          }));
        }
      }
    }

    loadSavedDetails();

    return () => {
      cancelled = true;
    };
  }, [user?.id, user?.email]);

  function updateCustomer(event) {
    const { name, value } = event.target;

    setCustomer((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) setError("");
  }

  async function startPayment(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const fullName = customer.fullName.trim();
    const email = customer.email.trim().toLowerCase();
    const digits = customer.mobile.replace(/\D/g, "");

    const mobile =
      digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits;

    if (fullName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!acceptedPolicy) {
      setError("Please accept the Terms and Refund Policy to continue.");
      return;
    }

    if (!purchase || selectedSubjects.length === 0) {
      setError("Your PDF selection is missing. Please choose it again.");
      return;
    }

    if (user?.email && user.email.trim().toLowerCase() !== email) {
      setError(
        `You are signed in as ${user.email}. Please use that same email for this order.`,
      );
      return;
    }

    const cleanCustomer = { fullName, email, mobile };

    setBusy(true);

    try {
      const order = await postJson(
        "/api/create-order",
        {
          type: purchase.type,
          subjectIds: purchase.subjectIds,
          customer: cleanCustomer,
        },
        Boolean(user),
      );

      if (!order.paymentSessionId) {
        throw new Error("Could not start secure checkout. Please try again.");
      }

      sessionStorage.setItem(
        "examByteCheckoutDraft",
        JSON.stringify({
          purchase,
          customer: cleanCustomer,
          orderId: order.orderId,
        }),
      );

      await loadCashfree();

      const cashfree = window.Cashfree({
        mode: "production",
      });

      cashfree.checkout({
        paymentSessionId: order.paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Could not start payment. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFCFF] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-[#FFF9EA] via-[#F4F8FF] to-[#F6F0FF] px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-yellow-700 dark:text-slate-300">
            <ArrowLeft size={17} />
            Back to PDFs
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-950 px-6 py-7 text-white dark:border-slate-800 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
                ExamByte checkout
              </p>

              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Review your PDFs
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Complete payment securely through Cashfree.
              </p>

              <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold text-slate-950">
                <ShieldCheck size={14} />
                Secure payment
              </span>
            </div>

            {!purchase ? (
              <div className="px-6 py-12 text-center sm:px-8">
                <FileText size={36} className="mx-auto text-slate-400" />
                <h2 className="mt-4 text-xl font-bold">No PDFs selected</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Choose a subject or bundle to begin.
                </p>
                <Link
                  to="/"
                  className="mt-6 inline-flex rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white">
                  Browse PDFs
                </Link>
              </div>
            ) : (
              <>
                <section className="px-6 pt-7 sm:px-8">
                  <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-yellow-100 to-blue-100">
                      {purchase.image ? (
                        <img
                          src={purchase.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileText size={28} className="text-yellow-700" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-yellow-700">
                        {purchase.type === "bundle"
                          ? "PDF bundle"
                          : "Revision PDF"}
                      </p>

                      <h2 className="mt-1 text-lg font-extrabold">
                        {purchase.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedSubjects.length}{" "}
                        {selectedSubjects.length === 1 ? "PDF" : "PDFs"}{" "}
                        selected
                      </p>
                    </div>

                    <span className="shrink-0 text-xl font-extrabold">
                      {purchase.price}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                    <p className="text-sm font-bold">Included in your order</p>

                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {selectedSubjects.map((subject) => (
                        <li
                          key={subject}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-600"
                          />
                          {subject}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <form
                  onSubmit={startPayment}
                  className="space-y-5 px-6 py-8 sm:px-8">
                  <div>
                    <h2 className="text-xl font-extrabold">
                      Your delivery details
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {user
                        ? "Your saved details are used for this purchase."
                        : "No account is required before payment."}
                    </p>
                  </div>

                  <label
                    className="block text-sm font-semibold"
                    htmlFor="buyer-name">
                    <span className="inline-flex items-center gap-2">
                      <UserRound size={17} />
                      Full name
                    </span>

                    <input
                      id="buyer-name"
                      name="fullName"
                      autoComplete="name"
                      required
                      value={customer.fullName}
                      onChange={updateCustomer}
                      placeholder="Your full name"
                      className={inputClass}
                    />
                  </label>

                  <label
                    className="block text-sm font-semibold"
                    htmlFor="buyer-email">
                    <span className="inline-flex items-center gap-2">
                      <Mail size={17} />
                      Email address
                    </span>

                    <input
                      id="buyer-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      readOnly={Boolean(user)}
                      value={customer.email}
                      onChange={updateCustomer}
                      placeholder="you@example.com"
                      className={`${inputClass} ${
                        user
                          ? "cursor-not-allowed bg-slate-100 dark:bg-slate-700"
                          : ""
                      }`}
                    />

                    {user ? (
                      <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        Signed in as {user.email}. This purchase will be added
                        to your existing library.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-slate-500">
                        Use an email address you can access. You will use an OTP
                        sent to this email to open your PDF library later.
                      </p>
                    )}
                  </label>

                  <label
                    className="block text-sm font-semibold"
                    htmlFor="buyer-mobile">
                    <span className="inline-flex items-center gap-2">
                      <Phone size={17} />
                      Mobile number
                    </span>

                    <input
                      id="buyer-mobile"
                      name="mobile"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      value={customer.mobile}
                      onChange={updateCustomer}
                      placeholder="10-digit Indian mobile number"
                      className={inputClass}
                    />
                  </label>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                    <p className="font-bold">
                      Important: enter correct details
                    </p>
                    <p className="mt-1 leading-6">
                      Your purchase and secure PDF library are linked to this
                      email address. You must be able to receive an OTP at this
                      email to access your PDFs later. Please enter your own
                      correct mobile number and email address.
                    </p>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={acceptedPolicy}
                      onChange={(event) =>
                        setAcceptedPolicy(event.target.checked)
                      }
                      className="mt-1 h-4 w-4 accent-amber-500"
                    />

                    <span>
                      I agree to the{" "}
                      <Link
                        to="/terms"
                        className="font-bold text-yellow-700 underline">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/refund-policy"
                        className="font-bold text-yellow-700 underline">
                        Refunds & Cancellations Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {error && (
                    <p
                      role="alert"
                      className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                      {error}
                    </p>
                  )}

                  {notice && (
                    <p
                      role="status"
                      className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                      {notice}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-4 font-bold text-white shadow-md shadow-yellow-200 transition hover:bg-yellow-600 disabled:cursor-wait disabled:opacity-60">
                    {busy
                      ? "Opening secure payment…"
                      : `Continue to secure payment · ${purchase.price}`}

                    <ArrowRight size={18} />
                  </button>

                  <p className="text-center text-xs leading-5 text-slate-500">
                    Digital PDF · No physical shipping · Payment is processed
                    securely by Cashfree.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
