// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import { getProducts } from "./services/product";
import { useToast } from "./components/Toast";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const { success, error: showError } = useToast();

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
      showError("Failed to load products");
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
                  <Link
                    key={product._id}
                    href={`/products/${product._id}`}
                    className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full hover:scale-[1.02] sm:hover:scale-[1.02] transform-gpu cursor-pointer"
                  >
                    <div className="relative w-full pt-[60%] sm:pt-[65%] md:pt-[70%] lg:pt-[75%] bg-gray-200 overflow-hidden">
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
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold">
                          Low Stock
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-gray-600 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-semibold">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
                      <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-black leading-tight min-h-[2.5rem] sm:min-h-[3rem] line-clamp-2 overflow-hidden group-hover:text-blue-600 transition-colors">
                        {truncateText(product.name, 50)}
                      </h2>

                      <p className="text-blue-600 text-base sm:text-lg md:text-xl font-bold mt-1 sm:mt-2">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    
                    </div>
                  </Link>
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

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}