// app/page.jsx
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { getProducts } from "./services/product";
import { useToast } from "./components/Toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [bannerIndex, setBannerIndex] = useState(0);
  
  const { success, error: showError } = useToast();
  const productScrollRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      let productData = [];

      if (Array.isArray(res.data)) {
        productData = res.data;
      } else if (Array.isArray(res.data.products)) {
        productData = res.data.products;
      } else if (Array.isArray(res.data.data)) {
        productData = res.data.data;
      } else {
        productData = [];
      }

      setProducts(productData);
      
      const sorted = [...productData].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
      setLatestProducts(sorted.slice(0, 4));
      setFeaturedProducts(sorted.slice(0, 3));
      
    } catch (error) {
      console.log(error);
      showError("Failed to load products");
      setProducts([]);
      setLatestProducts([]);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search input
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Check if user is currently searching
  const isSearching = search.trim() !== "";

  // Determine which products to show in the latest section
  const latestDisplayProducts = isSearching ? filteredProducts.slice(0, 4) : latestProducts;

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Banner navigation
  const prevBanner = () => {
    setBannerIndex((prev) => (prev === 0 ? featuredProducts.length - 1 : prev - 1));
  };
  const nextBanner = () => {
    setBannerIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  // Product bar scroll
  const scrollLeft = () => {
    if (productScrollRef.current) {
      productScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  const scrollRight = () => {
    if (productScrollRef.current) {
      productScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const bannerColors = [
    'from-purple-900 via-purple-700 to-indigo-600',
    'from-blue-900 via-blue-700 to-cyan-600',
    'from-green-900 via-green-700 to-teal-600',
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      
      <Navbar search={search} setSearch={setSearch} />

      {/* Hide Banner when searching */}
      {!isSearching && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 relative">
          {loading ? (
            <div className="h-[300px] sm:h-[340px] lg:h-[380px] bg-gray-200 rounded-2xl animate-pulse"></div>
          ) : featuredProducts.length > 0 ? (
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${bannerIndex * 100}%)` }}
              >
                {featuredProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className={`min-w-full relative min-h-[300px] sm:min-h-[340px] lg:min-h-[380px] bg-gradient-to-br ${bannerColors[index % bannerColors.length]} group`}
                  >
                    <div className="absolute inset-0">
                      <img
                        src={product.image || "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200&h=500&fit=crop"}
                        alt={product.name}
                        className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    </div>

                    <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-between h-full">
                      <div>
                        <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 border border-white/20">
                          {index === 0 ? "AVAILABLE NOW" : index === 1 ? "GET IT AT" : "FEATURED"}
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-2">
                          {truncateText(product.name, 30)}
                        </h2>
                        {product.category && (
                          <p className="text-lg sm:text-xl text-white/90 font-medium">
                            {product.category}
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        {product.discount && (
                          <p className="text-sm sm:text-base text-yellow-300 font-semibold">
                            {product.discount}% OFF
                          </p>
                        )}
                        {product.stock > 0 && product.stock <= 5 && (
                          <p className="text-sm sm:text-base text-orange-300 font-medium">
                            Only {product.stock} left in stock!
                          </p>
                        )}
                        <Link href={`/products/${product._id}`}>
                          <button className="mt-4 sm:mt-5 bg-white text-gray-900 hover:bg-gray-100 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 hover:scale-105 shadow-lg">
                            Shop Now →
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Banner Navigation Arrows */}
              <button
                onClick={prevBanner}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 rounded-full z-20 transition-all duration-300 hover:scale-110"
                aria-label="Previous banner"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-2 rounded-full z-20 transition-all duration-300 hover:scale-110"
                aria-label="Next banner"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                {featuredProducts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setBannerIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      bannerIndex === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      )}

      {/* Hide Product Scroll Bar when searching */}
      {!isSearching && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden py-2">
          <div className="relative flex items-center">
            <button
              onClick={scrollLeft}
              className="absolute left-0 z-10 bg-white/90 hover:bg-white shadow-lg p-2 rounded-full transition-all duration-300 hover:scale-110 border border-gray-200"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div 
              ref={productScrollRef}
              className="flex items-center justify-center gap-4 sm:gap-6 py-3 sm:py-4 overflow-x-auto scrollbar-hide mx-7 flex-nowrap"
              style={{ scrollBehavior: 'smooth' }}
            >
              {products.map((product) => (
                <div
                  key={product._id}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 min-w-[100px] sm:min-w-[120px] group cursor-pointer"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-md border-2 border-gray-200 group-hover:border-blue-500 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                    <img
                      src={product.image || "https://via.placeholder.com/100/4F46E5/FFFFFF?text=Product"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100/4F46E5/FFFFFF?text=Product";
                      }}
                    />
                    {product.discount && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[7px] px-1.5 py-0.5 rounded-full font-bold">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] sm:text-xs font-medium text-gray-700 line-clamp-1 max-w-[100px]">
                      {truncateText(product.name, 12)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={scrollRight}
              className="absolute right-0 z-10 bg-white/90 hover:bg-white shadow-lg p-2 rounded-full transition-all duration-300 hover:scale-110 border border-gray-200"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Latest Products Section - Transforms based on search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {isSearching ? `Search Results for "${search}"` : "Latest Products"}
          </h2>
        
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="w-full pt-[75%] bg-gray-200 animate-pulse"></div>
                <div className="p-3 sm:p-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {latestDisplayProducts.length > 0 ? (
              latestDisplayProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1"
                >
                  <div className="relative w-full pt-[75%] bg-gray-200 overflow-hidden">
                    <img
                      src={product.image || "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Product"}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Product";
                      }}
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                        Low Stock
                      </span>
                    )}
                    {product.discount && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {truncateText(product.name, 40)}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-blue-600 text-lg sm:text-xl font-bold">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            ${Number(product.originalPrice).toFixed(2)}
                          </p>
                        )}
                      </div>
                     
                    </div>
                  
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No products found matching your search.
              </div>
            )}
          </div>
        )}
      </section>

      {/* All Products Section - All products displayed without pagination */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12 lg:pb-16">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {isSearching ? "All Results" : "All Products"}
          </h2>
          
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 text-lg">Loading products...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product._id}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1"
                >
                  <div className="relative w-full pt-[60%] sm:pt-[65%] bg-gray-200 overflow-hidden">
                    <img
                      src={product.image || "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Product"}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300x300/4F46E5/FFFFFF?text=Product";
                      }}
                    />
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold">
                        Low Stock
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-600 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold">
                        Out of Stock
                      </span>
                    )}
                    {product.discount && (
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-green-500 text-white text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
                    <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {truncateText(product.name, 50)}
                    </h2>

                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-blue-600 text-lg sm:text-xl md:text-2xl font-bold">
                          ${Number(product.price).toFixed(2)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-xs text-gray-400 line-through">
                            ${Number(product.originalPrice).toFixed(2)}
                          </p>
                        )}
                      </div>
                     
                    </div>

                    
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-xl text-gray-600 font-semibold">No products found</h2>
                <p className="text-gray-400 mt-2">
                  {search ? `No results for "${search}"` : 'Try adjusting your search'}
                </p>
                {search && (
                  <button onClick={() => setSearch('')} className="mt-4 text-blue-600 hover:text-blue-700 font-medium underline">
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  );
}