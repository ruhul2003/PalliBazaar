"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Leaf, ArrowLeft, Upload, Loader2, DollarSign, Package, MapPin } from "lucide-react";
import toast from "react-hot-toast";

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

export default function EditItemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { id } = useParams() as { id: string };

  // Data Loading
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [fetchingData, setFetchingData] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("Jessore");
  const [imagesUrl, setImagesUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const districts = ["Jessore", "Rajshahi", "Sundarbans", "Khulna", "Mymensingh", "Kushtia", "Dhaka"];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        // Load categories
        const catRes = await fetch("/api/categories");
        let loadedCategories: CategoryType[] = [];
        if (catRes.ok) {
          const catData = await catRes.json();
          loadedCategories = catData.categories || [];
          setCategories(loadedCategories);
        }

        // Load existing product details
        const prodRes = await fetch(`/api/products/${id}`);
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          const p = prodData.product;

          // Double check authorization
          if (user && user.role !== "admin" && p.seller._id !== user.id) {
            toast.error("You are not authorized to edit this listing.");
            router.push("/items/manage");
            return;
          }

          setName(p.name);
          setShortDesc(p.shortDescription || "");
          setDescription(p.description);
          setPrice(p.price.toString());
          setStock(p.stock.toString());
          setCategory(p.category?._id || (loadedCategories.length > 0 ? loadedCategories[0]._id : ""));
          setDistrict(p.district);
          setImagesUrl(p.images ? p.images.join(", ") : "");
        } else {
          toast.error("Product listing not found.");
          router.push("/items/manage");
        }
      } catch (e) {
        console.error("Failed to load product edit configurations:", e);
        toast.error("Error loading product listing.");
      } finally {
        setFetchingData(false);
      }
    };

    if (user) {
      fetchSetupData();
    }
  }, [id, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name || !description || !price || !stock || !category || !district) {
      setFormError("All required fields must be filled out.");
      toast.error("Please fill all required fields.");
      return;
    }

    setSubmitting(true);

    const imagesArray = imagesUrl
      ? imagesUrl.split(",").map((url) => url.trim())
      : ["https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600"]; // default fallback harvest image

    const payload = {
      name,
      shortDescription: shortDesc,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      district,
      images: imagesArray,
    };

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Harvest listing updated successfully!");
        router.push("/items/manage");
      } else {
        const msg = data.error || "Failed to update product";
        setFormError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setFormError("An error occurred while updating the product.");
      toast.error("Failed to update product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetchingData) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex items-center justify-center bg-bg-sand">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <h2 className="text-xl font-bold text-primary">Gathering details...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-75px)] py-12 px-4 bg-bg-sand">
      <div className="max-w-[750px] mx-auto bg-white border border-border-light rounded-2xl shadow-md p-8 sm:p-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light pb-5 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary flex items-center gap-2">
              <Leaf className="w-8 h-8 text-primary" />
              <span>Edit Listing</span>
            </h1>
            <p className="text-text-muted text-sm mt-1">Make adjustments to your rural harvest marketplace listing</p>
          </div>
          <button 
            type="button"
            onClick={() => router.back()} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        {formError && (
          <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg p-3.5 mb-6 font-semibold text-center">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 font-sans">
          
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="title">
                Product Title *
              </label>
              <input
                type="text"
                id="title"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
                placeholder="e.g., Pure Mustard Oil"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="category">
                Category *
              </label>
              <select
                id="category"
                required
                className="w-full px-4 py-2.5 bg-white rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm font-semibold text-text-earth"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="shortDesc">
              Short Description (Card Summary) *
            </label>
            <input
              type="text"
              id="shortDesc"
              required
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
              placeholder="Provide a brief 1-line hook for the listing card..."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="description">
              Full Description / Story *
            </label>
            <textarea
              id="description"
              required
              rows={5}
              className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
              placeholder="Describe how the harvest was grown..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Row 2: Price, Stock & District */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="price">
                Price (BDT) *
              </label>
              <div className="relative flex items-center">
                <DollarSign className="w-4 h-4 text-text-muted absolute left-3" />
                <input
                  type="number"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="stock">
                Stock Count *
              </label>
              <div className="relative flex items-center">
                <Package className="w-4 h-4 text-text-muted absolute left-3" />
                <input
                  type="number"
                  id="stock"
                  required
                  min="0"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
                  placeholder="Stock"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="district">
                Source Region *
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-4 h-4 text-text-muted absolute left-3" />
                <select
                  id="district"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-white rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm font-semibold text-text-earth"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  {districts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Image URLs */}
          <div>
            <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="images">
              Image URL
            </label>
            <div className="relative flex items-center">
              <Upload className="w-4 h-4 text-text-muted absolute left-3" />
              <input
                type="text"
                id="images"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
                placeholder="Comma separated URLs"
                value={imagesUrl}
                onChange={(e) => setImagesUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Submit area */}
          <div className="pt-4 border-t border-border-light flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-grow py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Listing...</span>
                </>
              ) : (
                <span>Update Listing</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/items/manage")}
              className="px-6 py-3 border border-border-light text-text-muted font-bold rounded-lg hover:bg-bg-sand transition active:scale-95 text-sm"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
