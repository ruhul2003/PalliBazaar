import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order, Product, Cart, Notification } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

// GET /api/orders - Get orders (Customized by Role)
export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let query: any = {};

    // Filter by role
    if (user.role === "customer") {
      query.customer = user._id;
    } else if (user.role === "seller") {
      // Find all products belonging to this seller
      const sellerProducts = await Product.find({ seller: user._id });
      const productIds = sellerProducts.map((p) => p._id);
      query["items.product"] = { $in: productIds };
    } else if (user.role === "admin") {
      // Admin can see everything
    }

    // Optional status filter (pending, processing, shipped, delivered, cancelled)
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("customer", "name email phoneNumber")
      .populate({
        path: "items.product",
        select: "name price images seller stock",
        populate: { path: "seller", select: "name email" },
      })
      .sort({ createdAt: -1 });

    // If role is seller, filter the items in each order to only show their products
    if (user.role === "seller") {
      const sellerOrders = orders.map((order) => {
        const orderObj = order.toObject();
        orderObj.items = orderObj.items.filter(
          (item: any) => item.product && item.product.seller.toString() === user._id.toString()
        );
        return orderObj;
      });
      return NextResponse.json({ orders: sellerOrders });
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders - Place a new order
// Body: { items: [{ product, quantity }], shippingAddress, paymentMethod }
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { items, shippingAddress, paymentMethod } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.district || !shippingAddress.zipCode || !shippingAddress.phoneNumber) {
      return NextResponse.json({ error: "Complete shipping address is required" }, { status: 400 });
    }

    if (!paymentMethod || !["cod", "stripe"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    let totalAmount = 0;
    const orderItemsToCreate: any[] = [];
    const productsToUpdate: any[] = [];

    // Verify stock and calculate pricing server-side
    for (const item of items) {
      const dbProduct = await Product.findById(item.product);

      if (!dbProduct || !dbProduct.isApproved) {
        return NextResponse.json(
          { error: `Product not found or not available: ${item.product}` },
          { status: 404 }
        );
      }

      if (dbProduct.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${dbProduct.name}. Only ${dbProduct.stock} left.` },
          { status: 400 }
        );
      }

      // Add to running totals
      totalAmount += dbProduct.price * item.quantity;
      orderItemsToCreate.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: dbProduct.price, // capture current price
      });

      productsToUpdate.push({
        product: dbProduct,
        newStock: dbProduct.stock - item.quantity,
      });
    }

    // Update stock levels
    for (const update of productsToUpdate) {
      update.product.stock = update.newStock;
      await update.product.save();
    }

    // Set initial payment status
    const paymentStatus = paymentMethod === "cod" ? "pending" : "pending"; // if Stripe, pending until verified

    // Create the order
    const order = await Order.create({
      customer: user._id,
      items: orderItemsToCreate,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      orderStatus: "pending",
    });

    // Clear customer cart
    await Cart.findOneAndUpdate({ user: user._id }, { $set: { items: [] } });

    // Send notifications to sellers
    const sellerIds = new Set<string>();
    for (const update of productsToUpdate) {
      const sellerIdStr = update.product.seller.toString();
      if (!sellerIds.has(sellerIdStr)) {
        sellerIds.add(sellerIdStr);
        await Notification.create({
          recipient: update.product.seller,
          message: `New Order Received: You have a new order containing '${update.product.name}'. Order ID: ${order._id}`,
          type: "order",
        });
      }
    }

    // Send notification to customer
    await Notification.create({
      recipient: user._id,
      message: `Order Placed Successfully! Your order #${order._id} for amount BDT ${totalAmount} is confirmed.`,
      type: "order",
    });

    // Handle Mock Stripe Client response if required
    let clientSecret = "";
    if (paymentMethod === "stripe") {
      // Simulate/mock Stripe payment intent creation
      clientSecret = `mock_client_secret_for_order_${order._id}`;
      // In a real flow, you would instantiate Stripe and run:
      // const paymentIntent = await stripe.paymentIntents.create({ amount: totalAmount * 100, currency: 'bdt' });
      // clientSecret = paymentIntent.client_secret
    }

    return NextResponse.json(
      {
        message: "Order placed successfully",
        orderId: order._id,
        order,
        clientSecret, // Used for Stripe payment processing on frontend
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Place order error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
