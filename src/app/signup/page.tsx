"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCart, Wheat, Wrench } from "lucide-react";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

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

  const handleGoogleSignup = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: role === "customer" ? "/dashboard/buyer" : "/dashboard/farmer",
        additionalData: {
          role: role,
        },
      });
    } catch (err: any) {
      toast.error("Google sign-up failed. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setDebugLink("");
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
        const msg = res.message || "Registration successful! Please verify your email.";
        setSuccess(msg);
        toast.success(msg);
        if (res.debugVerificationLink) {
          setDebugLink(res.debugVerificationLink);
        }
        setName("");
        setEmail("");
        setPassword("");
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

        {success && (
          <div className="bg-green-50 border border-green-200 text-success text-sm rounded-lg p-4 mb-5 font-medium">
            <p className="text-center">{success}</p>
            {debugLink && (
              <div className="mt-3 border-t border-green-200 pt-3">
                <div className="flex items-center gap-1 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-primary" />
                  <strong className="text-[11px] uppercase tracking-wider text-primary block">
                    Local Dev Simulation:
                  </strong>
                </div>
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
            disabled={isSubmitting && !success}
          >
            {isSubmitting && !success ? "Registering account..." : "Sign Up"}
          </button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light"></div>
          </div>
          <span className="relative bg-white px-3 text-xs uppercase text-text-muted font-medium">Or continue with</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          className="w-full py-2.5 border border-border-light bg-white hover:bg-gray-50 text-text-earth font-semibold rounded-lg hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

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
