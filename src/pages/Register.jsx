import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Phone, UserRound } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

export default function Register() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requestedDestination = params.get("returnTo");

  const returnTo = ["/checkout", "/my-purchases"].includes(
    requestedDestination,
  )
    ? requestedDestination
    : "/my-purchases";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(
    () => params.get("email")?.trim().toLowerCase() || "",
  );
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return <p className="p-8">Checking your account…</p>;
  }

  if (user) {
    return <Navigate to={returnTo} replace />;
  }

  function normaliseMobile(value) {
    const digits = value.replace(/\D/g, "");

    if (digits.length === 12 && digits.startsWith("91")) {
      return digits.slice(2);
    }

    return digits;
  }

  async function createAccount(event) {
    event.preventDefault();
    setError("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = normaliseMobile(mobile);

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(cleanMobile)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setBusy(true);

    try {
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: cleanName,
            mobile: cleanMobile,
          },
        },
      });

      if (sendError) {
        setError(sendError.message);
        return;
      }

      setEmail(cleanEmail);
      setMobile(cleanMobile);
      setCodeSent(true);
    } catch {
      setError("Could not create your account. Please try again.");
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

  const loginHref =
    `/login?returnTo=${encodeURIComponent(returnTo)}` +
    (email.trim()
      ? `&email=${encodeURIComponent(email.trim().toLowerCase())}`
      : "");

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900 dark:bg-slate-950 dark:text-white">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-9">
          <h1 className="text-2xl font-extrabold">
            {codeSent ? "Verify your email" : "Create your account"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {codeSent
              ? `Enter the 6-digit code sent to ${email}.`
              : "Create an ExamByte account to keep your purchases in one secure library."}
          </p>

          {!codeSent ? (
            <form onSubmit={createAccount} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold">
                <span className="inline-flex items-center gap-2">
                  <UserRound size={17} />
                  Full name
                </span>

                <input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

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

              <label className="block text-sm font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Phone size={17} />
                  Mobile number
                </span>

                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="10-digit Indian mobile number"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                If you purchased PDFs as a guest, use the same email address
                entered during checkout. Your verified purchases will appear in
                your Study Library after email verification.
              </p>

              <button
                disabled={busy}
                className="w-full rounded-xl bg-amber-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-50">
                {busy ? "Sending code…" : "Create account"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-7 space-y-5">
              <label className="block text-sm font-semibold">
                Verification code

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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-bold tracking-[0.3em] text-slate-900 outline-none transition placeholder:tracking-normal placeholder:text-sm placeholder:font-normal focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <button
                disabled={busy}
                className="w-full rounded-xl bg-amber-400 px-5 py-3.5 font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-50">
                {busy ? "Verifying…" : "Verify and create account"}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                  setError("");
                }}
                className="w-full text-sm font-semibold text-slate-600 hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-300">
                Change my details
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

          <div className="mt-7 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Already have an account?
            </p>

            <Link
              to={loginHref}
              className="mt-2 inline-block text-sm font-bold text-amber-700 hover:text-amber-800 dark:text-amber-300">
              Log in
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}