import {
  HttpError,
  getSupabaseAdmin,
  requireMethod,
  requireUser,
  sendJson,
} from "../serverless/examByteServer.js";

export default async function handler(req, res) {
  try {
    requireMethod(req, "GET");

    const user = await requireUser(req);
    const supabase = getSupabaseAdmin();

    const { data: profile, error } = await supabase
      .from("exambyte_profiles")
      .select("full_name, email, mobile")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw new HttpError(500, "Could not load your saved details.");
    }

    return sendJson(res, 200, {
      profile: {
        fullName: profile?.full_name || "",
        email: user.email?.trim().toLowerCase() || profile?.email || "",
        mobile: profile?.mobile || "",
      },
    });
  } catch (error) {
    console.error("Load buyer profile failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error:
        error instanceof HttpError
          ? error.message
          : "Could not load your saved details.",
    });
  }
}