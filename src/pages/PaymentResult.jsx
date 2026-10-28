import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const statusStyles = {
  paid: {
    icon: CheckCircle2,
    iconClass: "bg-emerald-100 text-emerald-700",
    heading: "Payment successful",
    description:
      "Your payment has been verified and your study material is ready.",
  },
  pending: {
    icon: Clock3,
    iconClass: "bg-amber-100 text-amber-700",
    heading: "Payment is being verified",
    description:
      "Please do not pay again. Some bank and UPI payments can take a moment to be confirmed.",
  },
  failed: {
    icon: XCircle,
    iconClass: "bg-rose-100 text-rose-700",
    heading: "Payment was not completed",
    description:
      "No study material has been unlocked for this order. You can return and try payment again.",
  },
  error: {
    icon: XCircle,
    iconClass: "bg-rose-100 text-rose-700",
    heading: "We could not check the payment",
    description:
      "Please try checking again. If your account was debited, contact ExamByte support with this order reference.",
  },
};

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("cashfree_order_id") || "";
  const [status, setStatus] = useState("checking");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function checkPayment() {
    if (!orderId) {
      setStatus("error");
      setError("Payment reference is missing.");
      return;
    }

    setStatus("checking");
    setError("");

    try {
      const response = await fetch(
        `/api/payment-status?order_id=${encodeURIComponent(orderId)}`,
        { cache: "no-store" },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Could not check payment status.");
      }

      setTitle(result.title || "");
      setStatus(["paid", "pending", "failed"].includes(result.status)
        ? result.status
        : "error");
    } catch (caught) {
      setStatus("error");
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not check payment status.",
      );
    }
  }

  useEffect(() => {
    checkPayment();
  }, [orderId]);

  const details = statusStyles[status];

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFCFF] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="flex flex-1 items-center bg-gradient-to-br from-[#FFF9EA] via-[#F4F8FF] to-[#F6F0FF] px-4 py-12 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 sm:px-6">
        <section className="mx-auto w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-10">
          {status === "checking" ? (
            <>
              <RefreshCw className="mx-auto h-12 w-12 animate-spin text-amber-500" />
              <h1 className="mt-6 text-2xl font-extrabold sm:text-3xl">
                Checking your payment
              </h1>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                ExamByte is securely confirming the result with Cashfree.
              </p>
            </>
          ) : (
            <>
              <span
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${details.iconClass}`}>
                <details.icon size={34} />
              </span>

              <h1 className="mt-6 text-2xl font-extrabold sm:text-3xl">
                {details.heading}
              </h1>

              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {details.description}
              </p>

              {title ? (
                <p className="mt-4 font-bold text-slate-800 dark:text-slate-100">
                  {title}
                </p>
              ) : null}

              {orderId ? (
                <p className="mt-3 break-all text-xs text-slate-500 dark:text-slate-400">
                  Order reference: {orderId}
                </p>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </p>
              ) : null}

              {status === "paid" ? (
                <div className="mt-7 space-y-3">
                  <Link
                    to="/my-purchases"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-extrabold text-white transition hover:bg-emerald-700">
                    <ShieldCheck size={19} />
                    Open My Study Notes
                  </Link>

                  <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Bought as a guest? Sign in or register using the same email
                    used during checkout to access your library.
                  </p>
                </div>
              ) : (
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={checkPayment}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                    <RefreshCw size={18} />
                    Check again
                  </button>

                  <Link
                    to="/"
                    className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-5 py-3 font-extrabold text-slate-950 transition hover:bg-amber-300">
                    Return to ExamByte
                  </Link>
                </div>
              )}

              {status !== "paid" ? (
                <Link
                  to="/contact"
                  className="mt-5 inline-block text-sm font-bold text-blue-700 hover:underline dark:text-blue-300">
                  Need payment help? Contact ExamByte
                </Link>
              ) : null}
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
