import { useState } from "react";

export default function AuthButtons() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="flex space-x-4">
      {/* Login Button */}
      <button
        className="px-4 py-2 bg-transparent border border-yellow-500 text-yellow-500 rounded-lg hover:bg-yellow-500 hover:text-white transition"
        onClick={() => setShowLogin(true)}
      >
        Login
      </button>

      {/* Register Button */}
      <button
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        onClick={() => setShowRegister(true)}
      >
        Register
      </button>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-96 relative">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-3 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-3 border rounded"
            />
            <button className="w-full bg-yellow-500 text-white py-2 rounded-lg">
              Login
            </button>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setShowLogin(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-96 relative">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2 mb-3 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 mb-3 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 mb-3 border rounded"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full p-2 mb-3 border rounded"
            />
            <button className="w-full bg-yellow-500 text-white py-2 rounded-lg">
              Register
            </button>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
              onClick={() => setShowRegister(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
