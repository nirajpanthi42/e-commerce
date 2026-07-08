"use client";

import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import { getProducts } from "./services/product";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [expandedDescription, setExpandedDescription] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();

      if (Array.isArray(res.data)) {
        setProducts(res.data);
      } else if (Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else if (Array.isArray(res.data.data)) {
        setProducts(res.data.data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.log(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Toggle description expansion
  const toggleDescription = () => {
    setExpandedDescription(!expandedDescription);
  };

  // Reset expansion when modal closes
  useEffect(() => {
    if (!selectedProduct) {
      setExpandedDescription(false);
    }
  }, [selectedProduct]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 text-black">
      <Navbar search={search} setSearch={setSearch} />

      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-10 lg:pb-12 pt-3 sm:pt-4 md:pt-6 lg:pt-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh] sm:min-h-[60vh]">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg">Loading products...</p>
            </div>
          </div>
        ) : (
          <>
           

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:scale-[1.02] sm:hover:scale-[1.02] transform-gpu"
                  >
                    <div className="relative w-full pt-[60%] sm:pt-[65%] md:pt-[70%] lg:pt-[75%] bg-gray-200 overflow-hidden">
                      <img
                        src={product.image || "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Product"}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      {product.stock <= 5 && (
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold">
                          Low Stock
                        </span>
                      )}
                    </div>

                    <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-black leading-tight min-h-[2.5rem] sm:min-h-[3rem] line-clamp-2 overflow-hidden">
                        {truncateText(product.name, 50)}
                      </h2>

                      <p className="text-blue-600 text-base sm:text-lg md:text-xl font-bold mt-1 sm:mt-2">
                        ${Number(product.price).toFixed(2)}
                      </p>

                      <p className="text-gray-500 mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed min-h-[2.5rem] sm:min-h-[3rem] line-clamp-2 overflow-hidden">
                        {truncateText(product.description, 70)}
                      </p>

                      <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mt-2 sm:mt-3">
                        <span className="bg-green-100 text-green-700 px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap">
                          Stock: {product.stock}
                        </span>
                        <span className="bg-purple-100 text-purple-700 px-1.5 sm:px-2 md:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium truncate max-w-[70px] sm:max-w-[90px] md:max-w-[110px]">
                          {truncateText(product.category, 12)}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="mt-3 sm:mt-4 w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
                      >
                        <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h2 className="text-lg sm:text-xl md:text-2xl text-gray-600 font-semibold">No products found</h2>
                  <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                    {search ? `No results for "${search}"` : 'Try adjusting your search'}
                  </p>
                  {search && (
                    <button onClick={() => setSearch('')} className="mt-3 sm:mt-4 text-blue-600 hover:text-blue-700 text-sm sm:text-base font-medium underline">
                      Clear search
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Product Details Modal with Read More */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/50 sm:bg-black/60 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 z-50 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
        >
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden shadow-2xl animate-slideUp flex flex-col">
            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center p-3 sm:p-4 border-b border-gray-100">
              <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate flex-1">
                {selectedProduct.name}
              </h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="ml-2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 flex-1 overflow-hidden">
              {/* Image Section - 2/5 on desktop */}
              <div className="md:col-span-2 relative w-full pt-[55%] sm:pt-[60%] md:pt-[75%] bg-gray-100 order-first md:order-none">
                <img
                  src={selectedProduct.image || "https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Product"}
                  alt={selectedProduct.name}
                  className="absolute inset-0 w-full h-full object-contain p-2 sm:p-3 md:p-4"
                />
                {/* Desktop close button */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="hidden md:block absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content Section - 3/5 on desktop */}
              <div className="md:col-span-3 p-4 sm:p-5 md:p-6 overflow-y-auto flex flex-col">
                {/* Desktop Title */}
                <h1 className="hidden md:block text-xl lg:text-2xl font-bold pr-8 leading-tight break-words">
                  {selectedProduct.name}
                </h1>

                {/* Price and Stock */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap mt-0 md:mt-1">
                  <p className="text-xl sm:text-2xl md:text-3xl text-blue-600 font-bold">
                    ${Number(selectedProduct.price).toFixed(2)}
                  </p>
                  {selectedProduct.stock <= 5 && (
                    <span className="bg-red-100 text-red-700 px-2 sm:px-3 py-0.5 rounded-full text-xs font-semibold">
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                  <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                    In Stock: {selectedProduct.stock}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium break-words max-w-[120px] sm:max-w-none">
                    {selectedProduct.category}
                  </span>
                </div>

                {/* Description with Read More */}
                <div className="mt-3 sm:mt-4">
                  <h3 className="text-sm font-semibold text-gray-800">Description</h3>
                  
                  {/* Description content with expand/collapse */}
                  <div className="relative">
                    <p className={`text-gray-600 mt-1 leading-5 sm:leading-6 text-sm break-words whitespace-pre-wrap transition-all duration-300 ${
                      !expandedDescription && selectedProduct.description?.length > 150 ? 'line-clamp-4' : ''
                    }`}>
                      {selectedProduct.description || 'No description available'}
                    </p>
                    
                    {/* Read More/Show Less Button */}
                    {selectedProduct.description?.length > 150 && (
                      <button
                        onClick={toggleDescription}
                        className="mt-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors duration-200"
                      >
                        <span className="flex items-center gap-1">
                          {expandedDescription ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              Show Less
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              Read More
                            </>
                          )}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-100 sticky bottom-0 bg-white md:bg-transparent">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 order-2 sm:order-1"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        alert(`Added ${selectedProduct.name} to cart!`);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm hover:shadow-md order-1 sm:order-2"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .break-words {
          word-wrap: break-word;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .whitespace-pre-wrap {
          white-space: pre-wrap;
        }
      `}</style>
    </main>
  );
}