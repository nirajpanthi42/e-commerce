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
          // Ensure all items have required fields
          const fixedCart = parsedCart.map(item => ({
            _id: item._id || item.id || item.productId || `temp-${Date.now()}-${Math.random()}`,
            id: item._id || item.id || item.productId || `temp-${Date.now()}-${Math.random()}`,
            productId: item._id || item.id || item.productId || `temp-${Date.now()}-${Math.random()}`,
            name: item.name || item.product?.name || 'Product',
            price: Number(item.price || item.product?.price || 0),
            quantity: Number(item.quantity || 1),
            image: item.image || item.product?.image || '',
            category: item.category || item.product?.category || '',
            stock: item.stock || item.product?.stock || 0
          }));
          console.log('Fixed cart items:', fixedCart);
          setCartItems(fixedCart);
          // Save fixed cart back to localStorage
          localStorage.setItem('guestCart', JSON.stringify(fixedCart));
        }
      } catch (error) {
        console.error('Error loading guest cart:', error);
        setCartItems([]);
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
        _id: item._id || item.id || item.productId,
        id: item._id || item.id || item.productId,
        productId: item._id || item.id || item.productId,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || item.product?.price || 0),
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
      
      // Ensure we have the product ID
      const productId = product._id || product.id || product.productId;
      if (!productId) {
        console.error('Product has no ID:', product);
        throw new Error('Product ID is required');
      }
      
      // Create a clean product object with ALL required fields
      const productToAdd = {
        _id: productId,
        id: productId,
        productId: productId,
        name: product.name || product.product?.name || 'Product',
        price: Number(product.price || product.product?.price || 0),
        quantity: Number(quantity),
        image: product.image || product.product?.image || '',
        category: product.category || product.product?.category || '',
        stock: Number(product.stock || product.product?.stock || 0)
      };
      
      console.log('Product to add:', productToAdd);
      
      if (user) {
        console.log('User is logged in, adding to API cart');
        await apiAddToCart(productId, quantity);
        await fetchCart();
      } else {
        console.log('Guest user, adding to localStorage cart');
        
        setCartItems(prevItems => {
          // Check if item already exists
          const existingItemIndex = prevItems.findIndex(item => 
            item._id === productId || item.id === productId || item.productId === productId
          );
          
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
            console.log('Added new item:', productToAdd);
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
      
      console.log('Removing from cart:', productId);
      
      if (user) {
        await apiRemoveFromCart(productId);
        await fetchCart();
      } else {
        setCartItems(prevItems => {
          const newItems = prevItems.filter(item => 
            item._id !== productId && item.id !== productId && item.productId !== productId
          );
          localStorage.setItem('guestCart', JSON.stringify(newItems));
          console.log('Updated guest cart after remove:', newItems);
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
            if (item._id === productId || item.id === productId || item.productId === productId) {
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
      const price = Number(item.price || 0);
      const quantity = Number(item.quantity || 0);
      return total + (price * quantity);
    }, 0);
    return total;
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    const count = cartItems.reduce((count, item) => count + Number(item.quantity || 0), 0);
    return count;
  }, [cartItems]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      localStorage.setItem('guestCart', JSON.stringify(cartItems));
      console.log('Auto-saved guest cart to localStorage:', cartItems);
    }
  }, [cartItems, user]);

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

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export { CartContext };