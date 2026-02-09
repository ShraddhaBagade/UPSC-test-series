import { useState, useEffect } from "react";

export default function CountdownTimer() {
  const targetDate = new Date("2026-05-24T09:00:00").getTime(); // Launch date
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());

  function getTimeRemaining() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { label: "Days", value: timeLeft.days, icon: "📅" },
    { label: "Hours", value: timeLeft.hours, icon: "⏰" },
    { label: "Minutes", value: timeLeft.minutes, icon: "🕒" },
    { label: "Seconds", value: timeLeft.seconds, icon: "⏳" },
  ];

  return (
    <div className="relative bg-gradient-to-br from-yellow-500 via-orange-600 to-red-700 text-center py-20 px-6 overflow-hidden">
      {/* subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent)] animate-pulse"></div>

      <h2 className="relative text-4xl md:text-5xl font-extrabold mb-6 text-white drop-shadow-lg">
        🚀 UPSC PRELIMS 24TH MAY 2026
      </h2>
      <h4 className="relative text-2xl md:text-3xl font-bold mb-12 text-yellow-200 tracking-widest drop-shadow-md">
        TIME LEFT
      </h4>

      <div className="relative flex justify-center flex-wrap gap-8 z-10">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="bg-gradient-to-br from-white to-gray-100 text-gray-800 shadow-[6px_6px_15px_rgba(0,0,0,0.25),-4px_-4px_10px_rgba(255,255,255,0.6)] rounded-2xl px-6 py-6 w-32 transform transition-all hover:scale-110 hover:shadow-[10px_10px_25px_rgba(0,0,0,0.35),-6px_-6px_15px_rgba(255,255,255,0.7)]"
          >
            <div className="text-3xl mb-2">{unit.icon}</div>
            <span className="block text-5xl font-extrabold drop-shadow-sm">
              {unit.value}
            </span>
            <span className="text-sm uppercase tracking-widest font-semibold text-gray-600">
              {unit.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-10 text-lg md:text-xl text-white font-medium drop-shadow-lg">
        Prepare with our complete UPSC CSAT Test Series & boost your confidence!
      </p>
    </div>
  );
}
