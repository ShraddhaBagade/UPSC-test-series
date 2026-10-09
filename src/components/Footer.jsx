import { Instagram, Send, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 border-t border-yellow-100 bg-[#FFF9EA]"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <a href="#top" className="text-xl font-extrabold text-yellow-500">
            ExamByte
          </a>

          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Simple study material for focused learning.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-slate-900">Material</h3>

          <div className="mt-4 flex flex-col gap-3 text-sm font-medium text-slate-600">
            <a href="#study-material" className="hover:text-yellow-700">
              Study Material
            </a>
            <a href="#bundles" className="hover:text-yellow-700">
              PDF Bundles
            </a>
            <a href="#free-sample" className="hover:text-yellow-700">
              Free Sample
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900">Follow ExamByte</h3>

          <div className="mt-4 flex gap-3">
            <a
              href="https://www.instagram.com/exambyteindia/"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-pink-100 p-3 text-pink-600 transition hover:bg-pink-200"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram size={20} />
            </a>

            <a
              href="https://www.youtube.com/@YOUR_CHANNEL"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-200"
              aria-label="YouTube"
              title="YouTube"
            >
              <Youtube size={20} />
            </a>

            <a
              href="https://t.me/YOUR_CHANNEL"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-blue-100 p-3 text-blue-600 transition hover:bg-blue-200"
              aria-label="Telegram"
              title="Telegram"
            >
              <Send size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-yellow-100 px-6 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} ExamByte · Privacy · Terms · Refund Policy
      </div>
    </footer>
  );
}