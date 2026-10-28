import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";
import { Clock, Instagram, Mail, MessageCircle } from "lucide-react";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import MyPurchases from "./pages/MyPurchases";
import PaymentResult from "./pages/PaymentResult";
import LegalPage from "./pages/LegalPage";
import { AuthProvider } from "./lib/AuthContext";
import Account from "./pages/Account";
import About from "./pages/About";

function ComingSoon({ title }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#FBFCFF] px-6 text-center text-slate-900">
      <h1 className="text-3xl font-extrabold">{title}</h1>

      <p className="mt-3 text-slate-600">This page is coming soon.</p>

      <Link
        to="/"
        className="mt-6 rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-white">
        Back to ExamByte
      </Link>
    </main>
  );
}

function ContactPage() {
  return (
    <LegalPage title="Contact ExamByte">
      <p className="max-w-2xl text-lg leading-8">
        Need help with an order, PDF delivery, bundle selection, or access to
        your study material? Our support team is here to help.
      </p>

      <div className="grid gap-4 pt-2 md:grid-cols-2">
        <a
          href="https://www.instagram.com/exambyteindia/"
          target="_blank"
          rel="noreferrer"
          className="group rounded-2xl border border-pink-100 bg-pink-50 p-5 transition hover:-translate-y-1 hover:border-pink-200 hover:shadow-md">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-pink-200 p-3 text-pink-700">
              <Instagram size={22} />
            </span>

            <div>
              <h2 className="font-bold text-slate-900">Instagram DM</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Message us for quick questions about PDFs, bundles, and
                previews.
              </p>
              <span className="mt-3 inline-block text-sm font-bold text-pink-700 group-hover:underline">
                @exambyteindia →
              </span>
            </div>
          </div>
        </a>

        <a
          href="mailto:exambyte01@gmail.com"
          className="group rounded-2xl border border-blue-100 bg-blue-50 p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-blue-200 p-3 text-blue-700">
              <Mail size={22} />
            </span>

            <div>
              <h2 className="font-bold text-slate-900">Email Support</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                For payment, order, delivery, or technical support questions.
              </p>
              <span className="mt-3 inline-block text-sm font-bold text-blue-700 group-hover:underline">
                exambyte01@gmail.com →
              </span>
            </div>
          </div>
        </a>
      </div>

      <div className="rounded-2xl border border-yellow-100 bg-[#FFF9EA] p-5">
        <div className="flex gap-3">
          <span className="rounded-xl bg-yellow-200 p-3 text-yellow-800">
            <Clock size={21} />
          </span>

          <div>
            <h2 className="font-bold text-slate-900">Support response time</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              We usually reply within 1–2 business days. Please include your
              order email and payment reference when asking about an existing
              order.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-slate-100 pt-5 text-sm text-slate-500">
        <MessageCircle size={18} className="text-yellow-600" />
        For faster help, please contact us through Instagram DM.
      </div>
    </LegalPage>
  );
}

