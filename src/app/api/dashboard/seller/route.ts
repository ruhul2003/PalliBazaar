import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Order, Product, Review } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

// GET /api/dashboard/seller - Fetch seller statistics & analytics
export async function GET() {
  try {
    const user = await requireAuth(["seller", "admin"]);
    await dbConnect();

    // 1. Get all products listed by this seller
    const products = await Product.find({ seller: user._id }).populate("category", "name slug");
    const productIds = products.map((p) => p._id);

    // 2. Fetch all orders containing this seller's products
    const orders = await Order.find({ "items.product": { $in: productIds } })
      .populate("customer", "name email")
      .populate("items.product", "name price seller");

    // 3. Calculate metrics:
    // Revenue is calculated from paid items only
    let revenue = 0;
    let totalItemsSold = 0;
    let pendingOrdersCount = 0;
    let deliveredOrdersCount = 0;
    const pendingOrdersList: any[] = [];
    const recentSales: any[] = [];

    orders.forEach((order) => {
      let containsSellerProduct = false;
      let orderRevenueForSeller = 0;
      let orderItemsForSeller = 0;

      order.items.forEach((item) => {
        if (item.product && (item.product as any).seller.toString() === user._id.toString()) {
          containsSellerProduct = true;
          orderItemsForSeller += item.quantity;
          if (order.paymentStatus === "paid" && order.orderStatus !== "cancelled") {
            orderRevenueForSeller += item.price * item.quantity;
          }
        }
      });

      if (containsSellerProduct) {
        if (order.orderStatus === "pending") {
          pendingOrdersCount++;
          pendingOrdersList.push({
            orderId: order._id,
            customerName: order.customer.name,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            orderStatus: order.orderStatus,
          });
        } else if (order.orderStatus === "delivered") {
          deliveredOrdersCount++;
        }

        revenue += orderRevenueForSeller;
        totalItemsSold += orderItemsForSeller;

        recentSales.push({
          orderId: order._id,
          customerName: order.customer.name,
          revenue: orderRevenueForSeller,
          itemsCount: orderItemsForSeller,
          createdAt: order.createdAt,
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
        });
      }
    });

    // Calculate rating statistics
    const ratingCount = products.reduce((acc, p) => acc + p.ratings.count, 0);
    const ratingSum = products.reduce((acc, p) => acc + p.ratings.average * p.ratings.count, 0);
    const sellerAverageRating = ratingCount > 0 ? parseFloat((ratingSum / ratingCount).toFixed(1)) : 0;

    // Fetch recent reviews for seller's products
    const reviews = await Review.find({ product: { $in: productIds } })
      .populate("customer", "name profilePicture")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      analytics: {
        revenue,
        totalItemsSold,
        totalProductsListed: products.length,
        averageRating: sellerAverageRating,
        pendingOrdersCount,
        deliveredOrdersCount,
      },
      products,
      pendingOrders: pendingOrdersList.limit ? pendingOrdersList.slice(0, 5) : pendingOrdersList,
      recentSales: recentSales.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5),
      recentReviews: reviews,
    });
  } catch (error: any) {
    console.error("Seller dashboard analytics error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden. Seller access required." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Failed to load seller metrics" }, { status: 500 });
  }
}
