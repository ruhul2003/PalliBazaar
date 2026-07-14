import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Review, Product, Order, Notification } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

                                                        
                                   
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const reviews = await Review.find({ product: productId })
      .populate("customer", "name profilePicture")
      .sort({ createdAt: -1 });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

                                                                                               
                                               
export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    await dbConnect();

    const { productId, rating, comment, images } = await request.json();

    if (!productId || rating === undefined || !comment) {
      return NextResponse.json(
        { error: "Product ID, rating, and comment are required fields" },
        { status: 400 }
      );
    }

    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

                               
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

                                                                               
    const purchaseCount = await Order.countDocuments({
      customer: user._id,
      orderStatus: "delivered",
      "items.product": productId,
    });

    if (purchaseCount === 0) {
      return NextResponse.json(
        { error: "You can only review products that you have purchased and received." },
        { status: 403 }
      );
    }

                                                     
    const existingReview = await Review.findOne({
      product: productId,
      customer: user._id,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product. You can update your existing review." },
        { status: 409 }
      );
    }

                           
    const review = await Review.create({
      product: productId,
      customer: user._id,
      rating: numRating,
      comment,
      images: images || [],
    });

                                                            
    const productReviews = await Review.find({ product: productId });
    const count = productReviews.length;
    const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const average = parseFloat((sum / count).toFixed(1));

    product.ratings = { average, count };
    await product.save();

                       
    await Notification.create({
      recipient: product.seller,
      message: `New Product Review: Your product '${product.name}' was rated ${numRating} stars by ${user.name}.`,
      type: "review",
    });

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Submit review error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
