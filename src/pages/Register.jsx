import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

export default function Register() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const stateFrom =
    typeof location.state?.from === "string"
      ? location.state.from
      : location.state?.from?.pathname;

  const requestedDestination =
    searchParams.get("returnTo") || searchParams.get("redirect") || stateFrom;

  const destination = ["/checkout", "/my-purchases"].includes(
    requestedDestination,
  )
    ? requestedDestination
    : "/my-purchases";

  const [method, setMethod] = useState("otp");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(event) {
    event.preventDefault();
    setError("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    if (method === "password") {
      if (password.length < 8) {
        setError("Use a password with at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Your passwords do not match.");
        return;
      }
    }

    setBusy(true);

    try {
      const userData = {
        full_name: cleanName,
        mobile: cleanMobile,
      };

      if (method === "password") {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: userData },
        });

        if (signupError) {
          setError(signupError.message);
          return;
        }

        // When email confirmation is disabled, Supabase may create
        // the session immediately.
        if (data.session) {
          navigate(destination, { replace: true });
          return;
        }
      } else {
        const { error: sendError } = await supabase.auth.signInWithOtp({
          email: cleanEmail,
          options: {
            shouldCreateUser: true,
            data: userData,
          },
        });

        if (sendError) {
          setError(sendError.message);
          return;
        }
      }

      setEmail(cleanEmail);
      setCodeSent(true);
    } catch {
      setError("Could not start registration. Please try again.");
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

      navigate(destination, { replace: true });
    } catch {
      setError("Could not verify the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="p-8">Checking your login…</p>;
  }

  if (user) {
    return <Navigate to={destination} replace />;
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-6 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link to="/" className="text-xl font-extrabold tracking-tight">
            Exam<span className="text-amber-500">Byte</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">
            <ArrowLeft size={16} />
            Back to materials
          </Link>
        </header>

        <section className="mx-auto mt-10 max-w-xl rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900 sm:p-10">
          <p className="text-sm font-semibold text-amber-600">GET STARTED</p>

          <h1 className="mt-2 text-3xl font-bold">
            {codeSent ? "Verify your email" : "Create your account"}
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {codeSent
              ? `Enter the one-time code sent to ${email}.`
              : "Add your details, then choose how you want to secure your account."}
          </p>

          {!codeSent ? (
            <form onSubmit={sendCode} className="mt-7 space-y-4">
              <label className="block text-sm font-medium">
                Full name
                <input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                />
              </label>

              <label className="block text-sm font-medium">
                Email address
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                />
              </label>

              <label className="block text-sm font-medium">
                Mobile number
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  ["otp", "Email code"],
                  ["password", "Set a password"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={method === value}
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

              {method === "password" && (
                <>
                  <label className="block text-sm font-medium">
                    Password
                    <input
                      required
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Confirm password
                    <input
                      required
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </label>
                </>
              )}

              <button
                disabled={busy}
                className="w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">
                {busy
                  ? method === "otp"
                    ? "Sending code…"
                    : "Creating account…"
                  : method === "otp"
                    ? "Send email code"
                    : "Create account"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-7 space-y-4">
              <label className="block text-sm font-medium">
                One-time code
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
                />
              </label>

              <button
                disabled={busy}
                className="w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60">
                {busy ? "Verifying…" : "Verify and create account"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                  setError("");
                }}
                className="w-full text-sm font-semibold text-amber-700 dark:text-amber-300">
                Change my details
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
            Already registered?{" "}
            <Link
              to={`/login?returnTo=${encodeURIComponent(destination)}`}
              className="font-semibold text-amber-700 dark:text-amber-300">
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
