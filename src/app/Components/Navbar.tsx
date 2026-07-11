"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

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
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <span className="font-serif text-2xl font-bold text-primary tracking-tight">PalliBazaar</span>
          <span className="text-[10px] bg-accent-light text-primary px-1.5 py-0.5 rounded font-bold ml-1">
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
                Cart {cartCount > 0 && <span className="bg-secondary text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>}
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
                <button
                  className="relative p-1.5 text-text-muted hover:text-primary transition-colors"
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
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute top-11 right-0 bg-white border border-border-light rounded-md shadow-xl w-[290px] p-4 z-50">
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
                  </div>
                )}
              </div>

              {/* Dashboard redirection buttons */}
              {user.role === "customer" && (
                <Link
                  href="/dashboard/buyer"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-md text-sm font-semibold transition"
                >
                  My Profile
                </Link>
              )}
              {user.role === "seller" && (
                <Link
                  href="/dashboard/farmer"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 bg-secondary text-white hover:bg-secondary-hover rounded-md text-sm font-semibold transition"
                >
                  Farmer Dashboard
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  href="/dashboard/farmer"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-1.5 bg-primary text-white hover:bg-primary-hover rounded-md text-sm font-semibold transition"
                >
                  Admin View
                </Link>
              )}

              <button
                onClick={logout}
                className="px-4 py-1.5 border border-border-light text-text-muted hover:bg-danger hover:border-danger hover:text-white rounded-md text-sm font-semibold transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Link href="/login" className="font-semibold text-text-earth hover:text-primary transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white hover:bg-primary-hover rounded-md text-sm font-semibold transition"
              >
                Join Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
