import { Link } from "react-router-dom";
import { Instagram, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 border-t border-yellow-100 bg-[#FFF9EA]">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-3">
        <div>
          <a href="/#top" className="text-xl font-extrabold text-yellow-500">
            ExamByte
          </a>

          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Concise General Awareness revision PDFs for focused, organised
            study.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-slate-900">Material</h3>

          <div className="mt-4 flex flex-col gap-3 text-sm font-medium text-slate-600">
            <a href="/#study-material" className="hover:text-yellow-700">
              Study Material
            </a>

            <a href="/#bundles" className="hover:text-yellow-700">
              PDF Bundles
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
              title="Instagram">
              <Instagram size={20} />
            </a>

            <a
              href="https://www.youtube.com/@ExamByte123"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-red-100 p-3 text-red-600 transition hover:bg-red-200"
              aria-label="YouTube"
              title="YouTube">
              <Youtube size={20} />
            </a>
          </div>

          <p className="mt-4 text-sm text-slate-600">
            Need help?{" "}
            <a
              href="mailto:exambyte01@gmail.com"
              className="font-semibold text-yellow-700 hover:underline">
              Contact ExamByte
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-yellow-100 px-6 py-5 text-center text-sm text-slate-500">
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
          <span>© {new Date().getFullYear()} ExamByte</span>
          <Link to="/contact" className="hover:text-yellow-700 hover:underline">
            Contact Us
          </Link>
          
          <Link to="/terms" className="hover:text-yellow-700 hover:underline">
            Terms & Conditions
          </Link>

          <Link
            to="/privacy-policy"
            className="hover:text-yellow-700 hover:underline">
            Privacy Policy
          </Link>

          <Link
            to="/refund-policy"
            className="hover:text-yellow-700 hover:underline">
            Refunds & Cancellations
          </Link>
        </div>
      </div>
    </footer>
  );
}
