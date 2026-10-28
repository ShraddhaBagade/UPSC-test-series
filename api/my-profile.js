import {
  HttpError,
  getSupabaseAdmin,
  requireUser,
  sendJson,
} from "../serverless/examByteServer.js";

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanName(value) {
  return cleanText(value).replace(/\s+/g, " ");
}

function cleanMobile(value) {
  const digits = cleanText(value).replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  return /^\d{10}$/.test(digits) ? digits : "";
}

function profileResponse(profile, user) {
  const metadata = user.user_metadata || {};

  return {
    fullName: cleanText(profile?.full_name) || cleanText(metadata.full_name),
    email: user.email?.trim().toLowerCase() || profile?.email || "",
    mobile: cleanMobile(profile?.mobile) || cleanMobile(metadata.mobile),
  };
}

export default async function handler(req, res) {
  try {
    if (!["GET", "PATCH"].includes(req.method)) {
      throw new HttpError(405, "Method not allowed.");
    }

    const user = await requireUser(req);
    const supabase = getSupabaseAdmin();

    if (req.method === "GET") {
      const { data: profile, error } = await supabase
        .from("exambyte_profiles")
        .select("full_name, email, mobile")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        throw new HttpError(500, "Could not load your saved details.");
      }

      return sendJson(res, 200, {
        profile: profileResponse(profile, user),
      });
    }

    const fullName = cleanName(req.body?.fullName);
    const mobile = cleanMobile(req.body?.mobile);

    if (fullName.length < 2 || fullName.length > 80) {
      throw new HttpError(400, "Please enter a valid full name.");
    }

    if (!mobile) {
      throw new HttpError(400, "Please enter a valid 10-digit mobile number.");
    }

    const email = user.email?.trim().toLowerCase();

    if (!email) {
      throw new HttpError(400, "Your account does not have an email address.");
    }

    const { data: profile, error } = await supabase
      .from("exambyte_profiles")
      .upsert(
        {
          id: user.id,
          email,
          full_name: fullName,
          mobile,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("full_name, email, mobile")
      .single();

    if (error || !profile) {
      console.error("Could not update buyer profile:", error);
      throw new HttpError(
        500,
        "Could not save your profile. Please try again.",
      );
    }

    return sendJson(res, 200, {
      profile: profileResponse(profile, user),
    });
  } catch (error) {
    console.error("Buyer profile request failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error:
        error instanceof HttpError
          ? error.message
          : "Could not save your profile. Please try again.",
    });
  }
}
