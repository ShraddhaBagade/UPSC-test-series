import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../lib/AuthContext";

const studyMaterials = [
  {
    title: "Indian Polity",
    text: "Quick revision notes",
    pages: "42 pages",
    price: "₹99",
    image: "/images/subjects/polity.jpg",
    sample: "/pdfs/samples/polity-sample.pdf",
  },
  {
    title: "Modern History",
    text: "Timeline and key facts",
    pages: "38 pages",
    price: "₹99",
    image: "/images/subjects/modern-india.jpg",
    sample: "/pdfs/samples/modern-history-sample.pdf",
  },
  {
    title: "Indian Geography",
    text: "Maps and concepts",
    pages: "45 pages",
    price: "₹99",
    image: "/images/subjects/indian-geography.jpg",
    sample: "/pdfs/samples/indian-geography-sample.pdf",
  },
  {
    title: "Economics",
    text: "Simple revision notes",
    pages: "40 pages",
    price: "₹99",
    image: "/images/subjects/economics.jpg",
    sample: "/pdfs/samples/economics-sample.pdf",
  },
  {
    title: "Environment",
    text: "Important topics",
    pages: "35 pages",
    price: "₹99",
    image: "/images/subjects/environment.jpg",
    sample: "/pdfs/samples/environment-sample.pdf",
  },
  {
    title: "Science and Tech",
    text: "Exam-focused notes",
    pages: "32 pages",
    price: "₹99",
    image: "/images/subjects/science.jpg",
    sample: "/pdfs/samples/science-sample.pdf",
  },
  {
    title: "Ancient India",
    text: "Ancient history revision notes",
    pages: "PDF notes",
    price: "₹99",
    image: "/images/subjects/ancient-india.jpg",
    cover: "from-amber-100 via-orange-100 to-rose-100",
    sample: "/pdfs/samples/ancient-india-sample.pdf",
  },
  {
    title: "Medieval Indian History",
    text: "Medieval history revision notes",
    pages: "PDF notes",
    price: "₹99",
    image: "/images/subjects/medieval-india.jpg",
    cover: "from-violet-100 via-purple-100 to-pink-100",
    sample: "/pdfs/samples/medieval-indian-history-sample.pdf",
  },
  {
    title: "Art & Culture",
    text: "Indian art and culture notes",
    pages: "PDF notes",
    price: "₹99",
    image: "/images/subjects/art-culture.jpg",
    cover: "from-teal-100 via-emerald-100 to-yellow-100",
    sample: "/pdfs/samples/art-culture-sample.pdf",
  },
];

const bundles = [
  {
    title: "Buy 3 PDFs",
    text: "Choose any 3 subjects",
    items: "3 PDFs",
    count: 3,
    oldPrice: "₹297",
    price: "₹249",
    save: "Save ₹48",
    color: "bg-[#EAF4FF]",
  },
  {
    title: "Buy 5 PDFs",
    text: "Choose any 5 subjects",
    items: "5 PDFs",
    count: 5,
    oldPrice: "₹495",
    price: "₹399",
    save: "Save ₹96",
    color: "bg-[#FFF4D8]",
    popular: true,
  },
  {
    title: "Buy All PDFs",
    text: "Get every subject in the current collection",
    items: "9 PDFs",
    count: 9,
    oldPrice: "₹891",
    price: "₹699",
    save: "Save ₹192",
    color: "bg-[#E9F7F0]",
  },
];

