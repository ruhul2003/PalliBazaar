import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order, Product, Notification } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/orders/[id] - Fetch single order detail & tracking info
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id)
      .populate("customer", "name email phoneNumber")
      .populate({
        path: "items.product",
        select: "name price images seller stock",
        populate: { path: "seller", select: "name email" },
      });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization checks:
    // 1. Customer who placed it
    // 2. Seller who owns a product in it
    // 3. Admin
    const isCustomer = order.customer._id.toString() === user._id.toString();
    const isSeller = order.items.some(
      (item: any) => item.product && item.product.seller.toString() === user._id.toString()
    );
    const isAdmin = user.role === "admin";

    if (!isCustomer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: "Forbidden access to this order" }, { status: 403 });
    }

    // If seller, filter items to only show seller's products
    if (user.role === "seller" && !isAdmin) {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(
        (item: any) => item.product && item.product.seller.toString() === user._id.toString()
      );
      return NextResponse.json({ order: orderObj });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Fetch order detail error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}

// PUT /api/orders/[id] - Cancel order (Customer) or update status (Seller/Admin)
// Body: { orderStatus, paymentStatus }
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id).populate("items.product");
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const { orderStatus, paymentStatus } = await request.json();

    const isCustomer = order.customer.toString() === user._id.toString();
    const isSeller = order.items.some(
      (item: any) => item.product && item.product.seller.toString() === user._id.toString()
    );
    const isAdmin = user.role === "admin";

    if (!isCustomer && !isSeller && !isAdmin) {
      return NextResponse.json({ error: "Forbidden access to this order" }, { status: 403 });
    }

    // CASE 1: Customer cancelling order (only if currently pending)
    if (orderStatus === "cancelled" && isCustomer && !isAdmin && !isSeller) {
      if (order.orderStatus !== "pending") {
        return NextResponse.json(
          { error: "Order can only be cancelled while it is pending." },
          { status: 400 }
        );
      }

      // Restore stock levels
      for (const item of order.items) {
        if (item.product) {
          const product = await Product.findById(item.product._id);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
      }

      order.orderStatus = "cancelled";
      await order.save();

      // Create notification for sellers
      const sellerIds = new Set<string>();
      for (const item of order.items) {
        if (item.product) {
          const sellerIdStr = (item.product as any).seller.toString();
          if (!sellerIds.has(sellerIdStr)) {
            sellerIds.add(sellerIdStr);
            await Notification.create({
              recipient: (item.product as any).seller,
              message: `Order Cancelled: Order #${order._id} containing your products was cancelled by the customer.`,
              type: "order",
            });
          }
        }
      }

      return NextResponse.json({
        message: "Order cancelled successfully and stock restored.",
        order,
      });
    }

    // CASE 2: Seller or Admin updating status
    if (isSeller || isAdmin) {
      if (orderStatus) {
        // Validate transition
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
        if (!validStatuses.includes(orderStatus)) {
          return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
        }

        // If transitioning to cancelled, restore stock (if not already done)
        if (orderStatus === "cancelled" && order.orderStatus !== "cancelled") {
          for (const item of order.items) {
            if (item.product) {
              const product = await Product.findById(item.product._id);
              if (product) {
                product.stock += item.quantity;
                await product.save();
              }
            }
          }
        }

        // If delivered, automatically mark COD payment status as paid
        if (orderStatus === "delivered" && order.paymentMethod === "cod") {
          order.paymentStatus = "paid";
        }

        order.orderStatus = orderStatus;
      }

      if (paymentStatus) {
        const validPaymentStatuses = ["pending", "paid", "failed"];
        if (!validPaymentStatuses.includes(paymentStatus)) {
          return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
        }
        order.paymentStatus = paymentStatus;
      }

      await order.save();

      // Notify customer of order status update
      await Notification.create({
        recipient: order.customer,
        message: `Order Status Update: Your order #${order._id} status is now: '${order.orderStatus}' (Payment: '${order.paymentStatus}').`,
        type: "order",
      });

      return NextResponse.json({
        message: "Order status updated successfully",
        order,
      });
    }

    return NextResponse.json({ error: "Unauthorized to update status" }, { status: 403 });
  } catch (error: any) {
    console.error("Update order status error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
