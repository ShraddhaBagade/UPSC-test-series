import {
  HttpError,
  cashfreeRequest,
  getSupabaseAdmin,
  readRawBody,
  requireMethod,
  sendJson,
  verifyCashfreeWebhook,
} from "../serverless/examByteServer.js";
import { sendOrderReceipt } from "../serverless/receiptEmail.js";

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

    /*
      Do not trust the browser or webhook payload alone.
      Ask Cashfree directly whether the exact order was paid successfully.
    */
    const paymentResponse = await cashfreeRequest(
      `/orders/${encodeURIComponent(cashfreeOrderId)}/payments`,
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

    const paidAt = order.paid_at || new Date().toISOString();

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

    const subjects = Array.isArray(order.subjects) ? order.subjects : [];

    /*
      For a guest purchase, user_id is null for now.
      It will be attached to the real account only after that email
      completes its OTP sign-in.
    */
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
      throw new HttpError(500, "Could not create purchase access.");
    }

    /*
  Receipt email failure must never block payment fulfillment.
  Resend's idempotency key prevents duplicate emails when Cashfree
  sends the same webhook more than once.
*/
    if (!order.receipt_sent_at) {
      try {
        const { emailId } = await sendOrderReceipt({
          order: {
            ...order,
            paid_at: paidAt,
          },
          subjects,
          idempotencyKey: `exam-byte-receipt-${order.id}`,
        });

        await supabase
          .from("exambyte_orders")
          .update({
            receipt_sent_at: new Date().toISOString(),
            receipt_email_id: emailId,
          })
          .eq("id", order.id)
          .is("receipt_sent_at", null);
      } catch (receiptError) {
        console.error(
          "Payment was verified, but the receipt email could not be sent:",
          receiptError,
        );
      }
    }

    return sendJson(res, 200, { received: true, paid: true });
  } catch (error) {
    console.error("Cashfree webhook failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error: "Webhook processing failed.",
    });
  }
}
