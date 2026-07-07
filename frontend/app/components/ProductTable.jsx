"use client";

import { useAuth } from "../context/AuthContext";

export default function ProductTable({
  products = [],
  handleEdit,
  handleDelete,
}) {
  const { isAdmin } = useAuth();

  const productList = Array.isArray(products) ? products : [];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        🛍️ Product List
      </h2>

      <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <tr>
            <th className="py-4 px-3">#</th>
            <th className="py-4 px-3">Image</th>
            <th className="py-4 px-3">Name</th>
            <th className="py-4 px-3">Price</th>
            <th className="py-4 px-3">Category</th>
            <th className="py-4 px-3">Stock</th>
            <th className="py-4 px-3">Description</th>
            {isAdmin && <th className="py-4 px-3">Action</th>}
          </tr>
        </thead>

        <tbody>
          {productList.length > 0 ? (
            productList.map((product, index) => (
              <tr
                key={product._id}
                className={`text-center transition hover:bg-blue-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {/* Index */}
                <td className="border p-3 font-semibold">
                  {index + 1}
                </td>

                {/* Image */}
                <td className="border p-3">
                  <img
                    src={product.image || "/placeholder.png"}
                    alt={product.name || "Product image"}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                    className="w-16 h-16 rounded-lg object-cover mx-auto border"
                  />
                </td>

                {/* Name */}
                <td className="border p-3 font-semibold text-gray-700">
                  {product.name}
                </td>

                {/* Price */}
                <td className="border p-3 font-bold text-blue-600">
                  ${product.price}
                </td>

                {/* Category */}
                <td className="border p-3">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {product.category || "N/A"}
                  </span>
                </td>

                {/* Stock */}
                <td className="border p-3">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {product.stock ?? 0}
                  </span>
                </td>

                {/* Description */}
                <td className="border p-3 text-gray-600 max-w-xs truncate">
                  {product.description || "No description"}
                </td>

                {/* Actions */}
                {isAdmin && (
                  <td className="border p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={isAdmin ? 8 : 7}
                className="text-center py-10 text-gray-500 text-lg"
              >
                No Products Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}