import { createHmac, timingSafeEqual } from "node:crypto";

export function validPaymentSignature(orderId, paymentId, signature, secret) {
  if (
    typeof orderId !== "string" ||
    typeof paymentId !== "string" ||
    typeof signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected = createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

export function paymentMatchesOrder(payment, order) {
  return (
    payment?.id === order.paymentId &&
    payment?.order_id === order.id &&
    payment?.amount === order.amount &&
    payment?.currency === "INR"
  );
}
