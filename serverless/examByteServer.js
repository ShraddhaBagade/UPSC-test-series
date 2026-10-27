import { createClient } from "@supabase/supabase-js";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const subjects = new Map([
  ["indian-polity", "Indian Polity"],
  ["modern-history", "Modern History"],
  ["indian-geography", "Indian Geography"],
  ["economics", "Economics"],
  ["environment", "Environment"],
  ["science-and-tech", "Science and Tech"],
  ["ancient-india", "Ancient India"],
  ["medieval-indian-history", "Medieval Indian History"],
  ["art-culture", "Art & Culture"],
]);

const bundlePrices = new Map([
  [3, 24900],
  [5, 39900],
  [9, 69900],
]);

const pdfFiles = new Map([
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

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function sendJson(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function requireMethod(req, method) {
  if (req.method !== method) {
    throw new HttpError(405, "Method not allowed.");
  }
}

export function getEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new HttpError(503, `Server configuration is missing: ${name}.`);
  }

  return value;
}

export function getSupabaseAdmin() {
  return createClient(
    getEnv("SUPABASE_URL"),
    getEnv("SUPABASE_SECRET_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

export async function requireUser(req) {
  const authorization = req.headers.authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    throw new HttpError(401, "Please log in again.");
  }

  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.auth.getUser(match[1]);

  if (error || !data.user) {
    throw new HttpError(401, "Your login session has expired. Please log in again.");
  }

  return data.user;
}

export function priceSelection(type, subjectIds) {
  if (
    !Array.isArray(subjectIds) ||
    !subjectIds.every((id) => typeof id === "string")
  ) {
    throw new HttpError(400, "Choose your PDFs again.");
  }

  if (
    new Set(subjectIds).size !== subjectIds.length ||
    subjectIds.some((id) => !subjects.has(id))
  ) {
    throw new HttpError(
      400,
      "Your PDF selection contains duplicate or unknown subjects.",
    );
  }

  if (type === "pdf" && subjectIds.length !== 1) {
    throw new HttpError(400, "Choose exactly one subject for a single PDF.");
  }

  if (type === "bundle" && !bundlePrices.has(subjectIds.length)) {
    throw new HttpError(400, "Choose exactly 3, 5, or all 9 subjects.");
  }

  if (type !== "pdf" && type !== "bundle") {
    throw new HttpError(400, "Unknown purchase type.");
  }

  return {
    amountPaise: type === "pdf" ? 9900 : bundlePrices.get(subjectIds.length),
    title:
      type === "pdf"
        ? subjects.get(subjectIds[0])
        : subjectIds.length === 9
          ? "Buy All PDFs"
          : `Buy ${subjectIds.length} PDFs`,
    subjectIds,
    subjects: subjectIds.map((id) => subjects.get(id)),
  };
}

export function validateCustomer(customer) {
  const fullName =
    typeof customer?.fullName === "string" ? customer.fullName.trim() : "";

  const email =
    typeof customer?.email === "string"
      ? customer.email.trim().toLowerCase()
      : "";

  const mobile =
    typeof customer?.mobile === "string"
      ? customer.mobile.replace(/\D/g, "")
      : "";

  const indianMobile =
    mobile.length === 12 && mobile.startsWith("91")
      ? mobile.slice(2)
      : mobile;

  if (
    fullName.length < 2 ||
    fullName.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !/^[0-9]{10}$/.test(indianMobile)
  ) {
    throw new HttpError(
      400,
      "Enter your name, a valid email, and a 10-digit mobile number.",
    );
  }

  return { fullName, email, mobile: indianMobile };
}

export function createCashfreeOrderId() {
  return `exb_${randomUUID().replaceAll("-", "").slice(0, 28)}`;
}

function cashfreeBaseUrl() {
  return getEnv("CASHFREE_ENVIRONMENT") === "production"
    ? "https://api.cashfree.com"
    : "https://sandbox.cashfree.com";
}

export async function cashfreeRequest(path, options = {}) {
  const response = await fetch(`${cashfreeBaseUrl()}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-version": "2023-08-01",
      "x-client-id": getEnv("CASHFREE_CLIENT_ID"),
      "x-client-secret": getEnv("CASHFREE_CLIENT_SECRET"),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    console.error("Cashfree API error:", response.status, data || text);

    throw new HttpError(
      502,
      "Could not start Cashfree checkout. Please try again shortly.",
    );
  }

  return data;
}

export function getPdfFilename(subjectId) {
  const filename = pdfFiles.get(subjectId);

  if (!filename) {
    throw new HttpError(400, "Unknown purchased PDF.");
  }

  return filename;
}

export async function readRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

export function verifyCashfreeWebhook(req, rawBody) {
  const signature = req.headers["x-webhook-signature"];
  const timestamp = req.headers["x-webhook-timestamp"];

  if (
    typeof signature !== "string" ||
    typeof timestamp !== "string" ||
    !rawBody
  ) {
    return false;
  }

  const expected = createHmac("sha256", getEnv("CASHFREE_CLIENT_SECRET"))
    .update(`${timestamp}${rawBody}`)
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}