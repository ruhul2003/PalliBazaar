import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Review, Product } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

                                           
async function updateProductRatings(productId: string) {
  const productReviews = await Review.find({ product: productId });
  const product = await Product.findById(productId);

  if (product) {
    if (productReviews.length === 0) {
      product.ratings = { average: 0, count: 0 };
    } else {
      const count = productReviews.length;
      const sum = productReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const average = parseFloat((sum / count).toFixed(1));
      product.ratings = { average, count };
    }
    await product.save();
  }
}

                                           
                                    
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    await dbConnect();
    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

                                 
    if (review.customer.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden. You can only edit your own reviews." }, { status: 403 });
    }

    const { rating, comment, images } = await request.json();

    if (rating !== undefined) {
      const numRating = parseInt(rating, 10);
      if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return NextResponse.json({ error: "Rating must be a number between 1 and 5" }, { status: 400 });
      }
      review.rating = numRating;
    }

    if (comment) {
      review.comment = comment;
    }

    if (images) {
      review.images = images;
    }

    await review.save();

                                 
    await updateProductRatings(review.product.toString());

    return NextResponse.json({
      message: "Review updated successfully",
      review,
    });
  } catch (error: any) {
    console.error("Update review error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

                                                                 
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireAuth();
    await dbConnect();
    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

                                    
    const isOwner = review.customer.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden. You cannot delete this review." }, { status: 403 });
    }

    const productId = review.product.toString();

    await Review.findByIdAndDelete(id);

                                 
    await updateProductRatings(productId);

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete review error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
