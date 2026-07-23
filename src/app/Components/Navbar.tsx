"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Leaf, Bell, ShoppingCart, User, Menu, X, Inbox, Mail, Sparkles, ChevronDown } from "lucide-react";
import ThemeToggle from "@/app/Components/ThemeToggle";

interface NavLink {
  name: string;
  href?: string;
  count?: number;
  subLinks?: { name: string; href: string }[];
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            if (data.cart) {
              const count = data.cart.items.reduce(
                (acc: number, curr: any) => acc + curr.quantity,
                0
              );
              setCartCount(count);
            }
          }
        } catch (e) {
                   
        }
      };

      const fetchNotifications = async () => {
        try {
          const res = await fetch("/api/notifications");
          if (res.ok) {
            const data = await res.json();
            if (data.notifications) {
              setNotifications(data.notifications);
            }
          }
        } catch (e) {
                   
        }
      };

      fetchCart();
      fetchNotifications();
    } else {
      setCartCount(0);
      setNotifications([]);
    }
  }, [user]);

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PUT" });
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Failed to mark notifications read:", e);
    }
  };

  const aiTools = [
    ...(user ? [{ name: "AI Analyzer", href: "/analyzer" }] : []),
    ...(user && user.role === "customer" ? [{ name: "AI Shopper", href: "/shopper" }] : []),
  ];

  const infoLinks = [
    { name: "About PalliBazaar", href: "/about" },
    { name: "Contact Support", href: "/contact" },
  ];

  const navLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    ...(aiTools.length > 0
      ? [
          {
            name: "AI Copilot",
            subLinks: aiTools,
          },
        ]
      : []),
    {
      name: "Explore",
      subLinks: infoLinks,
    },
    ...(user && user.role === "customer"
      ? [
          { name: "Cart", href: "/cart", count: cartCount },
          { name: "Wishlist", href: "/dashboard/buyer" },
        ]
      : []),
    ...(user && user.role === "seller"
      ? [
          { name: "Add Product", href: "/items/add" },
          { name: "Manage Listings", href: "/items/manage" },
        ]
      : []),
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 w-full ${
        scrolled
          ? "bg-white/75 backdrop-blur-md border-b border-border-light/65 shadow-md py-2.5"
          : "bg-transparent border-b border-transparent py-4.5"
      }`}
    >
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: [0, -12, 12, -12, 0] }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-light text-primary"
          >
            <Leaf className="w-5 h-5 text-primary" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-black text-primary tracking-tight leading-none">
              PalliBazaar
            </span>
            <span className="text-[10px] text-text-muted font-bold tracking-widest mt-0.5 uppercase">
              rural marketplace
            </span>
          </div>
          <span className="hidden sm:inline-block text-[9px] bg-accent-light border border-accent/25 text-accent-hover px-1.5 py-0.5 rounded font-extrabold ml-1">
            পল্লীবাজার
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            if (link.subLinks) {
              const hasActiveChild = link.subLinks.some(sub => pathname === sub.href);
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(link.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    className={`px-4 py-2 font-semibold text-sm transition-colors duration-200 rounded-lg flex items-center gap-1 cursor-pointer focus:outline-none ${
                      hasActiveChild ? "text-primary font-bold bg-primary-light/40" : "text-text-muted hover:text-primary"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === link.name ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === link.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-1.5 w-48 bg-white border border-border-light rounded-xl shadow-lg py-2 z-50 overflow-hidden"
                      >
                        {link.subLinks.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={`block px-4.5 py-2.5 text-xs font-semibold transition-colors ${
                                isSubActive ? "text-primary bg-primary-light/60 font-bold" : "text-text-muted hover:text-primary hover:bg-bg-sand/65"
                              }`}
                            >
                              {sub.name}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href!}
                className={`relative px-4 py-2 font-semibold text-sm transition-colors duration-200 rounded-lg flex items-center gap-1.5 ${
                  isActive ? "text-primary font-bold" : "text-text-muted hover:text-primary"
                }`}
              >
                <span>{link.name}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span className="bg-secondary text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none min-w-[16px] text-center">
                    {link.count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-primary-light/65 rounded-lg -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              {/* Notifications Trigger */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-2 rounded-xl transition-all duration-200 cursor-pointer ${
                    showNotifications ? "bg-primary-light text-primary" : "text-text-muted hover:bg-bg-sand hover:text-primary"
                  }`}
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications && unreadNotifications > 0) {
                      handleMarkAllRead();
                    }
                  }}
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 bg-danger w-2.5 h-2.5 rounded-full ring-2 ring-white animate-pulse" />
                  )}
                </motion.button>
                
                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-12 right-0 bg-white border border-border-light rounded-xl shadow-xl w-[320px] p-4.5 z-50 origin-top-right overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-border-light pb-2.5 mb-2.5">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-earth">
                          Notifications
                        </h4>
                        {unreadNotifications > 0 && (
                          <span className="text-[10px] bg-primary-light text-primary px-2 py-0.5 rounded-full font-bold">
                            {unreadNotifications} new
                          </span>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 flex flex-col items-center gap-2">
                          <Inbox className="w-8 h-8 opacity-45 text-text-muted" />
                          <p className="text-xs text-text-muted">All caught up! No notifications.</p>
                        </div>
                      ) : (
                        <ul className="list-none max-h-[250px] overflow-y-auto space-y-1.5 pr-1">
                          {notifications.slice(0, 5).map((n) => (
                            <li
                              key={n._id}
                              className={`text-xs p-2.5 rounded-lg border border-transparent leading-relaxed transition-all ${
                                n.isRead
                                  ? "text-text-muted bg-bg-sand/40 hover:bg-bg-sand/80"
                                  : "bg-primary-light/50 border-primary-light text-primary font-medium hover:bg-primary-light/80"
                              }`}
                            >
                              <div className="flex gap-2.5">
                                {n.isRead ? (
                                  <Mail className="w-4 h-4 text-text-muted/65 mt-0.5 shrink-0" />
                                ) : (
                                  <Sparkles className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                                )}
                                <div>
                                  <p>{n.message}</p>
                                  {n.createdAt && (
                                    <span className="text-[9px] text-text-muted/65 mt-1 block">
                                      {new Date(n.createdAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dashboard Redirection Buttons */}
              {user.role === "customer" && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="hidden sm:block">
                  <Link
                    href="/dashboard/buyer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold transition duration-200"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                </motion.div>
              )}
              {user.role === "seller" && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="hidden sm:block">
                  <Link
                    href="/dashboard/farmer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary text-white hover:bg-secondary-hover rounded-lg text-xs font-bold transition duration-200"
                  >
                    <User className="w-4 h-4" />
                    Farmer Dashboard
                  </Link>
                </motion.div>
              )}
              {user.role === "admin" && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="hidden sm:block">
                  <Link
                    href="/dashboard/farmer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-lg text-xs font-bold transition duration-200"
                  >
                    <User className="w-4 h-4" />
                    Admin View
                  </Link>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="hidden sm:inline-flex px-4 py-2 border border-border-light text-text-muted hover:bg-danger-light hover:border-danger/35 hover:text-danger rounded-lg text-xs font-bold transition duration-200 cursor-pointer"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-5">
              <Link href="/login" className="font-semibold text-text-earth hover:text-primary transition-colors text-sm">
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4.5 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-bold shadow-sm hover:shadow transition duration-200"
                >
                  Join Marketplace
                </Link>
              </motion.div>
            </div>
          )}

          {/* Hamburger Mobile Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-earth hover:text-primary hover:bg-bg-sand rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-[300px] bg-white shadow-2xl z-50 p-6 md:hidden flex flex-col justify-between"
            >
              <div className="flex flex-col gap-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-border-light pb-4">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    <span className="font-serif text-xl font-bold text-primary">PalliBazaar</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-1 text-text-muted hover:text-primary hover:bg-bg-sand rounded transition-colors cursor-pointer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    if (link.subLinks) {
                      return (
                        <div key={link.name} className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-text-muted/65 px-3.5 pt-3 pb-1">
                            {link.name}
                          </span>
                          {link.subLinks.map((sub) => {
                            const isActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`font-semibold text-sm py-2.5 px-6 rounded-lg flex items-center justify-between transition ${
                                  isActive
                                    ? "bg-primary-light text-primary font-bold"
                                    : "text-text-muted hover:bg-bg-sand/60 hover:text-primary"
                                }`}
                              >
                                <span>{sub.name}</span>
                                <span className="text-text-muted/30">→</span>
                              </Link>
                            );
                          })}
                        </div>
                      );
                    }

                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href!}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`font-semibold text-base py-3 px-3.5 rounded-lg flex items-center justify-between transition ${
                          isActive
                            ? "bg-primary-light text-primary font-bold"
                            : "text-text-muted hover:bg-bg-sand/60 hover:text-primary"
                        }`}
                      >
                        <span>{link.name}</span>
                        {link.count !== undefined && link.count > 0 ? (
                          <span className="bg-secondary text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none">
                            {link.count}
                          </span>
                        ) : (
                          <span className="text-text-muted/30">→</span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Actions / Profile Area */}
              <div className="pt-6 border-t border-border-light flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 mb-2 px-1">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-base border border-primary/10">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-text-earth leading-tight">{user.name}</p>
                        <p className="text-xs text-text-muted capitalize">{user.role}</p>
                      </div>
                    </div>
                    
                    {user.role === "customer" && (
                      <Link
                        href="/dashboard/buyer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-2.5 bg-primary-light hover:bg-primary text-primary hover:text-white font-bold text-center rounded-lg text-sm transition"
                      >
                        My Profile
                      </Link>
                    )}
                    {user.role === "seller" && (
                      <Link
                        href="/dashboard/farmer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-2.5 bg-secondary text-white font-bold text-center rounded-lg text-sm hover:bg-secondary-hover transition"
                      >
                        Farmer Dashboard
                      </Link>
                    )}
                    {user.role === "admin" && (
                      <Link
                        href="/dashboard/farmer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full py-2.5 bg-primary text-white font-bold text-center rounded-lg text-sm hover:bg-primary-hover transition"
                      >
                        Admin View
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full py-2.5 border border-border-light text-text-muted hover:bg-danger-light hover:text-danger hover:border-danger/35 font-bold text-center rounded-lg text-sm transition cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 text-center text-text-earth font-bold hover:text-primary transition text-sm"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-2.5 bg-primary text-white text-center font-bold rounded-lg text-sm hover:bg-primary-hover transition"
                    >
                      Join Marketplace
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
