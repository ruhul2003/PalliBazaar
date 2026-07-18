"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Leaf, ArrowLeft, Upload, Loader2, DollarSign, Package, MapPin, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface CategoryType {
  _id: string;
  name: string;
  slug: string;
}

export default function AddItemPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);

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

  // AI Content Generator states
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [aiTemplate, setAiTemplate] = useState("organic");
  const [aiLength, setAiLength] = useState("medium");
  const [suggestedPriceRange, setSuggestedPriceRange] = useState("");

  const districts = ["Jessore", "Rajshahi", "Sundarbans", "Khulna", "Mymensingh", "Kushtia", "Dhaka"];

  const handleGenerateAI = async () => {
    if (!name) {
      toast.error("Please enter a product name first to let AI generate description.");
      return;
    }
    setGeneratingAI(true);
    try {
      const selectedCat = categories.find(c => c._id === category);
      const res = await fetch("/api/ai/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryName: selectedCat ? selectedCat.name : "",
          district,
          notes: aiNotes,
          template: aiTemplate,
          length: aiLength
        })
      });

      if (!res.ok) throw new Error("Failed to generate content.");

      const data = await res.json();
      if (data.description) setDescription(data.description);
      if (data.shortDescription) setShortDesc(data.shortDescription);
      if (data.suggestedPriceRange) setSuggestedPriceRange(data.suggestedPriceRange);
      if (data.tags && Array.isArray(data.tags)) {
        const tagsString = "\n\nTags: " + data.tags.map((t: string) => `#${t}`).join(" ");
        setDescription(data.description + tagsString);
      }
      toast.success("AI description generated successfully!");
    } catch (e) {
      console.error(e);
      toast.error("AI Generation failed. Using fallback copy.");
      setDescription(`This premium ${name} is sourced directly from the local fields of ${district}. Cultivated with care using traditional methods, it offers exceptional quality and natural goodness.`);
      setShortDesc(`Fresh, high-quality ${name} direct from village producers.`);
    } finally {
      setGeneratingAI(false);
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
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
          if (data.categories && data.categories.length > 0) {
            setCategory(data.categories[0]._id);
          }
        }
      } catch (e) {
        console.error("Failed to load categories:", e);
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

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
      : ["https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600"];

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
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Listing published successfully!");
        router.push("/items/manage");
      } else {
        const msg = data.error || "Failed to save product";
        setFormError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setFormError("An error occurred while saving the product.");
      toast.error("Failed to list product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || fetchingCategories) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex items-center justify-center bg-bg-sand">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <h2 className="text-xl font-bold text-primary">Loading setup...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-75px)] py-12 px-4 bg-bg-sand">
      <div className="max-w-[1100px] mx-auto bg-white border border-border-light rounded-2xl shadow-md p-8 sm:p-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light pb-5 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-primary flex items-center gap-2">
              <Leaf className="w-8 h-8 text-primary" />
              <span>List New Harvest</span>
            </h1>
            <p className="text-text-muted text-sm mt-1">Upload fresh organic products directly to the village marketplace</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Form Fields */}
          <form onSubmit={handleSubmit} className="space-y-6 font-sans">
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
                  placeholder="e.g., Pure Mustard Oil (খাঁটি সরিষার তেল)"
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

            <div>
              <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="description">
                Full Description / Story *
              </label>
              <textarea
                id="description"
                required
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
                placeholder="Describe how the harvest was grown, pesticide-free details, and other attributes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

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
                    placeholder="e.g., 250"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="stock">
                  Stock Volume *
                </label>
                <div className="relative flex items-center">
                  <Package className="w-4 h-4 text-text-muted absolute left-3" />
                  <input
                    type="number"
                    id="stock"
                    required
                    min="0"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
                    placeholder="e.g., 100"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="district">
                  District of Origin *
                </label>
                <div className="relative flex items-center">
                  <MapPin className="w-4 h-4 text-text-muted absolute left-3" />
                  <select
                    id="district"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-white rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm font-semibold text-text-earth cursor-pointer"
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

            <div>
              <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="imageUrl">
                Product Image URL
              </label>
              <div className="relative flex items-center">
                <Upload className="w-4 h-4 text-text-muted absolute left-3" />
                <input
                  type="text"
                  id="imageUrl"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light text-sm"
                  placeholder="e.g., https://images.unsplash.com/... (leave blank for placeholder)"
                  value={imagesUrl}
                  onChange={(e) => setImagesUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border-light flex items-center justify-end gap-3.5">
              <button
                type="button"
                className="px-5 py-2.5 border border-border-light text-text-muted hover:bg-bg-sand/30 font-bold rounded-lg text-sm transition"
                onClick={() => router.push("/items/manage")}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg text-sm transition"
                disabled={submitting}
              >
                {submitting ? "Listing Product..." : "List Product"}
              </button>
            </div>
          </form>

          {/* AI Content Assistant Panel */}
          <aside className="bg-bg-sand/20 border border-border-light rounded-xl p-5 h-fit self-start space-y-4">
            <h3 className="text-sm font-serif font-bold text-primary border-b border-border-light pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" /> AI Copywriter Assistant
            </h3>
            <p className="text-[11px] text-text-muted leading-relaxed">
              Fill in the Product Title, then customize parameters to generate high-quality copywriting hooks and description templates.
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-earth uppercase">Prompt Template</label>
              <select
                className="w-full px-3 py-1.5 border border-border-light rounded-lg text-xs bg-white focus:border-primary outline-none cursor-pointer"
                value={aiTemplate}
                onChange={(e) => setAiTemplate(e.target.value)}
              >
                <option value="organic">Organic & Healthy Focus</option>
                <option value="heritage">Traditional Heritage Focus</option>
                <option value="marketing">Premium Marketing Hook</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-earth uppercase">Output Length</label>
              <select
                className="w-full px-3 py-1.5 border border-border-light rounded-lg text-xs bg-white focus:border-primary outline-none cursor-pointer"
                value={aiLength}
                onChange={(e) => setAiLength(e.target.value)}
              >
                <option value="short">Short (30-50 words)</option>
                <option value="medium">Medium (80-120 words)</option>
                <option value="long">Long (180-250 words)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-text-earth uppercase">Custom Bullets / Notes</label>
              <textarea
                rows={3}
                className="w-full p-2 border border-border-light rounded-lg text-xs focus:border-primary bg-white outline-none"
                placeholder="e.g. freshly pressed, hand-carved, no sugar added..."
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              onClick={handleGenerateAI}
              disabled={generatingAI}
            >
              {generatingAI ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  {description ? "Regenerate Copy" : "Generate Copy"}
                </>
              )}
            </button>

            {suggestedPriceRange && (
              <div className="bg-primary-light border border-primary/10 rounded-lg p-3 text-[10px] text-primary mt-2">
                <span className="font-bold uppercase tracking-wider block text-[8px] mb-1">AI Market Pricing Advice</span>
                {suggestedPriceRange}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
