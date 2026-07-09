// app/components/Navbar.jsx - Update the cart count display
"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
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

  const { cartItems, getCartCount, getCartTotal } = useCart();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Calculate cart values
  const cartItemCount = getCartCount ? getCartCount() : 0;
  const cartTotal = getCartTotal ? getCartTotal() : 0;

  // Debug log
  useEffect(() => {
    console.log('Navbar - Cart items:', cartItems);
    console.log('Navbar - Cart count:', cartItemCount);
  }, [cartItems, cartItemCount]);

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
    <nav className="bg-white shadow-md px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4 md:gap-6 sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-blue-600 flex-shrink-0">
        <FaStore className="text-2xl sm:text-3xl" />
        <span className="hidden xs:inline">E-Commerce</span>
        <span className="xs:hidden">Shop</span>
      </Link>

      {/* Search Bar */}
      <div className="hidden sm:block flex-1 max-w-xl relative min-w-[150px]">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-8 sm:pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <FiX className="text-sm sm:text-base" />
          </button>
        )}
      </div>

      {/* Mobile Search */}
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
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {/* Cart Icon */}
        <Link 
          href="/cart" 
          className="relative group flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors duration-200 p-1.5 rounded-lg hover:bg-blue-50"
          aria-label="Shopping cart"
        >
          <div className="relative">
            <FiShoppingCart className="text-2xl sm:text-3xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] flex items-center justify-center px-1 shadow-md animate-pulse">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </div>
          {cartItemCount > 0 && (
            <span className="hidden sm:inline text-sm font-medium text-gray-700">
              ${cartTotal.toFixed(2)}
            </span>
          )}
        </Link>

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-blue-50"
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              <span className="flex items-center gap-1.5 sm:gap-2">
                <FiUser className="text-base sm:text-lg" />
                <span className="text-sm sm:text-base max-w-[80px] sm:max-w-[120px] truncate">
                  {user?.name || user?.email || 'User'}
                </span>
              </span>
              <FiChevronDown
                className={`text-sm sm:text-base transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-slideDown">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate flex items-center gap-2">
                    <FiUser className="text-blue-500" />
                    {user?.name || user?.email}
                  </p>
                  {user?.email && user?.name !== user?.email && (
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-1">
                      <FiMail className="text-gray-400" />
                      {user?.email}
                    </p>
                  )}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1.5 bg-purple-100 text-purple-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      <MdAdminPanelSettings className="text-xs" />
                      Admin
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiUser className="text-base" />
                    Profile
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiShoppingBag className="text-base" />
                    My Orders
                  </Link>

                  <Link
                    href="/cart"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiShoppingCart className="text-base" />
                    Cart ({cartItemCount})
                  </Link>

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

                <div className="border-t border-gray-100"></div>

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
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
            >
              <FiUser className="text-sm sm:text-base" />
              <span className="hidden xs:inline">Login</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition duration-200 whitespace-nowrap shadow-sm hover:shadow-md"
            >
              <FiUser className="text-sm sm:text-base" />
              <span className="hidden xs:inline">Register</span>
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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }

        @media (max-width: 400px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:hidden {
            display: none;
          }
        }
      `}</style>
    </nav>
  );
}