import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

function checkoutEmail() {
  try {
    return (
      JSON.parse(sessionStorage.getItem("examByteCheckoutDraft"))?.customer
        ?.email || ""
    );
  } catch {
    return "";
  }
}

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requestedDestination = params.get("returnTo");

  const returnTo = ["/checkout", "/my-purchases"].includes(requestedDestination)
    ? requestedDestination
    : "/my-purchases";

  const [email, setEmail] = useState(checkoutEmail);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return <p className="p-8">Checking your login…</p>;
  }

  if (user) {
    return <Navigate to={returnTo} replace />;
  }

  async function sendCode(event) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setBusy(true);

    try {
      /*
        Existing email: signs in.
        New email: creates an ExamByte account after OTP verification.
      */
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });

      if (sendError) {
        setError(sendError.message);
        return;
      }

      setEmail(cleanEmail);
      setCodeSent(true);
    } catch {
      setError("Could not send your verification code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: "email",
      });

      if (verifyError) {
        setError("That code is invalid or has expired. Please try again.");
        return;
      }

      navigate(returnTo, { replace: true });
    } catch {
      setError("Could not verify the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-amber-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Header />

      <main className="mx-auto flex w-full max-w-lg flex-1 items-center px-5 py-12">
        <section className="w-full rounded-3xl bg-white p-7 shadow-lg dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            <ShieldCheck size={28} />
          </div>

          <h1 className="mt-5 text-center text-2xl font-extrabold">
            {codeSent ? "Enter your verification code" : "Access ExamByte"}
          </h1>

          <p className="mt-3 text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
            {codeSent
              ? `Enter the code sent to ${email}.`
              : "Create an ExamByte account or sign in to an existing account. If you have purchased PDFs, use the same email entered during checkout."}
          </p>

          {!codeSent ? (
            <form onSubmit={sendCode} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Mail size={17} />
                  Email address
                </span>

                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="font-bold">New or returning user?</p>
                <p className="mt-1">
                  Use one secure email-code flow. A new email creates your
                  ExamByte account after verification; an existing email signs
                  you in. Your library stays empty until you complete a verified
                  purchase.
                </p>
              </div>

              <button
                disabled={busy}
                className="w-full rounded-xl bg-amber-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-50">
                {busy ? "Sending code…" : "Send verification code"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold">
                One-time verification code
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter 6-digit code"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.35em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:text-sm placeholder:font-normal focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <button
                disabled={busy}
                className="w-full rounded-xl bg-amber-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-50">
                {busy ? "Verifying…" : "Verify and continue"}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                  setError("");
                }}
                className="w-full text-sm font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-50 dark:text-amber-300">
                Use a different email
              </button>
            </form>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          )}

          <Link
            to="/"
            className="mt-6 block text-center text-sm font-semibold text-slate-600 hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-300">
            ← Back to study material
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
