import { useRef, useEffect } from "react";

export default function TopTicker() {
  const text =
    "🚀 UPSC CSAT 2026 Test Series Launching Soon! 🎯 Get 10 Sectional Tests • 10 Previous Year Papers • 10 Full-Length Mocks ✅ Early Bird Discount Available 🕒 Limited Time Offer — Subscribe Now & Boost Your UPSC Prep with Confidence 🔥";

  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const containerWidth = wrapper.parentElement.offsetWidth;

    // Clear previous content
    wrapper.innerHTML = "";

    // Create text spans dynamically
    const span = document.createElement("span");
    span.className = "marquee-content";
    span.textContent = text;
    wrapper.appendChild(span);

    const spanWidth = span.offsetWidth;
    let repeatCount = Math.ceil(containerWidth * 2 / spanWidth);

    for (let i = 1; i < repeatCount; i++) {
      const clone = span.cloneNode(true);
      wrapper.appendChild(clone);
    }
  }, [text]);

  return (
    <div className="ticker-container">
      <div className="marquee-wrapper" ref={wrapperRef}></div>
    </div>
  );
}
