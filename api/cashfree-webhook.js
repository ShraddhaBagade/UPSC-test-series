import {
  HttpError,
  cashfreeRequest,
  getSupabaseAdmin,
  readRawBody,
  requireMethod,
  sendJson,
  verifyCashfreeWebhook,
} from "../serverless/examByteServer.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    requireMethod(req, "POST");

    const rawBody = await readRawBody(req);

    if (!verifyCashfreeWebhook(req, rawBody)) {
      return sendJson(res, 401, { error: "Invalid webhook signature." });
    }

    const event = JSON.parse(rawBody);
    const cashfreeOrderId = event?.data?.order?.order_id;

    if (!cashfreeOrderId) {
      return sendJson(res, 200, { received: true, ignored: true });
    }

    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from("exambyte_orders")
      .select("*")
      .eq("cashfree_order_id", cashfreeOrderId)
      .maybeSingle();

    if (orderError || !order) {
      return sendJson(res, 200, { received: true, ignored: true });
    }

    const paymentResponse = await cashfreeRequest(
      `/pg/orders/${encodeURIComponent(cashfreeOrderId)}/payments`,
      { method: "GET" },
    );

    const payments = Array.isArray(paymentResponse)
      ? paymentResponse
      : Array.isArray(paymentResponse?.data)
        ? paymentResponse.data
        : [];

    const successfulPayment = payments.find(
      (payment) =>
        payment?.payment_status === "SUCCESS" &&
        Math.round(Number(payment?.payment_amount) * 100) ===
          order.amount_paise &&
        payment?.payment_currency === "INR",
    );

    if (!successfulPayment?.cf_payment_id) {
      return sendJson(res, 200, { received: true, pending: true });
    }

    const paidAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("exambyte_orders")
      .update({
        status: "paid",
        cashfree_payment_id: successfulPayment.cf_payment_id,
        cashfree_payment_status: successfulPayment.payment_status,
        paid_at: paidAt,
      })
      .eq("id", order.id);

    if (updateError) {
      throw new HttpError(500, "Could not update paid order.");
    }

    const subjectIds = Array.isArray(order.subject_ids)
      ? order.subject_ids
      : [];

    const subjects = Array.isArray(order.subjects)
      ? order.subjects
      : [];

    const purchaseItems = subjectIds.map((subjectId, index) => ({
      order_id: order.id,
      user_id: order.user_id,
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
      throw new HttpError(500, "Could not create purchase access.");
    }

    return sendJson(res, 200, { received: true, paid: true });
  } catch (error) {
    console.error("Cashfree webhook failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error: "Webhook processing failed.",
    });
  }
}