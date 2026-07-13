// app/checkout/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useOrder } from "../context/OrderContext";
import { useToast } from "../components/Toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiShoppingBag,
  FiCreditCard,
  FiTruck,
  FiUser,
  FiMapPin,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiLoader,
  FiAlertCircle,
  FiInfo,
  FiLock,
  FiShield,
  FiClock,
  FiHome,
  FiCalendar,
  FiDollarSign
} from "react-icons/fi";

export default function CheckoutPage() {
  const { 
    cartItems, 
    getCartTotal,
    getCartCount,
    clearCart,
    loading: cartLoading,
    refreshCart
  } = useCart();
  
  const { user, loading: authLoading } = useAuth();
  const { createOrder, loading: orderLoading } = useOrder();
  const router = useRouter();
  const { success, error: showError, info, warning } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    deliveryNotes: ""
  });

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billingFormData, setBillingFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States"
  });

  // Calculate totals
  const subtotal = getCartTotal();
  const itemCount = getCartCount();
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + shipping + tax;

  useEffect(() => {
    setIsClient(true);
    
    // Redirect if cart is empty
    if (!cartLoading && cartItems.length === 0 && isClient) {
      warning("Your cart is empty. Please add items before checkout.");
      router.push("/cart");
    }

    // Pre-fill user data if logged in
    if (user && isClient) {
      const firstName = user.firstName || user.name?.split(' ')[0] || "";
      const lastName = user.lastName || user.name?.split(' ')[1] || "";
      
      setFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        country: user.country || "United States"
      }));

      setBillingFormData(prev => ({
        ...prev,
        firstName: firstName,
        lastName: lastName,
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        country: user.country || "United States"
      }));
    }
  }, [user, cartItems, cartLoading]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Personal Information
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-+()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Shipping Address
    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid ZIP code";
    }

    // Billing Address
    if (!sameAsShipping) {
      if (!billingFormData.address.trim()) newErrors.billingAddress = "Billing address is required";
      if (!billingFormData.city.trim()) newErrors.billingCity = "Billing city is required";
      if (!billingFormData.state.trim()) newErrors.billingState = "Billing state is required";
      if (!billingFormData.zipCode.trim()) {
        newErrors.billingZip = "Billing ZIP code is required";
      } else if (!/^\d{5}(-\d{4})?$/.test(billingFormData.zipCode)) {
        newErrors.billingZip = "Please enter a valid ZIP code";
      }
    }

    // Payment Information - Only validate card details if card is selected
    if (paymentMethod === "card") {
      const cardNumberClean = cardDetails.cardNumber.replace(/\s/g, '');
      if (!cardDetails.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      } else if (!/^\d{16}$/.test(cardNumberClean)) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }
      if (!cardDetails.cardName.trim()) newErrors.cardName = "Name on card is required";
      if (!cardDetails.expiryDate.trim()) {
        newErrors.expiryDate = "Expiry date is required";
      } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
        newErrors.expiryDate = "Please use MM/YY format";
      } else {
        const [month, year] = cardDetails.expiryDate.split('/');
        const currentYear = new Date().getFullYear() % 100;
        const currentMonth = new Date().getMonth() + 1;
        if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
          newErrors.expiryDate = "Card has expired";
        }
      }
      if (!cardDetails.cvv.trim()) {
        newErrors.cvv = "CVV is required";
      } else if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        newErrors.cvv = "Please enter a valid CVV";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle billing input change
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle card input change
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }

    if (name === "expiryDate") {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    }

    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Handle checkout submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      info("Please login to complete your order");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (cartItems.length === 0) {
      warning("Your cart is empty!");
      router.push("/cart");
      return;
    }

    if (!validateForm()) {
      const firstError = Object.keys(errors)[0];
      const element = document.querySelector(`[name="${firstError}"]`);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cartItems.map(item => ({
        productId: item._id || item.id || item.productId || item.product?._id,
        quantity: item.quantity || 1,
        price: typeof item.price === 'number' ? item.price : (item.product?.price || 0),
        name: item.name || item.product?.name || 'Product',
        image: item.image || item.product?.image || ''
      }));

      const orderPayload = {
        items: orderItems,
        totalAmount: parseFloat(grandTotal.toFixed(2)),
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: parseFloat(shipping.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        discount: 0,
        couponCode: null,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email
        },
        billingAddress: sameAsShipping ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email
        } : {
          firstName: billingFormData.firstName,
          lastName: billingFormData.lastName,
          address: billingFormData.address,
          city: billingFormData.city,
          state: billingFormData.state,
          zipCode: billingFormData.zipCode,
          country: billingFormData.country
        },
        deliveryNotes: formData.deliveryNotes,
        orderDate: new Date().toISOString(),
        status: "pending",
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      };

      const newOrder = await createOrder(orderPayload);
      setOrderData(newOrder);
      await clearCart();
      await refreshCart();
      setOrderId(newOrder._id || newOrder.id);
      setOrderComplete(true);
      
      if (paymentMethod === 'cod') {
        success("Order placed successfully! Pay cash on delivery. 🎉");
      } else {
        success("Order placed successfully! 🎉");
      }
      
      setTimeout(() => {
        router.push(`/orders/${newOrder._id || newOrder.id}`);
      }, 5000);

    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to place order. Please try again.';
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!isClient || cartLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-4xl text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Order complete
  if (orderComplete && orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center">
              <FiCheckCircle className="text-5xl text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>
            <p className="mt-2 text-gray-600">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <FiCheckCircle className="text-green-600 text-2xl" />
              <h3 className="font-semibold text-green-900">Order Confirmed!</h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Order #:</span> {orderData._id?.slice(-8).toUpperCase()}</p>
              <p><span className="font-medium">Total:</span> ${orderData.totalAmount?.toFixed(2)}</p>
              <p><span className="font-medium">Estimated Delivery:</span> {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
              <p><span className="font-medium">Payment Method:</span> {
                orderData.paymentMethod === 'card' ? 'Credit Card' : 
                orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                'PayPal'
              }</p>
              {orderData.paymentMethod === 'cod' && (
                <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium">💵 Cash on Delivery</p>
                  <p className="text-xs text-yellow-700">Please have the exact amount ready when the order arrives.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link 
              href={`/orders/${orderId}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-center font-medium"
            >
              View Order Details
            </Link>
            <Link 
              href="/"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-center font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link 
              href="/cart" 
              className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft className="text-gray-600 text-xl" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-500">Complete your order securely</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-xl shadow-sm mt-3 sm:mt-0">
            <FiShoppingBag className="text-blue-600" />
            <span className="font-medium">{itemCount}</span>
            <span>items</span>
            <span className="mx-1 text-gray-300">|</span>
            <span className="font-medium text-blue-600">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Progress Steps */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between">
                  {['Personal Info', 'Shipping', 'Payment', 'Confirm'].map((step, index) => (
                    <div key={step} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index === 0 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 hidden sm:block">{step}</span>
                      </div>
                      {index < 3 && (
                        <div className={`w-12 sm:w-16 h-0.5 mx-2 ${
                          index === 0 ? 'bg-blue-600' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiUser className="text-blue-600" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2.5 border ${
                        errors.firstName && touched.firstName 
                          ? 'border-red-500 ring-2 ring-red-200' 
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      } rounded-lg focus:outline-none transition-all`}
                      placeholder="John"
                    />
                    {errors.firstName && touched.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2.5 border ${
                        errors.lastName && touched.lastName 
                          ? 'border-red-500 ring-2 ring-red-200' 
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      } rounded-lg focus:outline-none transition-all`}
                      placeholder="Doe"
                    />
                    {errors.lastName && touched.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-2.5 border ${
                          errors.email && touched.email 
                            ? 'border-red-500 ring-2 ring-red-200' 
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                        } rounded-lg focus:outline-none transition-all`}
                        placeholder="john@example.com"
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full pl-10 pr-4 py-2.5 border ${
                          errors.phone && touched.phone 
                            ? 'border-red-500 ring-2 ring-red-200' 
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                        } rounded-lg focus:outline-none transition-all`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    {errors.phone && touched.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMapPin className="text-blue-600" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-2.5 border ${
                        errors.address && touched.address 
                          ? 'border-red-500 ring-2 ring-red-200' 
                          : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                      } rounded-lg focus:outline-none transition-all`}
                      placeholder="123 Main Street"
                    />
                    {errors.address && touched.address && (
                      <p className="mt-1 text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apartment, Suite, etc. (Optional)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Apt 4B, Suite 200"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2.5 border ${
                          errors.city && touched.city 
                            ? 'border-red-500 ring-2 ring-red-200' 
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                        } rounded-lg focus:outline-none transition-all`}
                        placeholder="New York"
                      />
                      {errors.city && touched.city && (
                        <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2.5 border ${
                          errors.state && touched.state 
                            ? 'border-red-500 ring-2 ring-red-200' 
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                        } rounded-lg focus:outline-none transition-all`}
                        placeholder="NY"
                      />
                      {errors.state && touched.state && (
                        <p className="mt-1 text-sm text-red-500">{errors.state}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2.5 border ${
                          errors.zipCode && touched.zipCode 
                            ? 'border-red-500 ring-2 ring-red-200' 
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                        } rounded-lg focus:outline-none transition-all`}
                        placeholder="10001"
                      />
                      {errors.zipCode && touched.zipCode && (
                        <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="United States">United States</option>
                        <option value="Canada">Canada</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Japan">Japan</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      name="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Special instructions for delivery..."
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiHome className="text-blue-600" />
                  Billing Address
                </h2>
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Same as shipping address</span>
                  </label>
                </div>

                {!sameAsShipping && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="billingFirstName"
                          value={billingFormData.firstName}
                          onChange={handleBillingChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="billingLastName"
                          value={billingFormData.lastName}
                          onChange={handleBillingChange}
                          onBlur={handleBlur}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="billingAddress"
                        value={billingFormData.address}
                        onChange={handleBillingChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-2.5 border ${
                          errors.billingAddress && touched.billingAddress 
                            ? 'border-red-500 ring-2 ring-red-200' 
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                        } rounded-lg focus:outline-none transition-all`}
                        placeholder="123 Main Street"
                      />
                      {errors.billingAddress && touched.billingAddress && (
                        <p className="mt-1 text-sm text-red-500">{errors.billingAddress}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="billingCity"
                          value={billingFormData.city}
                          onChange={handleBillingChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-2.5 border ${
                            errors.billingCity && touched.billingCity 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                          } rounded-lg focus:outline-none transition-all`}
                          placeholder="New York"
                        />
                        {errors.billingCity && touched.billingCity && (
                          <p className="mt-1 text-sm text-red-500">{errors.billingCity}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="billingState"
                          value={billingFormData.state}
                          onChange={handleBillingChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-2.5 border ${
                            errors.billingState && touched.billingState 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                          } rounded-lg focus:outline-none transition-all`}
                          placeholder="NY"
                        />
                        {errors.billingState && touched.billingState && (
                          <p className="mt-1 text-sm text-red-500">{errors.billingState}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="billingZip"
                          value={billingFormData.zipCode}
                          onChange={handleBillingChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-2.5 border ${
                            errors.billingZip && touched.billingZip 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                          } rounded-lg focus:outline-none transition-all`}
                          placeholder="10001"
                        />
                        {errors.billingZip && touched.billingZip && (
                          <p className="mt-1 text-sm text-red-500">{errors.billingZip}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="billingCountry"
                          value={billingFormData.country}
                          onChange={handleBillingChange}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Japan">Japan</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCreditCard className="text-blue-600" />
                  Payment Method
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card" 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <FiCreditCard className={paymentMethod === "card" ? 'text-blue-600' : 'text-gray-600'} />
                      <span className="text-sm font-medium">Credit Card</span>
                    </label>
                    
                    <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "paypal" 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={() => setPaymentMethod("paypal")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">PayPal</span>
                    </label>

                    <label className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "cod" 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <FiDollarSign className={paymentMethod === "cod" ? 'text-blue-600' : 'text-gray-600'} />
                      <span className="text-sm font-medium">Cash on Delivery</span>
                    </label>
                  </div>

                  {paymentMethod === "card" && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={handleCardChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-2.5 border ${
                            errors.cardNumber && touched.cardNumber 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                          } rounded-lg focus:outline-none transition-all font-mono`}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                        {errors.cardNumber && touched.cardNumber && (
                          <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name on Card <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="cardName"
                          value={cardDetails.cardName}
                          onChange={handleCardChange}
                          onBlur={handleBlur}
                          className={`w-full px-4 py-2.5 border ${
                            errors.cardName && touched.cardName 
                              ? 'border-red-500 ring-2 ring-red-200' 
                              : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                          } rounded-lg focus:outline-none transition-all`}
                          placeholder="John Doe"
                        />
                        {errors.cardName && touched.cardName && (
                          <p className="mt-1 text-sm text-red-500">{errors.cardName}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleCardChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 border ${
                              errors.expiryDate && touched.expiryDate 
                                ? 'border-red-500 ring-2 ring-red-200' 
                                : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                            } rounded-lg focus:outline-none transition-all font-mono`}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                          {errors.expiryDate && touched.expiryDate && (
                            <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            CVV <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            onBlur={handleBlur}
                            className={`w-full px-4 py-2.5 border ${
                              errors.cvv && touched.cvv 
                                ? 'border-red-500 ring-2 ring-red-200' 
                                : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                            } rounded-lg focus:outline-none transition-all font-mono`}
                            placeholder="123"
                            maxLength="4"
                          />
                          {errors.cvv && touched.cvv && (
                            <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "paypal" && (
                    <div className="p-4 bg-blue-50 rounded-lg flex items-start gap-3">
                      <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5 text-xl" />
                      <div>
                        <p className="text-sm text-blue-800">
                          You will be redirected to PayPal to complete your payment securely.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          You don't need a PayPal account to use this method.
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="p-4 bg-green-50 rounded-lg flex items-start gap-3 border border-green-200">
                      <FiDollarSign className="text-green-600 flex-shrink-0 mt-0.5 text-xl" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Cash on Delivery</p>
                        <p className="text-xs text-green-700 mt-1">
                          Pay with cash when your order arrives. No payment needed now.
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-green-700">
                          <FiCheckCircle className="text-green-600" />
                          <span>No additional fees for COD</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-green-700">
                          <FiCheckCircle className="text-green-600" />
                          <span>Pay only when you receive the order</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Security Section */}
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex flex-wrap items-center gap-4 justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiLock className="text-green-600 text-xl flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Secure Checkout</p>
                      <p className="text-xs text-gray-600">256-bit SSL encryption</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">We accept</span>
                    <FiCreditCard className="text-gray-600 text-xl" />
                    <FiDollarSign className="text-gray-600 text-xl" />
                    <span className="text-xs font-medium text-gray-700">Card • PayPal • COD</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || cartItems.length === 0}
                className={`w-full flex justify-center items-center gap-3 py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-medium text-white transition-all duration-200 ${
                  isSubmitting || cartItems.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin h-5 w-5" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'cod' ? (
                      <FiDollarSign className="text-lg" />
                    ) : (
                      <FiShield className="text-lg" />
                    )}
                    {paymentMethod === 'cod' ? 'Place Order • Pay on Delivery' : `Place Order • $${grandTotal.toFixed(2)}`}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </div>

          {/* Order Summary Sidebar */}
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
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Cart Items Preview */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Items in Cart</h3>
                <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
                  {cartItems.map((item, index) => {
                    const name = item.name || item.product?.name || 'Product';
                    const price = typeof item.price === 'number' ? item.price : (item.product?.price || 0);
                    const quantity = item.quantity || 1;
                    const image = item.image || item.product?.image || '';
                    
                    return (
                      <div key={item._id || index} className="flex items-center gap-3">
                        <img
                          src={image || 'https://via.placeholder.com/50/4F46E5/FFFFFF?text=No+Image'}
                          alt={name}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/50/4F46E5/FFFFFF?text=No+Image';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                          <p className="text-xs text-gray-500">Qty: {quantity}</p>
                        </div>
                        <span className="text-sm font-medium text-gray-900">${(price * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3">
                  <FiTruck className="text-blue-600 flex-shrink-0 mt-0.5 text-xl" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Free Shipping</p>
                    <p className="text-xs text-blue-700">On orders over $100</p>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl flex items-start gap-3">
                  <FiCalendar className="text-purple-600 flex-shrink-0 mt-0.5 text-xl" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Estimated Delivery</p>
                    <p className="text-xs text-purple-700">
                      {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                  <FiInfo className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    Please <Link href="/login?redirect=/checkout" className="font-semibold underline hover:text-yellow-900">login</Link> to complete your order
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}