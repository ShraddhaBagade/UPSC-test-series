import { useState } from "react";
import { Check, Download } from "lucide-react";
import { authFetch } from "../lib/authFetch";

function getSubjectImage(subjectId, title) {
  const value = `${subjectId} ${title}`.toLowerCase().replaceAll("&", "and");

  if (value.includes("polity")) return "/images/subjects/polity.jpg";
  if (value.includes("modern")) return "/images/subjects/modern-india.jpg";
  if (value.includes("geography")) {
    return "/images/subjects/indian-geography.jpg";
  }
  if (value.includes("economic")) return "/images/subjects/economics.jpg";
  if (value.includes("environment")) return "/images/subjects/environment.jpg";
  if (value.includes("science") || value.includes("technology")) {
    return "/images/subjects/science.jpg";
  }
  if (value.includes("ancient")) return "/images/subjects/ancient-india.jpg";
  if (value.includes("medieval")) return "/images/subjects/medieval-india.jpg";
  if (value.includes("culture")) return "/images/subjects/art-culture.jpg";

  return null;
}

export default function TestDownloads({ payment }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [failedImages, setFailedImages] = useState(() => new Set());

  const subjectIds = Array.isArray(payment?.subjectIds)
    ? payment.subjectIds
    : [];

  const subjectNames = Array.isArray(payment?.subjects) ? payment.subjects : [];

  async function downloadFile(subjectId) {
    setBusyId(subjectId);
    setError("");

    try {
      if (!payment?.orderId) {
        throw new Error("This purchase is missing its order ID.");
      }

      const response = await authFetch(
        `/api/download?orderId=${encodeURIComponent(
          payment.orderId,
        )}&subjectId=${encodeURIComponent(subjectId)}`,
      );

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok || !result.url) {
        throw new Error(result.error || "Download unavailable.");
      }

      const link = document.createElement("a");
      link.href = result.url;
      link.download = result.filename || `ExamByte-${subjectId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Download unavailable.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-lg font-extrabold">Your purchased subjects</h3>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Your ExamByte PDFs are ready for secure download.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          {subjectIds.length} {subjectIds.length === 1 ? "subject" : "subjects"}
        </span>
      </div>

      {subjectIds.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjectIds.map((subjectId, index) => {
            const title = subjectNames[index] || subjectId;
            const image = getSubjectImage(subjectId, title);
            const imageFailed = failedImages.has(subjectId);

            return (
              <article
                key={subjectId}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 to-orange-50 dark:from-slate-700 dark:to-slate-800">
                  {image && !imageFailed ? (
                    <img
                      src={image}
                      alt={`${title} study material`}
                      loading="lazy"
                      onError={() =>
                        setFailedImages((current) =>
                          new Set(current).add(subjectId),
                        )
                      }
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-amber-700 dark:text-amber-300">
                      <span className="text-4xl font-extrabold">
                        {title.slice(0, 1)}
                      </span>
                    </div>
                  )}

                  <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm">
                    <Check size={14} />
                    Owned
                  </span>
                </div>

                <div className="p-4">
                  <h4 className="min-h-12 text-base font-extrabold leading-6 text-slate-900 dark:text-white">
                    {title}
                  </h4>

                  <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    Included in your verified purchase
                  </p>

                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => downloadFile(subjectId)}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300">
                    <Download size={17} />
                    {busyId === subjectId
                      ? "Preparing download…"
                      : "Download PDF"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          No subjects are listed for this purchase.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </p>
      )}
    </section>
  );
}
