import express from "express";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import { priceSelection, validateCustomer } from "./catalog.js";
import { paymentMatchesOrder, validPaymentSignature } from "./payment.js";
import { createPurchaseStore } from "./purchase-store.js";
import { requireUser } from "./Auth.js";
import { createOrderStore } from "./order-store.js";

const app = express();
const port = Number(process.env.PORT || 5000);
const keyId = process.env.RAZORPAY_KEY_ID || "";
const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

const configured =
  /^rzp_test_[A-Za-z0-9]+$/.test(keyId) &&
  !!keySecret &&
  keySecret !== "REPLACE_ME";

const orders = createOrderStore(
  fileURLToPath(new URL("./data/orders.json", import.meta.url)),
);

const purchases = createPurchaseStore(
  fileURLToPath(new URL("./data/purchases.json", import.meta.url)),
);

app.post(
  "/api/webhooks/razorpay",
  express.raw({ type: "application/json", limit: "16kb" }),
  async (req, res) => {
    if (!webhookSecret) {
      return res
        .status(503)
        .json({ error: "Webhook secret is not configured." });
    }

    const signature = req.get("X-Razorpay-Signature") || "";

    if (!Buffer.isBuffer(req.body) || !/^[a-f0-9]{64}$/i.test(signature)) {
      return res.status(400).json({ error: "Invalid webhook request." });
    }

    const expected = createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest();
    const received = Buffer.from(signature, "hex");

    if (!timingSafeEqual(expected, received)) {
      return res.status(401).json({ error: "Invalid webhook signature." });
    }

    try {
      const event = JSON.parse(req.body.toString("utf8"));

      if (event.event !== "payment.captured") {
        return res.status(200).json({ received: true, ignored: true });
      }

      const payment = event.payload?.payment?.entity;

      if (
        payment?.status !== "captured" ||
        typeof payment.order_id !== "string" ||
        typeof payment.id !== "string"
      ) {
        return res.status(200).json({ received: true, ignored: true });
      }

      const order = await orders.get(payment.order_id);

      if (!order) {
        return res.status(200).json({ received: true, ignored: true });
      }

      if (
        payment.order_id !== order.id ||
        payment.amount !== order.amount ||
        payment.currency !== "INR"
      ) {
        console.error(
          "Ignoring a captured webhook with mismatched order details.",
        );
        return res.status(200).json({ received: true, ignored: true });
      }

      const capturedAt = new Date().toISOString();

      await orders.update(order.id, {
        status: "captured",
        paymentId: payment.id,
        capturedAt,
      });

      await purchases.add({
        orderId: order.id,
        paymentId: payment.id,
        amount: order.amount,
        mode: "test",
        title: order.selection.title,
        subjects: order.selection.subjects,
        subjectIds: order.selection.subjectIds,
        capturedAt,
        userId: order.userId,
      });

      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Razorpay webhook processing failed:", error);
      return res.status(500).json({ error: "Webhook processing failed." });
    }
  },
);

app.use(express.json({ limit: "16kb" }));

function requireTestKeys(_req, res, next) {
  if (!configured) {
    return res.status(503).json({
      error: "Add your Razorpay Test Mode keys to server/.env.",
    });
  }

  next();
}

async function razorpayRequest(path, options = {}) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString(
        "base64",
      )}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(`Razorpay API returned ${response.status}`);
  }

  return response.json();
}

app.get("/api/health", (_req, res) => res.json({ mode: "test", configured }));

