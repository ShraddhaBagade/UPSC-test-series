import {
  HttpError,
  getSupabaseAdmin,
  requireMethod,
  requireUser,
  sendJson,
} from "../serverless/examByteServer.js";
import { sendOrderReceipt } from "../serverless/receiptEmail.js";

const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

export default async function handler(req, res) {
  try {
    requireMethod(req, "POST");

    const user = await requireUser(req);
    const orderId =
      typeof req.body?.orderId === "string" ? req.body.orderId.trim() : "";

    if (!orderId) {
      throw new HttpError(400, "Order reference is missing.");
    }

    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from("exambyte_orders")
      .select(
        "id, user_id, cashfree_order_id, customer_name, customer_email, title, amount_paise, currency, paid_at, status, subjects, receipt_sent_at",
      )
      .eq("cashfree_order_id", orderId)
      .eq("user_id", user.id)
      .eq("status", "paid")
      .maybeSingle();

    if (orderError || !order) {
      throw new HttpError(404, "This verified order is not available.");
    }

    const lastSentAt = order.receipt_sent_at
      ? new Date(order.receipt_sent_at).getTime()
      : 0;

    if (lastSentAt && Date.now() - lastSentAt < RESEND_COOLDOWN_MS) {
      throw new HttpError(
        429,
        "A receipt was sent recently. Please wait 5 minutes before requesting another one.",
      );
    }

    const { emailId } = await sendOrderReceipt({
      order,
      subjects: Array.isArray(order.subjects) ? order.subjects : [],
      idempotencyKey: `exam-byte-receipt-manual-${order.id}-${Math.floor(
        Date.now() / RESEND_COOLDOWN_MS,
      )}`,
    });

    const { error: updateError } = await supabase
      .from("exambyte_orders")
      .update({
        receipt_sent_at: new Date().toISOString(),
        receipt_email_id: emailId,
      })
      .eq("id", order.id);

    if (updateError) {
      throw new HttpError(500, "Receipt was sent, but could not be recorded.");
    }

    return sendJson(res, 200, {
      sent: true,
      message: `A receipt was sent to ${order.customer_email}.`,
    });
  } catch (error) {
    console.error("Resend receipt failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error:
        error instanceof HttpError
          ? error.message
          : "Could not resend your receipt. Please try again.",
    });
  }
}