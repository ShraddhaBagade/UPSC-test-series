import { getEnv } from "./examByteServer.js";

const RECEIPT_FROM = "ExamByte <no-reply@exambyte.co.in>";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAmount(amountPaise, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amountPaise || 0) / 100);
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function sendOrderReceipt({
  order,
  subjects = [],
  idempotencyKey,
}) {
  const resendApiKey = getEnv("RESEND_API_KEY");
  const appUrl = getEnv("APP_URL").replace(/\/$/, "");
  const customerName = escapeHtml(order.customer_name || "ExamByte learner");
  const orderId = escapeHtml(order.cashfree_order_id);
  const orderTitle = escapeHtml(order.title || "ExamByte study material");
  const amount = formatAmount(order.amount_paise, order.currency);
  const subjectList = subjects
    .map((subject) => `<li>${escapeHtml(subject)}</li>`)
    .join("");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: RECEIPT_FROM,
      to: [order.customer_email],
      subject: `Order confirmed - ${orderTitle}`,
      html: `
        <main style="max-width:600px;margin:0 auto;padding:32px 20px;font-family:Arial,sans-serif;color:#1e293b">
          <h1 style="margin:0;color:#0f172a">Your ExamByte order is confirmed</h1>
          <p style="font-size:16px;line-height:1.6">Hi ${customerName},</p>
          <p style="font-size:16px;line-height:1.6">
            Your payment has been verified. Your purchased study material is ready in My Study Notes.
          </p>

          <section style="margin:24px 0;padding:20px;border-radius:12px;background:#fff9ea;border:1px solid #fde68a">
            <p style="margin:0 0 10px"><strong>${orderTitle}</strong></p>
            <p style="margin:0 0 10px">Amount paid: <strong>${amount}</strong></p>
            <p style="margin:0 0 10px">Order reference: <strong>${orderId}</strong></p>
            <p style="margin:0">Purchase date: ${formatDate(order.paid_at)}</p>
          </section>

          <h2 style="font-size:18px;color:#0f172a">Included study material</h2>
          <ul style="line-height:1.8">${subjectList || "<li>ExamByte study material</li>"}</ul>

          <p style="margin-top:28px">
            <a href="${appUrl}/my-purchases" style="display:inline-block;background:#fbbf24;color:#111827;padding:13px 20px;border-radius:10px;text-decoration:none;font-weight:700">
              Open My Study Notes
            </a>
          </p>

          <p style="font-size:13px;line-height:1.6;color:#64748b">
            For security, your PDF downloads are personalized for your account. Please do not share them.
            Need help? Contact us at exambyte01@gmail.com.
          </p>
        </main>
      `,
      text: `Hi ${order.customer_name || "ExamByte learner"},

Your ExamByte order is confirmed.

${order.title || "Study material"}
Amount paid: ${amount}
Order reference: ${order.cashfree_order_id}
Purchase date: ${formatDate(order.paid_at)}

Open My Study Notes: ${appUrl}/my-purchases

For support, email exambyte01@gmail.com.`,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result?.id) {
    console.error("Resend receipt email failed:", result);
    throw new Error("Could not send order confirmation email.");
  }

  return {
    emailId: result.id,
  };
}