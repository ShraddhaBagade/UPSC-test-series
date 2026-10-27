import {
  HttpError,
  getSupabaseAdmin,
  requireMethod,
  requireUser,
  sendJson,
} from "../serverless/examByteServer.js";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanMobile(value) {
  const digits = cleanText(value).replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return /^\d{10}$/.test(digits) ? digits : "";
}

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

    /*
      New accounts may not have a database profile yet.
      Use the name and mobile stored during registration until their
      first checkout saves the permanent profile record.
    */
    const metadata = user.user_metadata || {};

    return sendJson(res, 200, {
      profile: {
        fullName:
          cleanText(profile?.full_name) || cleanText(metadata.full_name),
        email: user.email?.trim().toLowerCase() || profile?.email || "",
        mobile: cleanMobile(profile?.mobile) || cleanMobile(metadata.mobile),
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
