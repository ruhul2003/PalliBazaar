"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle, Package, Banknote, CreditCard, Tractor, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface CartItemType {
  product: {
    _id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

               
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");

                    
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [fetchingCart, setFetchingCart] = useState(true);
  
                              
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState("");

                          
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripeOrderId, setStripeOrderId] = useState("");
  const [showStripeForm, setShowStripeForm] = useState(false);

  const districts = ["Dhaka", "Rajshahi", "Sundarbans", "Jessore", "Khulna", "Mymensingh", "Kushtia"];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
                                                 
      if (user.addresses && user.addresses.length > 0) {
        const addr = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
        setStreet(addr.street || "");
        setCity(addr.city || "");
        setDistrict(addr.district || "Dhaka");
        setZipCode(addr.zipCode || "");
      }
      if (user.phoneNumber) {
        setPhoneNumber(user.phoneNumber);
      }
      fetchCart();
    }
  }, [user, loading, router]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.cart && data.cart.items) {
          const items = data.cart.items.filter((i: any) => i.product !== null);
          setCartItems(items);
          if (items.length === 0) {
            router.push("/cart");                              
          }
        }
      }
    } catch (e) {
      console.error("Cart fetch error:", e);
    } finally {
      setFetchingCart(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (paymentMethod === "stripe" && !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      const msg = "Stripe is not configured. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);

    const shippingAddress = {
      street,
      city,
      district,
      zipCode,
      phoneNumber,
    };

    try {
                                                                                    
      const items = cartItems.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (paymentMethod === "stripe" && data.clientSecret) {
          setStripeClientSecret(data.clientSecret);
          setStripeOrderId(data.orderId);
          setShowStripeForm(true);
          toast.success("Order details saved. Proceeding to payment...");
        } else {
          setConfirmedOrderId(data.orderId);
          setOrderConfirmed(true);
          toast.success("Order placed successfully!");
        }
      } else {
        const msg = data.error || "Failed to place order";
        setError(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = "An error occurred while placing your order.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripeSuccess = (confirmedId: string) => {
    setConfirmedOrderId(confirmedId);
    setOrderConfirmed(true);
    setShowStripeForm(false);
  };

  const handleStripeCancel = () => {
    setShowStripeForm(false);
    setStripeClientSecret("");
    setStripeOrderId("");
    toast.error("Payment cancelled. You can retry checkout.");
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 1000 ? 0 : 80;
  const total = subtotal + shipping;

  if (loading || fetchingCart) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex items-center justify-center bg-bg-sand">
        <h2 className="text-xl font-bold text-primary animate-pulse">Loading checkout details...</h2>
      </div>
    );
  }

  if (orderConfirmed) {
    return (
      <div className="container py-20 text-center flex flex-col items-center">
        <CheckCircle className="w-16 h-16 text-success mb-4" />
        <h2 className="font-serif text-3xl font-bold text-primary mb-3">Order Confirmed!</h2>
        <p className="text-text-muted text-sm max-w-md mx-auto mb-6">
          Thank you for supporting village harvests! Your order has been placed successfully.
        </p>
        
        <div className="bg-white border border-border-light rounded-xl p-5 max-w-sm w-full mx-auto mb-8 shadow-sm text-center">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Order ID</p>
          <p className="font-mono text-sm text-text-earth font-bold mt-0.5">{confirmedOrderId}</p>
          <p className="text-xs text-secondary font-bold mt-2">
            Payment Method: {paymentMethod === "cod" ? "Cash on Delivery" : "Online via Stripe"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/dashboard/buyer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition shadow-sm">
            <Package className="w-4 h-4" />
            <span>Track Order progress</span>
          </Link>
          <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-2.5 border border-border-light text-text-muted bg-white hover:bg-bg-sand rounded-lg font-bold transition shadow-sm">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (showStripeForm && stripeClientSecret) {
    return (
      <div className="container py-12 max-w-lg mx-auto">
        {stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: stripeClientSecret,
            }}
          >
            <CheckoutForm
              orderId={stripeOrderId}
              totalAmount={total}
              onSuccess={handleStripeSuccess}
              onCancel={handleStripeCancel}
            />
          </Elements>
        ) : (
          <div className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm text-center">
            <h3 className="font-serif text-xl font-bold text-danger mb-2">Stripe Configuration Error</h3>
            <p className="text-sm text-text-muted mb-4">
              Stripe Publishable Key is not configured. Please add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your environment variables.
            </p>
            <button
              type="button"
              onClick={handleStripeCancel}
              className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition cursor-pointer"
            >
              Go Back
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-12">
      <h2 className="font-serif text-3xl font-bold text-primary mb-8">Checkout Details</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg p-3.5 mb-6 text-center font-semibold flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10">
        {                                    }
        <div className="space-y-6">
          <div className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-primary mb-5 border-b border-border-light pb-2">
              Shipping Address
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text-earth mb-1" htmlFor="street">
                  Street Address
                </label>
                <input
                  type="text"
                  id="street"
                  className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                  placeholder="e.g., House 12, Road 4"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-earth mb-1" htmlFor="city">
                    City / Town
                  </label>
                  <input
                    type="text"
                    id="city"
                    className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                    placeholder="e.g., Jessore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-earth mb-1" htmlFor="district">
                    District
                  </label>
                  <select
                    id="district"
                    className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none bg-white focus:border-primary"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    required
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-earth mb-1" htmlFor="zipCode">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                    placeholder="e.g., 7400"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-earth mb-1" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2.5 rounded-lg border border-border-light outline-none transition focus:border-primary focus:ring-4 focus:ring-primary-light"
                    placeholder="e.g., 01711111111"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-primary mb-5 border-b border-border-light pb-2">
              Payment Method
            </h3>

            <div className="flex flex-col gap-3">
              <div
                className={`border-2 rounded-xl p-4 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === "cod" ? "border-primary bg-primary-light" : "border-border-light bg-white"
                }`}
                onClick={() => setPaymentMethod("cod")}
              >
                <Banknote className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-sm text-text-earth">Cash on Delivery (COD)</p>
                  <p className="text-[10px] text-text-muted">Pay with cash when items are delivered to your door</p>
                </div>
              </div>

              <div
                className={`border-2 rounded-xl p-4 flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === "stripe" ? "border-primary bg-primary-light" : "border-border-light bg-white"
                }`}
                onClick={() => setPaymentMethod("stripe")}
              >
                <CreditCard className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-bold text-sm text-text-earth">Online Payment (Mock Stripe)</p>
                  <p className="text-[10px] text-text-muted">Simulate card payment instantly (Safe & secure sandbox)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary & Confirm Box */}
        <div className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm h-fit sticky top-24">
          <h3 className="font-serif text-xl font-bold text-primary mb-5 border-b border-border-light pb-2">
            Order Items
          </h3>

          <div className="divide-y divide-border-light max-h-48 overflow-y-auto mb-5 pr-1">
            {cartItems.map((item) => (
              <div key={item.product._id} className="py-2.5 flex justify-between text-xs font-semibold text-text-muted">
                <span className="line-clamp-1 flex-grow pr-3">
                  {item.product.name} <strong className="text-primary font-bold">x {item.quantity}</strong>
                </span>
                <span className="text-text-earth">BDT {item.product.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3.5 text-sm border-t border-border-light pt-4">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-text-earth">BDT {subtotal}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Shipping Fee</span>
              <span className="font-semibold text-text-earth">
                {shipping === 0 ? <span className="text-success font-bold">FREE</span> : `BDT ${shipping}`}
              </span>
            </div>

            <div className="flex justify-between text-base font-extrabold text-primary border-t border-border-light pt-4 mt-4">
              <span>Total Cost</span>
              <span>BDT {total}</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-lg hover:scale-101 active:scale-99 transition mt-6 cursor-pointer flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {paymentMethod === "cod" ? <Tractor className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
              <span>
                {isSubmitting
                  ? "Placing Order..."
                  : paymentMethod === "cod"
                  ? "Place Cash on Delivery Order"
                  : "Confirm Payment via Card"}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
