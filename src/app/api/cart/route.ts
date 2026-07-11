import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Cart, Product } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

// GET /api/cart - Get user's cart populated with product details
export async function GET() {
  try {
    const user = await requireAuth();
    await dbConnect();

    let cart = await Cart.findOne({ user: user._id }).populate({
      path: "items.product",
      select: "name price images stock seller isApproved",
      populate: { path: "seller", select: "name" },
    });

    if (!cart) {
      // Return empty cart structure if none exists yet
      cart = await Cart.create({ user: user._id, items: [] });
    }

    return NextResponse.json({ cart });
  } catch (error: any) {
    console.error("Fetch cart error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// POST /api/cart - Add item to cart or update quantity
// Body: { productId, quantity }
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty)) {
      return NextResponse.json({ error: "Quantity must be a number" }, { status: 400 });
    }

    // Check if product exists and has stock
    const product = await Product.findById(productId);
    if (!product || !product.isApproved) {
      return NextResponse.json({ error: "Product not found or not approved" }, { status: 404 });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      cart = new Cart({ user: user._id, items: [] });
    }

    // Check if item already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (qty <= 0) {
      // If quantity is 0 or less, remove item from cart
      if (itemIndex > -1) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      // Check stock limit
      if (qty > product.stock) {
        return NextResponse.json(
          { error: `Cannot add more than available stock (${product.stock} items remaining)` },
          { status: 400 }
        );
      }

      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity = qty;
      } else {
        // Add new item
        cart.items.push({ product: productId as any, quantity: qty });
      }
    }

    await cart.save();

    // Populate and return updated cart
    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock seller isApproved",
    });

    return NextResponse.json({
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("Update cart error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

// DELETE /api/cart - Remove item from cart or clear entire cart
// Query or Body: { productId }
export async function DELETE(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    let cart = await Cart.findOne({ user: user._id });
    if (!cart) {
      return NextResponse.json({ message: "Cart is already empty", cart: { items: [] } });
    }

    if (productId) {
      // Remove specific product
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    } else {
      // Clear entire cart
      cart.items = [];
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name price images stock seller",
    });

    return NextResponse.json({
      message: productId ? "Product removed from cart" : "Cart cleared successfully",
      cart: updatedCart,
    });
  } catch (error: any) {
    console.error("Delete cart error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to clear/update cart" }, { status: 500 });
  }
}
