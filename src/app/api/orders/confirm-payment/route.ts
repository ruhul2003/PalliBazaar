import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order, Notification } from "@/lib/models";
import { requireAuth } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { orderId, paymentIntentId } = await request.json();

    if (!orderId || !paymentIntentId) {
      return NextResponse.json(
        { error: "Order ID and Payment Intent ID are required" },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured on this server" },
        { status: 500 }
      );
    }

    // 1. Retrieve the PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json(
        { error: "Payment Intent not found on Stripe" },
        { status: 404 }
      );
    }

    // 2. Validate PaymentIntent state
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { error: `Payment failed or incomplete. Status: ${paymentIntent.status}` },
        { status: 400 }
      );
    }

    // 3. Verify metadata matching
    const metadataOrderId = paymentIntent.metadata?.orderId;
    if (metadataOrderId !== orderId) {
      return NextResponse.json(
        { error: "Payment verification mismatch: Order ID does not match metadata" },
        { status: 400 }
      );
    }

    // 4. Find the order in our database
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 5. Ensure the order belongs to the authenticated customer (or admin)
    if (order.customer.toString() !== user._id.toString() && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden access" }, { status: 403 });
    }

    // 6. Update payment status to paid
    order.paymentStatus = "paid";
    await order.save();

    // 7. Send payment confirmation notification to customer
    await Notification.create({
      recipient: order.customer,
      message: `Payment Confirmed: Your card payment for order #${order._id} has been verified successfully.`,
      type: "payment",
    });

    return NextResponse.json({
      message: "Payment verified and order updated successfully",
      order,
    });
  } catch (error: any) {
    console.error("Payment confirmation error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 });
  }
}
