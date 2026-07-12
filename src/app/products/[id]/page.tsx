"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Wheat, Package, Tractor, Phone, ShoppingCart, Star, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface ProductDetailType {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  district: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
}

interface ReviewType {
  _id: string;
  rating: number;
  comment: string;
  customer: {
    name: string;
  };
  createdAt: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductDetailType | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [similarProducts, setSimilarProducts] = useState<ProductDetailType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          if (data.product.images && data.product.images.length > 0) {
            setActiveImage(data.product.images[0]);
          }
          
          // Fetch similar products
          if (data.product.category) {
            const simRes = await fetch(`/api/products?category=${data.product.category.slug}&limit=4`);
            if (simRes.ok) {
              const simData = await simRes.json();
              setSimilarProducts(
                (simData.products || []).filter((p: ProductDetailType) => p._id !== id)
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?productId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.reviews) {
            setReviews(data.reviews);
          }
        }
      } catch (e) {
        // ignore
      }
    };

    fetchProductDetails();
    fetchReviews();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role === "seller") {
      toast.error("Farmers/Sellers cannot purchase products.");
      return;
    }

    setAddingToCart(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, quantity }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Added to cart successfully! Click Cart to view.");
      } else {
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (e) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, rating, comment }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Review submitted successfully!");
        setComment("");
        // Reload reviews list
        const reviewRes = await fetch(`/api/reviews?productId=${id}`);
        const reviewData = await reviewRes.json();
        if (reviewData.reviews) {
          setReviews(reviewData.reviews);
        }
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (e) {
      toast.error("An error occurred. Make sure you purchased this product.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex items-center justify-center bg-bg-sand">
        <h2 className="text-xl font-bold text-primary animate-pulse">Gathering harvest details...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-red-600">Product not found or has been deleted.</h2>
        <Link href="/shop" className="btn btn-primary mt-4">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-12">
      {/* Back button */}
      <Link href="/shop" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors flex items-center gap-1 mb-6">
        ← Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Photo Gallery Column */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full h-[380px] bg-bg-sand rounded-xl overflow-hidden border border-border-light">
            <Image src={activeImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, index) => (
                <div
                  key={index}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                    activeImage === img ? "border-primary scale-102" : "border-transparent opacity-80"
                  }`}
                >
                  <Image width={80} height={80} src={img} alt={`thumbnail-${index}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wider text-secondary uppercase mb-2">
            {product.category?.name || "Uncategorized"}
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary mb-3 leading-snug">
            {product.name}
          </h1>

          <div className="text-2xl font-extrabold text-secondary mb-5">
            BDT {product.price}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="bg-primary-light text-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-primary shrink-0" />
              <span>Harvested: {product.district}</span>
            </span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
              product.stock > 0 ? "bg-green-50 text-success" : "bg-red-50 text-danger"
            }`}>
              <Package className="w-4 h-4 shrink-0" />
              <span>Stock: {product.stock > 0 ? `${product.stock} items remaining` : "Out of Stock"}</span>
            </span>
          </div>

          <div className="border-t border-border-light pt-5 mb-5 leading-relaxed text-text-muted">
            <h3 className="text-text-earth font-bold mb-1.5 text-sm uppercase tracking-wider">Product Description</h3>
            <p>{product.description}</p>
          </div>

          {/* Seller Information */}
          <div className="bg-primary-light rounded-xl p-4 mb-6 flex items-center gap-4 border border-primary/10">
            <div className="w-12 h-12 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xl shrink-0">
              {product.seller.name[0]}
            </div>
            <div>
              <h4 className="font-bold text-sm text-text-earth">{product.seller.name}</h4>
              <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                <Tractor className="w-3.5 h-3.5 text-primary" /> Local Farmer / Artisan
              </p>
              {product.seller.phoneNumber && (
                <p className="text-xs text-primary font-semibold mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {product.seller.phoneNumber}
                </p>
              )}
            </div>
          </div>

          {/* Action Row */}
          {product.stock > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-border-light rounded-lg bg-bg-sand overflow-hidden">
                  <button
                    onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                    className="w-10 h-10 font-bold hover:bg-white transition"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-text-earth">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity < product.stock ? quantity + 1 : product.stock)}
                    className="w-10 h-10 font-bold hover:bg-white transition"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-grow py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg hover:scale-101 active:scale-99 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={addingToCart}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{addingToCart ? "Adding to Cart..." : "Add to Cart"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews list */}
      <section className="mt-12 bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="font-serif text-2xl font-bold text-primary mb-6 border-b border-border-light pb-3 flex items-center gap-2">
          <Star className="w-6 h-6 fill-accent text-accent" />
          <span>Customer Reviews ({product.ratings.average || "New"} - {product.ratings.count} reviews)</span>
        </h3>

        {/* Review Submission Form */}
        {user && user.role === "customer" && (
          <div className="bg-primary-light rounded-xl p-5 mb-8 border border-primary/10">
            <h4 className="font-bold text-text-earth mb-3">Write a review</h4>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-muted mb-1 uppercase">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl cursor-pointer transition ${
                        star <= rating ? "text-accent" : "text-gray-300"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted mb-1.5 uppercase" htmlFor="comment">
                  Review Comment
                </label>
                <textarea
                  id="comment"
                  className="w-full p-3 rounded-lg border border-border-light bg-white outline-none text-sm focus:border-primary"
                  placeholder="Share your experience with this fresh village product..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold cursor-pointer transition"
                disabled={submittingReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <p className="text-text-muted text-sm py-4">No reviews yet for this product. Be the first to share your thoughts!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="border-b border-border-light last:border-b-0 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm text-text-earth">{rev.customer.name}</span>
                  <span className="text-xs text-text-muted">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-accent text-sm mb-1.5 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating ? "fill-accent text-accent" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <section className="mt-12">
          <h3 className="font-serif text-2xl font-bold text-primary mb-6">Similar Products You May Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <div key={p._id} className="bg-white border border-border-light rounded-xl overflow-hidden shadow-sm flex flex-col hover:shadow-md hover:-translate-y-1 transition duration-300">
                <div className="w-full h-44 bg-bg-sand overflow-hidden relative">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-accent" /> {p.district}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h4 className="font-serif text-sm font-bold text-text-earth mb-2 line-clamp-2">
                    <Link href={`/products/${p._id}`}>{p.name}</Link>
                  </h4>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="text-primary font-bold text-sm">BDT {p.price}</div>
                    <Link href={`/products/${p._id}`} className="text-xs text-secondary font-bold hover:underline">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
