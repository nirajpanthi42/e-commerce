"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../context/AuthContext";
import { useOrder } from "../context/OrderContext";

import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product";
import { getAllReviews, deleteReview } from "../services/review";
// 🆕 Import user services
import { getUsers, deleteUser, updateUserRole,updateUser } from "../services/user";

import {
  FiPackage,
  FiShoppingBag,
  FiDollarSign,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiMenu,
  FiX,
  FiLogOut,
  FiSearch,
  FiEye,
  FiUser,
  FiMail,
  FiCalendar,
  FiTag,
  FiBox,
  FiStar,
  FiTrash2,
  FiUsers,       // 🆕
  FiEdit2,       // 🆕
} from "react-icons/fi";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, logout, loading, user } = useAuth();
  const { orders, fetchAllOrders, updateOrderStatus } = useOrder();

  // --- existing state ---
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [orderError, setOrderError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");

  // --- review state ---
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // 🆕 User management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // holds user object being edited
  const [showEditModal, setShowEditModal] = useState(false);

  // --- form state ---
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: null,
  });

  // --- effects ---
  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!isAdmin) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      setDashboardLoading(true);
      await fetchProducts();
      if (activeTab === "orders") await fetchAllOrders();
      if (activeTab === "reviews") await fetchReviews();
      if (activeTab === "users") await fetchUsers(); // 🆕
      setDashboardLoading(false);
    };

    loadData();

    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [loading, isAuthenticated, isAdmin, activeTab]);

  // --- data fetching functions ---
  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewsError(null);
      const res = await getAllReviews();
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setReviewsError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  // 🆕 Fetch users
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsersError(err.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  // --- handlers ---
  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      setDeletingReviewId(reviewId);
      await deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  // 🆕 User handlers
  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user permanently? This action cannot be undone.")) return;
    try {
      setDeletingUserId(userId);
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  // Edit user modal (simplified – you can expand)
  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      // You can update more fields – we only update name and email here
      await updateUser(editingUser._id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === editingUser._id ? { ...u, ...editingUser } : u
        )
      );
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  // --- other existing handlers (unchanged) ---
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm((prev) => ({ ...prev, image: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      stock: "",
      description: "",
      image: null,
    });
    setEditing(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("stock", form.stock);
      formData.append("description", form.description);
      if (form.image) formData.append("image", form.image);

      if (editing) {
        await updateProduct(editId, formData);
      } else {
        await createProduct(formData);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (product) => {
    setEditing(true);
    setEditId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description,
      image: product.image,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      console.log(err);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    setUpdatingOrder(orderId);
    setOrderError(null);
    setUpdateSuccess(null);
    try {
      await updateOrderStatus(orderId, status);
      setUpdateSuccess(`Order ${orderId.slice(-6)} updated to ${status}`);
      setTimeout(() => fetchAllOrders(), 500);
    } catch (error) {
      setOrderError(error.response?.data?.message || "Failed to update order");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending", icon: FiClock },
      processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Processing", icon: FiRefreshCw },
      shipped: { bg: "bg-purple-100", text: "text-purple-800", label: "Shipped", icon: FiTruck },
      delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered", icon: FiCheckCircle },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled", icon: FiXCircle },
    };
    const statusConfig = config[status?.toLowerCase()] || config.pending;
    const Icon = statusConfig.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
        <Icon className="w-3 h-3" />
        {statusConfig.label}
      </span>
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "orders") fetchAllOrders();
    if (tab === "reviews") fetchReviews();
    if (tab === "users") fetchUsers(); // 🆕
    if (window.innerWidth < 1024) setMobileSidebarOpen(false);
  };

  // --- computed values ---
  const ordersList = Array.isArray(orders) ? orders : [];
  const totalOrders = ordersList.length;
  const pendingOrders = ordersList.filter((o) => o.status === "pending").length;
  const totalRevenue = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const processingOrders = ordersList.filter((o) => o.status === "processing").length;
  const deliveredOrders = ordersList.filter((o) => o.status === "delivered").length;
  const totalReviews = reviews.length;
  const totalUsers = users.length; // 🆕

  const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orderFilter === "all"
    ? ordersList
    : ordersList.filter(order => order.status === orderFilter);

  // --- loader ---
  if (loading || dashboardLoading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center z-50 fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) return null;

  // --- main render ---
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 h-screen bg-white shadow-2xl flex flex-col ${
          mobileSidebarOpen ? "block" : "hidden"
        } ${sidebarOpen ? "w-[280px]" : "w-0"} lg:block overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <FiPackage className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                <p className="text-xs text-gray-500">Welcome back!</p>
              </div>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-200 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">Main Menu</p>

          {/* Products */}
          <button
            onClick={() => handleTabChange("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
              activeTab === "products" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiShoppingBag className="w-5 h-5" />
            <span className="flex-1 text-left font-medium text-sm">Product Management</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === "products" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {products.length}
            </span>
          </button>

          {/* Orders */}
          <button
            onClick={() => handleTabChange("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
              activeTab === "orders" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiPackage className="w-5 h-5" />
            <span className="flex-1 text-left font-medium text-sm">Order Management</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === "orders" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {totalOrders}
            </span>
          </button>

          {/* Reviews */}
          <button
            onClick={() => handleTabChange("reviews")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
              activeTab === "reviews" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiStar className="w-5 h-5" />
            <span className="flex-1 text-left font-medium text-sm">Review Management</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === "reviews" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {totalReviews}
            </span>
          </button>

          {/* 🆕 Users */}
          <button
            onClick={() => handleTabChange("users")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
              activeTab === "users" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FiUsers className="w-5 h-5" />
            <span className="flex-1 text-left font-medium text-sm">User Management</span>
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === "users" ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
            }`}>
              {totalUsers}
            </span>
          </button>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 fade-in">
        {/* Top Navbar */}
        <div className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) setMobileSidebarOpen(!mobileSidebarOpen);
                  else setSidebarOpen(!sidebarOpen);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiMenu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {activeTab === "products" && "Product Management"}
                  {activeTab === "orders" && "Order Management"}
                  {activeTab === "reviews" && "Review Management"}
                  {activeTab === "users" && "User Management"} {/* 🆕 */}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === "products" && (
                <div className="relative hidden md:block">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 w-48 lg:w-64"
                  />
                </div>
              )}
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-sm lg:hidden">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
            </div>
          </div>

          {activeTab === "products" && (
            <div className="px-4 pb-3 md:hidden">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FiShoppingBag className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Products</p>
                  <p className="text-lg font-bold text-gray-800">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FiPackage className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <p className="text-lg font-bold text-gray-800">{totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <FiClock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pending Orders</p>
                  <p className="text-lg font-bold text-gray-800">{pendingOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-50 rounded-xl">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-lg font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <FiStar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Reviews</p>
                  <p className="text-lg font-bold text-gray-800">{totalReviews}</p>
                </div>
              </div>
            </div>
            {/* 🆕 Users stats card */}
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Users</p>
                  <p className="text-lg font-bold text-gray-800">{totalUsers}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Contents */}
          {activeTab === "products" && (
            <>
              <div className="mb-6">
                <ProductForm
                  form={form}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  editing={editing}
                  onCancel={resetForm}
                />
              </div>
              <ProductTable
                products={filteredProducts}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
              />
              {filteredProducts.length === 0 && searchTerm && (
                <div className="text-center py-8 bg-white rounded-2xl shadow-sm mt-4">
                  <p className="text-gray-500">No products found matching "{searchTerm}"</p>
                </div>
              )}
            </>
          )}

          {activeTab === "orders" && (
            /* ... your existing orders tab code ... */
            <div>
              {updateSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5" />
                    <span>{updateSuccess}</span>
                  </div>
                  <button onClick={() => setUpdateSuccess(null)} className="text-green-700 hover:text-green-900">
                    <FiXCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
              {orderError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiXCircle className="w-5 h-5" />
                    <span>{orderError}</span>
                  </div>
                  <button onClick={() => setOrderError(null)} className="text-red-700 hover:text-red-900">
                    <FiXCircle className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-800">{totalOrders}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-lg font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Processing</p>
                  <p className="text-lg font-bold text-blue-600">{processingOrders}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Delivered</p>
                  <p className="text-lg font-bold text-green-600">{deliveredOrders}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-lg font-bold text-purple-600">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
              {/* Filter buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setOrderFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    orderFilter === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Orders ({totalOrders})
                </button>
                {statusOptions.map((status) => {
                  const count = ordersList.filter(o => o.status === status).length;
                  return (
                    <button
                      key={status}
                      onClick={() => setOrderFilter(status)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium ${
                        orderFilter === status ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                    </button>
                  );
                })}
              </div>
              {/* Order table */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPackage className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Orders Found</h3>
                  <p className="text-gray-500 text-sm">
                    {orderFilter === "all" ? "There are no orders in the system yet." : `No ${orderFilter} orders found.`}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredOrders.map((order) => {
                          const orderId = order._id || order.id;
                          const orderStatus = order.status || "pending";
                          const orderTotal = order.totalAmount || 0;
                          const orderItems = order.items || [];
                          const orderDate = order.createdAt || order.orderDate || new Date();
                          const customerName = order.userId?.name || order.user?.name || "N/A";
                          return (
                            <tr key={orderId} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{orderId?.slice(-6) || "N/A"}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{customerName}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">${orderTotal.toFixed(2)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{orderItems.length}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(orderStatus)}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {new Date(orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleViewOrder(order)} className="p-1.5 text-gray-900 hover:bg-gray-100 rounded-lg" title="View Order Details">
                                    <FiEye className="w-4 h-4" />
                                  </button>
                                  <select
                                    value={orderStatus}
                                    onChange={(e) => handleOrderStatusUpdate(orderId, e.target.value)}
                                    disabled={updatingOrder === orderId}
                                    className={`border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 ${
                                      updatingOrder === orderId ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {statusOptions.map((s) => (
                                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                  </select>
                                  {updatingOrder === orderId && <span className="text-xs text-gray-900 animate-pulse">Updating...</span>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {/* Order details modal */}
              {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        <FiPackage className="w-6 h-6 text-gray-900" />
                        <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                      </div>
                      <button onClick={() => { setShowOrderDetails(false); setSelectedOrder(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="col-span-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="text-sm text-gray-500">Order ID</p>
                              <p className="font-semibold text-lg">#{selectedOrder._id?.slice(-8)}</p>
                            </div>
                            <div>{getStatusBadge(selectedOrder.status)}</div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1"><FiUser className="w-3 h-3" /> Customer</p>
                          <p className="font-semibold">{selectedOrder.userId?.name || selectedOrder.user?.name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1"><FiMail className="w-3 h-3" /> Email</p>
                          <p className="font-semibold text-sm">{selectedOrder.userId?.email || selectedOrder.user?.email || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1"><FiTag className="w-3 h-3" /> Total Amount</p>
                          <p className="font-semibold text-lg text-green-600">${(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Order Date</p>
                          <p className="font-semibold text-sm">{new Date(selectedOrder.createdAt || selectedOrder.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><FiBox className="w-4 h-4" /> Order Items</h4>
                        <div className="space-y-2">
                          {(selectedOrder.items || []).map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                  {item.productId?.image ? (
                                    <img src={item.productId.image} alt={item.productId?.name} className="w-12 h-12 object-cover rounded-lg" />
                                  ) : (
                                    <FiPackage className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{item.productId?.name || item.name || "Product"}</p>
                                  <p className="text-sm text-gray-500">Qty: {item.quantity || 1} × ${(item.price || 0).toFixed(2)}</p>
                                </div>
                              </div>
                              <p className="font-semibold">${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-gray-800">Total</p>
                          <p className="text-2xl font-bold text-green-600">${(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Update Status</h4>
                        <div className="flex gap-2 flex-wrap">
                          {statusOptions.map((status) => (
                            <button
                              key={status}
                              onClick={() => {
                                handleOrderStatusUpdate(selectedOrder._id, status);
                                setShowOrderDetails(false);
                                setSelectedOrder(null);
                              }}
                              disabled={updatingOrder === selectedOrder._id}
                              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                                selectedOrder.status === status ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              } ${updatingOrder === selectedOrder._id ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div>
              {reviewsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading reviews...</span>
                </div>
              )}
              {reviewsError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiXCircle className="w-5 h-5" />
                    <span>{reviewsError}</span>
                  </div>
                  <button onClick={() => fetchReviews()} className="text-red-700 hover:text-red-900 font-medium">Retry</button>
                </div>
              )}
              {!reviewsLoading && !reviewsError && (
                <>
                  {reviews.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiStar className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Reviews Found</h3>
                      <p className="text-gray-500 text-sm">There are no product reviews yet.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {reviews.map((review) => (
                              <tr key={review._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {review.product?.name || "Deleted Product"}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                  {review.user?.name || "Unknown"}
                                  <div className="text-xs text-gray-400">{review.user?.email}</div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <FiStar className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-sm font-medium">{review.rating}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3"><div className="max-w-xs truncate text-sm text-gray-700">{review.comment}</div></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  <button
                                    onClick={() => handleDeleteReview(review._id)}
                                    disabled={deletingReviewId === review._id}
                                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                    title="Delete review"
                                  >
                                    {deletingReviewId === review._id ? (
                                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <FiTrash2 className="w-5 h-5" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 🆕 USERS TAB */}
          {activeTab === "users" && (
            <div>
              {usersLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading users...</span>
                </div>
              )}
              {usersError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiXCircle className="w-5 h-5" />
                    <span>{usersError}</span>
                  </div>
                  <button onClick={() => fetchUsers()} className="text-red-700 hover:text-red-900 font-medium">Retry</button>
                </div>
              )}
              {!usersLoading && !usersError && (
                <>
                  {users.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiUsers className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Users Found</h3>
                      <p className="text-gray-500 text-sm">There are no registered users yet.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {users.map((u) => (
                              <tr key={u._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {u.name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{u.email}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <select
                                    value={u.role || "user"}
                                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                    className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                                  >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleEditUser(u)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Edit user"
                                    >
                                      <FiEdit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(u._id)}
                                      disabled={deletingUserId === u._id}
                                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                      title="Delete user"
                                    >
                                      {deletingUserId === u._id ? (
                                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <FiTrash2 className="w-5 h-5" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 🆕 Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Edit User</h3>
              <button
                onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUserEdit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingUser.name || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email || ""}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editingUser.role || "user"}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingUser(null); }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}