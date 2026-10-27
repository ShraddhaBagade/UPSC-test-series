import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabase";

export default function AccountNav() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  async function logOut() {
    await supabase.auth.signOut();
    navigate("/");
  }

  return (
    <nav
      aria-label="Account"
      className="flex items-center justify-end gap-4 bg-amber-50 px-6 py-2 text-sm font-semibold text-slate-800 dark:bg-slate-900 dark:text-white">
      {user ? (
        <>
          <Link to="/my-purchases" className="hover:text-amber-700">
            My Study Notes
          </Link>
          <button
            type="button"
            onClick={logOut}
            className="hover:text-amber-700">
            Log out
          </button>
        </>
      ) : (
        <Link to="/login" className="hover:text-amber-700">
          Sign in / Create account
        </Link>
      )}
    </nav>
  );
}
