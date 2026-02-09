// src/components/WhyChooseUs.jsx

export default function WhyChooseUs() {
  const reasons = [
    { text: "Detailed solutions & explanations", icon: "📘" },
    { text: "Previous Year Question Papers", icon: "📝" },
    { text: "Performance analytics & feedback", icon: "📊" },
    { text: "Mobile & desktop friendly", icon: "💻📱" },
    { text: "Affordable pricing plans", icon: "💰" },
    { text: "Regular updates as per UPSC trends", icon: "🔄" },
    { text: "Flexible learning at your pace", icon: "⏳" },
    { text: "Boost accuracy & confidence", icon: "🚀" },
  ];

  return (
    <section className="py-16 bg-blue-600 text-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
          Why Choose Us
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="bg-white text-blue-600 rounded-lg p-6 shadow hover:shadow-lg transition transform hover:scale-105 flex flex-col items-center text-center"
            >
              {/* ✅ Render emoji string, not object */}
              <div className="text-3xl mb-3">{reason.icon}</div>  
              <h3 className="font-semibold text-lg">{reason.text}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
