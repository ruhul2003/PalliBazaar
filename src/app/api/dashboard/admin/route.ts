import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User, Product, Order, Category } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

                                                                      
export async function GET() {
  try {
                                         
    await requireAuth(["admin"]);
    await dbConnect();

                    
    const totalUsers = await User.countDocuments();
    const customersCount = await User.countDocuments({ role: "customer" });
    const sellersCount = await User.countDocuments({ role: "seller" });
    const adminsCount = await User.countDocuments({ role: "admin" });
    const bannedUsersCount = await User.countDocuments({ isBanned: true });

                       
    const totalProducts = await Product.countDocuments();
    const approvedProductsCount = await Product.countDocuments({ isApproved: true });
    const pendingProductsCount = await Product.countDocuments({ isApproved: false });

                        
    const totalCategories = await Category.countDocuments();

                     
    const totalOrders = await Order.countDocuments();
    const pendingOrdersCount = await Order.countDocuments({ orderStatus: "pending" });
    const deliveredOrdersCount = await Order.countDocuments({ orderStatus: "delivered" });
    const cancelledOrdersCount = await Order.countDocuments({ orderStatus: "cancelled" });

                                               
    const paidOrders = await Order.find({ paymentStatus: "paid", orderStatus: { $ne: "cancelled" } });
    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.totalAmount, 0);

                                            
    const pendingProducts = await Product.find({ isApproved: false })
      .populate("category", "name")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    const recentUsers = await User.find()
      .select("-passwordHash -verificationToken -resetPasswordToken")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentOrders = await Order.find()
      .populate("customer", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      analytics: {
        users: {
          total: totalUsers,
          customers: customersCount,
          sellers: sellersCount,
          admins: adminsCount,
          banned: bannedUsersCount,
        },
        products: {
          total: totalProducts,
          approved: approvedProductsCount,
          pending: pendingProductsCount,
        },
        categories: {
          total: totalCategories,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrdersCount,
          delivered: deliveredOrdersCount,
          cancelled: cancelledOrdersCount,
          totalRevenue,
        },
      },
      pendingProducts,
      recentUsers,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Admin dashboard error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: "Failed to load admin stats" }, { status: 500 });
  }
}
