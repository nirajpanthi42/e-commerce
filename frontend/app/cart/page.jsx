// app/cart/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
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
  FiXCircle,
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
    loading,
    error,
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
      console.error('Quantity update error:', err);
      showError("Failed to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    console.log('🔄 REMOVE BUTTON CLICKED');
    console.log('📌 Product ID received:', productId);
    console.log('📌 Product ID type:', typeof productId);
    console.log('📦 Current cart items:', cartItems);
    
    // Find the item - check ALL possible ID locations including nested product
    const itemToRemove = cartItems.find(item => {
      const itemId = item._id || 
                     item.id || 
                     item.productId || 
                     item.product?._id || 
                     item.product?.id || 
                     item.product?.productId;
      console.log(`🔍 Checking item: ${item.name || item.product?.name}, ID: ${itemId}, Match: ${itemId === productId}`);
      return itemId === productId;
    });
    
    if (!itemToRemove) {
      console.error('❌ Item not found with ID:', productId);
      console.log('📋 Available IDs:', cartItems.map(item => ({
        name: item.name || item.product?.name,
        _id: item._id,
        id: item.id,
        productId: item.productId,
        product_id: item.product?._id,
        realId: item._id || item.id || item.productId || item.product?._id
      })));
      showError('Item not found in cart');
      return;
    }
    
    console.log('✅ Found item to remove:', itemToRemove);
    
    if (window.confirm(`Remove "${itemToRemove.name || itemToRemove.product?.name}" from your cart?`)) {
      try {
        setRemovingItem(productId);
        console.log('🗑️ Removing item with ID:', productId);
        await removeFromCart(productId);
        console.log('✅ Item removed successfully');
        success(`${itemToRemove.name || itemToRemove.product?.name} removed from cart`);
        await refreshCart();
      } catch (err) {
        console.error('❌ Remove error:', err);
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
        console.error('Clear cart error:', err);
        showError("Failed to clear cart");
      }
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }
    
    if (cartItems.length === 0) {
      warning("Your cart is empty!");
      return;
    }
    
    router.push("/checkout");
  };

  const handleApplyCoupon = () => {
    const coupon = couponCode.toUpperCase().trim();
    
    if (coupon === "SAVE10") {
      const discountAmount = total * 0.1;
      setDiscount(discountAmount);
      setAppliedCoupon({ code: coupon, discount: discountAmount });
      success(`Coupon ${coupon} applied! You saved $${discountAmount.toFixed(2)}`);
    } else if (coupon === "SAVE20") {
      const discountAmount = total * 0.2;
      setDiscount(discountAmount);
      setAppliedCoupon({ code: coupon, discount: discountAmount });
      success(`Coupon ${coupon} applied! You saved $${discountAmount.toFixed(2)}`);
    } else {
      showError("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode("");
    info("Coupon removed");
  };

  // Get the product ID from an item - check nested product object
  const getItemId = (item) => {
    // Try all possible locations for the ID
    const id = item._id || 
               item.id || 
               item.productId || 
               item.product?._id || 
               item.product?.id || 
               item.product?.productId;
    
    if (!id) {
      console.error('⚠️ Item has no ID:', item);
      return `temp-${Date.now()}-${Math.random()}`;
    }
    return id;
  };

  // Get the product name - check nested product
  const getItemName = (item) => {
    return item.name || item.product?.name || 'Product';
  };

  // Get the product price - check nested product
  const getItemPrice = (item) => {
    return item.price || item.product?.price || 0;
  };

  // Get the product image - check nested product
  const getItemImage = (item) => {
    return item.image || item.product?.image || '';
  };

  // Get the product category - check nested product
  const getItemCategory = (item) => {
    return item.category || item.product?.category || '';
  };

  // Get the product quantity
  const getItemQuantity = (item) => {
    return item.quantity || 1;
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-4xl text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-4xl text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
            <FiAlertCircle className="text-4xl text-red-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <div className="flex justify-center">
              <div className="bg-gray-100 rounded-full p-6">
                <FiShoppingCart className="h-16 w-16 text-gray-400" />
              </div>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-sm text-gray-600">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="mt-6 space-y-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
      {/* Debug Panel */}
     
          

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
              <FiShoppingCart className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-sm text-gray-500">{itemCount} items in your cart</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            
            <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200 shadow-sm">
              <FiArrowLeft />
              Continue Shopping
            </Link>
            <button onClick={handleClearCart} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white rounded-xl hover:bg-red-50 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <FiTrash2 />
              Clear Cart
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="divide-y divide-gray-200">
                {cartItems.map((item, index) => {
                  const itemId = getItemId(item);
                  const itemName = getItemName(item);
                  const itemPrice = getItemPrice(item);
                  const itemImage = getItemImage(item);
                  const itemCategory = getItemCategory(item);
                  const itemQuantity = getItemQuantity(item);
                  
                  console.log(`Rendering item ${index}:`, { 
                    itemId, 
                    itemName, 
                    itemPrice, 
                    itemQuantity,
                    rawItem: item 
                  });
                  
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
                                e.target.src = 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=No+Image';
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
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {itemName}
                              </h3>
                              {itemCategory && (
                                <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full mt-1">
                                  {itemCategory}
                                </span>
                              )}
                            </div>
                            <p className="text-xl font-bold text-blue-600">
                              ${(itemPrice * itemQuantity).toFixed(2)}
                            </p>
                          </div>

                          {/* Quantity Controls and Remove */}
                          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                              <button
                                onClick={() => handleQuantityChange(itemId, itemQuantity - 1)}
                                disabled={loading || updatingItem === itemId || itemQuantity <= 1}
                                className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiMinus className="w-4 h-4 text-gray-600" />
                              </button>
                              <span className="w-10 text-center font-medium text-gray-700">
                                {itemQuantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(itemId, itemQuantity + 1)}
                                disabled={loading || updatingItem === itemId}
                                className="p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiPlus className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                console.log('🔴 Remove button clicked for item:', itemId);
                                console.log('🔴 Item data:', item);
                                handleRemoveItem(itemId);
                              }}
                              disabled={loading || removingItem === itemId}
                              className={`text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center gap-1 text-sm font-medium ${
                                loading || removingItem === itemId ? 'opacity-50 cursor-not-allowed' : ''
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
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiShoppingBag className="text-blue-600" />
                Order Summary
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (8%)</span>
                  <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mt-6">
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter coupon code"
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button onClick={handleRemoveCoupon} className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 text-sm font-medium">
                      Remove
                    </button>
                  ) : (
                    <button onClick={handleApplyCoupon} className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200 text-sm font-medium">
                      Apply
                    </button>
                  )}
                </div>
                {appliedCoupon && (
                  <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                    <FiCheckCircle className="text-green-500" />
                    Coupon {appliedCoupon.code} applied! Saved ${appliedCoupon.discount.toFixed(2)}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  Try: SAVE10 (10% off), SAVE20 (20% off)
                </p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className={`mt-6 w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-base font-medium text-white ${
                  loading || cartItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-200"
                }`}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin h-5 w-5" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FiShoppingBag className="text-lg" />
                    Proceed to Checkout
                  </>
                )}
              </button>

              {/* Payment Methods */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">Secure checkout • SSL Encrypted</p>
                <div className="flex justify-center gap-3 mt-2">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">💳 Visa</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">💳 Mastercard</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">💳 PayPal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      
     
    </div>
  );
}