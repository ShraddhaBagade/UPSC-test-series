import { supabase } from "./supabase";

export async function authFetch(url, options = {}) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message || "Could not check your login.");
  }

  if (!session?.access_token) {
    throw new Error("Please log in and try again.");
  }

  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${session.access_token}`);

  return fetch(url, {
    ...options,
    headers,
  });
}
