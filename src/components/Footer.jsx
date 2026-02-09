// src/components/Footer.jsx
import {
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaYoutube,
  FaLinkedin,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkedAlt,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 mt-auto">
      {/* GRID: compact version */}
      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center lg:text-left">
        
        {/* Quick Links */}
{/* Quick Links */}
<div className="flex flex-col items-center lg:items-start gap-2 pl-6 lg:pl-6">
  <h2 className="text-lg font-semibold mb-1">Quick Links</h2>
  <ul className="space-y-2 text-white text-base">
    {["Home", "Dashboard", "Test Series", "Pricing", "About", "Contact"].map((link) => (
      <li key={link}>
        <a
          href={`/${link.toLowerCase().replace(" ", "")}`}
          className="inline-block text-white font-medium transition transform hover:scale-105 hover:text-white"
        >
          {link}
        </a>
      </li>
    ))}
  </ul>
</div>



        {/* Contact */}
<div className="flex flex-col items-center lg:items-start gap-3">
  <h2 className="text-lg font-semibold mb-1">Contact</h2>

  <div className="flex items-center gap-2 text-gray-300 text-base md:text-lg">
    <FaEnvelope className="shrink-0" />
    <span className="font-medium">support@csattestseries.com</span>
  </div>

  <div className="flex items-center gap-2 text-gray-300 text-base md:text-lg">
    <FaPhoneAlt className="shrink-0" />
    <span className="font-medium">+91-9876543210</span>
  </div>

  <div className="flex items-center gap-2 text-gray-300 text-base md:text-lg">
    <FaMapMarkedAlt className="shrink-0" />
    <span className="font-medium">Mumbai, India</span>
  </div>
</div>


        {/* Subscribe + Socials */}
        <div className="flex flex-col items-center lg:items-start gap-3">
          <h2 className="text-lg font-semibold mb-1">Subscribe & Follow</h2>
          <p className="text-gray-300 text-sm max-w-xs text-center lg:text-left">
            Get test notifications straight to your inbox.
          </p>

         <form className="w-full max-w-xs mt-1">
  <div className="flex w-full gap-2">
    <input
      type="email"
      placeholder="Enter your email"
      className="flex-1 px-4 py-2 rounded-md text-gray-900 bg-white focus:outline-none border-none text-base"
    />
    <button
      type="submit"
      className="bg-blue-600 px-4 py-2 rounded-md text-white hover:bg-blue-700 transition text-base"
    >
      Subscribe
    </button>
  </div>
</form>



          {/* Social Icons under Subscribe */}
<div className="flex gap-5 mt-2 justify-center lg:justify-start text-2xl">
  {[FaFacebook, FaInstagram, FaTelegram, FaYoutube, FaLinkedin].map((Icon, idx) => (
    <a
      key={idx}
      href="#"
      className="text-white transition transform hover:scale-110 hover:text-white"
    >
      <Icon />
    </a>
  ))}
</div>

        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-gray-800 mt-4">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} UPSC CSAT Test Series. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 text-sm mt-1">
            <a href="/privacy" className="text-gray-400 hover:text-white">Privacy</a>
            <a href="/terms" className="text-gray-400 hover:text-white">Terms</a>
            <a href="/faq" className="text-gray-400 hover:text-white">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
