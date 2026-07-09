import api from "./api";

// Get logged-in user's cart
export const getCart = async () => {
  const res = await api.get("/cart");
  return res.data;
};

// Add product to cart
export const addToCart = async (productId, quantity = 1) => {
  const res = await api.post("/cart", {
    productId,
    quantity,
  });

  return res.data;
};

// Update quantity
export const updateCart = async (productId, quantity) => {
  const res = await api.put(`/cart/${productId}`, {
    quantity,
  });

  return res.data;
};

// Remove item
export const removeFromCart = async (productId) => {
  const res = await api.delete(`/cart/${productId}`);
  return res.data;
};

// Clear cart
export const clearCart = async () => {
  const res = await api.delete("/cart");
  return res.data;
};