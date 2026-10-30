import {
  PDFDocument,
  StandardFonts,
  concatTransformationMatrix,
  popGraphicsState,
  pushGraphicsState,
  rgb,
} from "pdf-lib";
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
const WATERMARK_VERSION = 3;

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

function drawWatermarkBlock(page, font, lines, centerX, centerY, fontSize) {
  const angle = (30 * Math.PI) / 180;
  const lineHeight = fontSize + 4;
  const blockHeight = lines.length * lineHeight;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  /*
    Rotate the complete text block around its centre.
    This keeps all three watermark blocks centred instead of left-aligned.
  */
  page.pushOperators(pushGraphicsState());
  page.pushOperators(
    concatTransformationMatrix(cos, sin, -sin, cos, centerX, centerY),
  );

  lines.forEach((line, index) => {
    const lineWidth = font.widthOfTextAtSize(line, fontSize);

    page.drawText(line, {
      x: -lineWidth / 2,
      y: blockHeight / 2 - fontSize - index * lineHeight,
      size: fontSize,
      font,
      color: rgb(0.65, 0.04, 0.08),
      opacity: 0.17,
    });
  });

  page.pushOperators(popGraphicsState());
}

async function createWatermarkedPdf(originalPdf, order) {
  const pdfBytes = new Uint8Array(await originalPdf.arrayBuffer());

  /*
    Some source PDFs contain damaged metadata, outlines, or cross-references.
    Copying their pages into a brand-new PDF removes that broken structure.
  */
  const sourcePdf = await PDFDocument.load(pdfBytes, {
    ignoreEncryption: true,
  });

  const pdf = await PDFDocument.create();

  const copiedPages = await pdf.copyPages(
    sourcePdf,
    sourcePdf.getPageIndices(),
  );

  copiedPages.forEach((page) => pdf.addPage(page));

  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const watermarkLines = [
    `ExamByte | Licensed to: ${safeWatermarkText(order.customer_name, 45)}`,
    `Email: ${safeWatermarkText(order.customer_email, 45)}`,
    `Mobile: ${safeWatermarkText(order.customer_mobile, 20)}`,
    `Order: ${safeWatermarkText(order.cashfree_order_id, 36)} | Personal use only`,
  ];

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const fontSize = Math.max(8, Math.min(10, width / 62));

    drawWatermarkBlock(
      page,
      font,
      watermarkLines,
      width * 0.5,
      height * 0.2,
      fontSize,
    );

    drawWatermarkBlock(
      page,
      font,
      watermarkLines,
      width * 0.5,
      height * 0.5,
      fontSize,
    );

    drawWatermarkBlock(
      page,
      font,
      watermarkLines,
      width * 0.5,
      height * 0.8,
      fontSize,
    );
  }

  return pdf.save({
    useObjectStreams: false,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });
}

async function createPrivateDownloadUrl(supabase, storagePath, filename) {
  const { data, error } = await supabase.storage
    .from(WATERMARKED_PDF_BUCKET)
    .createSignedUrl(storagePath, 300, {
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
      .select("storage_path, watermark_version")
      .eq("order_id", order.id)
      .eq("subject_id", subjectId)
      .maybeSingle();

    if (existingFileError) {
      throw new HttpError(500, "Could not check your personalized PDF.");
    }

    /*
      Version 1 files are the old broken files.
      Only reuse a file generated by this fixed version.
    */
    if (
      existingFile?.storage_path &&
      existingFile.watermark_version === WATERMARK_VERSION
    ) {
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

    const generatedPdf = await createWatermarkedPdf(originalPdf, order);
    const watermarkedPdf = Buffer.from(generatedPdf);

    if (
      watermarkedPdf.length < 1000 ||
      watermarkedPdf.subarray(0, 5).toString() !== "%PDF-"
    ) {
      throw new HttpError(500, "Could not create a valid personalized PDF.");
    }

    const storagePath = `orders/${order.id}/${safeFilename(
      subjectId,
    )}-v${WATERMARK_VERSION}.pdf`;

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
          watermark_version: WATERMARK_VERSION,
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
