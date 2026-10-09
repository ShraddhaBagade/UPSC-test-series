import { open, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const privateDirectory = join(
  dirname(fileURLToPath(import.meta.url)),
  "private-pdfs",
);

export const pdfFiles = new Map([
  ["indian-polity", "ExamByte_Polity.pdf"],
  ["modern-history", "ExamByte_Modern_Indian_History.pdf"],
  ["indian-geography", "ExamByte_Geography.pdf"],
  ["economics", "ExamByte_Economics.pdf"],
  ["environment", "ExamByte_Environment_and_Ecology.pdf"],
  ["science-and-tech", "ExamByte_Science_and_Technology.pdf"],
  ["ancient-india", "ExamByte_Ancient_Indian_History.pdf"],
  ["medieval-indian-history", "ExamByte_Medieval_Indian_History.pdf"],
  ["art-culture", "ExamByte_Art_and_Culture.pdf"],
]);

export function testEmailConfigured() {
  return Boolean(
    process.env.GMAIL_USER?.includes("@") &&
    process.env.GMAIL_USER !== "youraddress@gmail.com" &&
    process.env.GMAIL_APP_PASSWORD &&
    process.env.GMAIL_APP_PASSWORD !== "REPLACE_ME",
  );
}

export async function selectedAttachments(subjectIds) {
  if (
    !Array.isArray(subjectIds) ||
    !subjectIds.length ||
    new Set(subjectIds).size !== subjectIds.length ||
    subjectIds.some((id) => !pdfFiles.has(id))
  ) {
    throw new Error("Invalid subject selection for delivery.");
  }

  const attachments = [];

  for (const id of subjectIds) {
    const filename = pdfFiles.get(id);
    const path = join(privateDirectory, filename);
    const info = await stat(path);

    if (!info.isFile() || info.size < 100) {
      throw new Error(`Missing PDF: ${filename}`);
    }

    const file = await open(path, "r");
    const header = Buffer.alloc(5);

    try {
      await file.read(header, 0, 5, 0);
    } finally {
      await file.close();
    }

    if (header.toString() !== "%PDF-") {
      throw new Error(`Invalid PDF: ${filename}`);
    }

    attachments.push({
      filename,
      path,
      contentType: "application/pdf",
    });
  }

  return attachments;
}

export async function sendTestDelivery(order) {
  if (!testEmailConfigured()) {
    throw new Error("Gmail is not configured.");
  }

  const attachments = await selectedAttachments(order.selection.subjectIds);

  const gmailUser = process.env.GMAIL_USER.trim();
  const { default: nodemailer } = await import("nodemailer");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: process.env.GMAIL_APP_PASSWORD.replace(/\s/g, ""),
    },
    disableUrlAccess: true,
  });

  await transporter.sendMail({
    from: `ExamByte <${gmailUser}>`,

    // Test Mode: send the PDFs to yourself, never the buyer.
    to: gmailUser,

    subject: `ExamByte TEST delivery — ${order.selection.title}`,

    text: [
      "This is a Test Mode purchase. No real money was charged.",
      `Order: ${order.id}`,
      `Buyer email entered during the test: ${order.customer.email}`,
      `Selected subjects: ${order.selection.subjects.join(", ")}`,
      "Only the selected PDFs are attached. This email was sent to your own Gmail account.",
    ].join("\n"),

    attachments,
  });

  return gmailUser;
}
