"use client";

import { 
  FiPlus, 
  FiEdit, 
  FiSave, 
  FiUpload, 
  FiImage,
  FiPackage,
  FiTag,
  FiDollarSign,
  FiBox,
  FiFileText,
  FiSend,
  FiRefreshCw,
  FiXCircle
} from "react-icons/fi";
import { FaProductHunt } from "react-icons/fa";

export default function ProductForm({
  form,
  handleChange,
  handleSubmit,
  editing,
  onCancel,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8 border border-gray-100 transition-all duration-300">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        {editing ? (
          <>
            <FiEdit className="text-yellow-500 text-2xl sm:text-3xl" />
            <span>Update Product</span>
          </>
        ) : (
          <>
            <FaProductHunt className="text-blue-600 text-2xl sm:text-3xl" />
            <span>Add New Product</span>
          </>
        )}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-black">
          {/* Product Name */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiPackage className="text-blue-500" />
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter product name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Price */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiDollarSign className="text-green-500" />
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              placeholder="Enter price"
              value={form.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiTag className="text-purple-500" />
              Category
            </label>
            <input
              type="text"
              name="category"
              placeholder="Electronics, Clothing, etc."
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Stock */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiBox className="text-orange-500" />
              Stock
            </label>
            <input
              type="number"
              name="stock"
              placeholder="Available stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              min="0"
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiImage className="text-pink-500" />
              Product Image
            </label>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              
              {form.image && (
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="relative">
                    <img
                      src={
                        typeof form.image === "string"
                          ? form.image
                          : URL.createObjectURL(form.image)
                      }
                      alt="Preview"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[name="image"]');
                        if (input) input.value = '';
                        handleChange({ target: { name: 'image', value: null } });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition"
                    >
                      <FiXCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {!form.image && (
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                <FiUpload className="text-gray-400" />
                Upload a product image (JPG, PNG, WebP)
              </p>
            )}
          </div>

          {/* Description */}
          <div className="md:col-span-2 relative">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FiFileText className="text-indigo-500" />
              Description
            </label>
            <textarea
              name="description"
              rows={5}
              placeholder="Write product description..."
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
              {form.description?.length || 0} characters
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-md hover:shadow-lg"
            style={{
              background: editing 
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)'
            }}
          >
            {editing ? (
              <>
                <FiSave className="text-lg sm:text-xl" />
                Update Product
              </>
            ) : (
              <>
                <FiPlus className="text-lg sm:text-xl" />
                Create Product
              </>
            )}
          </button>

          {editing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              <FiXCircle className="text-lg sm:text-xl" />
              Cancel
            </button>
          )}

          {!editing && (
            <button
              type="reset"
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
              onClick={() => {
                const inputs = document.querySelectorAll('input, textarea');
                inputs.forEach(input => {
                  if (input.type !== 'file') {
                    input.value = '';
                  }
                });
              }}
            >
              <FiRefreshCw className="text-lg sm:text-xl" />
              Reset
            </button>
          )}
        </div>
      </form>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}