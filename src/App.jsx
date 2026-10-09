import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import MyPurchases from "./pages/MyPurchases";
import { AuthProvider } from "./lib/AuthContext";

function ComingSoon({ title }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBFCFF] px-6 text-center text-slate-900 dark:bg-slate-950 dark:text-white">
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        This page is coming soon.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white dark:bg-amber-400 dark:text-slate-950">
        Back to ExamByte
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/test/:id"
            element={<ComingSoon title="Practice tests" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
