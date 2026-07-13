import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Product, Category } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

// GET /api/products - List products with search, filter, sorting, pagination
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const district = searchParams.get("district");
    const seller = searchParams.get("seller");
    const sort = searchParams.get("sort");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    // Build query object
    // Default to listing only approved products
    const query: any = { isApproved: true };

    // Search by product name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Filter by Category (can be category ID or category slug)
    if (category) {
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        // Find category by slug
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          // If category slug is not found, return empty results
          return NextResponse.json({
            products: [],
            total: 0,
            page,
            totalPages: 0,
          });
        }
      }
    }

    // Filter by Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by District
    if (district) {
      query.district = { $regex: new RegExp(`^${district}$`, "i") };
    }

    // Filter by Seller
    if (seller) {
      query.seller = seller;
    }

    // Determine Sort options
    let sortOption: any = { createdAt: -1 }; // default: newest first
    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "popularity") {
      sortOption = { "ratings.average": -1, "ratings.count": -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate("category", "name slug")
      .populate("seller", "name profilePicture email phoneNumber")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("List products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product (Seller or Admin only)
export async function POST(request: Request) {
  try {
    // Authenticate and restrict to sellers/admins
    const user = await requireAuth(["seller", "admin"]);

    await dbConnect();
    const { name, description, price, images, category, stock, district } =
      await request.json();

    // Required fields validation
    if (!name || !description || price === undefined || !category || stock === undefined || !district) {
      return NextResponse.json(
        { error: "Name, description, price, category, stock, and district are required fields." },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "Product must have at least one image." },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return NextResponse.json(
        { error: "Specified category does not exist." },
        { status: 404 }
      );
    }

    // Set approved status: all created products are auto-approved
    const isApproved = true;

    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      images,
      category,
      stock: parseInt(stock, 10),
      seller: user._id,
      district,
      isApproved,
    });

    return NextResponse.json(
      {
        message: "Product created successfully.",
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create product error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden. Seller or Admin credentials required." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
