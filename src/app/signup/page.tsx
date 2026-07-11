"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "seller">("customer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [debugLink, setDebugLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDebugLink("");
    setIsSubmitting(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await signup(name, email, password, role);
      if (res.success) {
        setSuccess(res.message || "Registration successful! Please verify your email.");
        if (res.debugVerificationLink) {
          setDebugLink(res.debugVerificationLink);
        }
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setError(res.error || "Failed to sign up.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError("An error occurred during signup. Please try again.");
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

        {success && (
          <div className="bg-green-50 border border-green-200 text-success text-sm rounded-lg p-4 mb-5 font-medium">
            <p className="text-center">{success}</p>
            {debugLink && (
              <div className="mt-3 border-t border-green-200 pt-3">
                <strong className="text-[11px] uppercase tracking-wider text-primary block mb-1">
                  🔧 Local Dev Simulation:
                </strong>
                <a
                  href={debugLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-bold hover:text-primary-hover text-xs break-all"
                >
                  Click here to auto-verify your email address
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector cards */}
          <div>
            <label className="block text-sm font-semibold text-text-earth mb-2">Register As</label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border-2 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center gap-1.5 hover:border-primary ${
                  role === "customer" ? "border-primary bg-primary-light" : "border-border-light bg-white"
                }`}
                onClick={() => setRole("customer")}
              >
                <span className="text-2xl">🛒</span>
                <span className="font-bold text-sm text-text-earth">Buyer</span>
                <span className="text-[10px] text-text-muted leading-tight">Purchase organic food & crafts</span>
              </div>
              <div
                className={`border-2 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center gap-1.5 hover:border-primary ${
                  role === "seller" ? "border-primary bg-primary-light" : "border-border-light bg-white"
                }`}
                onClick={() => setRole("seller")}
              >
                <span className="text-2xl">🌾</span>
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
            disabled={isSubmitting && !success}
          >
            {isSubmitting && !success ? "Registering account..." : "Sign Up"}
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
