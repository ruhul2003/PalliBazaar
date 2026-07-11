"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ProductType {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: {
    name: string;
    slug: string;
  };
  district: string;
  ratings: {
    average: number;
    count: number;
  };
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const categoriesList = [
    { name: "Fruits", slug: "fruits", icon: "🍎" },
    { name: "Vegetables", slug: "vegetables", icon: "🥬" },
    { name: "Dairy & Milk", slug: "dairy", icon: "🥛" },
    { name: "Handicrafts", slug: "handicrafts", icon: "🏺" },
    { name: "Seeds & Fertilizer", slug: "seeds", icon: "🌱" },
    { name: "Livestock", slug: "livestock", icon: "🐄" },
  ];

  useEffect(() => {
    fetch("/api/products?limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load featured products:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1e3a2c] to-[#3e7356] text-white overflow-hidden py-20 md:py-28 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="relative z-10 container max-w-4xl">
          <span className="text-accent font-bold uppercase tracking-wider text-sm mb-4 block">
            🌾 Fresh & Traditional
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Directly from Village Farms to Your Doorstep
          </h1>
          <p className="text-white/90 text-base md:text-lg mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Support local Bangladeshi farmers and artisans. Discover farm-fresh organic produce,
            pure dairy products, healthy livestock, and authentic handmade handicrafts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-accent text-text-earth rounded-lg font-bold hover:bg-accent-hover hover:scale-102 transition"
            >
              Explore Shop 🛒
            </Link>
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-primary transition"
            >
              Join as Farmer/Artisan 🚜
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 container">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">Browse Rural Categories</h2>
          <p className="text-text-muted text-sm md:text-base">Hand-harvested crops and hand-crafted items directly from Bangladesh</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categoriesList.map((cat) => (
            <Link
              href={`/shop?category=${cat.slug}`}
              key={cat.slug}
              className="bg-white border border-border-light rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 hover:border-primary hover:-translate-y-1 hover:shadow-sm hover:bg-primary-light flex flex-col items-center gap-3"
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className="font-bold text-sm text-text-earth">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white border-y border-border-light">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">Featured Village Harvests</h2>
            <p className="text-text-muted text-sm md:text-base">Popular farm-fresh organic food and high quality local items</p>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-bold text-primary animate-pulse">Loading featured products...</h3>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <p>No products listed yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product._id} className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm flex flex-col h-full hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="relative w-full h-[200px] bg-bg-sand overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full height-full object-cover transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-accent text-text-earth text-xs font-extrabold px-2 py-1 rounded">
                      Harvested 🌾
                    </span>
                    <span className="absolute top-3 right-3 bg-black/75 text-white text-[10px] px-2 py-1 rounded font-semibold">
                      📍 {product.district}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold tracking-wider text-secondary uppercase mb-1.5">
                      {product.category.name}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-text-earth mb-2 line-clamp-2 hover:text-primary transition-colors">
                      <Link href={`/products/${product._id}`}>{product.name}</Link>
                    </h3>
                    <div className="text-xs text-accent-hover mb-4 flex items-center gap-1">
                      ⭐ {product.ratings.average || "New"} ({product.ratings.count || 0} reviews)
                    </div>

                    <div className="flex items-center justify-between border-t border-border-light pt-4 mt-auto">
                      <div className="font-sans text-lg font-extrabold text-primary">
                        BDT {product.price}
                      </div>
                      <Link
                        href={`/products/${product._id}`}
                        className="inline-flex items-center justify-center px-4 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-md text-xs font-bold transition"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-bold transition"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-primary-light rounded-2xl p-8 md:p-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-5 leading-snug">
              Connecting Rural Farmers directly with Urban Buyers
            </h2>
            <p className="text-text-muted mb-6 leading-relaxed">
              PalliBazaar removes middlemen. This allows farmers to receive fair prices for their
              labor, and ensures urban households receive healthy, natural, and unprocessed goods
              directly from Bangladesh's fertile regions (Rajshahi, Sundarbans, Jessore, and more).
            </p>
            <ul className="space-y-3 font-semibold text-primary">
              <li className="flex items-center gap-2">🚜 100% Fair price directly to local farmers</li>
              <li className="flex items-center gap-2">🍯 Fresh, formalin-free natural organic food</li>
              <li className="flex items-center gap-2">🏺 Supporting authentic village cottage-industry artisans</li>
            </ul>
          </div>
          <div className="h-[280px] sm:h-[350px] rounded-xl overflow-hidden shadow-md">
            <img
              src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800"
              alt="Bangladeshi village farm fields"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}