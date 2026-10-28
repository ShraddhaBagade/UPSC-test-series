import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LegalPage({ title, children }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCFDFE] text-slate-800">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-[#FFF9EA] via-[#FCFDFE] to-[#F7FAFF] px-5 py-10 sm:px-6 md:py-16">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-amber-700 transition hover:text-amber-800 hover:underline">
            ← Back to ExamByte
          </Link>

          <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-950 to-slate-800 px-7 py-8 text-white md:px-10 md:py-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                ExamByte Support
              </p>

              <h1 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                {title}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Clear information and support for your ExamByte learning
                experience.
              </p>
            </div>

            <div className="px-7 py-8 md:px-10 md:py-10">
              <div className="space-y-5 leading-7 text-slate-600">
                {children}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
