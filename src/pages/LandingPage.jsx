// src/pages/LandingPage.jsx
import React from "react";
import QRCode from "react-qr-code";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WhyChooseUs from "../components/WhyChooseUs";
import PricingSection from "../components/PricingSection";
import CountdownTimer from "../components/CountdownTimer";
import TopTicker from "../components/TopTicker";
import SubscribePopup from "../components/SubscribePopup";


export default function LandingPage() {
  const features = [
    { icon: "📘", title: "10 Sectional Tests", description: "Cover English, Reasoning & Quantitative Aptitude in depth." },
    { icon: "📝", title: "10 Previous Year Papers", description: "Practice with authentic UPSC CSAT questions from past years." },
    { icon: "⏱️", title: "10 Full-Length Mocks", description: "Simulate real exam conditions with 80-question mock tests." },
  ];

  const reasons = [
    { icon: "📘", text: "Detailed solutions & explanations" },
    { icon: "📝", text: "Previous Year Question Papers" },
    { icon: "📊", text: "Performance analytics & feedback" },
    { icon: "💻📱", text: "Mobile & desktop friendly" },
    { icon: "💰", text: "Affordable pricing plans" },
    { icon: "🔄", text: "Regular updates as per UPSC trends" },
    { icon: "⏳", text: "Flexible learning at your pace" },
    { icon: "🚀", text: "Boost accuracy & confidence" },
  ];

  return (
    <>
      {/* Top Rolling Banner */}
      <TopTicker />

      {/* Subscribe Popup */}
      <SubscribePopup />

      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
        {/* Header */}
        <Header className="bg-blue-600 text-white p-6 text-center">
          <h1 className="text-4xl font-bold">UPSC CSAT Test Series</h1>
          <p className="mt-2 text-lg">Prelims 2026 | Starting January 1, 2026</p>
        </Header>

        {/* Hero Section */}
        <section
          className="relative bg-cover bg-center text-white text-center py-24 px-6"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Crack UPSC CSAT 2026 with Confidence 🚀
            </h2>
            <p className="mt-4 text-lg md:text-xl">
              10 Sectional Tests • 10 PYQs • 10 Full-Length Mocks
            </p>
            <a
              href="/dashboard"
              className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition transform hover:scale-105"
            >
              Start Practicing
            </a>
          </div>
        </section>

        {/* Countdown Timer */}
        <CountdownTimer />

        {/* Key Features */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Key Features of Our Test Series
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((f, i) => (
                <Feature key={i} icon={f.icon} title={f.title} description={f.description} />
              ))}
            </div>
          </div>
        </section>

           {/* Pricing Section */}
           <PricingSection />

        {/* Why Choose Us */}
        <section className="py-16 bg-blue-50">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Why Choose Us</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {reasons.map((r, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition transform hover:scale-105 flex flex-col items-center text-center"
                >
                  <div className="text-3xl mb-2">{r.icon}</div>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

     

        {/* Buy Section with QR Code */}
        <section className="bg-gray-100 p-8 text-center mb-12">
          <h3 className="text-2xl font-bold mb-4">Get the Full Test Series</h3>
          <div className="bg-white inline-block p-6 rounded-lg shadow">
            <QRCode value="https://your-payment-link.com" size={128} />
            <p className="mt-3 text-lg font-semibold">Scan to Buy</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-blue-700 text-white text-center py-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Ace UPSC CSAT 2026? 💯
          </h2>
          <p className="text-lg mb-8">
            Join our comprehensive test series and boost your preparation today!
          </p>
          <a
            href="/dashboard"
            className="bg-white text-blue-700 font-semibold px-10 py-4 rounded-lg shadow-lg hover:bg-gray-200 transition transform hover:scale-105"
          >
            🚀 Get Started Now
          </a>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}

// Feature Component
function Feature({ icon, title, description }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p>{description}</p>
    </div>
  );
}
