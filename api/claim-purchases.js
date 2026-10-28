import {
  HttpError,
  getSupabaseAdmin,
  requireMethod,
  requireUser,
  sendJson,
} from "../serverless/examByteServer.js";

export default async function handler(req, res) {
  try {
    requireMethod(req, "POST");

    /*
      This endpoint is called after the buyer proves ownership of the
      checkout email through Supabase OTP login.
    */
    const user = await requireUser(req);
    const email = user.email?.trim().toLowerCase();

    if (!email) {
      throw new HttpError(
        400,
        "Your signed-in account does not have an email address.",
      );
    }

    const supabase = getSupabaseAdmin();

    /*
      Find successful guest purchases made using this verified email.
      Only orders with no owner are claimable.
    */
    const { data: guestOrders, error: ordersError } = await supabase
      .from("exambyte_orders")
      .select("id, customer_name, customer_mobile, paid_at")
      .eq("status", "paid")
      .eq("customer_email", email)
      .is("user_id", null)
      .order("paid_at", { ascending: false });

    if (ordersError) {
      throw new HttpError(500, "Could not find your earlier purchases.");
    }

    const orderIds = (guestOrders || []).map((order) => order.id);

    /*
      Save their checkout name and mobile into their profile only if
      they do not already have a saved ExamByte profile.
    */
    const { data: existingProfile, error: profileReadError } = await supabase
      .from("exambyte_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileReadError) {
      throw new HttpError(500, "Could not load your profile.");
    }

    if (!existingProfile && guestOrders?.length) {
      const latestOrder = guestOrders[0];

      const { error: profileCreateError } = await supabase
        .from("exambyte_profiles")
        .insert({
          id: user.id,
          email,
          full_name: latestOrder.customer_name,
          mobile: latestOrder.customer_mobile,
        });

      if (profileCreateError) {
        throw new HttpError(500, "Could not save your buyer profile.");
      }
    }

    if (!orderIds.length) {
      return sendJson(res, 200, {
        claimedOrders: 0,
        message: "No unclaimed purchases were found for this email.",
      });
    }

    /*
      Link paid orders and their subjects to this verified user account.
    */
    const { error: orderUpdateError } = await supabase
      .from("exambyte_orders")
      .update({ user_id: user.id })
      .in("id", orderIds)
      .is("user_id", null);

    if (orderUpdateError) {
      throw new HttpError(500, "Could not link your purchases.");
    }

    const { error: itemUpdateError } = await supabase
      .from("exambyte_purchase_items")
      .update({ user_id: user.id })
      .in("order_id", orderIds)
      .is("user_id", null);

    if (itemUpdateError) {
      throw new HttpError(500, "Could not link your purchased PDFs.");
    }

    return sendJson(res, 200, {
      claimedOrders: orderIds.length,
      message: "Your earlier purchases are now available in My Study Notes.",
    });
  } catch (error) {
    console.error("Claim purchases failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error:
        error instanceof HttpError
          ? error.message
          : "Could not connect your purchases to this account.",
    });
  }
}