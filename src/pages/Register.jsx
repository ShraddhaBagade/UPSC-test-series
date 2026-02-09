import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  // Validation
  const validate = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required.";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email address.";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!/^\+?\d{10,15}$/.test(formData.mobile))
      newErrors.mobile = "Enter valid mobile number with country code.";
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSuccess(true);
      console.log("User registered:", formData);
      alert("Verification link sent to your email!");
    } else {
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6">
      {/* Registration Card */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border">
        <h1 className="text-2xl font-bold text-center mb-2">
          Welcome to UPSC CSAT
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Register to Continue
        </p>

        {/* Google Login */}
        <div className="mb-6">
          <button className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-3 hover:bg-gray-100 transition shadow-sm bg-white text-gray-800 font-medium">
            <FcGoogle size={22} className="mr-2" />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <p className="text-center text-gray-500 text-sm mb-4">or sign up with email</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-400"
            required
          />
          {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName}</p>}

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-400"
            required
          />
          {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password" // prevents Chrome saved-password popup
            className="w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-400"
            required
          />
          {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-400"
            required
          />
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
          )}

          {/* Mobile */}
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number (e.g. +919876543210)"
            value={formData.mobile}
            onChange={handleChange}
            autoComplete="off"
            className="w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-200 bg-white text-gray-800 placeholder-gray-400"
            required
          />
          {errors.mobile && <p className="text-red-600 text-sm">{errors.mobile}</p>}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg shadow hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        {/* Success */}
        {success && (
          <p className="text-green-600 text-center mt-3 animate-bounce">
            ✅ Registration successful! Check your email to verify.
          </p>
        )}

        {/* Link to login */}
        <p className="text-center text-gray-600 text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
