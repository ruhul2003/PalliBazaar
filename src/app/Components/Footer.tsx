"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Wheat, Tractor, AlertCircle, CheckCircle } from "lucide-react";

// Inline Custom SVGs for Social Media Icons to avoid lucide-react version variations
const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Youtube = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const Twitter = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");

    // Simulate API request
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  const categories = [
    { name: "Fruits", slug: "fruits" },
    { name: "Vegetables", slug: "vegetables" },
    { name: "Dairy & Milk", slug: "dairy" },
    { name: "Handicrafts", slug: "handicrafts" },
    { name: "Seeds & Fertilizer", slug: "seeds" },
    { name: "Livestock", slug: "livestock" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Shop All", href: "/shop" },
    { name: "My Cart", href: "/cart" },
    { name: "Become a Seller", href: "/signup" },
    { name: "Help Center", href: "#" },
  ];

  const socialLinks = [
    { icon: Facebook, name: "Facebook", link: "#" },
    { icon: Instagram, name: "Instagram", link: "#" },
    { icon: Youtube, name: "YouTube", link: "#" },
    { icon: Twitter, name: "Twitter", link: "#" },
  ];

  return (
    <footer className="bg-[#1b3327] text-[#e6ece8] border-t border-[#2e5a44]/30 pt-16 pb-8 relative overflow-hidden font-sans">
      {/* Decorative top wave pattern or grid lines */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="container relative z-10 mx-auto px-6 max-w-[1200px]">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & About */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <Leaf className="w-6 h-6 text-accent" />
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                PalliBazaar
              </span>
              <span className="text-[10px] bg-accent/20 text-accent border border-accent/30 px-1.5 py-0.5 rounded font-bold">
                পল্লীবাজার
              </span>
            </Link>
            <p className="text-sm text-[#a2b5ab] leading-relaxed mt-2">
              Connecting Bangladesh's rural farmers and artisans directly with urban buyers. 
              Fresh organic harvests, pure dairy, livestock, and traditional cottage crafts.
            </p>
            {/* Social Icons with Framer Motion hover pops */}
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((social, idx) => (
                <motion.a
                  key={idx}
                  href={social.link}
                  whileHover={{ scale: 1.15, rotate: 5, backgroundColor: "#2e5a44" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-[#244233] flex items-center justify-center border border-[#2e5a44]/30 hover:border-accent/50 transition-colors group"
                  title={social.name}
                >
                  <social.icon className="w-4.5 h-4.5 text-[#a2b5ab] group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
            {/* Contact Details */}
            <div className="flex flex-col gap-2 text-xs text-[#a2b5ab] mt-4 border-t border-[#2e5a44]/30 pt-4">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>Mirpur 10, Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>+880 1711-223344</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✉️</span>
                <span>support@pallibazaar.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold text-white tracking-wide border-b border-[#2e5a44]/40 pb-2">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#a2b5ab]">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="hover:text-accent transition-colors flex items-center gap-1.5 group"
                  >
                    <Wheat className="w-3.5 h-3.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 text-accent shrink-0" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rural Categories */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold text-white tracking-wide border-b border-[#2e5a44]/40 pb-2">
              Rural Categories
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-[#a2b5ab]">
              {categories.map((cat, idx) => (
                <li key={idx}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="hover:text-accent transition-colors flex items-center gap-1.5 group"
                  >
                    <Tractor className="w-3.5 h-3.5 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 text-accent shrink-0" />
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {cat.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Working Form */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif text-lg font-bold text-white tracking-wide border-b border-[#2e5a44]/40 pb-2">
              Newsletter
            </h3>
            <p className="text-sm text-[#a2b5ab] leading-relaxed">
              Subscribe to get seasonal harvest updates, special farm discounts, and recipe ideas.
            </p>

            <div className="relative mt-2">
              <AnimatePresence mode="wait">
                {status !== "success" ? (
                  <motion.form
                    key="newsletter-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubscribe}
                    className="flex flex-col gap-2"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") setStatus("idle");
                        }}
                        disabled={status === "loading"}
                        className="w-full px-4 py-2.5 pr-12 rounded-lg bg-[#244233] text-white placeholder-[#64756c] text-sm border border-[#2e5a44]/40 focus:border-accent focus:outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="absolute right-1 px-3 py-1.5 rounded-md bg-accent text-[#222d27] font-bold text-xs hover:bg-[#cf9410] active:scale-95 transition-all flex items-center justify-center min-w-[50px]"
                      >
                        {status === "loading" ? (
                          <div className="w-4 h-4 border-2 border-[#222d27] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          "Join"
                        )}
                      </button>
                    </div>

                    {status === "error" && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-red-400 font-semibold mt-1 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.p>
                    )}
                  </motion.form>
                ) : (
                  <motion.div
                    key="newsletter-success"
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#244233] border border-accent/40 rounded-lg p-4 flex flex-col items-center text-center gap-2"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                      className="text-accent"
                    >
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </motion.div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Successfully Joined!
                    </h4>
                    <p className="text-xs text-[#a2b5ab]">
                      Thank you for joining our farm-to-table network. Check your inbox soon!
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="text-[10px] text-accent hover:underline mt-1 font-semibold"
                    >
                      Subscribe another email
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Middle Divider */}
        <div className="border-t border-[#2e5a44]/30 my-8"></div>

        {/* Footer Bottom info */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#a2b5ab]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <span>© {new Date().getFullYear()} PalliBazaar. All Rights Reserved.</span>
            <div className="flex items-center gap-4 mt-2 sm:mt-0 justify-center">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#244233] border border-[#2e5a44]/30 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-[#e6ece8]/90 font-medium">Connecting 5,000+ local farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
