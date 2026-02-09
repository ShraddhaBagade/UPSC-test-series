// src/components/SubscribePopup.jsx
import React, { useState, useEffect } from "react";

export default function SubscribePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup 2 seconds after page load
    const timer = setTimeout(() => setIsOpen(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative transform transition-transform duration-500 scale-100 animate-slide-in">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Hurry Up! Limited Time Offer ⏳
        </h2>

        {/* Description */}
        <p className="text-gray-700 mb-6">
          Subscribe now to get early access to our UPSC CSAT 2026 Test Series.
          Don’t miss out on the exclusive launch benefits!
        </p>

        {/* Email Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-lg transition">
            Subscribe
          </button>
        </div>

        {/* Optional Footer Note */}
        <p className="text-gray-500 text-sm mt-4">
          We respect your privacy. No spam, only updates.
        </p>
      </div>
    </div>
  );
}
