"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Wheat, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await signup(name, email, password, role);
      if (res.success) {
        toast.success("Account created successfully!");
        // Redirect based on role
        router.push(role === "customer" ? "/dashboard/buyer" : "/dashboard/farmer");
      } else {
        const msg = res.error || "Failed to sign up.";
        setError(msg);
        toast.error(msg);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      const msg = "An error occurred during signup. Please try again.";
      setError(msg);
      toast.error(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-75px)] flex items-center justify-center px-4 py-12 bg-bg-sand">
      <div className="w-full max-w-[500px] bg-white border border-border-light rounded-2xl shadow-md p-8 sm:p-10">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold text-primary mb-2">Create Account</h2>
          <p className="text-text-muted text-sm">Join PalliBazaar to start trading rural products</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg p-3.5 mb-5 font-semibold text-center">
            {error}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector cards */}
          <div>
            <label className="block text-sm font-semibold text-text-earth mb-2">Register As</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border-2 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center gap-2 hover:border-primary ${
                  role === "customer" ? "border-primary bg-primary-light" : "border-border-light bg-white"
                }`}
                onClick={() => setRole("customer")}
              >
                <ShoppingCart className={`w-6 h-6 ${role === "customer" ? "text-primary" : "text-text-muted"}`} />
                <span className="font-bold text-sm text-text-earth">Buyer</span>
                <span className="text-[10px] text-text-muted leading-tight">Purchase organic food & crafts</span>
              </div>
              <div
                className={`border-2 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center gap-2 hover:border-primary ${
                  role === "seller" ? "border-primary bg-primary-light" : "border-border-light bg-white"
                }`}
                onClick={() => setRole("seller")}
              >
                <Wheat className={`w-6 h-6 ${role === "seller" ? "text-primary" : "text-text-muted"}`} />
                <span className="font-bold text-sm text-text-earth">Farmer/Artisan</span>
                <span className="text-[10px] text-text-muted leading-tight">Sell crops, livestock & crafts</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-earth mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-4 py-2 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
              placeholder="e.g., Rahim Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-earth mb-1" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
              placeholder="e.g., rahim@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-earth mb-1" htmlFor="password">
              Password (Min 6 characters)
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering account..." : "Sign Up"}
          </button>
        </form>


        <div className="text-center mt-6 text-sm text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
