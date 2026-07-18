"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ShoppingBag, Plus, Trash2, ListChecks, DollarSign, ChefHat, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

interface BasketItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShopperResult {
  rationale: string;
  plan: string[];
  budgetUsed: number;
  items: BasketItem[];
}

export default function PersonalShopperPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShopperResult | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const shopperPresets = [
    { label: "Traditional Fish Feast", desc: "Traditional Bengali fish curry ingredients" },
    { label: "Organic Breakfast", desc: "Pure dairy, honey, and fresh fruits" },
    { label: "Village Handicrafts Decor", desc: "Decorate the room with local crafts" },
    { label: "Fresh Green Salad Kit", desc: "A mix of organic veggies and lemon" }
  ];

  const handleRunShopper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) {
      toast.error("Please describe your shopping goal or select a preset.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/ai/personal-shopper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal,
          budget: budget ? parseInt(budget, 10) : undefined
        })
      });

      if (!res.ok) throw new Error("Failed to compile shopping plan");

      const data = await res.json();
      setResult(data);
      toast.success("AI Shopper compiled your curated basket!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to build basket. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBasketToCart = async () => {
    if (!result || result.items.length === 0) return;

    setAddingToCart(true);
    try {
      // Loop through all items and send POST to /api/cart
      let successCount = 0;
      for (const item of result.items) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity
          })
        });
        if (res.ok) successCount++;
      }

      if (successCount === result.items.length) {
        toast.success("🎉 Added all suggested items to your cart!");
        router.push("/cart");
      } else if (successCount > 0) {
        toast.success(`Added ${successCount} items to your cart.`);
        router.push("/cart");
      } else {
        toast.error("Failed to add items to cart.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while building your cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-bg-sand">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-75px)] py-12 px-4 sm:px-6 bg-bg-sand font-sans">
      <div className="max-w-[1000px] mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2 text-center sm:text-left">
          <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" /> Agentic AI Shopper
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary tracking-tight">AI Personal Shopper & Basket Builder</h2>
          <p className="text-text-muted text-sm md:text-base">
            Tell the AI Agent what you want to prepare or design. It searches our village listings, builds a custom basket, and lets you purchase it with a single click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Controls Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm">
              <h3 className="font-serif text-base font-bold text-primary mb-4 flex items-center gap-1.5">
                <ChefHat className="w-4.5 h-4.5 text-primary" /> Setup Your Goal
              </h3>
              
              <form onSubmit={handleRunShopper} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-earth mb-1">What is your goal?</label>
                  <textarea
                    rows={4}
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Cook traditional mustard hilsa feast for 4 guests"
                    className="w-full p-3 text-xs rounded-xl border border-border-light outline-none focus:border-primary bg-bg-sand/5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-earth mb-1">Max Budget (BDT, Optional)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full p-3 text-xs rounded-xl border border-border-light outline-none focus:border-primary bg-bg-sand/5 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg cursor-pointer transition shadow flex items-center justify-center gap-1.5 disabled:opacity-55"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Designing Basket...
                    </>
                  ) : (
                    <>Build AI Basket</>
                  )}
                </button>
              </form>
            </div>

            {/* Presets */}
            <div className="bg-white border border-border-light rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Example Ideas</span>
              <div className="flex flex-col gap-2">
                {shopperPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setGoal(preset.desc);
                      setBudget("");
                    }}
                    className="text-left p-2.5 rounded-xl border border-border-light text-xs hover:border-accent hover:bg-accent-light transition-all cursor-pointer bg-white"
                  >
                    <span className="font-bold text-primary block">{preset.label}</span>
                    <span className="text-[10px] text-text-muted mt-0.5 block">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="md:col-span-2">
            {!result && !loading && (
              <div className="bg-white border border-border-light rounded-2xl p-12 shadow-sm text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                <ShoppingBag className="w-12 h-12 text-text-muted/60 mb-4 animate-bounce" />
                <h4 className="font-serif text-lg font-bold text-primary mb-1">Your Basket Awaits</h4>
                <p className="text-xs text-text-muted max-w-sm">
                  Fill in your goal on the left or select a template to have the AI Agent assemble a fresh, rural package for you.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white border border-border-light rounded-2xl p-12 shadow-sm text-center flex flex-col items-center justify-center h-full min-h-[300px]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <h4 className="font-serif text-lg font-bold text-primary mb-1">Agent is Gathering Listings</h4>
                <p className="text-xs text-text-muted max-w-sm">
                  Checking active PalliBazaar approved items, sorting by origin, price, and matching your goal criteria...
                </p>
              </div>
            )}

            {result && (
              <div className="bg-white border border-border-light rounded-2xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
                
                {/* Rationale */}
                <div className="bg-primary-light/50 p-4 border border-primary/10 rounded-xl text-xs text-text-earth leading-relaxed">
                  <span className="font-bold text-[10px] text-text-muted uppercase block mb-1">AI Shopper Advice</span>
                  {result.rationale}
                </div>

                {/* Shopping Basket Items */}
                <div>
                  <span className="font-bold text-[10px] text-text-muted uppercase block mb-3">AI Basket Items</span>
                  <div className="overflow-x-auto rounded-xl border border-border-light">
                    <table className="w-full text-left text-xs text-text-earth border-collapse bg-white">
                      <thead>
                        <tr className="bg-primary-light text-primary font-bold border-b border-border-light">
                          <th className="py-2.5 px-4">Item Name</th>
                          <th className="py-2.5 px-4 text-center">Qty</th>
                          <th className="py-2.5 px-4 text-right">Price</th>
                          <th className="py-2.5 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light">
                        {result.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-bg-sand/10">
                            <td className="py-2.5 px-4 font-semibold">{item.name}</td>
                            <td className="py-2.5 px-4 text-center font-bold text-primary">{item.quantity}</td>
                            <td className="py-2.5 px-4 text-right">{item.price} BDT</td>
                            <td className="py-2.5 px-4 text-right font-bold">{item.price * item.quantity} BDT</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Plan Checklist */}
                <div>
                  <span className="font-bold text-[10px] text-text-muted uppercase block mb-2.5">Instructions & Recipe Steps</span>
                  <div className="space-y-2">
                    {result.plan.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-text-earth">
                        <ListChecks className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer / Action */}
                <div className="border-t border-border-light pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-text-muted uppercase block">Estimated Cost</span>
                    <span className="text-xl font-extrabold text-primary">{result.budgetUsed} BDT</span>
                  </div>

                  <button
                    onClick={handleAddBasketToCart}
                    disabled={addingToCart}
                    className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow cursor-pointer transition flex items-center gap-1.5 disabled:opacity-55"
                  >
                    {addingToCart ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding to Cart...
                      </>
                    ) : (
                      <>
                        Add Entire Basket to Cart <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
