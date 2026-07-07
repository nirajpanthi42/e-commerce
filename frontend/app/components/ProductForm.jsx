"use client";

export default function ProductForm({
  form,
  handleChange,
  handleSubmit,
  editing,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        {editing ? "✏️ Update Product" : "➕ Add New Product"}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-6">

          {/* Product Name */}
          <input
            type="text"
            name="name"
            placeholder="Enter product name"
            value={form.name}
            onChange={handleChange}
            className="input"
            required
          />

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Enter price"
            value={form.price}
            onChange={handleChange}
            className="input"
            required
          />

          {/* Category */}
          <input
            type="text"
            name="category"
            placeholder="Electronics"
            value={form.category}
            onChange={handleChange}
            className="input"
          />

          {/* Stock */}
          <input
            type="number"
            name="stock"
            placeholder="Available stock"
            value={form.stock}
            onChange={handleChange}
            className="input"
          />

          {/* Image */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">
              Product Image
            </label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-3"
            />

            {form.image && (
              <img
                src={
                  typeof form.image === "string"
                    ? form.image
                    : URL.createObjectURL(form.image)
                }
                alt="Preview"
                className="mt-4 w-32 h-32 object-cover rounded-xl border"
              />
            )}
          </div>

          {/* Description */}
          <textarea
            name="description"
            rows={5}
            placeholder="Write product description..."
            value={form.description}
            onChange={handleChange}
            className="md:col-span-2 input resize-none"
          />
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className={`w-full md:w-auto px-8 py-3 rounded-xl font-semibold text-white ${
              editing
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editing ? "✏️ Update Product" : "🚀 Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}