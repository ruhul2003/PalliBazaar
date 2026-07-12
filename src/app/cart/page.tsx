"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Trash2, ShoppingCart, CreditCard, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface CartItemType {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
    seller: {
      name: string;
    };
  } | null;
  quantity: number;
}

export default function CartPage() {
  const { user, loading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [fetchingCart, setFetchingCart] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      fetchCart();
    }
  }, [user, loading, router]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.cart && data.cart.items) {
          // Filter out items where the product might have been deleted/is null
          setCartItems(data.cart.items.filter((item: any) => item.product !== null));
        }
      } else {
        setError("Failed to fetch cart items.");
      }
    } catch (e) {
      setError("An error occurred loading your cart.");
    } finally {
      setFetchingCart(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQty: number) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: newQty }),
      });
      const data = await res.json();
      if (res.ok && data.cart) {
        setCartItems(data.cart.items.filter((item: any) => item.product !== null));
        toast.success("Quantity updated.");
      } else {
        toast.error(data.error || "Failed to update quantity");
      }
    } catch (e) {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    try {
      const res = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.cart) {
        setCartItems(data.cart.items.filter((item: any) => item.product !== null));
        toast.success("Item removed from cart.");
      } else {
        toast.error("Failed to remove item.");
      }
    } catch (e) {
      toast.error("Failed to remove item.");
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await fetch("/api/cart", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.cart) {
        setCartItems([]);
        toast.success("Cart cleared.");
      } else {
        toast.error("Failed to clear cart.");
      }
    } catch (e) {
      toast.error("Failed to clear cart.");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      if (item.product) {
        return acc + item.product.price * item.quantity;
      }
      return acc;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 1000 ? 0 : 80; // Free shipping above BDT 1000
  const total = subtotal + shipping;

  if (loading || fetchingCart) {
    return (
      <div className="min-h-[calc(100vh-75px)] flex items-center justify-center bg-bg-sand">
        <h2 className="text-xl font-bold text-primary animate-pulse">Loading shopping cart...</h2>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-20 text-center flex flex-col items-center">
        <ShoppingCart className="w-16 h-16 text-primary/30 mb-4" />
        <h2 className="font-serif text-2xl font-bold text-text-earth mb-3">Your Cart is Empty</h2>
        <p className="text-text-muted text-sm max-w-sm mx-auto mb-6">
          Looks like you haven't added any fresh village goods to your cart yet. Explore our fresh harvests and crafts!
        </p>
        <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition shadow-sm">
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8 sm:py-12">
      <h2 className="font-serif text-3xl font-bold text-primary mb-8">Shopping Cart</h2>

      {error && <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg p-3 mb-5">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        {/* Cart items list */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-primary-light text-primary border-b border-border-light">
                    <th className="p-5 text-left font-bold text-sm">Product</th>
                    <th className="p-5 text-left font-bold text-sm">Price</th>
                    <th className="p-5 text-left font-bold text-sm">Quantity</th>
                    <th className="p-5 text-left font-bold text-sm">Total</th>
                    <th className="p-5 text-left font-bold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {cartItems.map((item) => {
                    const prod = item.product!;
                    return (
                      <tr key={prod._id} className="hover:bg-bg-sand/30 transition">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <img
                              src={prod.images[0]}
                              alt={prod.name}
                              className="w-16 h-16 rounded-lg object-cover border border-border-light"
                            />
                            <div>
                              <h4 className="font-bold text-sm text-text-earth hover:text-primary transition-colors">
                                <Link href={`/products/${prod._id}`}>{prod.name}</Link>
                              </h4>
                              <p className="text-[11px] text-text-muted">Farmer: {prod.seller.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 font-semibold text-sm">BDT {prod.price}</td>
                        <td className="p-5">
                          <div className="flex items-center border border-border-light rounded bg-bg-sand w-fit">
                            <button
                              onClick={() => handleUpdateQuantity(prod._id, item.quantity - 1)}
                              className="px-2.5 py-1 font-bold hover:bg-white transition"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(prod._id, item.quantity + 1)}
                              className="px-2.5 py-1 font-bold hover:bg-white transition"
                              disabled={item.quantity >= prod.stock}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-5 font-bold text-primary text-sm">
                          BDT {prod.price * item.quantity}
                        </td>
                        <td className="p-5">
                          <button
                            onClick={() => handleRemoveItem(prod._id)}
                            className="text-text-muted hover:text-danger p-2 hover:bg-red-50 rounded-lg transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4 text-text-muted hover:text-danger shrink-0" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <Link href="/shop" className="text-sm font-bold text-primary hover:underline">
              ← Continue Shopping
            </Link>
            <button
              onClick={handleClearCart}
              className="px-4 py-2 border border-danger text-danger hover:bg-danger hover:text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Clear Entire Cart
            </button>
          </div>
        </div>

        {/* Cart Summary Card */}
        <div className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm h-fit sticky top-24">
          <h3 className="font-serif text-xl font-bold text-primary mb-6 border-b border-border-light pb-3">
            Cart Summary
          </h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-text-earth">BDT {subtotal}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Delivery Fee</span>
              <span className="font-semibold text-text-earth">
                {shipping === 0 ? <span className="text-success font-bold">FREE</span> : `BDT ${shipping}`}
              </span>
            </div>
            
            {shipping > 0 && (
              <p className="text-[11px] text-text-muted bg-primary-light p-2.5 rounded-lg border border-primary/5">
                Shop for <strong className="text-primary">BDT {1000 - subtotal}</strong> more to get <strong>FREE delivery</strong>!
              </p>
            )}

            <div className="flex justify-between text-base font-extrabold text-primary border-t border-border-light pt-4 mt-4">
              <span>Total Cost</span>
              <span>BDT {total}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-secondary hover:bg-secondary-hover text-white font-bold rounded-lg hover:scale-101 active:scale-99 transition mt-6 text-center cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Checkout</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
