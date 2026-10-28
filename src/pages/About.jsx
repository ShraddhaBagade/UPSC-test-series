import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Target } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBFCFF] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header />

      <main className="flex-1">
        <section className="border-b border-amber-100 bg-gradient-to-br from-[#FFF9EA] via-[#F4F8FF] to-[#F6F0FF] px-6 py-20 dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300">
              About ExamByte
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Made for focused exam revision.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              ExamByte creates concise, organised revision PDFs for aspirants
              preparing for competitive government examinations.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-amber-600 dark:text-amber-300">
                Founder&apos;s note
              </p>
              <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
                Built from a real preparation journey.
              </h2>

              <div className="mt-7 space-y-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                <p>
                  I&apos;m SHRADDHA SARANGDHAR BAGADE, the person behind ExamByte.
                  For the past six years, I have been preparing for competitive
                  government examinations, including UPSC and SSC CGL.
                </p>

                <p>
                  I understand how difficult it can be to manage a large amount
                  of material, revise consistently, and identify what matters
                  most close to an exam. The preparation journey requires
                  patience, repetition, and a practical way to organise
                  learning.
                </p>

                <p>
                  ExamByte was created from that experience: to offer concise,
                  organised revision PDFs that help aspirants focus on important
                  concepts, strengthen recall, and revise with more clarity.
                </p>
              </div>
            </div>

            <aside className="rounded-3xl border border-amber-200 bg-[#FFF9EA] p-7 dark:border-slate-700 dark:bg-slate-900 sm:p-8">
              <Target className="text-amber-600 dark:text-amber-300" size={30} />
              <h2 className="mt-5 text-2xl font-extrabold">
                The ExamByte approach
              </h2>

              <ul className="mt-6 space-y-4 text-slate-700 dark:text-slate-200">
                <li className="flex gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  Clear, exam-focused revision material
                </li>
                <li className="flex gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  Organised notes for quicker recall
                </li>
                <li className="flex gap-3">
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                  />
                  Honest support for serious aspirants
                </li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-white px-6 py-16 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
                <BookOpen className="text-amber-500" size={24} />
                <h2 className="mt-4 text-xl font-extrabold">Concise</h2>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                  Revision notes designed to reduce clutter and help you focus
                  on key concepts.
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
                <Target className="text-amber-500" size={24} />
                <h2 className="mt-4 text-xl font-extrabold">Purposeful</h2>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                  Material created to support active recall, self-testing, and
                  structured revision.
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
                <CheckCircle2 className="text-amber-500" size={24} />
                <h2 className="mt-4 text-xl font-extrabold">Honest</h2>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                  ExamByte does not promise marks, ranks, or selection. Results
                  depend on each learner&apos;s preparation and performance.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 text-center sm:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-extrabold">
              Ready to revise with more clarity?
            </h2>
            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
              Explore ExamByte study material and choose the subjects that fit
              your revision plan.
            </p>
            <Link
              to="/#study-material"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 font-extrabold text-slate-950 transition hover:bg-amber-300">
              Explore study material
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}