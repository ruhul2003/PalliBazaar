"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

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
          // ignore
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
          // ignore
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border-light shadow-sm">
      <div className="container flex items-center justify-between h-[75px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.span 
            className="text-2xl"
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            🌱
          </motion.span>
          <span className="font-serif text-2xl font-bold text-primary tracking-tight">PalliBazaar</span>
          <span className="text-[10px] bg-accent-light text-primary px-1.5 py-0.5 rounded font-bold ml-1 transition-all group-hover:bg-accent-hover group-hover:text-white">
            পল্লীবাজার
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link href="/" className="font-medium text-text-muted hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/shop" className="font-medium text-text-muted hover:text-primary transition-colors">
            Shop
          </Link>
          {user && user.role === "customer" && (
            <>
              <Link href="/cart" className="font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-1.5">
                Cart
                <AnimatePresence mode="wait">
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="bg-secondary text-white text-[11px] font-bold px-2 py-0.5 rounded-full inline-block"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              <Link href="/dashboard/buyer" className="font-medium text-text-muted hover:text-primary transition-colors">
                Wishlist
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* Notifications Trigger */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-1.5 text-text-muted hover:text-primary transition-colors cursor-pointer"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications && unreadNotifications > 0) {
                      handleMarkAllRead();
                    }
                  }}
                  title="Notifications"
                >
                  <span className="text-xl">🔔</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0.5 right-0.5 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadNotifications}
                    </span>
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
                      className="absolute top-11 right-0 bg-white border border-border-light rounded-md shadow-xl w-[290px] p-4 z-50 origin-top-right"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-earth border-b border-border-light pb-2 mb-2">
                        Recent Notifications
                      </h4>
                      {notifications.length === 0 ? (
                        <p className="text-xs text-text-muted text-center py-3">No notifications yet.</p>
                      ) : (
                        <ul className="list-none max-height-[200px] overflow-y-auto">
                          {notifications.slice(0, 5).map((n) => (
                            <li
                              key={n._id}
                              className={`text-xs p-2 border-b border-border-light last:border-b-0 rounded leading-relaxed ${
                                n.isRead ? "text-text-muted" : "bg-primary-light text-primary font-semibold"
                              }`}
                            >
                              {n.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dashboard redirection buttons */}
              {user.role === "customer" && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/dashboard/buyer"
                    className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-md text-sm font-semibold transition"
                  >
                    My Profile
                  </Link>
                </motion.div>
              )}
              {user.role === "seller" && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/dashboard/farmer"
                    className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 bg-secondary text-white hover:bg-secondary-hover rounded-md text-sm font-semibold transition"
                  >
                    Farmer Dashboard
                  </Link>
                </motion.div>
              )}
              {user.role === "admin" && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/dashboard/farmer"
                    className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-md text-sm font-semibold transition"
                  >
                    Admin View
                  </Link>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="px-4 py-1.5 border border-border-light text-text-muted hover:bg-danger hover:border-danger hover:text-white rounded-md text-sm font-semibold transition cursor-pointer"
              >
                Logout
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link href="/login" className="font-semibold text-text-earth hover:text-primary transition-colors">
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-md text-sm font-semibold transition"
                >
                  Join Marketplace
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
