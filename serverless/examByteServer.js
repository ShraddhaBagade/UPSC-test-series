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
  res.status(status).json(body);
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
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SECRET_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getBearerToken(req) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function requireUser(req) {
  const token = getBearerToken(req);

  if (!token) {
    throw new HttpError(401, "Please sign in to access your study library.");
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }

  return data.user;
}

/*
  Guest checkout is allowed.
  If a valid logged-in session exists, return that user.
  If no session exists, return null.
*/
export async function getOptionalUser(req) {
  const token = getBearerToken(req);

  if (!token) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
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
    throw new HttpError(
      400,
      "Choose exactly 3, 5, or all 9 subjects for a bundle.",
    );
  }

  if (type !== "pdf" && type !== "bundle") {
    throw new HttpError(400, "Unknown purchase type.");
  }

  const amountPaise =
    type === "pdf" ? 9900 : bundlePrices.get(subjectIds.length);

  return {
    amountPaise,
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
    typeof customer?.mobile === "string" ? customer.mobile.trim() : "";

  if (
    fullName.length < 2 ||
    fullName.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    !/^[0-9]{10}$/.test(mobile)
  ) {
    throw new HttpError(
      400,
      "Enter your full name, a valid email, and a 10-digit mobile number.",
    );
  }

  return { fullName, email, mobile };
}

export function createCashfreeOrderId() {
  return `exb_${Date.now()}_${randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

function cashfreeBaseUrl() {
  const environment = getEnv("CASHFREE_ENVIRONMENT").toLowerCase();

  if (environment === "production") {
    return "https://api.cashfree.com/pg";
  }

  if (environment === "sandbox" || environment === "test") {
    return "https://sandbox.cashfree.com/pg";
  }

  throw new HttpError(
    503,
    "CASHFREE_ENVIRONMENT must be production or sandbox.",
  );
}

export async function cashfreeRequest(path, options = {}) {
  const response = await fetch(`${cashfreeBaseUrl()}${path}`, {
    ...options,
    headers: {
      "x-client-id": getEnv("CASHFREE_CLIENT_ID"),
      "x-client-secret": getEnv("CASHFREE_CLIENT_SECRET"),
      "x-api-version": "2023-08-01",
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(15_000),
  });

  const responseText = await response.text();
  let responseBody = null;

  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    console.error("Cashfree API error:", response.status, responseBody);
    throw new HttpError(
      502,
      "Cashfree could not process the request. Please try again.",
    );
  }

  return responseBody;
}

export async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;

      if (size > 64 * 1024) {
        reject(new HttpError(413, "Webhook request is too large."));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

export function verifyCashfreeWebhook(req, rawBody) {
  const timestamp = req.headers["x-webhook-timestamp"];
  const signature = req.headers["x-webhook-signature"];

  if (
    typeof timestamp !== "string" ||
    typeof signature !== "string" ||
    !rawBody
  ) {
    return false;
  }

  const expected = createHmac("sha256", getEnv("CASHFREE_CLIENT_SECRET"))
    .update(`${timestamp}${rawBody}`)
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function getPdfFilename(subjectId) {
  const filename = pdfFiles.get(subjectId);

  if (!filename) {
    throw new HttpError(400, "Unknown PDF subject.");
  }

  return filename;
}
