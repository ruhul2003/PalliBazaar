"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();


  useEffect(() => {
    if (!loading && user) {
      if (user.role === "customer") {
        router.push("/dashboard/buyer");
      } else {
        router.push("/dashboard/farmer");
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Welcome back! Login successful.");
        // Redirection logic is triggered by useEffect
      } else {
        const msg = res.error || "Invalid email or password";
        setError(msg);
        toast.error(msg);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      const msg = "An error occurred. Please try again.";
      setError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  const triggerDemoLogin = async (role: "customer" | "seller") => {
    const demoEmail = role === "customer" 
      ? "test_palli_customer@example.com" 
      : "test_palli_seller@example.com";
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
    setIsSubmitting(true);
    
    try {
      const res = await login(demoEmail, "password123");
      if (res.success) {
        toast.success(`Demo ${role === "customer" ? "Buyer" : "Farmer"} Login successful!`);
      } else {
        const msg = res.error || "Login failed";
        setError(msg);
        toast.error(msg);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError("An error occurred");
      toast.error("An error occurred");
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex items-center justify-center bg-bg-sand">
        <h2 className="text-xl font-bold text-primary animate-pulse">Loading PalliBazaar...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-75px)] flex items-center justify-center px-4 py-12 bg-bg-sand">
      <div className="w-full max-w-[460px] bg-white border border-border-light rounded-2xl shadow-md p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-primary mb-2">Welcome Back</h2>
          <p className="text-text-muted text-sm">Log in to check village listings and dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg p-3.5 mb-5 font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
              placeholder="e.g., rahim@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-earth mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-primary hover:text-primary-hover hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authenticating..." : "Log In"}
          </button>
        </form>


        {/* Demo Login Buttons */}
        <div className="mt-6 pt-5 border-t border-border-light text-center">
          <p className="text-xs font-bold text-text-earth uppercase tracking-wider mb-3">Demo Quick Log In</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => triggerDemoLogin("customer")}
              className="flex-grow py-2 border border-primary/20 bg-primary-light hover:bg-primary/10 text-primary text-xs font-bold rounded-lg transition active:scale-95"
            >
              Demo Buyer
            </button>
            <button
              type="button"
              onClick={() => triggerDemoLogin("seller")}
              className="flex-grow py-2 border border-secondary/20 bg-secondary-light hover:bg-secondary/15 text-secondary-hover text-xs font-bold rounded-lg transition active:scale-95"
            >
              Demo Farmer
            </button>
          </div>
        </div>

        <div className="text-center mt-5 text-sm text-text-muted">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
