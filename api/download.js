import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import {
  HttpError,
  getPdfFilename,
  getSupabaseAdmin,
  requireMethod,
  requireUser,
  sendJson,
} from "../serverless/examByteServer.js";

const ORIGINAL_PDF_BUCKET = "exam-pdfs";
const WATERMARKED_PDF_BUCKET = "exam-watermarked-pdfs";

function safeWatermarkText(value, maximumLength = 90) {
  const text = String(value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\x20-\x7E]/g, "?")
    .trim();

  if (!text) return "Not available";

  return text.length > maximumLength
    ? `${text.slice(0, maximumLength - 3)}...`
    : text;
}

function safeFilename(value) {
  return String(value ?? "study-material")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function createWatermarkedPdf(originalPdf, order) {
  const pdfBytes = new Uint8Array(await originalPdf.arrayBuffer());
  const pdf = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
  });

  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const watermarkLines = [
    `ExamByte | Licensed to: ${safeWatermarkText(order.customer_name, 55)}`,
    `Email: ${safeWatermarkText(order.customer_email, 55)}`,
    `Mobile: ${safeWatermarkText(order.customer_mobile, 20)}`,
    `Order: ${safeWatermarkText(order.cashfree_order_id, 40)} | Personal use only - Do not share`,
  ];

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();

    const fontSize = Math.max(9, Math.min(15, width / 48));

    const positions = [
      { x: width * 0.08, y: height * 0.34 },
      { x: width * 0.08, y: height * 0.68 },
    ];

    for (const position of positions) {
      watermarkLines.forEach((line, index) => {
        page.drawText(line, {
          x: position.x,
          y: position.y - index * (fontSize + 5),
          size: fontSize,
          font,
          color: rgb(0.72, 0.05, 0.08),
          opacity: 0.18,
          rotate: degrees(32),
        });
      });
    }
  }

  return pdf.save();
}

async function createPrivateDownloadUrl(supabase, storagePath, filename) {
  const { data, error } = await supabase.storage
    .from(WATERMARKED_PDF_BUCKET)
    .createSignedUrl(storagePath, 60, {
      download: filename,
    });

  if (error || !data?.signedUrl) {
    console.error("Could not create personalized PDF download URL:", error);
    throw new HttpError(500, "Could not prepare your PDF download.");
  }

  return data.signedUrl;
}

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
      .select(
        "id, cashfree_order_id, customer_name, customer_email, customer_mobile",
      )
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

    const sourceFilename = getPdfFilename(subjectId);

    const outputFilename = `ExamByte-${safeFilename(subjectId)}-${safeFilename(
      order.cashfree_order_id,
    )}.pdf`;

    const { data: existingFile, error: existingFileError } = await supabase
      .from("exambyte_watermarked_files")
      .select("storage_path")
      .eq("order_id", order.id)
      .eq("subject_id", subjectId)
      .maybeSingle();

    if (existingFileError) {
      throw new HttpError(500, "Could not check your personalized PDF.");
    }

    if (existingFile?.storage_path) {
      const url = await createPrivateDownloadUrl(
        supabase,
        existingFile.storage_path,
        outputFilename,
      );

      return sendJson(res, 200, {
        url,
        filename: outputFilename,
      });
    }

    const { data: originalPdf, error: originalPdfError } =
      await supabase.storage.from(ORIGINAL_PDF_BUCKET).download(sourceFilename);

    if (originalPdfError || !originalPdf) {
      console.error("Could not load original ExamByte PDF:", originalPdfError);
      throw new HttpError(500, "Could not prepare your PDF download.");
    }

    const watermarkedPdf = await createWatermarkedPdf(originalPdf, order);

    const storagePath = `orders/${order.id}/${safeFilename(subjectId)}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from(WATERMARKED_PDF_BUCKET)
      .upload(storagePath, watermarkedPdf, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      console.error("Could not save personalized PDF:", uploadError);
      throw new HttpError(500, "Could not create your personalized PDF.");
    }

    const { error: recordError } = await supabase
      .from("exambyte_watermarked_files")
      .upsert(
        {
          order_id: order.id,
          user_id: user.id,
          subject_id: subjectId,
          storage_path: storagePath,
        },
        {
          onConflict: "order_id,subject_id",
        },
      );

    if (recordError) {
      console.error("Could not save personalized PDF record:", recordError);
      throw new HttpError(500, "Could not save your personalized PDF.");
    }

    const url = await createPrivateDownloadUrl(
      supabase,
      storagePath,
      outputFilename,
    );

    return sendJson(res, 200, {
      url,
      filename: outputFilename,
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
