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

    const { data: orders, error: ordersError } = await supabase
      .from("exambyte_orders")
      .select("id, cashfree_order_id, title, paid_at")
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