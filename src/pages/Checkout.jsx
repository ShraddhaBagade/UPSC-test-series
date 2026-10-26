import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { authFetch } from "../lib/authFetch";
import { useAuth } from "../lib/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import TestDownloads from "../components/TestDownloads";

function readPendingPurchase() {
  try {
    const saved = sessionStorage.getItem("examBytePendingPurchase");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-400 dark:focus:ring-amber-950";

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error("Could not load Razorpay Checkout. Check your connection."),
      );

    document.body.appendChild(script);
  });
}

async function postJson(url, body) {
  const response = await authFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok && response.status !== 202) {
    throw new Error(data.error || "Something went wrong. Please try again.");
  }

  return data;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
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

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [verifiedPayment, setVerifiedPayment] = useState(null);

  const selectedSubjects =
    Array.isArray(purchase?.subjects) && purchase.subjects.length
      ? purchase.subjects
      : purchase?.title
        ? [purchase.title]
        : [];

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

    if (authLoading) {
      setNotice("Checking your login. Please wait a moment.");
      return;
    }

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
      setError("Please enter a valid email address for your PDF.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a 10-digit mobile or WhatsApp number.");
      return;
    }

    if (!purchase || selectedSubjects.length === 0) {
      setError("Your PDF selection is missing. Please choose it again.");
      return;
    }

    setBusy(true);

    if (!user) {
      sessionStorage.setItem(
        "examByteCheckoutDraft",
        JSON.stringify({
          purchase,
          customer: { fullName, email, mobile },
        }),
      );

      navigate("/login?returnTo=/checkout");
      return;
    }

    if (user.email_confirmed_at && user.email.toLowerCase() !== email) {
      setError(
        `You're signed in as ${user.email}. Use that email here, or log out and sign in with the other email before buying.`,
      );
      setBusy(false);
      return;
    }

    try {
      const cleanCustomer = {
        fullName,
        email,
        mobile,
      };

      const order = await postJson("/api/orders", {
        type: purchase.type,
        subjectIds: purchase.subjectIds,
        customer: cleanCustomer,
      });

      if (!order.keyId?.startsWith("rzp_test_")) {
        throw new Error("Only Test Mode payments are enabled.");
      }

      await loadRazorpay();

      sessionStorage.setItem(
        "examByteCheckoutDraft",
        JSON.stringify({
          purchase,
          customer: cleanCustomer,
          orderId: order.orderId,
        }),
      );

      setCustomer(cleanCustomer);

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ExamByte",
        description: order.title,
        order_id: order.orderId,

        prefill: {
          name: fullName,
          email,
          contact: `+91${mobile}`,
        },

        theme: {
          color: "#eab308",
        },

        handler: async (payment) => {
          setBusy(true);

          try {
            const result = await postJson("/api/verify", payment);

            if (result.verified) {
              setVerifiedPayment(result);
              setNotice("");
            } else {
              setNotice(
                result.message ||
                  "Payment is awaiting capture. Please check again later.",
              );
            }
          } catch (verificationError) {
            setError(verificationError.message);
          } finally {
            setBusy(false);
          }
        },

        modal: {
          ondismiss: () => setBusy(false),
        },
      });

      checkout.on("payment.failed", (failure) => {
        setError(
          failure.error?.description ||
            "Test payment failed. Please try again.",
        );
        setBusy(false);
      });

      checkout.open();
    } catch (paymentError) {
      setError(
        paymentError instanceof TypeError
          ? "Cannot reach the payment server. Start it and check the Vite proxy."
          : paymentError.message,
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-yellow-700 dark:text-slate-300 dark:hover:text-amber-300">
            <ArrowLeft size={17} />
            Back to PDFs
          </Link>

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
            <div className="border-b border-slate-100 bg-slate-950 px-6 py-7 text-white dark:border-slate-800 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
                ExamByte checkout
              </p>

              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                Review your PDFs
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                Enter your details before opening Razorpay Test Mode.
              </p>

              <span className="mt-3 inline-block rounded-full bg-amber-300 px-3 py-1 text-xs font-extrabold text-slate-950">
                TEST MODE · No real charge
              </span>
            </div>

            {!purchase ? (
              <div className="px-6 py-12 text-center sm:px-8">
                <FileText size={36} className="mx-auto text-slate-400" />

                <h2 className="mt-4 text-xl font-bold">No PDFs selected</h2>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Choose a subject or bundle to begin.
                </p>

                <Link
                  to="/"
                  className="mt-6 inline-flex rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white dark:bg-amber-400 dark:text-slate-950">
                  Browse PDFs
                </Link>
              </div>
            ) : (
              <>
                <section
                  className="px-6 pt-7 sm:px-8"
                  aria-label="Order summary">
                  <div className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-yellow-100 to-blue-100 dark:from-slate-700 dark:to-slate-800">
                      {purchase.image ? (
                        <img
                          src={purchase.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FileText
                          size={28}
                          className="text-yellow-700 dark:text-amber-300"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-yellow-700 dark:text-amber-300">
                        {purchase.type === "bundle"
                          ? "PDF bundle"
                          : "PDF notes"}
                      </p>

                      <h2 className="mt-1 text-lg font-extrabold dark:text-white">
                        {purchase.title}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                        {selectedSubjects.length}{" "}
                        {selectedSubjects.length === 1 ? "PDF" : "PDFs"}{" "}
                        selected
                      </p>
                    </div>

                    <span className="shrink-0 text-xl font-extrabold text-slate-900 dark:text-white">
                      {purchase.price}
                    </span>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-100 p-4 dark:border-slate-700">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Included in your order
                    </p>

                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {selectedSubjects.map((subject) => (
                        <li
                          key={subject}
                          className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                          />
                          {subject}
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                {verifiedPayment ? (
                  <section className="px-6 py-8 sm:px-8" aria-live="polite">
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-700/40 dark:bg-emerald-400/10">
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        Test payment verified
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                        Razorpay confirmed this simulated payment as captured.
                        You can test the selected-subject download buttons
                        below.
                      </p>

                      <p className="mt-3 break-all text-xs text-slate-600 dark:text-slate-300">
                        Payment ID: {verifiedPayment.paymentId}
                      </p>
                    </div>

                    <TestDownloads payment={verifiedPayment} />

                    <Link
                      to="/my-purchases"
                      className="mt-5 inline-flex rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 hover:bg-amber-300">
                      Open My Study Notes
                    </Link>
                  </section>
                ) : (
                  <form
                    onSubmit={startPayment}
                    className="space-y-5 px-6 py-8 sm:px-8">
                    <div>
                      <h2 className="text-xl font-extrabold">Your details</h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        All three fields are required.
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
                        value={customer.email}
                        onChange={updateCustomer}
                        placeholder="you@example.com"
                        className={inputClass}
                      />

                      <span className="mt-1 block text-xs font-normal text-slate-500 dark:text-slate-400">
                        Enter the email where you want your PDFs once delivery
                        is enabled.
                      </span>
                    </label>

                    <label
                      className="block text-sm font-semibold"
                      htmlFor="buyer-mobile">
                      <span className="inline-flex items-center gap-2">
                        <Phone size={17} />
                        Mobile / WhatsApp number
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
                        placeholder="10-digit mobile number"
                        className={inputClass}
                      />
                    </label>

                    {error && (
                      <p
                        role="alert"
                        className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-200">
                        {error}
                      </p>
                    )}

                    {notice && (
                      <p
                        role="status"
                        className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        {notice}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={busy || authLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-4 font-bold text-white shadow-md shadow-yellow-200 transition hover:bg-yellow-600 disabled:cursor-wait disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950 dark:shadow-none dark:hover:bg-amber-300">
                      {authLoading
                        ? "Checking your login…"
                        : busy
                          ? "Preparing test payment…"
                          : `Continue to test payment · ${purchase.price}`}

                      <ArrowRight size={18} />
                    </button>

                    <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                      The server calculates the final amount. Test payments use
                      simulated money.
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
