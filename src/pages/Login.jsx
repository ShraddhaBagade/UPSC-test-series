import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const requestedDestination = params.get("returnTo");
  const returnTo = ["/checkout", "/my-purchases"].includes(requestedDestination)
    ? requestedDestination
    : "/my-purchases";

  const [method, setMethod] = useState("otp");
  const [email, setEmail] = useState(() => {
    try {
      return (
        JSON.parse(sessionStorage.getItem("examByteCheckoutDraft"))?.customer
          ?.email || ""
      );
    } catch {
      return "";
    }
  });
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <p className="p-8">Checking your login…</p>;
  if (user) return <Navigate to={returnTo} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (method === "password") {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (loginError) {
          setError(loginError.message);
          return;
        }

        navigate(returnTo, { replace: true });
        return;
      }

      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: false },
      });

      if (sendError) {
        setError(sendError.message);
        return;
      }

      setCodeSent(true);
    } catch {
      setError("Could not complete login. Please try again.");
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
        setError(verifyError.message);
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

      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-12">
        <Link
          to="/"
          className="text-sm font-semibold text-amber-700 dark:text-amber-300">
          ← Back to notes
        </Link>

        <div className="mt-6 rounded-3xl bg-white p-7 shadow-lg dark:bg-slate-900">
          <h1 className="text-2xl font-extrabold">Log in</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {codeSent
              ? `Enter the one-time code sent to ${email}.`
              : "Choose how you want to log in."}
          </p>

          {!codeSent && (
            <div className="mt-6 grid grid-cols-2 gap-2">
              {[
                ["otp", "Email code"],
                ["password", "Password"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setMethod(value);
                    setError("");
                  }}
                  className={`rounded-xl border px-3 py-3 text-sm font-bold ${
                    method === value
                      ? "border-amber-500 bg-amber-100 text-slate-950"
                      : "border-slate-200 dark:border-slate-700"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {!codeSent ? (
            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              <label className="block text-sm font-semibold">
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              {method === "password" && (
                <label className="block text-sm font-semibold">
                  Password
                  <input
                    required
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </label>
              )}

              <button
                disabled={busy}
                className="w-full rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">
                {busy
                  ? method === "otp"
                    ? "Sending code…"
                    : "Logging in…"
                  : method === "otp"
                    ? "Send email code"
                    : "Log in"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-6 space-y-5">
              <label className="block text-sm font-semibold">
                One-time code
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>

              <button
                disabled={busy}
                className="w-full rounded-xl bg-amber-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50">
                {busy ? "Checking…" : "Verify and continue"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                  setError("");
                }}
                className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Use a different email
              </button>
            </form>
          )}

          {error && (
            <p
              role="alert"
              className="mt-4 text-sm font-semibold text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
            Need an account?{" "}
            <Link
              to={`/register?returnTo=${encodeURIComponent(returnTo)}`}
              className="font-semibold text-amber-700 dark:text-amber-300">
              Register
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
