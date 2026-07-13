"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../context/AuthContext";
import { useOrder } from "../context/OrderContext";

import Loader from "../components/Loader";
import ProductForm from "../components/ProductForm";
import ProductTable from "../components/ProductTable";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product";

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
  FiEdit,
  FiTrash2,
  FiUser,
  FiMail,
  FiCalendar,
  FiTag,
  FiBox,
} from "react-icons/fi";

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, logout, loading, user } = useAuth();
  const { orders, fetchAllOrders, updateOrderStatus } = useOrder();

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

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: null,
  });

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
      if (activeTab === "orders") {
        await fetchAllOrders();
      }
      setDashboardLoading(false);
    };

    loadData();

    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [loading, isAuthenticated, isAdmin, activeTab]);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setForm((prev) => ({
        ...prev,
        image: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
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

      if (form.image) {
        formData.append("image", form.image);
      }

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
    if (tab === "orders") {
      fetchAllOrders();
    }
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false);
    }
  };

  if (loading || dashboardLoading) {
    return <Loader />;
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const ordersList = Array.isArray(orders) ? orders : [];
  const totalOrders = ordersList.length;
  const pendingOrders = ordersList.filter((o) => o.status === "pending").length;
  const totalRevenue = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const processingOrders = ordersList.filter((o) => o.status === "processing").length;
  const deliveredOrders = ordersList.filter((o) => o.status === "delivered").length;

  const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter orders based on status
  const filteredOrders = orderFilter === "all" 
    ? ordersList 
    : ordersList.filter(order => order.status === orderFilter);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 h-screen bg-white shadow-2xl flex flex-col transition-all duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarOpen ? "w-[280px]" : "w-0"} lg:translate-x-0 overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
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
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
            Main Menu
          </p>
          
          <button
            onClick={() => handleTabChange("products")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "products"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
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

          <button
            onClick={() => handleTabChange("orders")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "orders"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
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

          <div className="pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Navbar */}
        <div className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setMobileSidebarOpen(!mobileSidebarOpen);
                  } else {
                    setSidebarOpen(!sidebarOpen);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiMenu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {activeTab === "products" ? "Product Management" : "Order Management"}
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
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 lg:w-64"
                  />
                </div>
              )}
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm lg:hidden">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FiShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Products</p>
                  <p className="text-lg font-bold text-gray-800">{products.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <FiPackage className="w-5 h-5 text-indigo-600" />
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
          </div>

          {/* Tab Content */}
          {activeTab === "products" && (
            <div>
              <div className="mb-6">
                <ProductForm
                  form={form}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  editing={editing}
                  onCancel={resetForm}
                />
              </div>
              
              <div>
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
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              {/* Success Message */}
              {updateSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5" />
                    <span>{updateSuccess}</span>
                  </div>
                  <button
                    onClick={() => setUpdateSuccess(null)}
                    className="text-green-700 hover:text-green-900"
                  >
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
                  <button
                    onClick={() => setOrderError(null)}
                    className="text-red-700 hover:text-red-900"
                  >
                    <FiXCircle className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Order Statistics Cards */}
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

              {/* Order Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setOrderFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    orderFilter === "all"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                        orderFilter === status
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Order Details Modal */}
              {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        <FiPackage className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                      </div>
                      <button
                        onClick={() => {
                          setShowOrderDetails(false);
                          setSelectedOrder(null);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6">
                      {/* Order Information */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="col-span-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <p className="text-sm text-gray-500">Order ID</p>
                              <p className="font-semibold text-lg">#{selectedOrder._id?.slice(-8)}</p>
                            </div>
                            <div>
                              {getStatusBadge(selectedOrder.status)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FiUser className="w-3 h-3" /> Customer
                          </p>
                          <p className="font-semibold">{selectedOrder.userId?.name || selectedOrder.user?.name || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FiMail className="w-3 h-3" /> Email
                          </p>
                          <p className="font-semibold text-sm">{selectedOrder.userId?.email || selectedOrder.user?.email || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FiTag className="w-3 h-3" /> Total Amount
                          </p>
                          <p className="font-semibold text-lg text-green-600">${(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" /> Order Date
                          </p>
                          <p className="font-semibold text-sm">{new Date(selectedOrder.createdAt || selectedOrder.orderDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FiBox className="w-4 h-4" /> Order Items
                        </h4>
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

                      {/* Order Total */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-gray-800">Total</p>
                          <p className="text-2xl font-bold text-green-600">${(selectedOrder.totalAmount || 0).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Update Status */}
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
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                selectedOrder.status === status
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

              {/* Orders Table */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPackage className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Orders Found</h3>
                  <p className="text-gray-500 text-sm">
                    {orderFilter === "all" 
                      ? "There are no orders in the system yet." 
                      : `No ${orderFilter} orders found.`}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
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
                            <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                                #{orderId?.slice(-6) || "N/A"}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {customerName}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                ${orderTotal.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {orderItems.length}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {getStatusBadge(orderStatus)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                {new Date(orderDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleViewOrder(order)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="View Order Details"
                                  >
                                    <FiEye className="w-4 h-4" />
                                  </button>
                                  <select
                                    value={orderStatus}
                                    onChange={(e) =>
                                      handleOrderStatusUpdate(orderId, e.target.value)
                                    }
                                    disabled={updatingOrder === orderId}
                                    className={`border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                      updatingOrder === orderId ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {statusOptions.map((status) => (
                                      <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                  {updatingOrder === orderId && (
                                    <span className="text-xs text-blue-500 animate-pulse">Updating...</span>
                                  )}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}