app.post("/api/orders", requireTestKeys, requireUser, async (req, res) => {
  let selection;
  let customer;

  try {
    selection = priceSelection(req.body?.type, req.body?.subjectIds);
    customer = validateCustomer(req.body?.customer);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

  try {
    const created = await razorpayRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: selection.amount,
        currency: "INR",
        receipt: `exb_${randomUUID().replaceAll("-", "").slice(0, 30)}`,
        notes: {
          subjects: selection.subjectIds.join(","),
        },
      }),
    });

    if (
      !created.id ||
      created.amount !== selection.amount ||
      created.currency !== "INR"
    ) {
      throw new Error("Unexpected order returned by Razorpay");
    }
    await orders.add({
      id: created.id,
      amount: selection.amount,
      customer,
      selection,
      userId: req.user.id,
      status: "created",
      createdAt: new Date().toISOString(),
    });

    res.json({
      keyId,
      orderId: created.id,
      amount: selection.amount,
      currency: "INR",
      title: selection.title,
      subjects: selection.subjects,
    });
  } catch (error) {
    console.error("Test order creation failed:", error.message);
    res.status(502).json({
      error: "Could not create a test order. Try again shortly.",
    });
  }
});

app.post("/api/verify", requireTestKeys, requireUser, async (req, res) => {
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.body || {};

  let order = null;

  try {
    if (typeof orderId === "string") {
      order = await orders.get(orderId);
    }
  } catch (error) {
    console.error("Could not read the saved order:", error);
    return res.status(500).json({
      error: "Could not load this order. Try again.",
    });
  }

  if (
    !order ||
    order.userId !== req.user.id ||
    !validPaymentSignature(order.id, paymentId, signature, keySecret)
  ) {
    return res.status(400).json({
      error: "The payment signature could not be verified.",
    });
  }

  try {
    const payment = await razorpayRequest(
      `/payments/${encodeURIComponent(paymentId)}`,
    );

    if (!paymentMatchesOrder(payment, { ...order, paymentId })) {
      return res.status(400).json({
        error: "Payment details do not match this order.",
      });
    }

    if (payment.status !== "captured") {
      return res.status(202).json({
        verified: false,
        status: payment.status,
        message:
          "Payment is not captured yet. Check your Razorpay dashboard before delivering PDFs.",
      });
    }

    await orders.update(order.id, {
      status: "captured",
      paymentId,
      capturedAt: new Date().toISOString(),
    });

    await purchases.add({
      orderId: order.id,
      paymentId,
      amount: order.amount,
      mode: "test",
      title: order.selection.title,
      subjects: order.selection.subjects,
      subjectIds: order.selection.subjectIds,
      capturedAt: new Date().toISOString(),
      userId: order.userId,
    });

    res.json({
      verified: true,
      mode: "test",
      orderId: order.id,
      paymentId,
      title: order.selection.title,
      subjects: order.selection.subjects,
      subjectIds: order.selection.subjectIds,
    });
  } catch (error) {
    console.error("Test payment verification failed:", error.message);
    res.status(502).json({
      error:
        "Could not check the payment status. Check your Razorpay dashboard.",
    });
  }
});

app.get("/api/my-purchases", requireUser, async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    res.json({
      purchases: await purchases.list(req.user.id),
    });
  } catch (error) {
    console.error("Could not read purchases:", error);
    res.status(500).json({
      error: "Could not load your study notes.",
    });
  }
});

// Test Mode only: downloads harmless .txt receipts.
app.get(
  "/api/download/:orderId/:subjectId",
  requireTestKeys,
  requireUser,
  async (req, res) => {
    try {
      const permitted = await purchases.allowed(
        req.user.id,
        req.params.orderId,
        req.params.subjectId,
      );

      if (!permitted) {
        return res.status(403).json({
          error: "This subject is not in your account.",
        });
      }
    } catch (error) {
      console.error("Could not check purchase:", error);
      return res.status(500).json({
        error: "Could not check this download.",
      });
    }

    res.set("Cache-Control", "no-store");
    res.set(
      "Content-Disposition",
      `attachment; filename="ExamByte-Test-${req.params.subjectId}.txt"`,
    );

    res
      .type("text/plain")
      .send(
        `ExamByte Test Mode receipt\n` +
          `Subject: ${req.params.subjectId}\n` +
          `No real payment was taken. This is not the full PDF.\n`,
      );
  },
);

app.listen(port, () =>
  console.log(
    `ExamByte test payment server listening on http://localhost:${port}`,
  ),
);
