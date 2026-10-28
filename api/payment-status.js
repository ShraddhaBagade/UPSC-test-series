import {
  HttpError,
  cashfreeRequest,
  getSupabaseAdmin,
  requireMethod,
  sendJson,
} from "../serverless/examByteServer.js";

function getPaymentList(response) {
  if (Array.isArray(response)) return response;

  return Array.isArray(response?.data) ? response.data : [];
}

async function markOrderPaid(supabase, order, payment) {
  const paidAt = order.paid_at || new Date().toISOString();

  const { error: updateError } = await supabase
    .from("exambyte_orders")
    .update({
      status: "paid",
      cashfree_payment_id: payment.cf_payment_id,
      cashfree_payment_status: payment.payment_status,
      paid_at: paidAt,
    })
    .eq("id", order.id);

  if (updateError) {
    throw new HttpError(500, "Could not confirm this payment.");
  }

  const subjectIds = Array.isArray(order.subject_ids)
    ? order.subject_ids
    : [];

  const subjects = Array.isArray(order.subjects) ? order.subjects : [];

  const purchaseItems = subjectIds.map((subjectId, index) => ({
    order_id: order.id,
    user_id: order.user_id || null,
    subject_id: subjectId,
    subject_title: subjects[index] || subjectId,
  }));

  const { error: purchaseError } = await supabase
    .from("exambyte_purchase_items")
    .upsert(purchaseItems, {
      onConflict: "order_id,subject_id",
      ignoreDuplicates: true,
    });

  if (purchaseError) {
    throw new HttpError(500, "Could not unlock your study material.");
  }
}

export default async function handler(req, res) {
  try {
    requireMethod(req, "GET");

    const orderId =
      typeof req.query?.order_id === "string"
        ? req.query.order_id.trim()
        : "";

    if (!orderId) {
      throw new HttpError(400, "Payment reference is missing.");
    }

    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from("exambyte_orders")
      .select(
        "id, user_id, title, amount_paise, currency, subject_ids, subjects, status, paid_at",
      )
      .eq("cashfree_order_id", orderId)
      .maybeSingle();

    if (orderError || !order) {
      throw new HttpError(404, "This payment could not be found.");
    }

    const paymentResponse = await cashfreeRequest(
      `/orders/${encodeURIComponent(orderId)}/payments`,
      { method: "GET" },
    );

    const payments = getPaymentList(paymentResponse);

    const successfulPayment = payments.find(
      (payment) =>
        payment?.payment_status === "SUCCESS" &&
        Math.round(Number(payment?.payment_amount) * 100) ===
          order.amount_paise &&
        payment?.payment_currency === "INR" &&
        payment?.cf_payment_id,
    );

    if (successfulPayment) {
      if (order.status !== "paid") {
        await markOrderPaid(supabase, order, successfulPayment);
      }

      return sendJson(res, 200, {
        status: "paid",
        orderId,
        title: order.title,
      });
    }

    const hasFailedAttempt = payments.some((payment) =>
      ["FAILED", "USER_DROPPED", "CANCELLED"].includes(
        String(payment?.payment_status || "").toUpperCase(),
      ),
    );

    return sendJson(res, 200, {
      status: hasFailedAttempt ? "failed" : "pending",
      orderId,
      title: order.title,
    });
  } catch (error) {
    console.error("Payment status check failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error:
        error instanceof HttpError
          ? error.message
          : "Could not check payment status. Please try again.",
    });
  }
}