function TermsPage() {
  return (
    <LegalPage title="Terms & Conditions">
      <p className="max-w-3xl text-lg leading-8">
        Welcome to ExamByte. These Terms & Conditions govern your use of the
        ExamByte website and purchase of our digital educational products.
        Please read them before placing an order.
      </p>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          1. About ExamByte
        </h2>

        <p className="mt-3">
          ExamByte provides digital General Awareness revision PDFs for personal
          study and revision. Our material is designed to support organised
          learning, active recall, self-testing, and faster revision.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          2. Acceptance of these terms
        </h2>

        <p className="mt-3">
          By browsing this website, creating an account, or purchasing an
          ExamByte product, you agree to these Terms & Conditions, our Refunds &
          Cancellations Policy, and any information shown during checkout.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          3. Products and prices
        </h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>
            ExamByte products are digital PDFs. No physical product is shipped.
          </li>
          <li>
            Product descriptions, included subjects, bundle choices, and prices
            are displayed on the website before payment.
          </li>
          <li>All prices are shown in Indian Rupees (₹ / INR).</li>
          <li>
            We may update product information, subjects, prices, or offers when
            needed. Changes will not affect an already completed order.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          4. Payments and order confirmation
        </h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>
            Payment must be successfully completed and verified before a digital
            product is delivered or made available.
          </li>
          <li>
            An order is confirmed only after successful payment confirmation.
          </li>
          <li>
            If payment is pending, failed, reversed, or not verified, the order
            will not be fulfilled until the payment status is confirmed.
          </li>
          <li>
            Please check all bundle selections, product choices, and email
            details before completing payment.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          5. Digital delivery and access
        </h2>

        <p className="mt-3">
          After successful payment, the purchased PDF may be delivered by email,
          made available in the buyer’s ExamByte library, or provided through
          another stated delivery method. Delivery timing and access details
          will be shown during or after checkout.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          6. Personal-use licence
        </h2>

        <p className="mt-3">
          When you purchase an ExamByte PDF, you receive a limited,
          non-transferable licence to use that material for your own personal
          study and revision.
        </p>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>
            Do not share the PDF with friends, groups, or coaching classes.
          </li>
          <li>
            Do not upload it to Telegram, Google Drive, websites, or social
            media.
          </li>
          <li>
            Do not copy, reproduce, modify, resell, rent, or redistribute it.
          </li>
          <li>
            Do not remove watermarks, copyright notices, or ExamByte branding.
          </li>
          <li>Do not use the content for commercial teaching or resale.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          7. Intellectual property
        </h2>

        <p className="mt-3">
          All ExamByte PDFs, content, branding, graphics, text, layouts, and
          website materials are owned by ExamByte or used with permission.
          Purchase of a PDF does not transfer ownership or copyright to the
          buyer.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          8. No guarantee of examination results
        </h2>

        <p className="mt-3">
          ExamByte material is intended as a revision resource only. We do not
          guarantee any exam score, rank, selection, result, job offer, or
          outcome. Individual results depend on many factors, including the
          learner’s preparation, practice, and exam performance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          9. Refunds and cancellations
        </h2>

        <p className="mt-3">
          Refund and cancellation requests are handled according to our Refunds
          & Cancellations Policy. Because these are digital products, orders are
          generally not eligible for cancellation or refund after delivery,
          access, or download, except in the situations explained in that
          policy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          10. Acceptable use
        </h2>

        <p className="mt-3">
          You must not misuse the ExamByte website, interfere with its security,
          attempt unauthorised access, submit false payment information, or use
          the website for unlawful purposes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          11. Changes to these terms
        </h2>

        <p className="mt-3">
          ExamByte may update these Terms & Conditions when needed. The version
          available on the website at the time of your purchase will apply to
          that order.
        </p>
      </section>

      <section className="rounded-2xl border border-yellow-100 bg-[#FFF9EA] p-5">
        <h2 className="text-lg font-extrabold text-slate-900">
          12. Contact us
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          For questions about these Terms & Conditions, contact ExamByte at{" "}
          <a
            href="mailto:exambyte01@gmail.com"
            className="font-semibold text-yellow-700 underline">
            exambyte01@gmail.com
          </a>{" "}
          or through{" "}
          <a
            href="https://www.instagram.com/exambyteindia/"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-yellow-700 underline">
            @exambyteindia
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}

function RefundPolicyPage() {
  return (
    <LegalPage title="Refunds & Cancellations">
      <p className="max-w-3xl text-lg leading-8">
        ExamByte provides digital Government Exam revision PDFs. Please read
        this policy before placing an order.
      </p>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <h2 className="text-lg font-extrabold text-slate-900">
          Digital product policy
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          ExamByte sells digital educational PDFs only. No physical products are
          shipped. Once a purchased PDF has been delivered, added to the buyer’s
          library, or downloaded, it normally cannot be cancelled or refunded.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">Cancellations</h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>
            Orders can be cancelled before payment is successfully completed.
          </li>
          <li>
            If payment is successful but delivery has not started, contact
            ExamByte immediately. We will review whether cancellation is
            possible.
          </li>
          <li>
            Once digital content is delivered, accessible, or downloaded,
            cancellation is generally not possible.
          </li>
          <li>
            For 3-PDF and 5-PDF bundles, please check your chosen subjects
            carefully before completing payment.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          Situations where a refund may be approved
        </h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>You were charged more than once for the same order.</li>
          <li>
            You were charged an incorrect amount because of an ExamByte pricing
            or technical error.
          </li>
          <li>
            Payment was successful but the purchased PDF was not delivered
            within the stated delivery time.
          </li>
          <li>
            The wrong PDF or wrong bundle was delivered because of an ExamByte
            error.
          </li>
          <li>
            A delivered PDF is corrupted, cannot be opened, or has a genuine
            technical issue that cannot be fixed or replaced.
          </li>
          <li>A bundle did not include the selected number of PDF subjects.</li>
          <li>
            A duplicate order was created because of a technical or payment
            gateway issue.
          </li>
          <li>
            A verified unauthorised-payment issue is reported and confirmed
            after review with the payment provider or bank.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          Situations where a refund is normally not available
        </h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>Change of mind after the PDF has been delivered or accessed.</li>
          <li>Not using the PDF after purchase.</li>
          <li>
            Expecting a particular exam score, rank, selection, or result.
          </li>
          <li>
            Buying the wrong subject or bundle after it has already been
            delivered.
          </li>
          <li>
            Not checking the product description, sample pages, subjects, or
            price before completing payment.
          </li>
          <li>
            Device, storage, internet, browser, or PDF-reader issues where the
            PDF itself is working correctly.
          </li>
          <li>
            Providing an incorrect email address or account information during
            checkout after delivery has already been made to the submitted
            details.
          </li>
          <li>
            Sharing, copying, uploading, reselling, or redistributing ExamByte
            material.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-yellow-100 bg-[#FFF9EA] p-5">
        <h2 className="text-lg font-extrabold text-slate-900">
          How to request support or a refund
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Contact ExamByte within 7 days of payment through Instagram or email.
          Please include your full name, order email, order ID if available,
          payment reference / UTR, payment date, amount, and a short description
          of the issue.
        </p>

        <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
          Never share your UPI PIN, OTP, card number, CVV, or bank password.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          Refund processing
        </h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>
            We aim to respond to support requests within 1–2 business days.
          </li>
          <li>
            Approved refunds will be sent to the original payment method where
            possible.
          </li>
          <li>
            After a refund is initiated, final credit timing depends on the
            payment method and the customer’s bank.
          </li>
          <li>
            This policy does not remove any rights available under applicable
            law.
          </li>
        </ul>
      </section>
    </LegalPage>
  );
}

function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p className="max-w-3xl text-lg leading-8">
        ExamByte respects your privacy. This Privacy Policy explains what
        information we collect, why we collect it, and how we use and protect
        it.
      </p>

      <p className="text-sm text-slate-500">Last updated: 27 October 2026</p>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          1. Information we may collect
        </h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>
            Name, email address, and mobile number used to create an account or
            place an order.
          </li>
          <li>
            Order details, including purchased PDFs and selected bundle
            subjects.
          </li>
          <li>
            Payment status, payment reference, transaction ID, or UTR where
            needed for support.
          </li>
          <li>
            Messages or information you send through email, Instagram, or
            support requests.
          </li>
          <li>
            Basic technical information needed to operate and protect the
            website.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          2. Payment information
        </h2>

        <p className="mt-3">
          Payments are processed through our payment gateway provider. ExamByte
          does not store your card number, CVV, UPI PIN, OTP, internet-banking
          password, or other sensitive payment credentials.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          3. How we use your information
        </h2>

        <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
          <li>To process payments and confirm orders.</li>
          <li>To provide access to purchased digital PDFs.</li>

          <li>
            To create a personalised watermark on purchased PDFs containing your
            name, email address, mobile number, and order ID to help prevent
            unauthorised sharing, copying, or resale.
          </li>

          <li>
            To respond to delivery, payment, technical, or support requests.
          </li>
          <li>
            To prevent fraud, duplicate orders, misuse, or unauthorised access.
          </li>
          <li>
            To maintain records required for accounting, legal, or business
            purposes.
          </li>
          <li>To improve the ExamByte website and customer experience.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          4. When information may be shared
        </h2>

        <p className="mt-3">
          ExamByte does not sell your personal information. We may share limited
          information only when necessary with trusted providers that help us
          operate the website, process payments, deliver products, provide
          technical support, comply with law, or protect against fraud.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          5. Data security
        </h2>

        <p className="mt-3">
          We take reasonable steps to protect the information we hold. However,
          no internet transmission or electronic storage system can be
          guaranteed to be completely secure. Please do not send sensitive
          banking details, OTPs, passwords, card numbers, CVVs, or UPI PINs
          through email or Instagram.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          6. Data retention
        </h2>

        <p className="mt-3">
          We retain order and account information only for as long as reasonably
          necessary to provide purchased access, resolve support issues, prevent
          fraud, and meet legal or accounting obligations.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          7. Your choices
        </h2>

        <p className="mt-3">
          You may contact us to ask about the personal information associated
          with your ExamByte account or order. We may need to verify your
          identity before acting on a request.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-extrabold text-slate-900">
          8. Changes to this policy
        </h2>

        <p className="mt-3">
          We may update this Privacy Policy when required. The latest version
          will always be available on this website.
        </p>
      </section>

      <section className="rounded-2xl border border-yellow-100 bg-[#FFF9EA] p-5">
        <h2 className="text-lg font-extrabold text-slate-900">9. Contact us</h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          For privacy-related questions, email{" "}
          <a
            href="mailto:exambyte01@gmail.com"
            className="font-semibold text-yellow-700 underline">
            exambyte01@gmail.com
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/test/:id"
            element={<ComingSoon title="Practice tests" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/my-purchases" element={<MyPurchases />} />
          <Route path="/account" element={<Account />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/about" element={<About />} />

          <Route path="/refund-policy" element={<RefundPolicyPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
