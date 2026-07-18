"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { Apple, Leaf, Milk, Paintbrush, Sprout, Wheat, MapPin, Star, Sparkles, Droplets, Tractor, Users, ShieldCheck, Mail, ArrowRight, ShoppingCart } from "lucide-react";

                                         
const Cow = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {                  }
    <path d="M7 10c0-3.5 2.2-5 5-5h0c2.8 0 5 1.5 5 5v3a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-3z" />
    {           }
    <path d="M6 7c-1-2-3-1-3-1s1 3 3 2" />
    <path d="M18 7c1-2 3-1 3-1s-1 3-3 2" />
    {                 }
    <path d="M9 13h6a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v0a2 2 0 0 1 2-2z" />
    {          }
    <circle cx="10" cy="10" r="0.8" fill="currentColor" />
    <circle cx="14" cy="10" r="0.8" fill="currentColor" />
    {              }
    <circle cx="11" cy="15" r="0.5" fill="currentColor" />
    <circle cx="13" cy="15" r="0.5" fill="currentColor" />
  </svg>
);

                                   
const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
} as const;

const heroItemVariants = {
  hidden: { opacity: 0, x: -35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 90, damping: 14 },
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
  shortDescription?: string;
  description: string;
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

                                                   
const LeafParticle = ({
  delay = 0,
  x = 0,
  y = -20,
  scale = 1,
  duration = 12,
}: {
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
}) => (
  <motion.div
    initial={{ y: y, x: `${x}%`, opacity: 0, rotate: 0 }}
    animate={{
      y: "115%",
      x: [`${x}%`, `${x + 6}%`, `${x - 4}%`, `${x}%`],
      opacity: [0, 0.45, 0.45, 0],
      rotate: [0, 180, 270, 360],
    }}
    transition={{
      duration: duration,
      repeat: Infinity,
      delay: delay,
      ease: "linear",
    }}
    className="absolute pointer-events-none z-0"
    style={{ scale }}
  >
    <Leaf className="w-5 h-5 text-[#b2d8c3]/12 fill-current" />
  </motion.div>
);

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800",
      tag: "Organic Crops",
      title: "100% Organic Local Harvests"
    },
    {
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800",
      tag: "Fresh Seeds",
      title: "High Yield Paddy Seeds"
    },
    {
      image: "https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=800",
      tag: "Cottage Crafts",
      title: "Handcrafted Nakshi Kanthas"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);



  const categoriesList = [
    { name: "Fruits", slug: "fruits", icon: Apple, color: "text-[#e11d48]" },
    { name: "Vegetables", slug: "vegetables", icon: Leaf, color: "text-[#16a34a]" },
    { name: "Dairy & Milk", slug: "dairy", icon: Milk, color: "text-[#2563eb]" },
    { name: "Handicrafts", slug: "handicrafts", icon: Paintbrush, color: "text-[#d97706]" },
    { name: "Seeds & Fertilizer", slug: "seeds", icon: Sprout, color: "text-[#059669]" },
    { name: "Livestock", slug: "livestock", icon: Cow, color: "text-[#b45309]" },
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <main className="w-full">
      {/* Animated Hero Section */}
      <section className="relative bg-gradient-to-br from-[#275239] via-[#467756] to-[#76aa7b] text-white overflow-hidden py-16 md:py-24 lg:py-28">
        {/* Animated Background Leaves */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <LeafParticle x={8} y={-30} delay={0} scale={0.75} duration={13} />
          <LeafParticle x={28} y={-30} delay={4.5} scale={1.2} duration={17} />
          <LeafParticle x={52} y={-30} delay={2.1} scale={0.6} duration={11} />
          <LeafParticle x={78} y={-30} delay={6.8} scale={0.9} duration={15} />
          <LeafParticle x={92} y={-30} delay={9.3} scale={1.1} duration={14} />
          <LeafParticle x={18} y={-30} delay={8.2} scale={0.8} duration={16} />
        </div>

        {/* Radial grid pattern overlay */}
        <div className="absolute inset-0 opacity-8 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="container relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center text-center lg:text-left">
          
          {/* Left Column - Content & Search */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={heroContainerVariants}
            className="lg:col-span-7 flex flex-col items-center lg:items-start max-w-2xl mx-auto lg:mx-0"
          >
            {/* Tag Badge */}
            <motion.div
              variants={heroItemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-accent font-semibold tracking-wider text-xs uppercase mb-6"
            >
              <Wheat className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Direct from Bangladeshi Farms</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={heroItemVariants}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-[1.12]"
            >
              Directly from{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-[#ffd059] relative">
                Village Farms
                <span className="absolute left-0 bottom-1 w-full h-[4px] bg-accent/35 rounded-full" />
              </span>{" "}
              to Your Doorstep
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={heroItemVariants}
              className="text-white/85 text-base sm:text-lg mb-8 max-w-xl font-light leading-relaxed text-center lg:text-left"
            >
              Support local Bangladeshi farmers and artisans. Discover farm-fresh organic produce,
              pure dairy products, healthy livestock, and authentic handmade handicrafts.
            </motion.p>

            {/* Dynamic Search Bar */}
            <motion.form
              onSubmit={handleSearchSubmit}
              variants={heroItemVariants}
              className="w-full max-w-lg mb-8 relative flex items-center bg-white shadow-xl rounded-xl p-1.5 border border-white/20"
            >
              <div className="flex-grow flex items-center pl-3">
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search fresh mangoes, honey, handicrafts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-text-earth font-sans text-sm focus:outline-none pl-2.5 py-2.5 placeholder-text-muted/65"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-lg transition-colors cursor-pointer shrink-0"
              >
                Search
              </button>
            </motion.form>

            {/* CTAs */}
            <motion.div variants={heroItemVariants} className="flex flex-col sm:flex-row gap-4 w-full sm:justify-center lg:justify-start">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-accent text-text-earth rounded-xl font-extrabold shadow-lg hover:bg-accent-hover hover:shadow-accent/25 transition-all"
                >
                  Explore Shop
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="w-full sm:w-auto">
                <Link
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border-2 border-white/60 hover:border-white text-white hover:bg-white hover:text-primary rounded-xl font-extrabold transition-all"
                >
                  Join as Seller
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 45 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 14, delay: 0.1 }}
            className="lg:col-span-5 relative w-full h-[360px] sm:h-[400px] flex items-center justify-center mt-6 lg:mt-0"
          >
            {/* Dashed Orbital Rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute w-[310px] h-[310px] sm:w-[350px] sm:h-[350px] border border-dashed border-white/10 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute w-[250px] h-[250px] sm:w-[290px] sm:h-[290px] border border-dashed border-white/15 rounded-full"
            />
            
            {/* Center Showcase Card Slideshow */}
            <div className="relative w-[210px] h-[270px] sm:w-[240px] sm:h-[310px] bg-white border-4 border-white rounded-[2rem] shadow-2xl overflow-hidden ring-8 ring-white/5 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent z-10" />
                  <img
                    src={bannerSlides[currentSlide].image}
                    alt={bannerSlides[currentSlide].title}
                    className="w-full h-full object-cover transition-transform duration-750 group-hover:scale-105"
                  />
                  <div className="absolute bottom-5 left-5 right-5 z-20 text-left">
                    <span className="text-[10px] font-bold text-accent tracking-wider uppercase">
                      {bannerSlides[currentSlide].tag}
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-white mt-1 leading-snug">
                      {bannerSlides[currentSlide].title}
                    </h4>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Orbiting Badge 1 (Honey) - Top Right */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                x: [0, 5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute top-4 sm:top-8 right-0 sm:right-6 bg-white border border-border-light text-text-earth shadow-lg rounded-2xl py-2 px-3.5 flex items-center gap-2 z-20 cursor-default"
            >
              <Droplets className="w-5 h-5 text-accent shrink-0" />
              <div className="text-left leading-none">
                <p className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Pure</p>
                <p className="text-xs font-black text-primary mt-0.5">Honey</p>
              </div>
            </motion.div>

            {/* Orbiting Badge 2 (Pottery) - Bottom Left */}
            <motion.div
              animate={{
                y: [0, 10, 0],
                x: [0, -5, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2
              }}
              className="absolute bottom-4 sm:bottom-8 left-0 sm:left-4 bg-white border border-border-light text-text-earth shadow-lg rounded-2xl py-2 px-3.5 flex items-center gap-2 z-20 cursor-default"
            >
              <Sparkles className="w-5 h-5 text-secondary shrink-0" />
              <div className="text-left leading-none">
                <p className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Artisan</p>
                <p className="text-xs font-black text-secondary mt-0.5">Handicrafts</p>
              </div>
            </motion.div>

            {/* Orbiting Badge 3 (Crops) - Bottom Right */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                x: [0, -8, 0]
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute bottom-16 sm:bottom-20 right-0 sm:right-2 bg-white border border-border-light text-text-earth shadow-lg rounded-2xl py-2 px-3.5 flex items-center gap-2 z-20 cursor-default"
            >
              <Leaf className="w-5 h-5 text-[#2e5a44] shrink-0" />
              <div className="text-left leading-none">
                <p className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Fresh</p>
                <p className="text-xs font-black text-primary-hover mt-0.5">Vegetables</p>
              </div>
            </motion.div>

            {/* Orbiting Badge 4 (Fruits) - Top Left */}
            <motion.div
              animate={{
                y: [0, 8, 0],
                x: [0, 8, 0]
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.8
              }}
              className="absolute top-12 sm:top-16 left-0 sm:left-6 bg-white border border-border-light text-text-earth shadow-lg rounded-2xl py-2 px-3.5 flex items-center gap-2 z-20 cursor-default"
            >
              <Apple className="w-5 h-5 text-accent-hover shrink-0" />
              <div className="text-left leading-none">
                <p className="text-[9px] text-text-muted font-bold tracking-wider uppercase">Sweet</p>
                <p className="text-xs font-black text-accent-hover mt-0.5">Mangoes</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
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
              whileTap={{ scale: 0.98 }}
              key={cat.slug}
              className="bg-white border border-border-light rounded-2xl cursor-pointer hover-card-premium"
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="p-6 text-center flex flex-col items-center gap-4 w-full h-full justify-center"
              >
                <cat.icon className={`w-10 h-10 ${cat.color}`} />
                <span className="font-bold text-sm text-text-earth">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">How PalliBazaar Works</h2>
          <p className="text-text-muted text-sm md:text-base max-w-lg mx-auto">
            A simple, secure, and transparent ecosystem designed to bridge the gap between rural farms and urban dining rooms.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-[28%] left-[15%] right-[15%] h-[2px] bg-gradient-soft -translate-y-1/2 -z-10 opacity-30" />

          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white border border-border-light rounded-2xl p-8 text-center flex flex-col items-center hover-card-premium cursor-default"
          >
            <div className="w-14 h-14 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg mb-5 shadow-sm">
              1
            </div>
            <Wheat className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-serif text-lg font-bold text-text-earth mb-2.5">Harvest & Upload</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Verified rural farmers upload fresh yields of organic crops, pure honey, seeds, or authentic handicrafts directly from the village fields.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="bg-white border border-border-light rounded-2xl p-8 text-center flex flex-col items-center hover-card-premium cursor-default"
          >
            <div className="w-14 h-14 rounded-full bg-secondary-light text-secondary flex items-center justify-center font-bold text-lg mb-5 shadow-sm">
              2
            </div>
            <ShoppingCart className="w-8 h-8 text-secondary mb-4" />
            <h3 className="font-serif text-lg font-bold text-text-earth mb-2.5">Direct Purchase</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              City buyers browse and order directly from their preferred farmers. Transparent pricing ensures no hidden middlemen cuts.
            </p>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white border border-border-light rounded-2xl p-8 text-center flex flex-col items-center hover-card-premium cursor-default"
          >
            <div className="w-14 h-14 rounded-full bg-accent-light text-accent-hover flex items-center justify-center font-bold text-lg mb-5 shadow-sm">
              3
            </div>
            <Tractor className="w-8 h-8 text-accent-hover mb-4" />
            <h3 className="font-serif text-lg font-bold text-text-earth mb-2.5">Fast Eco-Delivery</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Harvests are packed in environment-friendly packaging and shipped directly via green routes, arriving fresh and pesticide-free.
            </p>
          </motion.div>
        </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm flex flex-col h-[420px] animate-pulse">
                  <div className="w-full h-[200px] bg-gray-200"></div>
                  <div className="p-5 flex flex-col flex-grow gap-3">
                    <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="h-3 w-5/6 bg-gray-200 rounded mt-2"></div>
                    <div className="h-3 w-4/6 bg-gray-200 rounded"></div>
                    <div className="h-8 w-full bg-gray-200 rounded mt-auto"></div>
                  </div>
                </div>
              ))}
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
                  key={product._id} 
                  className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm flex flex-col h-full hover-card-premium cursor-pointer"
                >
                  <div className="relative w-full aspect-[10/8] bg-bg-sand overflow-hidden group">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-accent text-text-earth text-xs font-extrabold px-2.5 py-1 rounded flex items-center gap-1">
                      <Wheat className="w-3.5 h-3.5" /> Harvested
                    </span>
                    <span className="absolute top-3 right-3 bg-black/75 text-white text-[10px] px-2 py-1 rounded font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-accent" /> {product.district}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold tracking-wider text-secondary uppercase mb-1.5">
                      {product.category?.name || "Uncategorized"}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-text-earth mb-1 line-clamp-2 hover:text-primary transition-colors">
                      <Link href={`/products/${product._id}`}>{product.name}</Link>
                    </h3>
                    <div className="text-xs text-accent-hover mb-2 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-accent stroke-accent" /> {product.ratings.average || "New"} ({product.ratings.count || 0} reviews)
                    </div>
                    
                    <p className="text-xs text-text-muted mb-4 line-clamp-2 leading-relaxed">
                      {product.shortDescription || product.description}
                    </p>

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

      {/* Our Impact Stats Section */}
      <section className="py-16 bg-[#eaf4ed]/45 border-y border-border-light/70">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Stat 1 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="text-center p-6 bg-white rounded-2xl border border-border-light shadow-sm hover-card-premium cursor-default"
            >
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-3xl font-extrabold text-primary">12,000+</h3>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">Happy Families</p>
            </motion.div>

            {/* Stat 2 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
              className="text-center p-6 bg-white rounded-2xl border border-border-light shadow-sm hover-card-premium cursor-default"
            >
              <Tractor className="w-8 h-8 text-secondary mx-auto mb-3" />
              <h3 className="text-3xl font-extrabold text-secondary">850+</h3>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">Empowered Farmers</p>
            </motion.div>

            {/* Stat 3 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              className="text-center p-6 bg-white rounded-2xl border border-border-light shadow-sm hover-card-premium cursor-default"
            >
              <MapPin className="w-8 h-8 text-accent-hover mx-auto mb-3" />
              <h3 className="text-3xl font-extrabold text-accent-hover">15+</h3>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">Village Districts</p>
            </motion.div>

            {/* Stat 4 */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
              className="text-center p-6 bg-white rounded-2xl border border-border-light shadow-sm hover-card-premium cursor-default"
            >
              <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-3xl font-extrabold text-primary">0%</h3>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mt-1">Middlemen Cuts</p>
            </motion.div>
          </div>
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
            <ul className="space-y-3.5 font-semibold text-primary">
              <motion.li whileHover={{ x: 6 }} className="flex items-center gap-2.5 cursor-default transition-all duration-200">
                <Tractor className="w-5 h-5 text-secondary shrink-0" />
                <span>100% Fair price directly to local farmers</span>
              </motion.li>
              <motion.li whileHover={{ x: 6 }} className="flex items-center gap-2.5 cursor-default transition-all duration-200">
                <Droplets className="w-5 h-5 text-accent-hover shrink-0" />
                <span>Fresh, formalin-free natural organic food</span>
              </motion.li>
              <motion.li whileHover={{ x: 6 }} className="flex items-center gap-2.5 cursor-default transition-all duration-200">
                <Paintbrush className="w-5 h-5 text-primary shrink-0" />
                <span>Supporting authentic village cottage-industry artisans</span>
              </motion.li>
            </ul>
          </motion.div>
          <motion.div
            variants={infoImageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="h-[280px] sm:h-[350px] rounded-xl overflow-hidden shadow-md"
          >
            <Image
              src="https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=800"
              alt="Bangladeshi village farm fields"
              className="w-full h-full object-cover"
              width={800}
              height={800}
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">Community Voices</h2>
          <p className="text-text-muted text-sm md:text-base max-w-md mx-auto">
            Read what our farmers and buyers say about their direct marketplace experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Testimonial 1 */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="bg-white border border-border-light rounded-2xl p-8 shadow-sm flex flex-col justify-between hover-card-premium cursor-default"
          >
            <div>
              <div className="flex gap-1 mb-4 text-[#e6a817]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4.5 h-4.5 fill-current" />
                ))}
              </div>
              <p className="text-sm italic text-text-earth leading-relaxed mb-6">
                "Finding organic food in Dhaka used to be difficult and expensive. PalliBazaar has changed everything. The vegetables are fresh, the honey is 100% pure, and I love knowing that my money goes directly to the village farmer who harvested them."
              </p>
            </div>
            <div className="flex items-center gap-3.5 border-t border-border-light pt-4 mt-auto">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-bg-sand">
                <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200" alt="Nusrat J." className="object-cover w-full h-full" width={200} height={200} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-earth">Nusrat Jahan</h4>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">City Buyer (Dhaka)</p>
              </div>
            </div>
          </motion.div>

          {/* Testimonial 2 */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
            className="bg-white border border-border-light rounded-2xl p-8 shadow-sm flex flex-col justify-between hover-card-premium cursor-default"
          >
            <div>
              <div className="flex gap-1 mb-4 text-[#e6a817]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4.5 h-4.5 fill-current" />
                ))}
              </div>
              <p className="text-sm italic text-text-earth leading-relaxed mb-6">
                "Earlier, local merchants in Jessore bought my mangoes and rice for a fraction of the cost, making all the profit. Now through PalliBazaar, I list my items directly and get the full payment. It has helped me send my children to a better school."
              </p>
            </div>
            <div className="flex items-center gap-3.5 border-t border-border-light pt-4 mt-auto">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-bg-sand">
                <Image src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200" alt="Rafiqul I." className="object-cover w-full h-full" width={200} height={200} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-earth">Md. Rafiqul Islam</h4>
                <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Organic Farmer (Jessore)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter / Join Us Section */}
      <section className="py-16 container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="bg-gradient-primary rounded-[2.5rem] p-8 md:p-14 text-center text-white shadow-xl relative overflow-hidden"
        >
          {/* Ambient shapes */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <Mail className="w-10 h-10 text-accent mb-6" />
            <h2 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-4">
              Get notified of the Fresh Harvests!
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg font-light leading-relaxed">
              Subscribe to receive weekly notifications when local farmers in Rajshahi, Jessore, and Sundarbans upload their fresh yields.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed successfully!"); }} className="w-full max-w-md flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-grow px-4 py-3 bg-transparent text-white placeholder-white/60 outline-none text-sm font-medium focus:ring-0 border-0" 
                required
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-white text-primary hover:bg-bg-sand font-bold text-sm rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </motion.div>
      </section>
    </main>
  );
}