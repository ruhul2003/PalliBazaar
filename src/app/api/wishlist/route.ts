import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Wishlist, Product } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

// GET /api/wishlist - Get user's wishlist populated with product details
export async function GET() {
  try {
    const user = await requireAuth();
    await dbConnect();

    let wishlist = await Wishlist.findOne({ user: user._id }).populate({
      path: "products",
      select: "name price images stock seller isApproved ratings",
      populate: { path: "seller", select: "name" },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: user._id, products: [] });
    }

    return NextResponse.json({ wishlist });
  } catch (error: any) {
    console.error("Fetch wishlist error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST /api/wishlist - Toggle product in wishlist (Add if not present, remove if present)
// Body: { productId }
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let wishlist = await Wishlist.findOne({ user: user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: user._id, products: [] });
    }

    const itemIndex = wishlist.products.findIndex(
      (id) => id.toString() === productId
    );

    let message = "";
    if (itemIndex > -1) {
      // Remove product if already exists (Toggle behavior)
      wishlist.products.splice(itemIndex, 1);
      message = "Product removed from wishlist";
    } else {
      // Add product
      wishlist.products.push(productId as any);
      message = "Product added to wishlist";
    }

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: "products",
      select: "name price images stock seller ratings",
    });

    return NextResponse.json({
      message,
      wishlist: updatedWishlist,
    });
  } catch (error: any) {
    console.error("Toggle wishlist error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}

// DELETE /api/wishlist - Remove product from wishlist
// Query parameter: ?productId=xxx
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    let wishlist = await Wishlist.findOne({ user: user._id });
    if (!wishlist) {
      return NextResponse.json({ message: "Wishlist is empty", wishlist: { products: [] } });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    const updatedWishlist = await Wishlist.findById(wishlist._id).populate({
      path: "products",
      select: "name price images stock seller ratings",
    });

    return NextResponse.json({
      message: "Product removed from wishlist",
      wishlist: updatedWishlist,
    });
  } catch (error: any) {
    console.error("Delete wishlist error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update wishlist" }, { status: 500 });
  }
}
