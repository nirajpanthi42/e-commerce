"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts } from "./services/product";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState(null);

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">

      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <h1 className="text-3xl font-bold text-blue-600">
            🛒 E-Commerce
          </h1>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
            >
              Register
            </Link>
          </div>

        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-14">
      

    
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-6 pb-10">

        {loading ? (
          <h1 className="text-center text-2xl">Loading...</h1>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition overflow-hidden"
              >
                <img
                  src={
                    product.image ||
                    "https://via.placeholder.com/300"
                  }
                  alt={product.name}
                  className="w-full h-60 object-cover"
                />

                <div className="p-5">

                  <h2 className="text-2xl font-bold text-black">
                    {product.name}
                  </h2>

                  <p className="text-blue-600 text-xl font-bold mt-2">
                    ${product.price}
                  </p>

                  <p className="text-gray-500 mt-2">
                    {product.description?.substring(0, 60)}...
                  </p>

                  <div className="flex justify-between mt-4">

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      Stock : {product.stock}
                    </span>

                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                      {product.category}
                    </span>

                  </div>

                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl"
                  >
                    View Product
                  </button>

                </div>
              </div>
            ))}

          </div>
        )}

      </section>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-5 z-50">

          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">

            <div className="grid md:grid-cols-2">

              <img
                src={
                  selectedProduct.image ||
                  "https://via.placeholder.com/500"
                }
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />

              <div className="p-8">

                <h1 className="text-4xl font-bold">
                  {selectedProduct.name}
                </h1>

                <p className="text-3xl text-blue-600 font-bold mt-4">
                  ${selectedProduct.price}
                </p>

                <div className="flex gap-3 mt-5">

                  <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full">
                    Stock : {selectedProduct.stock}
                  </span>

                  <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full">
                    {selectedProduct.category}
                  </span>

                </div>

                <h3 className="text-xl font-semibold mt-8">
                  Description
                </h3>

                <p className="text-gray-600 mt-3 leading-8">
                  {selectedProduct.description}
                </p>

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="mt-10 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl"
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}