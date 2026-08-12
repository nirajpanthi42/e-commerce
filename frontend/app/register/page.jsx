"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "../services/auth";
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiUserPlus, 
  FiAlertCircle, 
  FiCheckCircle, 
  FiHome,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await register(form);

      setSuccess(res.message || "Registration Successful");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Form container – no background, no border */}
      <div className="w-full max-w-md p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="bg-gray-200 p-3 rounded-full">
              <FaStore className="text-3xl sm:text-4xl text-gray-700" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Create Account
          </h1>

          <p className="text-gray-500 mt-1 text-sm">
            Register to manage your products
          </p>
        </div>

        {/* Error – monochrome */}
        {error && (
          <div className="bg-gray-100 border border-gray-300 text-gray-700 rounded-lg p-3 mb-4 flex items-start gap-2">
            <FiAlertCircle className="text-gray-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Success – monochrome */}
        {success && (
          <div className="bg-gray-100 border border-gray-300 text-gray-700 rounded-lg p-3 mb-4 flex items-start gap-2">
            <FiCheckCircle className="text-gray-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name – underlined input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 bg-transparent border-b-2 border-gray-300 focus:border-gray-700 focus:outline-none transition-colors text-gray-800 text-sm"
                required
              />
            </div>
          </div>

          {/* Email – underlined input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-7 pr-3 py-2 bg-transparent border-b-2 border-gray-300 focus:border-gray-700 focus:outline-none transition-colors text-gray-800 text-sm"
                required
              />
            </div>
          </div>

          {/* Password – underlined input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1.5 text-sm">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-7 pr-10 py-2 bg-transparent border-b-2 border-gray-300 focus:border-gray-700 focus:outline-none transition-colors text-gray-800 text-sm"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters</p>
          </div>

          {/* Register Button – monochrome */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-6"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                <FiUserPlus />
                Register
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-gray-700 font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-600 text-xs mt-3 inline-flex items-center gap-1"
          >
            <FiHome className="text-xs" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}