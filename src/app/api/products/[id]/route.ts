import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Product, Category } from "@/lib/models";
import { getCurrentUser, requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

                                                                           
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id)
      .populate("category", "name slug")
      .populate("seller", "name profilePicture email phoneNumber");

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

                                                                                 
    const similarProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isApproved: true,
    })
      .limit(4)
      .populate("category", "name slug")
      .populate("seller", "name profilePicture");

    return NextResponse.json({
      product,
      similarProducts,
    });
  } catch (error: any) {
    console.error("Fetch product details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product details" },
      { status: 500 }
    );
  }
}

                                                                     
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth(["seller", "admin"]);
    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

                                                                         
    if (user.role !== "admin" && product.seller.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Forbidden. You can only edit your own products." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const allowedUpdates = [
      "name",
      "description",
      "price",
      "images",
      "category",
      "stock",
      "district",
    ];

                     
    const updates: any = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        if (key === "price") {
          updates[key] = parseFloat(body[key]);
        } else if (key === "stock") {
          updates[key] = parseInt(body[key], 10);
        } else {
          updates[key] = body[key];
        }
      }
    }

                                      
    updates.isApproved = true;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    return NextResponse.json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

                                                                          
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth(["seller", "admin"]);
    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

                                                                         
    if (user.role !== "admin" && product.seller.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: "Forbidden. You can only delete your own products." },
        { status: 403 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Product deleted successfully.",
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
