// app/context/CartContext.jsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart as apiAddToCart, updateCart as apiUpdateCart, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '../services/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load cart from localStorage on mount (for guest users)
  useEffect(() => {
    const savedCart = localStorage.getItem('guestCart');
    console.log('Loading guest cart from localStorage:', savedCart);
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log('Parsed guest cart:', parsedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          // Ensure all items have an _id
          const fixedCart = parsedCart.map(item => ({
            ...item,
            _id: item._id || item.id || item.productId || item.product?._id,
            id: item._id || item.id || item.productId || item.product?._id,
            productId: item._id || item.id || item.productId || item.product?._id
          }));
          console.log('Fixed cart items:', fixedCart);
          setCartItems(fixedCart);
        }
      } catch (error) {
        console.error('Error loading guest cart:', error);
      }
    }
  }, []);

  // Fetch cart when user logs in
  useEffect(() => {
    if (user) {
      console.log('User logged in, fetching cart from API');
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching cart from API...');
      const response = await getCart();
      console.log('API Response:', response);
      
      let items = [];
      
      if (response) {
        if (response.data) {
          if (Array.isArray(response.data)) {
            items = response.data;
          } else if (response.data.items && Array.isArray(response.data.items)) {
            items = response.data.items;
          } else if (response.data.cart && Array.isArray(response.data.cart)) {
            items = response.data.cart;
          }
        } else if (Array.isArray(response)) {
          items = response;
        } else if (response.items && Array.isArray(response.items)) {
          items = response.items;
        } else if (response.cart && Array.isArray(response.cart)) {
          items = response.cart;
        }
      }
      
      console.log('Processed cart items:', items);
      
      const mappedItems = items.map(item => ({
        ...item,
        _id: item._id || item.id || item.productId || item.product?._id,
        id: item._id || item.id || item.productId || item.product?._id,
        productId: item._id || item.id || item.productId || item.product?._id,
        quantity: item.quantity || 1,
        price: item.price || item.product?.price || 0,
        name: item.name || item.product?.name || 'Product',
        image: item.image || item.product?.image || '',
        category: item.category || item.product?.category || ''
      }));
      
      console.log('Mapped items:', mappedItems);
      setCartItems(mappedItems);
      
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message || 'Failed to fetch cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Adding to cart - product:', product);
      console.log('Adding to cart - quantity:', quantity);
      
      // Ensure we have the product ID - check nested product object too
      const productId = product._id || product.id || product.productId || product.product?._id;
      if (!productId) {
        console.error('Product has no ID:', product);
        throw new Error('Product ID is required');
      }
      
      // Create a clean product object with _id as the primary key
      const productToAdd = {
        _id: productId,
        id: productId,
        productId: productId,
        name: product.name || product.product?.name || 'Product',
        price: product.price || product.product?.price || 0,
        image: product.image || product.product?.image || '',
        category: product.category || product.product?.category || '',
        stock: product.stock || product.product?.stock || 0,
        quantity: quantity,
        product: product.product || null // Preserve the product object if it exists
      };
      
      console.log('Product to add with _id:', productToAdd);
      
      if (user) {
        console.log('User is logged in, adding to API cart');
        await apiAddToCart(productId, quantity);
        await fetchCart();
      } else {
        console.log('Guest user, adding to localStorage cart');
        
        setCartItems(prevItems => {
          // Check if item already exists using _id
          const existingItemIndex = prevItems.findIndex(item => {
            const itemId = item._id || item.id || item.productId || item.product?._id;
            return itemId === productId;
          });
          
          let newItems;
          if (existingItemIndex >= 0) {
            // Update existing item
            newItems = [...prevItems];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: (newItems[existingItemIndex].quantity || 0) + quantity
            };
            console.log('Updated existing item:', newItems[existingItemIndex]);
          } else {
            // Add new item
            newItems = [...prevItems, productToAdd];
            console.log('Added new item with _id:', productToAdd);
          }
          
          // Save to localStorage
          localStorage.setItem('guestCart', JSON.stringify(newItems));
          console.log('Saved guest cart to localStorage:', newItems);
          
          return newItems;
        });
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message || 'Failed to add item to cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== REMOVE FROM CART ===');
      console.log('Product ID to remove:', productId);
      console.log('Current cart items:', cartItems);
      
      // Find the item - check ALL possible ID locations including nested product
      const itemToRemove = cartItems.find(item => {
        const itemId = item._id || 
                       item.id || 
                       item.productId || 
                       item.product?._id || 
                       item.product?.id || 
                       item.product?.productId;
        return itemId === productId;
      });
      
      console.log('Item to remove:', itemToRemove);
      
      if (!itemToRemove) {
        console.error('❌ Item not found with ID:', productId);
        console.log('Available items:', cartItems.map(item => ({
          name: item.name || item.product?.name,
          _id: item._id,
          id: item.id,
          productId: item.productId,
          product_id: item.product?._id,
          realId: item._id || item.id || item.productId || item.product?._id
        })));
        return;
      }
      
      if (user) {
        console.log('User is logged in, removing from API cart');
        await apiRemoveFromCart(productId);
        await fetchCart();
      } else {
        console.log('Guest user, removing from localStorage cart');
        
        setCartItems(prevItems => {
          const newItems = prevItems.filter(item => {
            const itemId = item._id || 
                          item.id || 
                          item.productId || 
                          item.product?._id || 
                          item.product?.id || 
                          item.product?.productId;
            return itemId !== productId;
          });
          
          console.log('Items before removal:', prevItems.length);
          console.log('Items after removal:', newItems.length);
          
          localStorage.setItem('guestCart', JSON.stringify(newItems));
          console.log('Updated guest cart saved to localStorage');
          
          return newItems;
        });
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message || 'Failed to remove item from cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Updating quantity:', productId, newQuantity);
      
      if (user) {
        await apiUpdateCart(productId, newQuantity);
        await fetchCart();
      } else {
        setCartItems(prevItems => {
          const newItems = prevItems.map(item => {
            const itemId = item._id || item.id || item.productId || item.product?._id;
            if (itemId === productId) {
              return { ...item, quantity: Math.max(0, newQuantity) };
            }
            return item;
          }).filter(item => item.quantity > 0);
          
          localStorage.setItem('guestCart', JSON.stringify(newItems));
          console.log('Updated guest cart after quantity change:', newItems);
          return newItems;
        });
      }
    } catch (err) {
      console.error('Error updating cart:', err);
      setError(err.message || 'Failed to update cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Clearing cart');
      
      if (user) {
        await apiClearCart();
        await fetchCart();
      } else {
        setCartItems([]);
        localStorage.removeItem('guestCart');
        console.log('Cleared guest cart');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message || 'Failed to clear cart');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = useCallback(() => {
    const total = cartItems.reduce((total, item) => {
      const price = item.price || item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
    return total;
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    const count = cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
    return count;
  }, [cartItems]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
      console.log('Auto-saved guest cart to localStorage:', cartItems);
    }
  }, [cartItems, user]);

  // Return the context provider with all values
  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      error,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      fetchCart,
      refreshCart: fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ✅ IMPORTANT: Make sure these exports exist at the bottom
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Also export CartContext if needed
export { CartContext };