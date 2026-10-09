import { useState } from "react";
import { Download } from "lucide-react";
import { authFetch } from "../lib/authFetch";

export default function TestDownloads({ payment }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const ids = payment.subjectIds || [];
  const isLivePurchase = payment.mode === "live";

  async function downloadFile(subjectId) {
    setBusyId(subjectId);
    setError("");

    try {
      const response = await authFetch(
        `/api/download/${encodeURIComponent(payment.orderId)}/${encodeURIComponent(subjectId)}`,
      );

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || "";
        let message = "Download unavailable.";

        if (contentType.includes("application/json")) {
          const result = await response.json();
          message = result.error || message;
        } else {
          const text = await response.text();
          if (text) message = text.slice(0, 200);
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const disposition = response.headers.get("content-disposition") || "";
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);

      link.href = url;
      link.download =
        filenameMatch?.[1] ||
        `ExamByte-${subjectId}.${isLivePurchase ? "pdf" : "txt"}`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (downloadError) {
      setError(downloadError.message || "Download unavailable.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
      <h3 className="font-bold text-slate-900 dark:text-white">
        Your selected subjects
      </h3>

      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {isLivePurchase
          ? "Download the PDFs included in your verified purchase."
          : "These buttons download test receipts. Full PDFs stay private in Test Mode."}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {ids.map((id, index) => (
          <button
            key={id}
            type="button"
            disabled={busyId !== null}
            onClick={() => downloadFile(id)}
            className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 hover:border-amber-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <span>
              {payment.subjects?.[index] || id}
              {busyId === id ? " · Downloading…" : ""}
            </span>
            <Download size={17} className="shrink-0" />
          </button>
        ))}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 text-sm font-semibold text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Saved purchases remain available in My Study Notes on this browser.
      </p>
    </div>
  );
}
