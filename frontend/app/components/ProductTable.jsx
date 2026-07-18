"use client";

import { useAuth } from "../context/AuthContext";
import { 
  FiEdit, 
  FiTrash2, 
  FiImage, 
  FiPackage, 
  FiDollarSign, 
  FiTag, 
  FiBox, 
  FiFileText,
  FiShoppingBag,
  FiHash,
  FiAlertCircle
} from "react-icons/fi";
import { FaShoppingBag } from "react-icons/fa";

export default function ProductTable({
  products = [],
  handleEdit,
  handleDelete,
}) {
  const { isAdmin } = useAuth();

  const productList = Array.isArray(products) ? products : [];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 overflow-x-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 sm:mb-6 flex items-center gap-2">
        <FaShoppingBag className="text-blue-600 text-2xl sm:text-3xl" />
        <span>Product List</span>
        <span className="ml-auto text-sm font-medium text-black bg-gray-100 px-3 py-1 rounded-full">
          {productList.length} {productList.length === 1 ? 'Product' : 'Products'}
        </span>
      </h2>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Image</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">Stock</th>
              <th className="py-3 px-4 text-left">Description</th>
              {isAdmin && <th className="py-3 px-4 text-center">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {productList.length > 0 ? (
              productList.map((product, index) => (
                <tr
                  key={product._id}
                  className={`transition hover:bg-blue-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  {/* Index */}
                  <td className="border p-3 font-semibold text-black">
                    <span className="flex items-center gap-1.5">
                      <FiHash className="text-gray-400" />
                      {index + 1}
                    </span>
                  </td>

                  {/* Image */}
                  <td className="border p-3">
                    <div className="relative w-16 h-16 mx-auto">
                      <img
                        src={product.image || "/placeholder.png"}
                        alt={product.name || "Product image"}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                        className="w-full h-full rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                      />
                      {!product.image && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                          <FiImage className="text-gray-400 text-xl" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="border p-3 font-semibold text-black">
                    <div className="flex items-center gap-2">
                      <FiPackage className="text-blue-500 flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{product.name}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="border p-3 font-bold text-black">
                    <div className="flex items-center gap-1">
                      <FiDollarSign className="text-black" />
                      ${Number(product.price).toFixed(2)}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="border p-3">
                    <span className="inline-flex items-center gap-1.5 bg-purple-100 text-black px-3 py-1 rounded-full text-sm font-medium">
                      <FiTag className="text-purple-500 text-xs" />
                      {product.category || "N/A"}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="border p-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-black ${
                      product.stock > 20 
                        ? "bg-green-100" 
                        : product.stock > 5 
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}>
                      <FiBox className="text-xs" />
                      {product.stock ?? 0}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="border p-3 text-black max-w-xs">
                    <div className="flex items-start gap-1.5">
                      <FiFileText className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="truncate">
                        {product.description || "No description"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  {isAdmin && (
                    <td className="border p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white px-3 py-1.5 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                          title="Edit product"
                        >
                          <FiEdit className="text-sm" />
                          <span className="hidden lg:inline">Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(product._id)}
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-1.5 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                          title="Delete product"
                        >
                          <FiTrash2 className="text-sm" />
                          <span className="hidden lg:inline">Delete</span>
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
                  className="text-center py-12 text-black"
                >
                  <div className="flex flex-col items-center gap-3">
                    <FiAlertCircle className="text-4xl text-gray-400" />
                    <p className="text-lg font-medium">No Products Found</p>
                    <p className="text-sm">Add your first product to get started</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {productList.length > 0 ? (
          productList.map((product, index) => (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start gap-4">
                {/* Image */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <img
                    src={product.image || "/placeholder.png"}
                    alt={product.name || "Product image"}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                    className="w-full h-full rounded-lg object-cover border-2 border-gray-200"
                  />
                  {!product.image && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                      <FiImage className="text-gray-400 text-2xl" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-black truncate flex-1">
                      {product.name}
                    </h3>
                    <span className="text-xs text-black ml-2">
                      #{index + 1}
                    </span>
                  </div>
                  
                  <p className="text-black font-bold text-lg mt-1">
                    ${Number(product.price).toFixed(2)}
                  </p>
                  
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-black px-2 py-0.5 rounded-full text-xs">
                      <FiTag className="text-purple-500 text-xs" />
                      {product.category || "N/A"}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-black ${
                      product.stock > 20 
                        ? "bg-green-100" 
                        : product.stock > 5 
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}>
                      <FiBox className="text-xs" />
                      Stock: {product.stock ?? 0}
                    </span>
                  </div>
                  
                  <p className="text-black text-sm mt-2 truncate">
                    {product.description || "No description"}
                  </p>

                  {/* Mobile Actions */}
                  {isAdmin && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                      >
                        <FiEdit className="text-sm" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                      >
                        <FiTrash2 className="text-sm" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-black bg-gray-50 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <FiAlertCircle className="text-4xl text-gray-400" />
              <p className="text-lg font-medium">No Products Found</p>
              <p className="text-sm">Add your first product to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}