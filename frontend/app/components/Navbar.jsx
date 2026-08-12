// app/components/Navbar.jsx
"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
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
  FiShoppingCart,
} from "react-icons/fi";
import { FaStore } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";

export default function Navbar({
  search = "",
  setSearch = () => {},
  products = [],
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

  // --- Search Suggestions State ---
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionRefs = useRef([]);
  const debounceTimer = useRef(null);

  const cartItemCount = getCartCount ? getCartCount() : 0;

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

  // Close suggestions when clicking outside search container
  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchContainer = document.getElementById("search-container");
      if (searchContainer && !searchContainer.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown/suggestions on escape key
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        if (isDropdownOpen) setIsDropdownOpen(false);
        if (showSuggestions) {
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [isDropdownOpen, showSuggestions]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  // --- Simplified Search Suggestions Logic ---
  const updateSuggestions = useCallback((query) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      const filtered = products
        .filter(product => 
          product.name?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8);

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    }, 200);
  }, [products]);

  useEffect(() => {
    updateSuggestions(search);
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [search, updateSuggestions]);

  // Keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        const selected = suggestions[selectedIndex];
        if (selected) {
          setSearch(selected.name);
          setShowSuggestions(false);
          window.location.href = `/products/${selected._id}`;
        }
      }
    }
  };

  const handleSuggestionClick = (product) => {
    setSearch(product.name);
    setShowSuggestions(false);
    window.location.href = `/products/${product._id}`;
  };

  return (
    <nav className="bg-white px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4 md:gap-6 sticky top-0 z-50 border-b border-gray-200">
      {/* Logo – monochrome */}
      <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
        <FaStore className="text-2xl sm:text-3xl text-gray-700" />
        <span className="hidden xs:inline">E-Commerce</span>
        <span className="xs:hidden">Shop</span>
      </Link>

      {/* Desktop Search Bar */}
      <div id="search-container" className="hidden sm:block flex-1 max-w-xl relative min-w-[150px]">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (search.trim() && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="w-full border border-gray-300 rounded-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-8 sm:pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-500 transition bg-gray-50 text-gray-800 placeholder-gray-500"
        />
        <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setShowSuggestions(false);
            }}
            className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX className="text-sm sm:text-base" />
          </button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 max-h-72 overflow-y-auto z-50 animate-slideDown">
            {suggestions.map((product, index) => (
              <div
                key={product._id}
                ref={el => suggestionRefs.current[index] = el}
                className={`px-4 py-2.5 cursor-pointer transition-colors hover:bg-gray-100 ${
                  index === selectedIndex ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleSuggestionClick(product)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {product.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Search */}
      <div className="sm:hidden w-full order-last mt-1 relative" id="search-container-mobile">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (search.trim() && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="w-full border border-gray-300 rounded-full py-1.5 pl-8 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 transition bg-gray-50 text-gray-800 placeholder-gray-500"
        />
        <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setShowSuggestions(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX className="text-sm" />
          </button>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 max-h-60 overflow-y-auto z-50 animate-slideDown">
            {suggestions.map((product, index) => (
              <div
                key={product._id}
                className={`px-4 py-2.5 cursor-pointer transition-colors hover:bg-gray-100 ${
                  index === selectedIndex ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleSuggestionClick(product)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {product.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {/* Cart Icon */}
        <Link 
          href="/cart" 
          className="relative group flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors duration-200 p-1.5 rounded-lg hover:bg-gray-100"
          aria-label="Shopping cart"
        >
          <div className="relative">
            <FiShoppingCart className="text-2xl sm:text-3xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-[20px] flex items-center justify-center px-1">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </div>
        </Link>

        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-100"
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
              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 py-1.5 z-50 animate-slideDown">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate flex items-center gap-2">
                    <FiUser className="text-gray-600" />
                    {user?.name || user?.email}
                  </p>
                  {user?.email && user?.name !== user?.email && (
                    <p className="text-xs text-gray-500 truncate flex items-center gap-1.5 mt-1">
                      <FiMail className="text-gray-400" />
                      {user?.email}
                    </p>
                  )}
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 mt-1.5 bg-gray-200 text-gray-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                      <MdAdminPanelSettings className="text-xs" />
                      Admin
                    </span>
                  )}
                </div>

                <div className="py-1">
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiShoppingBag className="text-base" />
                    My Orders
                  </Link>

                  <Link
                    href="/cart"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <FiShoppingCart className="text-base" />
                    Cart ({cartItemCount})
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
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
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 font-medium"
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
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition duration-200 whitespace-nowrap"
            >
              <FiUser className="text-sm sm:text-base" />
              <span className="xs:inline">Login</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base transition duration-200 whitespace-nowrap"
            >
              <FiUser className="text-sm sm:text-base" />
              <span className="xs:inline">Signup</span>
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