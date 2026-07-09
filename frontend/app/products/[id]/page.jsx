// app/products/[id]/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { getProducts } from "../../services/product";
import {
  FiArrowLeft,
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiStar,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiCheckCircle,
  FiPackage,
  FiTag,
  FiBox,
  FiLoader,
  FiAlertCircle,
  FiMinus,
  FiPlus,
  FiShoppingBag
} from "react-icons/fi";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProducts();
      let products = [];
      
      if (Array.isArray(response.data)) {
        products = response.data;
      } else if (Array.isArray(response.data.products)) {
        products = response.data.products;
      } else if (Array.isArray(response.data.data)) {
        products = response.data.data;
      }
      
      const foundProduct = products.find(p => p._id === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (product && newQuantity > product.stock) {
      showError(`Only ${product.stock} items available in stock`);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setAddingToCart(true);
      
      await addToCart({
        _id: product._id,
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
        quantity: quantity
      });

      success(`${product.name} added to cart! 🛒`);
    } catch (err) {
      console.error('Error adding to cart:', err);
      showError('Failed to add item to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/login?redirect=/products/' + id);
      return;
    }
    handleAddToCart();
    setTimeout(() => {
      router.push('/checkout');
    }, 500);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <FiLoader className="text-4xl text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto flex items-center justify-center">
            <FiAlertCircle className="text-4xl text-red-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Product Not Found</h2>
          <p className="mt-2 text-gray-600">
            {error || "We couldn't find the product you're looking for."}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiArrowLeft />
            Back to Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
            Products
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                <img
                  src={product.image || "https://via.placeholder.com/600x600/4F46E5/FFFFFF?text=Product"}
                  alt={product.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/600x600/4F46E5/FFFFFF?text=Product";
                  }}
                />
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Low Stock
                  </span>
                )}
                {product.stock === 0 && (
                  <span className="absolute top-4 right-4 bg-gray-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Category */}
              {product.category && (
                <span className="inline-flex items-center gap-1 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full w-fit mb-3">
                  <FiTag className="text-xs" />
                  {product.category}
                </span>
              )}

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (product.rating || 4)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.reviews || 24} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="mt-4">
                <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                  {formatPrice(product.price)}
                </p>
                {product.oldPrice && (
                  <p className="text-sm text-gray-400 line-through mt-1">
                    {formatPrice(product.oldPrice)}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mt-4 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 text-sm ${
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                {product.stock > 0 && (
                  <span className="text-sm text-gray-500">
                    ({product.stock} units available)
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= product.stock}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-500 ml-2">
                      Max {product.stock}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                {product.stock > 0 ? (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingToCart ? (
                          <>
                            <FiLoader className="animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <FiShoppingCart className="text-lg" />
                            Add to Cart
                          </>
                        )}
                      </button>
                     
                    </div>
                  
                  </>
                ) : (
                  <button
                    disabled
                    className="w-full px-6 py-3 bg-gray-400 text-white rounded-xl font-medium cursor-not-allowed"
                  >
                    Out of Stock
                  </button>
                )}
              </div>

              {/* Shipping Info */}
              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiTruck className="text-blue-600 text-lg" />
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-xs text-gray-400">On orders over $100</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiShield className="text-blue-600 text-lg" />
                  <div>
                    <p className="font-medium">Secure Payment</p>
                    <p className="text-xs text-gray-400">100% secure checkout</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiRotateCcw className="text-blue-600 text-lg" />
                  <div>
                    <p className="font-medium">Easy Returns</p>
                    <p className="text-xs text-gray-400">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPackage className="text-blue-600 text-lg" />
                  <div>
                    <p className="font-medium">Quality Guarantee</p>
                    <p className="text-xs text-gray-400">Premium products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}