function subjectId(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function BundleCover({ bundle }) {
  // Images are previews. Buyers choose the actual subjects for 3 and 5 PDFs.
  const previewMaterials =
    bundle.count === 3
      ? studyMaterials.slice(0, 3)
      : bundle.count === 5
        ? studyMaterials.slice(1, 6)
        : studyMaterials;

  const layout =
    bundle.count === 3
      ? "grid-cols-3 grid-rows-1"
      : bundle.count === 5
        ? "grid-cols-3 grid-rows-2"
        : "grid-cols-3 grid-rows-3";

  return (
    <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800">
      <div className={`grid h-full gap-1 ${layout}`}>
        {previewMaterials.map((material, index) => (
          <div
            key={material.title}
            className={`min-w-0 overflow-hidden ${
              bundle.count === 5 && index === 4 ? "col-span-2" : ""
            }`}>
            {material.image ? (
              <img
                src={material.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full items-center justify-center bg-gradient-to-br ${
                  material.cover || "from-yellow-100 to-blue-100"
                } dark:from-slate-700 dark:to-slate-800`}>
                <span className="px-1 text-center text-[10px] font-bold leading-tight text-slate-700 dark:text-slate-100">
                  {material.title}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

      <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-slate-900 shadow-sm">
        {bundle.items} · Subject previews
      </span>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [activeBundleCount, setActiveBundleCount] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const navigate = useNavigate();

  function startPurchase(item, type, chosenMaterials = []) {
    const included = type === "bundle" ? chosenMaterials : [item];

    if (
      type === "bundle" &&
      (included.length !== item.count ||
        new Set(included.map((material) => material.title)).size !== item.count)
    ) {
      return;
    }

    const purchase = {
      id: `${type}-${subjectId(item.title)}`,
      type,
      title: item.title,
      price: item.price,
      image: item.image || null,
      bundleCount: type === "bundle" ? item.count : null,
      selectionSummary: included.map((material) => material.title).join(", "),
      subjectIds: included.map((material) => subjectId(material.title)),
      subjects: included.map((material) => material.title),
      items: included.map((material) => ({
        id: subjectId(material.title),
        title: material.title,
      })),
    };

    sessionStorage.setItem("examBytePendingPurchase", JSON.stringify(purchase));

    navigate("/checkout");
  }

  function chooseBundle(bundle) {
    if (bundle.count === studyMaterials.length) {
      startPurchase(bundle, "bundle", studyMaterials);
      return;
    }

    setSelectedSubjects([]);
    setActiveBundleCount(bundle.count);

    requestAnimationFrame(() => {
      document
        .getElementById("bundle-selection")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleSubject(title) {
    setSelectedSubjects((current) => {
      if (current.includes(title)) {
        return current.filter((subject) => subject !== title);
      }

      return current.length < activeBundleCount ? [...current, title] : current;
    });
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#FBFCFF] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main id="top" className="flex-1">
        {/* Bundles */}
        <section
          id="bundles"
          className="scroll-mt-20 border-y border-yellow-100 bg-gradient-to-br from-[#FFF9EA] via-[#F1F6FF] to-[#F6F0FF] px-6 py-20 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-yellow-600 dark:text-amber-300">
                Save with bundles
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                More material. Better value.
              </h2>

              <p className="mt-3 text-slate-600 dark:text-slate-300">
                Choose 3, choose 5, or get all {studyMaterials.length} PDFs.
              </p>

              {user && (
                <Link
                  to="/my-purchases"
                  className="mt-5 inline-flex rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-200">
                  My Study Notes
                </Link>
              )}
            </div>

            <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
              {bundles.map((bundle) => (
                <article
                  key={bundle.title}
                  className={`relative rounded-3xl p-7 shadow-sm ring-1 ring-white dark:bg-slate-900 dark:ring-slate-700 ${bundle.color}`}>
                  {bundle.popular && (
                    <span className="absolute right-6 top-6 rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-white dark:bg-amber-400 dark:text-slate-950">
                      Best value
                    </span>
                  )}

                  <BundleCover bundle={bundle} />

                  <h3 className="mt-6 text-2xl font-extrabold text-slate-900 dark:text-white">
                    {bundle.title}
                  </h3>

                  <p className="mt-2 text-slate-600 dark:text-slate-300">
                    {bundle.text}
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <CheckCircle2
                        size={18}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                      {bundle.items}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <CheckCircle2
                        size={18}
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                      {bundle.count === studyMaterials.length
                        ? "Every subject included"
                        : "You pick the subjects"}
                    </div>
                  </div>

                  <div className="mt-7 flex items-end justify-between">
                    <div>
                      <p className="text-sm text-slate-500 line-through dark:text-slate-400">
                        {bundle.oldPrice}
                      </p>
                      <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {bundle.price}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm dark:bg-slate-800 dark:text-emerald-300">
                      {bundle.save}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => chooseBundle(bundle)}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-3 font-semibold text-white transition hover:bg-yellow-600 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300">
                    {bundle.count === studyMaterials.length
                      ? "Buy all PDFs"
                      : `Choose ${bundle.count} PDFs`}
                    <ArrowRight size={17} />
                  </button>
                </article>
              ))}
            </div>

            {/* Choose subjects for a 3 or 5 PDF bundle */}
            {activeBundleCount !== null && (
              <div
                id="bundle-selection"
                className="mx-auto mt-10 max-w-5xl scroll-mt-24 rounded-3xl border border-yellow-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900 md:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-yellow-600 dark:text-amber-300">
                      Build your bundle
                    </p>
                    <h3 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                      Choose exactly {activeBundleCount} PDFs
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      Your choices will be included in the order details.
                    </p>
                  </div>

                  <span
                    aria-live="polite"
                    className="w-fit rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-yellow-800 dark:bg-amber-400/10 dark:text-amber-300">
                    {selectedSubjects.length} of {activeBundleCount} selected
                  </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {studyMaterials.map((material) => {
                    const checked = selectedSubjects.includes(material.title);

                    return (
                      <label
                        key={material.title}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition ${
                          checked
                            ? "border-yellow-400 bg-yellow-50 text-slate-900 dark:border-amber-400 dark:bg-slate-800 dark:text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-yellow-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        }`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={
                            !checked &&
                            selectedSubjects.length >= activeBundleCount
                          }
                          onChange={() => toggleSubject(material.title)}
                          className="h-4 w-4 accent-amber-500"
                        />
                        {material.title}
                      </label>
                    );
                  })}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    disabled={selectedSubjects.length !== activeBundleCount}
                    onClick={() =>
                      startPurchase(
                        bundles.find(
                          (bundle) => bundle.count === activeBundleCount,
                        ),
                        "bundle",
                        studyMaterials.filter((material) =>
                          selectedSubjects.includes(material.title),
                        ),
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-white transition hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300">
                    Continue with {activeBundleCount} PDFs
                    <ArrowRight size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveBundleCount(null);
                      setSelectedSubjects([]);
                    }}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Individual PDFs */}
        <section
          id="study-material"
          className="scroll-mt-20 bg-white px-6 py-20 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-yellow-600 dark:text-amber-300">
                  Study material
                </p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white">
                  Buy one PDF.
                </h2>
                <p className="mt-2 text-slate-600 dark:text-slate-300">
                  Pick a subject and preview its notes.
                </p>
              </div>

              <a
                href="/#bundles"
                className="inline-flex items-center gap-2 font-semibold text-yellow-700 hover:text-yellow-800 dark:text-amber-300 dark:hover:text-amber-200">
                Prefer a bundle?
                <ArrowRight size={18} />
              </a>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {studyMaterials.map((material) => (
                <article
                  key={material.title}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 dark:ring-slate-800 dark:hover:shadow-black/30">
                  <div className="h-44 overflow-hidden bg-yellow-50 dark:bg-slate-800">
                    {material.image ? (
                      <img
                        src={material.image}
                        alt={`${material.title} PDF cover`}
                        className="h-full w-full object-cover transition duration-500 hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`flex h-full items-center justify-center bg-gradient-to-br px-6 text-center ${material.cover} dark:from-slate-800 dark:via-slate-700 dark:to-slate-900`}>
                        <span className="rounded-2xl border border-white/70 bg-white/75 px-5 py-3 text-xl font-extrabold text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-900/80 dark:text-white">
                          {material.title}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      PDF Notes
                    </p>
                    <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
                      {material.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {material.text}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {material.pages}
                      </span>
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {material.price}
                      </span>
                    </div>

                    <a
                      href={material.sample}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 block text-center text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                      View sample pages
                    </a>

                    <button
                      type="button"
                      onClick={() => startPurchase(material, "pdf")}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300">
                      Buy PDF
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
