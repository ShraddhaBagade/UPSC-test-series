import {
  HttpError,
  getPdfFilename,
  getSupabaseAdmin,
  requireMethod,
  requireUser,
  sendJson,
} from "../serverless/examByteServer.js";

export default async function handler(req, res) {
  try {
    requireMethod(req, "GET");

    const user = await requireUser(req);

    const orderId =
      typeof req.query?.orderId === "string" ? req.query.orderId : "";

    const subjectId =
      typeof req.query?.subjectId === "string" ? req.query.subjectId : "";

    if (!orderId || !subjectId) {
      throw new HttpError(400, "Missing purchase or subject information.");
    }

    const supabase = getSupabaseAdmin();

    const { data: order, error: orderError } = await supabase
      .from("exambyte_orders")
      .select("id")
      .eq("cashfree_order_id", orderId)
      .eq("user_id", user.id)
      .eq("status", "paid")
      .maybeSingle();

    if (orderError || !order) {
      throw new HttpError(403, "This purchase is not available.");
    }

    const { data: purchaseItem, error: itemError } = await supabase
      .from("exambyte_purchase_items")
      .select("subject_id")
      .eq("order_id", order.id)
      .eq("user_id", user.id)
      .eq("subject_id", subjectId)
      .maybeSingle();

    if (itemError || !purchaseItem) {
      throw new HttpError(403, "This PDF is not in your account.");
    }

    const filename = getPdfFilename(subjectId);

    const { data: signedFile, error: signedUrlError } = await supabase.storage
      .from("exam-pdfs")
      .createSignedUrl(filename, 60, {
        download: filename,
      });

    if (signedUrlError || !signedFile?.signedUrl) {
      console.error("Could not create secure download URL:", signedUrlError);
      throw new HttpError(500, "Could not prepare the PDF download.");
    }

    return sendJson(res, 200, {
      url: signedFile.signedUrl,
      filename,
    });
  } catch (error) {
    console.error("Secure PDF download failed:", error);

    return sendJson(res, error instanceof HttpError ? error.status : 500, {
      error:
        error instanceof HttpError
          ? error.message
          : "Download unavailable. Please try again.",
    });
  }
}
