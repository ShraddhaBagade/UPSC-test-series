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
    const email = user.email?.trim().toLowerCase();

    if (!email) {
      throw new HttpError(400, "Your account does not have an email address.");
    }

    const supabase = getSupabaseAdmin();

    /*
      Automatically claim any successful guest purchase made with the
      email that has now completed OTP sign-in.
    */
    const { data: guestOrders, error: guestOrdersError } = await supabase
      .from("exambyte_orders")
      .select("id, customer_name, customer_mobile, paid_at")
      .eq("status", "paid")
      .eq("customer_email", email)
      .is("user_id", null)
      .order("paid_at", { ascending: false });

    if (guestOrdersError) {
      throw new HttpError(500, "Could not find your earlier purchases.");
    }

    const guestOrderIds = (guestOrders || []).map((order) => order.id);

    if (guestOrderIds.length) {
      const { data: existingProfile, error: profileReadError } = await supabase
        .from("exambyte_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileReadError) {
        throw new HttpError(500, "Could not load your profile.");
      }

      /*
        First successful guest purchase becomes their saved profile.
        An existing profile is never overwritten automatically.
      */
      if (!existingProfile) {
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

      const { error: orderClaimError } = await supabase
        .from("exambyte_orders")
        .update({ user_id: user.id })
        .in("id", guestOrderIds)
        .is("user_id", null);

      if (orderClaimError) {
        throw new HttpError(500, "Could not connect your purchases.");
      }

      const { error: itemClaimError } = await supabase
        .from("exambyte_purchase_items")
        .update({ user_id: user.id })
        .in("order_id", guestOrderIds)
        .is("user_id", null);

      if (itemClaimError) {
        throw new HttpError(500, "Could not connect your purchased PDFs.");
      }
    }

    /*
      Load every paid purchase now linked to this account.
    */
    const { data: orders, error: ordersError } = await supabase
      .from("exambyte_orders")
      .select("id, cashfree_order_id, title, paid_at, amount_paise, currency")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .order("paid_at", { ascending: false });

    if (ordersError) {
      throw new HttpError(500, "Could not load your purchases.");
    }

    if (!orders?.length) {
      return sendJson(res, 200, { purchases: [] });
    }

    const orderIds = orders.map((order) => order.id);

    const { data: items, error: itemsError } = await supabase
      .from("exambyte_purchase_items")
      .select("order_id, subject_id, subject_title")
      .eq("user_id", user.id)
      .in("order_id", orderIds);

    if (itemsError) {
      throw new HttpError(500, "Could not load purchased subjects.");
    }

    const itemsByOrder = new Map();

    for (const item of items || []) {
      const current = itemsByOrder.get(item.order_id) || [];
      current.push(item);
      itemsByOrder.set(item.order_id, current);
    }

    const purchases = orders.map((order) => {
      const orderItems = itemsByOrder.get(order.id) || [];

      return {
        orderId: order.cashfree_order_id,
        title: order.title,
        amountPaise: order.amount_paise,
        currency: order.currency || "INR",
        subjectIds: orderItems.map((item) => item.subject_id),
        subjects: orderItems.map((item) => item.subject_title),
        capturedAt: order.paid_at,
        mode: "live",
      };
    });

    return sendJson(res, 200, { purchases });
  } catch (error) {
    console.error("Load purchases failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error:
        error instanceof HttpError
          ? error.message
          : "Could not load your study notes.",
    });
  }
}
