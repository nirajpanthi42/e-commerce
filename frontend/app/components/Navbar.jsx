"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    logout,
  } = useAuth();

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="text-2xl font-bold text-blue-600">
        E-Commerce
      </Link>

      <div className="flex items-center gap-4">
        {/* Home */}
        <Link
          href="/"
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          Home
        </Link>

        {/* Dashboard (Admin Only) */}
        {isAuthenticated && isAdmin && (
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-blue-600 font-medium"
          >
            Dashboard
          </Link>
        )}

        {/* Logged In User */}
        {isAuthenticated ? (
          <>
            <span className="text-gray-600">
              Hello, <strong>{user?.name}</strong>
            </span>

            <button
              onClick={logout}
              className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}