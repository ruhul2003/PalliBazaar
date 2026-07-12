"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Framer Motion Animation Variants
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
} as const;

const heroItemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
} as const;

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 14 },
  },
} as const;

const infoTextVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 80, damping: 15 },
  },
} as const;

const infoImageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 80, damping: 15, delay: 0.2 },
  },
} as const;

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
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroContainerVariants}
          className="relative z-10 container max-w-4xl"
        >
          <motion.span variants={heroItemVariants} className="text-accent font-bold uppercase tracking-wider text-sm mb-4 block">
            🌾 Fresh & Traditional
          </motion.span>
          <motion.h1 variants={heroItemVariants} className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Directly from Village Farms to Your Doorstep
          </motion.h1>
          <motion.p variants={heroItemVariants} className="text-white/90 text-base md:text-lg mb-8 max-w-2xl mx-auto font-light leading-relaxed">
            Support local Bangladeshi farmers and artisans. Discover farm-fresh organic produce,
            pure dairy products, healthy livestock, and authentic handmade handicrafts.
          </motion.p>
          <motion.div variants={heroItemVariants} className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-accent text-text-earth rounded-lg font-bold hover:bg-accent-hover transition"
              >
                Explore Shop 🛒
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg font-bold hover:bg-white hover:text-primary transition"
              >
                Join as Farmer/Artisan 🚜
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">Browse Rural Categories</h2>
          <p className="text-text-muted text-sm md:text-base">Hand-harvested crops and hand-crafted items directly from Bangladesh</p>
        </motion.div>

        <motion.div 
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {categoriesList.map((cat) => (
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.98 }}
              key={cat.slug}
              className="bg-white border border-border-light rounded-2xl cursor-pointer"
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="p-6 text-center flex flex-col items-center gap-3 w-full h-full"
              >
                <span className="text-4xl">{cat.icon}</span>
                <span className="font-bold text-sm text-text-earth">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white border-y border-border-light">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">Featured Village Harvests</h2>
            <p className="text-text-muted text-sm md:text-base">Popular farm-fresh organic food and high quality local items</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-bold text-primary animate-pulse">Loading featured products...</h3>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <p>No products listed yet. Check back soon!</p>
            </div>
          ) : (
            <motion.div 
              variants={gridVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {products.map((product) => (
                <motion.div 
                  variants={cardVariants}
                  whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)" }}
                  key={product._id} 
                  className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm flex flex-col h-full transition-all duration-300"
                >
                  <div className="relative w-full h-[200px] bg-bg-sand overflow-hidden group">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
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
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                          href={`/products/${product._id}`}
                          className="inline-flex items-center justify-center px-4 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-md text-xs font-bold transition"
                        >
                          View Details
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mt-12"
          >
            <motion.div className="inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-2.5 border-2 border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-bold transition"
              >
                View All Products
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-primary-light rounded-2xl p-8 md:p-12 overflow-hidden">
          <motion.div
            variants={infoTextVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-5 leading-snug">
              Connecting Rural Farmers directly with Urban Buyers
            </h2>
            <p className="text-text-muted mb-6 leading-relaxed">
              PalliBazaar removes middlemen. This allows farmers to receive fair prices for their
              labor, and ensures urban households receive healthy, natural, and unprocessed goods
              directly from Bangladesh's fertile regions (Rajshahi, Sundarbans, Jessore, and more).
            </p>
            <ul className="space-y-3 font-semibold text-primary">
              <motion.li whileHover={{ x: 6 }} className="flex items-center gap-2 cursor-default transition-all duration-200">🚜 100% Fair price directly to local farmers</motion.li>
              <motion.li whileHover={{ x: 6 }} className="flex items-center gap-2 cursor-default transition-all duration-200">🍯 Fresh, formalin-free natural organic food</motion.li>
              <motion.li whileHover={{ x: 6 }} className="flex items-center gap-2 cursor-default transition-all duration-200">🏺 Supporting authentic village cottage-industry artisans</motion.li>
            </ul>
          </motion.div>
          <motion.div
            variants={infoImageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="h-[280px] sm:h-[350px] rounded-xl overflow-hidden shadow-md"
          >
            <img
              src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800"
              alt="Bangladeshi village farm fields"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>
    </main>
  );
}