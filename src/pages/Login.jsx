// src/pages/Login.jsx
import React, { useRef, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash, FaBars, FaTimes } from "react-icons/fa";

export default function Login() {
  // header menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // auth form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  // feedback state
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // MFA (OTP) state
  const [step, setStep] = useState("login"); // "login" | "mfa" | "done"
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const otpRefs = useRef([]);

  // simple validators
  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validatePassword = (v) => v.length >= 6;

  // handle main login submit
  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Demo: If creds match this, proceed to MFA; otherwise show error
    if (email === "test@example.com" && password === "Password123") {
      setStep("mfa");
      setError("");
    } else {
      setError("Incorrect email or password.");
    }
  };

  // OTP input handling (6 separate inputs)
  const handleOtpChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return; // only single digit numeric
    const next = [...otp];
    next[idx] = val;
    setOtp(next);

    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const verifyOtp = () => {
    const code = otp.join("");
    if (code === "123456") {
      setStep("done");
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid verification code. Try 123456 for demo.");
    }
  };

  // CapsLock detection on key events in password field
  const onPasswordKey = (e) => {
    setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header (matches your style) */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <a href="/" className="hover:opacity-90">UPSC CSAT</a>
          </h1>

          <div className="hidden md:flex items-center space-x-8">
            <nav className="hidden md:flex space-x-6">
              {["Home", "Dashboard", "Test Series", "Pricing", "About", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "")}`}
                  className="text-white text-lg font-medium hover:text-gray-200 transition transform hover:scale-105"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex space-x-4">
              <a
                href="/login"
                className="bg-white text-blue-600 text-lg font-semibold px-5 py-2 rounded-lg shadow hover:bg-yellow-300 transition transform hover:scale-105"
              >
                Login
              </a>
              <a
                href="/register"
                className="bg-white text-blue-900 text-lg font-semibold px-5 py-2 rounded-lg shadow hover:bg-yellow-300 transition transform hover:scale-105"
              >
                Register
              </a>
            </div>
          </div>

          {/* mobile */}
          <div className="md:hidden flex items-center">
            <button
              aria-label="menu"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded"
            >
              {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden bg-blue-700 px-6 py-4 space-y-4">
            {["Home", "Dashboard", "Test Series", "Pricing", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase().replace(" ", "")}`}
                onClick={() => setMenuOpen(false)}
                className="block text-white font-semibold text-lg hover:text-gray-200 transition transform hover:scale-105"
              >
                {item}
              </a>
            ))}
            <div className="flex flex-col space-y-2 pt-4">
              <a href="/login" className="bg-white text-blue-600 font-semibold text-lg px-5 py-2 rounded-lg text-center">Login</a>
              <a href="/register" className="bg-yellow-400 text-blue-900 font-semibold text-lg px-5 py-2 rounded-lg text-center">Register</a>
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.12)] border border-gray-100 p-8">
          <h2 className="text-2xl font-semibold text-center text-blue-700 mb-2">Sign in to UPSC CSAT</h2>
          <p className="text-center text-gray-500 mb-6">Welcome back! Please sign in to continue</p>

          {/* Google */}
          <button className="w-full flex items-center justify-center border border-gray-300 rounded-md py-2 mb-4 bg-white text-gray-800 font-medium hover:bg-gray-50 transition shadow-sm">
            <FcGoogle size={20} className="mr-2" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <hr className="flex-1 border-gray-200" />
            <span className="text-sm text-gray-400">or</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Login form */}
          {step === "login" && (
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email (live validation) */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className={`w-full rounded-md px-3 text-sm outline-none shadow-sm
                  ${email === "" ? "border-gray-300" : validateEmail(email) ? "border-green-400" : "border-red-400"}
                  border`}
                aria-invalid={email !== "" && !validateEmail(email)}
              />

              {/* Password (flex wrapper to keep eye aligned) */}
              <div className={`flex items-center rounded-md border ${password === "" ? "border-gray-300" : validatePassword(password) ? "border-green-400" : "border-red-400"} shadow-sm`}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={onPasswordKey}
                  placeholder="Password"
                  className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="px-3 text-gray-600 flex-shrink-0"
                  aria-label="toggle password"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>

              {/* capslock */}
              {capsLock && <div className="text-yellow-600 text-xs">⚠️ Caps Lock is ON</div>}

              {/* remember + forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe((s) => !s)} />
                  <span className="text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
              </div>

              {/* error */}
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}

              {/* submit */}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition mt-1">Log In</button>
            </form>
          )}

          {/* MFA step (6 inputs) */}
          {step === "mfa" && (
            <div className="mt-4 text-center">
              <p className="text-gray-700 mb-3">Enter the 6-digit code sent to your device</p>

              <div className="flex justify-center gap-2 mb-3">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleOtpChange(e.target.value.replace(/\D/g, ""), i)}
                    onKeyDown={(e) => handleOtpKey(e, i)}
                    maxLength={1}
                    className="w-10 h-10 text-center border rounded-md outline-none"
                    inputMode="numeric"
                    aria-label={`digit-${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex gap-2 justify-center">
                <button onClick={verifyOtp} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Verify</button>
                <button onClick={() => { setStep("login"); setError(""); }} className="px-4 py-2 rounded-md border">Cancel</button>
              </div>

              {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
            </div>
          )}

          {/* done */}
          {step === "done" && (
            <div className="mt-4 text-center text-green-600 font-semibold">🎉 You're logged in!</div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white shadow-inner py-3 text-center text-gray-500 text-sm">
        © 2025 UPSC CSAT. All Rights Reserved.
      </footer>
    </div>
  );
}
