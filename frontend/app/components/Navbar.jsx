"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  FiUser, 
  FiLogOut, 
  FiSearch,
  FiX,
  FiChevronDown,
  FiLayout,
  FiMail,
  FiShoppingBag,
  FiSettings,
  FiHome,
  FiShoppingCart
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";

export default function Navbar({
  search = "",
  setSearch = () => {},
}) {
  const {
    user,
    isAuthenticated,
    isAdmin,
    logout,
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isDropdownOpen]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  return (
    <nav className="bg-white shadow-md px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4 md:gap-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-blue-600 flex-shrink-0">
        <FaStore className="text-2xl sm:text-3xl" />
        <span>E-Commerce</span>
      </Link>

      {/* Search Bar - Hidden on very small screens */}
      <div className="hidden sm:block flex-1 max-w-xl relative min-w-[150px]">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-8 sm:pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        {/* Search Icon */}
        <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />

        {/* Clear Button */}
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
          >
            <FiX className="text-sm sm:text-base" />
          </button>
        )}
      </div>

      {/* Mobile Search - Visible only on small screens */}
      <div className="sm:hidden w-full order-last mt-1 relative">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-full py-1.5 pl-8 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
          >
            <FiX className="text-sm" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
       

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            {/* Username Button */}
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2"
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              <span className="flex items-center gap-1.5 sm:gap-2">
                <FiUser className="text-base sm:text-lg" />
                <span className="text-sm sm:text-base max-w-[80px] sm:max-w-[120px] truncate">
                  {user?.name || user?.email}
                </span>
              </span>
              <FiChevronDown
                className={`text-sm sm:text-base transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu - Now with Logout inside */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-slideDown">
                {/* User Info */}
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate flex items-center gap-2">
                    <FiUser className="text-blue-500" />
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-1">
                    <FiMail className="text-gray-400" />
                    {user?.email}
                  </p>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1.5 bg-purple-100 text-purple-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      <MdAdminPanelSettings className="text-xs" />
                      Admin
                    </span>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-1">
                
  
                

                  {isAdmin && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FiLayout className="text-base" />
                      Dashboard
                    </Link>
                  )}

                 
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Logout Button - Now inside dropdown */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium"
                >
                  <FiLogOut className="text-base" />
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition duration-200 whitespace-nowrap"
            >
              <FiUser className="text-sm sm:text-base" />
              Login
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition duration-200 whitespace-nowrap"
            >
              <FiUser className="text-sm sm:text-base" />
              Register
            </Link>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </nav>
  );
}