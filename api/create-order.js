import {
  HttpError,
  cashfreeRequest,
  createCashfreeOrderId,
  getEnv,
  getOptionalUser,
  getSupabaseAdmin,
  priceSelection,
  requireMethod,
  sendJson,
  validateCustomer,
} from "../serverless/examByteServer.js";

export default async function handler(req, res) {
  try {
    requireMethod(req, "POST");

    // A visitor may pay without logging in.
    // If they are already logged in, this returns their account.
    const user = await getOptionalUser(req);

    const selection = priceSelection(req.body?.type, req.body?.subjectIds);
    const customer = validateCustomer(req.body?.customer);

    // A logged-in buyer must use the email belonging to that account.
    if (
      user?.email &&
      user.email.toLowerCase() !== customer.email.toLowerCase()
    ) {
      throw new HttpError(
        400,
        `You are signed in as ${user.email}. Please use that same email for this order.`,
      );
    }

    const supabase = getSupabaseAdmin();
    const cashfreeOrderId = createCashfreeOrderId();
    const appUrl = getEnv("APP_URL").replace(/\/$/, "");

    /*
      Save or update profile details for a logged-in buyer.
      Guest details are saved with their order and become a profile
      after they verify the email through OTP.
    */
    if (user) {
      const { error: profileError } = await supabase
        .from("exambyte_profiles")
        .upsert(
          {
            id: user.id,
            email: customer.email,
            full_name: customer.fullName,
            mobile: customer.mobile,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (profileError) {
        console.error("Could not save buyer profile:", profileError);
        throw new HttpError(
          500,
          "Could not save your checkout details. Please try again.",
        );
      }
    }

    const { data: savedOrder, error: saveError } = await supabase
      .from("exambyte_orders")
      .insert({
        cashfree_order_id: cashfreeOrderId,
        user_id: user?.id || null,
        customer_name: customer.fullName,
        customer_email: customer.email,
        customer_mobile: customer.mobile,
        purchase_type: req.body?.type,
        title: selection.title,
        subject_ids: selection.subjectIds,
        subjects: selection.subjects,
        amount_paise: selection.amountPaise,
        currency: "INR",
        status: "created",
      })
      .select("id")
      .single();

    if (saveError || !savedOrder) {
      console.error("Could not save ExamByte order:", saveError);
      throw new HttpError(
        500,
        "Could not prepare your order. Please try again.",
      );
    }

    let cashfreeOrder;

    try {
      cashfreeOrder = await cashfreeRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
          order_id: cashfreeOrderId,
          order_amount: selection.amountPaise / 100,
          order_currency: "INR",
          customer_details: {
            customer_id: user
              ? `exam_${user.id.replaceAll("-", "").slice(0, 30)}`
              : `guest_${cashfreeOrderId}`,
            customer_name: customer.fullName,
            customer_email: customer.email,
            customer_phone: customer.mobile,
          },
          order_note: `ExamByte — ${selection.title}`,
          order_meta: {
            return_url: `${appUrl}/my-purchases?cashfree_order_id={order_id}`,
            notify_url: `${appUrl}/api/cashfree-webhook`,
          },
        }),
      });
    } catch (cashfreeError) {
      await supabase
        .from("exambyte_orders")
        .update({ status: "failed" })
        .eq("id", savedOrder.id);

      throw cashfreeError;
    }

    if (!cashfreeOrder?.payment_session_id) {
      throw new HttpError(
        502,
        "Cashfree did not return a payment session. Please try again.",
      );
    }

    return sendJson(res, 200, {
      orderId: cashfreeOrderId,
      paymentSessionId: cashfreeOrder.payment_session_id,
      amount: selection.amountPaise,
      currency: "INR",
      title: selection.title,
      subjects: selection.subjects,

      // The frontend will use this to show the correct post-payment message.
      requiresLibrarySignIn: !user,
    });
  } catch (error) {
    console.error("Create Cashfree order failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error:
        error instanceof HttpError
          ? error.message
          : "Could not start payment. Please try again.",
    });
  }
}
