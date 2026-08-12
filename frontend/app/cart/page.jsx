// app/cart/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiArrowLeft,
  FiShoppingBag,
  FiAlertCircle,
  FiLoader,
  FiCheckCircle,
  FiInfo
} from "react-icons/fi";

export default function CartPage() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    getCartCount,
    loading: cartLoading,
    error: cartError,
    refreshCart
  } = useCart();
  
  const { user } = useAuth();
  const router = useRouter();
  const { success, error: showError, info, warning } = useToast();
  
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    setIsClient(true);
    if (refreshCart) {
      refreshCart();
    }
  }, []);

  const total = getCartTotal();
  const itemCount = getCartCount();
  const subtotal = total;
  const shipping = total > 0 ? (total > 100 ? 0 : 10) : 0;
  const tax = total * 0.08;
  const grandTotal = subtotal + shipping + tax - discount;

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      setUpdatingItem(productId);
      await updateQuantity(productId, newQuantity);
      await refreshCart();
    } catch (err) {
      showError("Failed to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    const itemToRemove = cartItems.find(item => {
      const itemId = item._id || 
                     item.id || 
                     item.productId || 
                     item.product?._id || 
                     item.product?.id || 
                     item.product?.productId;
      return itemId === productId;
    });
    
    if (!itemToRemove) {
      showError('Item not found in cart');
      return;
    }
    
    if (window.confirm(`Remove "${itemToRemove.name || itemToRemove.product?.name}" from your cart?`)) {
      try {
        setRemovingItem(productId);
        await removeFromCart(productId);
        success(`${itemToRemove.name || itemToRemove.product?.name} removed from cart`);
        await refreshCart();
      } catch (err) {
        showError('Failed to remove item');
      } finally {
        setRemovingItem(null);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        await clearCart();
        success("Cart cleared successfully");
        await refreshCart();
      } catch (err) {
        showError("Failed to clear cart");
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      info("Please login to proceed with checkout");
      router.push("/login?redirect=/cart");
      return;
    }
    
    if (cartItems.length === 0) {
      warning("Your cart is empty!");
      return;
    }

    router.push("/checkout");
  };

  const getItemId = (item) => {
    return item._id || 
           item.id || 
           item.productId || 
           item.product?._id || 
           item.product?.id || 
           item.product?.productId;
  };

  const getItemName = (item) => {
    return item.name || item.product?.name || 'Product';
  };

  const getItemPrice = (item) => {
    return typeof item.price === 'number' ? item.price : 
           (item.product?.price || 0);
  };

  const getItemImage = (item) => {
    return item.image || item.product?.image || '';
  };

  const getItemCategory = (item) => {
    return item.category || item.product?.category || '';
  };

  const getItemQuantity = (item) => {
    return typeof item.quantity === 'number' ? item.quantity : 1;
  };

  const isLoading = cartLoading;

  // Helper to truncate product name
  const truncateName = (name, maxLength = 30) => {
    if (!name) return '';
    return name.length > maxLength ? name.substring(0, maxLength) + '…' : name;
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-4xl text-black animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-4xl text-black animate-spin" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
            <FiAlertCircle className="text-4xl text-red-600" />
          </div>
          <h2 className="mt-4 text-2xl text-black">Oops! Something went wrong</h2>
          <p className="mt-2 text-gray-600">{cartError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white p-8 rounded-2xl border border-gray-200">
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-full p-6">
                <FiShoppingCart className="h-16 w-16 text-black" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl text-black">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-600">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base text-white bg-black hover:bg-gray-800 transition-all duration-200 rounded-xl"
              >
                <FiShoppingBag className="mr-2" />
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className=" p-2 rounded-xl">
                <FiShoppingCart className="text-black text-4xl " />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl text-black">Shopping Cart</h1>
                <p className="text-sm text-gray-600">{itemCount} items in your cart</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 sm:mt-0">
              <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm text-black bg-white rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-300">
                <FiArrowLeft />
                Continue Shopping
              </Link>
              <button 
                onClick={handleClearCart} 
                disabled={isLoading} 
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-black rounded-xl hover:bg-gray-800 transition-colors duration-200 border border-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiTrash2 />
                Clear Cart
              </button>
            </div>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => {
                    const itemId = getItemId(item);
                    const itemName = getItemName(item);
                    const itemPrice = getItemPrice(item);
                    const itemImage = getItemImage(item);
                    const itemCategory = getItemCategory(item);
                    const itemQuantity = getItemQuantity(item);
                    
                    return (
                      <div key={itemId || index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {itemImage ? (
                              <img
                                src={itemImage}
                                alt={itemName}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border-2 border-gray-200"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/150/000000/FFFFFF?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
                                <FiShoppingBag className="text-gray-400 text-3xl" />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="min-w-0">
                                {/* Product name – normal weight, truncated to 30 chars */}
                                <h3 className="text-lg text-black truncate max-w-[200px] sm:max-w-xs" title={itemName}>
                                  {truncateName(itemName, 30)}
                                </h3>
                                {itemCategory && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-gray-200 text-black px-2 py-1 rounded-full mt-1">
                                    {itemCategory}
                                  </span>
                                )}
                              </div>
                              {/* Price – normal weight */}
                              <p className="text-xl text-black whitespace-nowrap">
                                ${(itemPrice * itemQuantity).toFixed(2)}
                              </p>
                            </div>

                            {/* Quantity Controls and Remove */}
                            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                              <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1 border border-gray-300">
                                <button
                                  onClick={() => handleQuantityChange(itemId, itemQuantity - 1)}
                                  disabled={isLoading || updatingItem === itemId || itemQuantity <= 1}
                                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FiMinus className="w-4 h-4 text-black" />
                                </button>
                                <span className="w-10 text-center text-black">
                                  {itemQuantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(itemId, itemQuantity + 1)}
                                  disabled={isLoading || updatingItem === itemId}
                                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <FiPlus className="w-4 h-4 text-black" />
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemoveItem(itemId)}
                                disabled={isLoading || removingItem === itemId}
                                className={`text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center gap-1 text-sm ${
                                  isLoading || removingItem === itemId ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {removingItem === itemId ? (
                                  <>
                                    <FiLoader className="animate-spin w-4 h-4" />
                                    Removing...
                                  </>
                                ) : (
                                  <>
                                    <FiTrash2 />
                                    Remove
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4 mt-6 lg:mt-0">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
                <h2 className="text-xl text-black mb-4 flex items-center gap-2">
                  <FiShoppingBag className="text-black" />
                  Order Summary
                </h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                    <span className="text-black">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-black">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="text-black">${tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg">
                      <span className="text-black">Total</span>
                      <span className="text-black">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  disabled={isLoading || cartItems.length === 0}
                  className={`mt-6 w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-base text-white ${
                    isLoading || cartItems.length === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 transition-colors duration-200"
                  }`}
                >
                  <FiShoppingBag className="text-lg" />
                  Proceed to Checkout
                </button>

                {/* User Authentication Note */}
                {!user && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2 border border-yellow-300">
                    <FiInfo className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Please <Link href="/login?redirect=/cart" className="underline hover:text-yellow-900">login</Link> to complete your order
                    </p>
                  </div>
                )}

                {user && cartItems.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2 border border-blue-300">
                    <FiCheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      You're ready to checkout! Click the button above to proceed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}