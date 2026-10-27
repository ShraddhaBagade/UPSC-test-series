import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Menu, Moon, Sun, UserPlus, X } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

const navigation = [
  { label: "Study Material", href: "/#study-material" },
  { label: "Bundles", href: "/#bundles" },
  { label: "Contact", href: "/#contact" },
];

const allowedDestinations = ["/checkout", "/my-purchases"];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light",
  );

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const requestedReturnTo = allowedDestinations.includes(location.pathname)
    ? location.pathname
    : searchParams.get("returnTo") || searchParams.get("redirect");

  const returnTo = allowedDestinations.includes(requestedReturnTo)
    ? requestedReturnTo
    : "/my-purchases";

  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/register?returnTo=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Could not log out:", error.message);
      return;
    }

    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 text-slate-900 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 dark:text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
        <Link
          to="/"
          className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Exam<span className="text-amber-500">Byte</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition hover:text-amber-700 dark:text-slate-300 dark:hover:text-amber-300">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            {theme === "light" ? "Dark" : "Light"}
          </button>

          {!authLoading &&
            (user ? (
              <>
                <span
                  className="max-w-48 truncate text-sm text-slate-600 dark:text-slate-300"
                  title={user.email || ""}>
                  {user.email}
                </span>

                <Link
                  to="/my-purchases"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                  My Study Notes
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300">
                  <LogOut size={16} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to={loginHref}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800">
                  <LogIn size={16} />
                  Login
                </Link>

                <Link
                  to={registerHref}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300">
                  <UserPlus size={16} />
                  Register
                </Link>
              </>
            ))}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-950 md:hidden">
          <nav className="flex flex-col gap-4">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-medium text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-300">
                {item.label}
              </a>
            ))}

            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 border-t border-slate-100 pt-4 text-left font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              Switch to {theme === "light" ? "dark" : "light"} theme
            </button>

            {!authLoading &&
              (user ? (
                <div className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                    Signed in as {user.email}
                  </p>

                  <Link
                    to="/my-purchases"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-white">
                    My Study Notes
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-amber-400 dark:text-slate-950">
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to={loginHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-white">
                    Login
                  </Link>

                  <Link
                    to={registerHref}
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white dark:bg-amber-400 dark:text-slate-950">
                    Register
                  </Link>
                </div>
              ))}
          </nav>
        </div>
      )}
    </header>
  );
}
