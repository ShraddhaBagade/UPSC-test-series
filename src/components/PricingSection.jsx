// src/components/PricingSection.jsx

export default function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "₹499",
      features: [
        "10 Sectional Tests",
        "Few Tests Free",
        "Detailed Performance Analysis",
      ],
    },
    {
      name: "Standard",
      price: "₹999",
      features: [
        "10 Sectional Tests",
        "10 Previous Year Papers",
        "Detailed Performance Analysis",
      ],
      popular: true, // highlight plan
    },
    {
      name: "Premium",
      price: "₹1499",
      features: [
        "10 Sectional & 10 Full-Length Tests",
        "10 Previous Year Papers",
        "Detailed Performance Analysis",
      ],
    },
  ];

  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Choose Your Plan</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl bg-white shadow-lg p-8 transition-all duration-300 hover:scale-105 hover:border-2 hover:border-blue-600`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
              <p className="text-4xl font-bold text-black-600 mb-6">{plan.price}</p>

              <ul className="text-left mb-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <span className="text-blue-600 mr-2">✔</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
