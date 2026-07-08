import api from "./api";

// GET all products (supports search)
export const getProducts = async (search = "") => {
  const res = await api.get("/products", {
    params: {
      search,
    },
  });

  return res.data;
};

// CREATE product
export const createProduct = async (formData) => {
  try {
    const res = await api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Create Product Error:", error);
    throw error;
  }
};

// UPDATE product
export const updateProduct = async (id, formData) => {
  try {
    const res = await api.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error) {
    console.error("Update Product Error:", error);
    throw error;
  }
};

// DELETE product
export const deleteProduct = async (id) => {
  try {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error("Delete Product Error:", error);
    throw error;
  }
};