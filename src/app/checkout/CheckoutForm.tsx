"use client";

import React, { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import { CreditCard, ArrowLeft, Loader2 } from "lucide-react";

interface CheckoutFormProps {
  orderId: string;
  totalAmount: number;
  onSuccess: (confirmedOrderId: string) => void;
  onCancel: () => void;
}

export default function CheckoutForm({
  orderId,
  totalAmount,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // 1. Confirm the payment on Stripe's side (without redirecting if possible)
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // redirect is "if_required" so we handle success directly in Next.js SPA
        },
        redirect: "if_required",
      });

      if (error) {
        // Show error to customer (e.g., card declined, incomplete details)
        const msg = error.message || "An error occurred with your payment.";
        setErrorMessage(msg);
        toast.error(msg);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // 2. Call our backend to verify the transaction
        const res = await fetch("/api/orders/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("Payment completed successfully!");
          onSuccess(orderId);
        } else {
          const msg = data.error || "Payment verification failed.";
          setErrorMessage(msg);
          toast.error(msg);
        }
      } else {
        setErrorMessage("Payment was not completed successfully.");
        toast.error("Payment status is incomplete.");
      }
    } catch (err: any) {
      console.error("Stripe confirm error:", err);
      const msg = "An unexpected error occurred during confirmation.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-border-light rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-bg-sand rounded-lg transition text-text-muted hover:text-primary cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-serif text-xl font-bold text-primary">
            Pay Securely by Card
          </h3>
          <p className="text-xs text-text-muted">
            Secure processing via Stripe
          </p>
        </div>
      </div>

      <div className="bg-primary-light border border-primary/10 rounded-xl p-4 mb-6 flex justify-between items-center">
        <span className="text-sm font-semibold text-primary">Amount to Pay</span>
        <span className="text-base font-extrabold text-primary">
          BDT {totalAmount}
        </span>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg p-3.5 mb-6 text-center font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentElement />

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={isProcessing || !stripe || !elements}
            className="w-full py-3 bg-secondary hover:bg-secondary-hover disabled:bg-secondary/60 text-white font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay BDT {totalAmount}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="w-full py-3 border border-border-light text-text-muted hover:bg-bg-sand font-bold rounded-lg transition cursor-pointer"
          >
            Cancel and Go Back
          </button>
        </div>
      </form>
    </div>
  );
}
