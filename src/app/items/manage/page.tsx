"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Eye, Plus, Leaf, Loader2, Star, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface ProductType {
  _id: string;
  name: string;
  price: number;
  stock: number;
  district: string;
  isApproved: boolean;
  images: string[];
  category: {
    _id: string;
    name: string;
  };
}

export default function ManageItemsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSellerProducts = async () => {
    try {
      const res = await fetch("/api/dashboard/seller");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      } else {
        toast.error("Failed to load products list.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to connect to marketplace database.");
    } finally {
      setFetchingData(false);
    }
  };

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
      fetchSellerProducts();
    }
  }, [user, loading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing from PalliBazaar?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Product listing removed.");
        // filter out deleted product
        setProducts(products.filter((p) => p._id !== id));
      } else {
        toast.error(data.error || "Failed to delete product.");
      }
    } catch (err) {
      toast.error("An error occurred while deleting the product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading || (fetchingData && products.length === 0)) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex items-center justify-center bg-bg-sand">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <h2 className="text-xl font-bold text-primary">Fetching your fields...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-75px)] py-12 px-4 sm:px-6 lg:px-8 bg-bg-sand">
      <div className="max-w-[1100px] mx-auto bg-white border border-border-light rounded-2xl shadow-md p-6 sm:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-light pb-5 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary flex items-center gap-2">
              <Leaf className="w-8 h-8 text-primary" />
              <span>Manage Your Listings</span>
            </h1>
            <p className="text-text-muted text-sm mt-1">Review, add, or delete your farm-fresh products on PalliBazaar</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/items/add"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white hover:bg-primary-hover font-bold rounded-lg text-sm transition"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {products.length === 0 ? (
          <div className="text-center py-16 px-4 bg-primary-light rounded-2xl border border-primary/10">
            <Leaf className="w-14 h-14 text-secondary mx-auto mb-4 opacity-75" />
            <h3 className="font-serif text-xl font-bold text-text-earth mb-2">No Active Harvests Listed</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">
              You haven't listed any farm produce or traditional handicrafts yet. Start earning by publishing your first crop!
            </p>
            <Link
              href="/items/add"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary text-white hover:bg-primary-hover font-bold rounded-xl text-sm transition shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Your First Product
            </Link>
          </div>
        ) : (
          /* Responsive Table Wrapper */
          <div className="overflow-x-auto rounded-xl border border-border-light shadow-sm">
            <table className="w-full text-left border-collapse bg-white font-sans text-sm min-w-[700px]">
              <thead>
                <tr className="bg-primary-light text-primary font-bold text-xs uppercase tracking-wider border-b border-border-light">
                  <th className="py-4.5 px-5">Harvest</th>
                  <th className="py-4.5 px-5">Category</th>
                  <th className="py-4.5 px-5">Price (BDT)</th>
                  <th className="py-4.5 px-5">Stock</th>
                  <th className="py-4.5 px-5">Region</th>
                  <th className="py-4.5 px-5">Status</th>
                  <th className="py-4.5 px-5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-text-earth">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-bg-sand/20 transition-colors">
                    
                    {/* Harvest details */}
                    <td className="py-4.5 px-5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-bg-sand overflow-hidden border border-border-light shrink-0">
                        <Image 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                          width={48}
                          height={48}
                        />
                      </div>
                      <span className="font-bold text-text-earth line-clamp-1">{product.name}</span>
                    </td>

                    {/* Category */}
                    <td className="py-4.5 px-5 text-text-muted font-medium">
                      {product.category?.name || "Uncategorized"}
                    </td>

                    {/* Price */}
                    <td className="py-4.5 px-5 font-bold text-primary">
                      {product.price}
                    </td>

                    {/* Stock */}
                    <td className="py-4.5 px-5">
                      <span className={`font-semibold ${product.stock > 0 ? "text-text-earth" : "text-danger"}`}>
                        {product.stock} items
                      </span>
                    </td>

                    {/* District */}
                    <td className="py-4.5 px-5 text-text-muted flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#76aa7b]" />
                      <span>{product.district}</span>
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-5">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full leading-none ${
                        product.isApproved 
                          ? "bg-green-50 text-success border border-success/20" 
                          : "bg-amber-50 text-warning-hover border border-warning/20"
                      }`}>
                        {product.isApproved ? "Approved" : "Pending Approval"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-5">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/products/${product._id}`}
                          className="p-1.5 bg-primary-light text-primary hover:bg-primary hover:text-white rounded-lg transition"
                          title="View product details page"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="p-1.5 bg-danger-light text-danger hover:bg-danger hover:text-white rounded-lg transition disabled:opacity-50"
                          title="Delete Listing"
                        >
                          {deletingId === product._id ? (
                            <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-4.5 h-4.5" />
                          )}
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
    </div>
  );
}
