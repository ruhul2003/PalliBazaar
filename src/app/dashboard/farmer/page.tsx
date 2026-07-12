"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, BarChart3, Wheat, Tractor, Star, AlertTriangle, X, Plus } from "lucide-react";
import toast from "react-hot-toast";

interface ProductType {
  _id: string;
  name: string;
  price: number;
  stock: number;
  district: string;
  isApproved: boolean;
  category: {
    _id: string;
    name: string;
  };
}

interface OrderItemType {
  orderId: string;
  customerName: string;
  revenue: number;
  itemsCount: number;
  createdAt: string;
  orderStatus: string;
  paymentStatus: string;
}

export default function FarmerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "orders" | "reviews" | "admin">("overview");

  // Dashboard Data State
  const [analytics, setAnalytics] = useState<any>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<OrderItemType[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  // Admin Data State
  const [adminStats, setAdminStats] = useState<any>(null);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);

  // Modal Control State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editProductId, setEditProductId] = useState("");
  
  // Product Form State
  const [prodName, setProdName] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodDistrict, setProdDistrict] = useState("Jessore");
  const [prodImages, setProdImages] = useState("");
  const [formError, setFormError] = useState("");

  const districts = ["Jessore", "Rajshahi", "Sundarbans", "Khulna", "Mymensingh", "Kushtia", "Dhaka"];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user && user.role === "customer") {
      router.push("/dashboard/buyer");
      return;
    }

    if (user) {
      fetchCategories();
      fetchSellerData();
      if (user.role === "admin") {
        setActiveTab("admin");
        fetchAdminData();
      }
    }
  }, [user, loading, router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSellerData = async () => {
    try {
      const res = await fetch("/api/dashboard/seller");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
        setProducts(data.products || []);
        setPendingOrders(data.pendingOrders || []);
        setRecentSales(data.recentSales || []);
        setReviews(data.recentReviews || []);
      }
    } catch (e) {
      console.error("Seller dashboard fetch error:", e);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch("/api/dashboard/admin");
      if (res.ok) {
        const data = await res.json();
        setAdminStats(data.analytics);
        setPendingProducts(data.pendingProducts || []);
        setAllUsers(data.recentUsers || []);
        setAllOrders(data.recentOrders || []);
      }
    } catch (e) {
      console.error("Admin dashboard fetch error:", e);
    }
  };

  // Create or Update Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const imagesArray = prodImages
      ? prodImages.split(",").map((url) => url.trim())
      : ["https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600"]; // fallback image

    const payload = {
      name: prodName,
      description: prodDesc,
      price: prodPrice,
      stock: prodStock,
      category: prodCategory || (categories.length > 0 ? categories[0]._id : ""),
      district: prodDistrict,
      images: imagesArray,
    };

    try {
      const url = modalMode === "add" ? "/api/products" : `/api/products/${editProductId}`;
      const method = modalMode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Product saved successfully!");
        setShowModal(false);
        fetchSellerData();
        if (user?.role === "admin") {
          fetchAdminData();
        }
      } else {
        const msg = data.error || "Failed to save product";
        setFormError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setFormError("An error occurred while saving the product.");
      toast.error("An error occurred while saving the product.");
    }
  };

  const handleEditProductOpen = (prod: ProductType) => {
    setModalMode("edit");
    setEditProductId(prod._id);
    setProdName(prod.name);
    setProdDesc(""); // retrieve description separately or omit for quick edit
    setProdPrice(prod.price.toString());
    setProdStock(prod.stock.toString());
    setProdCategory(prod.category._id);
    setProdDistrict(prod.district);
    setProdImages("");
    setFormError("");
    setShowModal(true);
  };

  const handleAddProductOpen = () => {
    setModalMode("add");
    setProdName("");
    setProdDesc("");
    setProdPrice("");
    setProdStock("");
    setProdCategory(categories.length > 0 ? categories[0]._id : "");
    setProdDistrict("Jessore");
    setProdImages("");
    setFormError("");
    setShowModal(true);
  };

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${prodId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Listing deleted successfully!");
        fetchSellerData();
        if (user?.role === "admin") {
          fetchAdminData();
        }
      } else {
        toast.error("Failed to delete listing.");
      }
    } catch (e) {
      toast.error("Failed to delete listing.");
    }
  };

  // Manage Order statuses (ship/deliver orders)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        toast.success("Order status updated successfully!");
        fetchSellerData();
        if (user?.role === "admin") {
          fetchAdminData();
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update order status");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  // Admin approvals
  const handleApproveProduct = async (prodId: string) => {
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });
      if (res.ok) {
        toast.success("Product approved successfully!");
        fetchAdminData();
        fetchSellerData();
      } else {
        toast.error("Failed to approve product.");
      }
    } catch (e) {
      toast.error("Failed to approve product");
    }
  };

  // Admin user ban toggles
  const handleToggleUserBan = async (userId: string, isCurrentlyBanned: boolean) => {
    try {
      const res = await fetch(`/api/dashboard/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanned: !isCurrentlyBanned }),
      });
      if (res.ok) {
        toast.success(isCurrentlyBanned ? "User unbanned successfully!" : "User banned successfully!");
        fetchAdminData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update user status");
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  if (loading || fetchingData) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex items-center justify-center bg-bg-sand">
        <h2 className="text-xl font-bold text-primary animate-pulse">Loading farmer dashboard...</h2>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container py-8 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        
        {/* Sidebar Nav */}
        <aside className="bg-white border border-border-light rounded-2xl p-6 h-fit shadow-sm">
          <div className="text-center mb-8 border-b border-border-light pb-5">
            <div className="w-16 h-16 rounded-full bg-primary text-white font-bold flex items-center justify-center text-2xl mx-auto mb-3">
              {user.name[0]}
            </div>
            <h3 className="font-serif text-lg font-bold text-text-earth">{user.name}</h3>
            <span className="text-[10px] font-bold text-secondary bg-secondary-light px-2 py-0.5 rounded-full inline-block mt-1 uppercase">
              {user.role === "admin" ? "Platform Administrator" : "Farmer / Seller"}
            </span>
          </div>

          <ul className="flex flex-col gap-1.5 list-none">
            {user.role === "admin" && (
              <li>
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`w-full text-left bg-transparent border-0 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2 ${
                    activeTab === "admin" ? "bg-primary text-white" : "text-text-muted hover:bg-bg-sand hover:text-primary"
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left bg-transparent border-0 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2 ${
                  activeTab === "overview" ? "bg-primary text-white" : "text-text-muted hover:bg-bg-sand hover:text-primary"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard Metrics</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("listings")}
                className={`w-full text-left bg-transparent border-0 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2 ${
                  activeTab === "listings" ? "bg-primary text-white" : "text-text-muted hover:bg-bg-sand hover:text-primary"
                }`}
              >
                <Wheat className="w-4 h-4" />
                <span>My Listings</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full text-left bg-transparent border-0 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2 ${
                  activeTab === "orders" ? "bg-primary text-white" : "text-text-muted hover:bg-bg-sand hover:text-primary"
                }`}
              >
                <Tractor className="w-4 h-4" />
                <span>Orders Received</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`w-full text-left bg-transparent border-0 px-4 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2 ${
                  activeTab === "reviews" ? "bg-primary text-white" : "text-text-muted hover:bg-bg-sand hover:text-primary"
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Market Feedback</span>
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Panel Content */}
        <section className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm min-h-[500px]">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && analytics && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary mb-6 border-b border-border-light pb-2">
                Sales Overview
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-bg-sand border border-border-light rounded-xl p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Revenue</span>
                  <span className="text-xl font-extrabold text-primary">BDT {analytics.revenue}</span>
                </div>
                <div className="bg-bg-sand border border-border-light rounded-xl p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Items Sold</span>
                  <span className="text-xl font-extrabold text-primary">{analytics.totalItemsSold} units</span>
                </div>
                <div className="bg-bg-sand border border-border-light rounded-xl p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Products</span>
                  <span className="text-xl font-extrabold text-primary">{analytics.totalProductsListed} active</span>
                </div>
                <div className="bg-bg-sand border border-border-light rounded-xl p-5 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Avg Rating</span>
                  <span className="text-xl font-extrabold text-primary flex items-center gap-1">
                    <Star className="w-4 h-4 text-accent fill-accent shrink-0" />
                    <span>{analytics.averageRating || "New"}</span>
                  </span>
                </div>
              </div>

              {/* Pending / Recent section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-text-earth mb-3 border-b border-border-light pb-1 text-sm uppercase tracking-wider">
                    Recent Orders pending Shipment
                  </h4>
                  {pendingOrders.length === 0 ? (
                    <p className="text-xs text-text-muted py-4">No pending orders. Good job!</p>
                  ) : (
                    <ul className="space-y-3 list-none">
                      {pendingOrders.map((o) => (
                        <li key={o.orderId} className="bg-primary-light/50 border border-primary/10 rounded-lg p-3 text-xs">
                          <div className="flex justify-between items-center font-bold mb-1.5 text-text-earth">
                            <span>ID: {o.orderId.substring(12)}...</span>
                            <span className="text-secondary">BDT {o.totalAmount}</span>
                          </div>
                          <p className="text-[10px] text-text-muted">Buyer: {o.customerName}</p>
                          <p className="text-[10px] text-text-muted">Date: {new Date(o.createdAt).toLocaleDateString()}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-text-earth mb-3 border-b border-border-light pb-1 text-sm uppercase tracking-wider">
                    Recent Sales Activity
                  </h4>
                  {recentSales.length === 0 ? (
                    <p className="text-xs text-text-muted py-4">No recent activity logs.</p>
                  ) : (
                    <ul className="space-y-3 list-none">
                      {recentSales.map((s) => (
                        <li key={s.orderId} className="bg-bg-sand/60 border border-border-light rounded-lg p-3 text-xs">
                          <div className="flex justify-between items-center font-bold mb-1 text-text-earth">
                            <span>Order #{s.orderId.substring(12)}...</span>
                            <span className="text-success">+ BDT {s.revenue}</span>
                          </div>
                          <p className="text-[10px] text-text-muted">Quantity: {s.itemsCount} items</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[9px] text-text-muted">{new Date(s.createdAt).toLocaleDateString()}</span>
                            <span className="text-[9px] uppercase font-bold text-primary">{s.orderStatus}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LISTINGS TAB */}
          {activeTab === "listings" && (
            <div>
              <div className="flex justify-between items-center mb-6 border-b border-border-light pb-2">
                <h3 className="font-serif text-2xl font-bold text-primary">My Village Products</h3>
                <button
                  onClick={handleAddProductOpen}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Product</span>
                </button>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 text-text-muted flex flex-col items-center">
                  <Wheat className="w-8 h-8 opacity-40 mb-2 text-text-muted" />
                  <p className="text-sm">You haven't listed any products yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-primary-light text-primary border-b border-border-light">
                        <th className="p-3 text-left font-bold text-xs">Product Name</th>
                        <th className="p-3 text-left font-bold text-xs">Category</th>
                        <th className="p-3 text-left font-bold text-xs">Price</th>
                        <th className="p-3 text-left font-bold text-xs">Stock</th>
                        <th className="p-3 text-left font-bold text-xs">Status</th>
                        <th className="p-3 text-left font-bold text-xs">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {products.map((prod) => (
                        <tr key={prod._id} className="hover:bg-bg-sand/20 transition text-xs font-semibold text-text-muted">
                          <td className="p-3 text-text-earth">{prod.name}</td>
                          <td className="p-3 uppercase tracking-wider text-[10px]">{prod.category?.name || "General"}</td>
                          <td className="p-3 text-text-earth">BDT {prod.price}</td>
                          <td className="p-3">{prod.stock} units</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              prod.isApproved ? "bg-green-50 text-success" : "bg-orange-50 text-warning"
                            }`}>
                              {prod.isApproved ? "Approved" : "Pending Approval"}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditProductOpen(prod)}
                                className="px-2 py-1 bg-transparent border border-primary text-primary hover:bg-primary hover:text-white rounded text-[10px] font-bold cursor-pointer transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod._id)}
                                className="px-2 py-1 bg-transparent border border-danger text-danger hover:bg-danger hover:text-white rounded text-[10px] font-bold cursor-pointer transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === "orders" && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary mb-6 border-b border-border-light pb-2">
                Orders Received & Status Updates
              </h3>

              {recentSales.length === 0 ? (
                <p className="text-text-muted text-center py-10 text-sm">No orders received for your items yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-primary-light text-primary border-b border-border-light">
                        <th className="p-3 text-left font-bold text-xs">Order ID</th>
                        <th className="p-3 text-left font-bold text-xs">Customer</th>
                        <th className="p-3 text-left font-bold text-xs">Earnings</th>
                        <th className="p-3 text-left font-bold text-xs">Status</th>
                        <th className="p-3 text-left font-bold text-xs">Date</th>
                        <th className="p-3 text-left font-bold text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                      {recentSales.map((sale) => (
                        <tr key={sale.orderId} className="hover:bg-bg-sand/20 transition text-xs font-semibold text-text-muted">
                          <td className="p-3 font-mono text-[10px] text-text-earth">{sale.orderId.substring(12)}...</td>
                          <td className="p-3 text-text-earth">{sale.customerName}</td>
                          <td className="p-3 text-text-earth">BDT {sale.revenue}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              sale.orderStatus === "delivered"
                                ? "bg-green-50 text-success"
                                : sale.orderStatus === "cancelled"
                                ? "bg-red-50 text-danger"
                                : "bg-orange-50 text-warning"
                            }`}>
                              {sale.orderStatus}
                            </span>
                          </td>
                          <td className="p-3">{new Date(sale.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            {sale.orderStatus !== "cancelled" && sale.orderStatus !== "delivered" ? (
                              <select
                                className="p-1 border border-border-light rounded bg-white text-[10px] font-bold outline-none"
                                value={sale.orderStatus}
                                onChange={(e) => handleUpdateOrderStatus(sale.orderId, e.target.value)}
                              >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            ) : (
                              <span className="text-[10px] text-text-muted uppercase">Locked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === "reviews" && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary mb-6 border-b border-border-light pb-2">
                Customer Feedback
              </h3>

              {reviews.length === 0 ? (
                <p className="text-text-muted text-center py-10 text-sm">No feedback reviews written yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="border border-border-light rounded-xl p-4 bg-bg-sand/35">
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="font-bold text-text-earth">{rev.customer.name}</span>
                        <span className="text-text-muted">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-accent mb-2 flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />
                        ))}
                      </div>
                      <p className="text-xs text-text-earth italic font-medium">Product: {rev.product.name}</p>
                      <p className="text-xs text-text-muted leading-relaxed mt-1">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PLATFORM ADMIN TAB */}
          {activeTab === "admin" && user.role === "admin" && adminStats && (
            <div>
              <h3 className="font-serif text-2xl font-bold text-primary mb-6 border-b border-border-light pb-2">
                Platform Admin Settings
              </h3>

              {/* Admin KPI Matrix */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-bg-sand border border-border-light rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Total Sales</span>
                  <span className="text-lg font-extrabold text-primary">BDT {adminStats.orders.totalRevenue}</span>
                </div>
                <div className="bg-bg-sand border border-border-light rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sellers / Farmers</span>
                  <span className="text-lg font-extrabold text-primary">{adminStats.users.sellers} farmers</span>
                </div>
                <div className="bg-bg-sand border border-border-light rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Pending Approvals</span>
                  <span className="text-lg font-extrabold text-secondary">{adminStats.products.pending} items</span>
                </div>
                <div className="bg-bg-sand border border-border-light rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Banned accounts</span>
                  <span className="text-lg font-extrabold text-danger">{adminStats.users.banned} users</span>
                </div>
              </div>

              {/* Admin actions splits */}
              <div className="space-y-8">
                {/* 1. Approvals panel */}
                <div>
                  <h4 className="font-bold text-text-earth mb-3 border-b border-border-light pb-1 text-sm uppercase tracking-wider">
                    Crop / Craft Listings awaiting Approval
                  </h4>
                  {pendingProducts.length === 0 ? (
                    <p className="text-xs text-text-muted py-4">No products awaiting validation approval.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-primary-light text-primary border-b border-border-light">
                            <th className="p-3 text-left font-bold text-xs">Product Name</th>
                            <th className="p-3 text-left font-bold text-xs">Seller</th>
                            <th className="p-3 text-left font-bold text-xs">Price</th>
                            <th className="p-3 text-left font-bold text-xs">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                          {pendingProducts.map((p) => (
                            <tr key={p._id} className="text-xs font-semibold text-text-muted">
                              <td className="p-3 text-text-earth">{p.name}</td>
                              <td className="p-3">{p.seller.name} ({p.seller.email})</td>
                              <td className="p-3">BDT {p.price}</td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleApproveProduct(p._id)}
                                  className="px-3 py-1 bg-primary text-white hover:bg-primary-hover rounded text-[10px] font-bold cursor-pointer transition"
                                >
                                  Approve & List
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. User management panel */}
                <div>
                  <h4 className="font-bold text-text-earth mb-3 border-b border-border-light pb-1 text-sm uppercase tracking-wider">
                    Marketplace User Accounts
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-primary-light text-primary border-b border-border-light">
                          <th className="p-3 text-left font-bold text-xs">User Name</th>
                          <th className="p-3 text-left font-bold text-xs">Email</th>
                          <th className="p-3 text-left font-bold text-xs">Role</th>
                          <th className="p-3 text-left font-bold text-xs">Banned</th>
                          <th className="p-3 text-left font-bold text-xs">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light">
                        {allUsers.map((usr) => (
                          <tr key={usr._id} className="text-xs font-semibold text-text-muted">
                            <td className="p-3 text-text-earth">{usr.name}</td>
                            <td className="p-3">{usr.email}</td>
                            <td className="p-3 capitalize">{usr.role}</td>
                            <td className="p-3">
                              {usr.isBanned ? (
                                <span className="flex items-center gap-1 text-danger">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Yes</span>
                                </span>
                              ) : (
                                "No"
                              )}
                            </td>
                            <td className="p-3">
                              {usr._id !== user.id ? (
                                <button
                                  onClick={() => handleToggleUserBan(usr._id, usr.isBanned)}
                                  className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition ${
                                    usr.isBanned
                                      ? "bg-primary text-white hover:bg-primary-hover"
                                      : "bg-transparent border border-danger text-danger hover:bg-danger hover:text-white"
                                  }`}
                                >
                                  {usr.isBanned ? "Unban User" : "Ban User"}
                                </button>
                              ) : (
                                <span className="text-[10px] text-text-muted uppercase">Admin Self</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Modal for adding/editing product */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-1000 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-[580px] max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center border-b border-border-light pb-3 mb-5">
              <h3 className="font-serif text-xl font-bold text-primary">
                {modalMode === "add" ? "List New Village Product" : "Edit Listed Product"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-text-muted bg-transparent border-0 cursor-pointer p-1.5 hover:bg-bg-sand rounded-lg transition-colors flex items-center justify-center">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && <div className="bg-red-50 text-danger text-xs font-bold rounded p-3 mb-4">{formError}</div>}

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-earth mb-1 uppercase" htmlFor="pname">Product Title</label>
                <input
                  type="text"
                  id="pname"
                  className="w-full p-2.5 rounded border border-border-light outline-none text-xs focus:border-primary"
                  placeholder="e.g., Organic Red Rice"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-earth mb-1 uppercase" htmlFor="pdesc">Description</label>
                <textarea
                  id="pdesc"
                  className="w-full p-2.5 rounded border border-border-light outline-none text-xs focus:border-primary"
                  placeholder="Details about harvesting, quality, formatting..."
                  rows={4}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-earth mb-1 uppercase" htmlFor="pprice">Price (BDT)</label>
                  <input
                    type="number"
                    id="pprice"
                    className="w-full p-2.5 rounded border border-border-light outline-none text-xs focus:border-primary"
                    placeholder="e.g., 180"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-earth mb-1 uppercase" htmlFor="pstock">Stock Quantity</label>
                  <input
                    type="number"
                    id="pstock"
                    className="w-full p-2.5 rounded border border-border-light outline-none text-xs focus:border-primary"
                    placeholder="e.g., 50"
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-earth mb-1 uppercase" htmlFor="pcat">Category</label>
                  <select
                    id="pcat"
                    className="w-full p-2.5 rounded border border-border-light bg-white outline-none text-xs focus:border-primary"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-earth mb-1 uppercase" htmlFor="pdist">Harvest Location</label>
                  <select
                    id="pdist"
                    className="w-full p-2.5 rounded border border-border-light bg-white outline-none text-xs focus:border-primary"
                    value={prodDistrict}
                    onChange={(e) => setProdDistrict(e.target.value)}
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-earth mb-1 uppercase" htmlFor="pimgs">
                  Image URLs (Comma separated, optional)
                </label>
                <input
                  type="text"
                  id="pimgs"
                  className="w-full p-2.5 rounded border border-border-light outline-none text-xs focus:border-primary"
                  placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                  value={prodImages}
                  onChange={(e) => setProdImages(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-border-light text-text-muted hover:bg-bg-sand rounded-lg text-xs font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5"
                >
                  <Wheat className="w-4 h-4 shrink-0" />
                  <span>Save Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
