import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Category } from "@/lib/models";
import { requireAuth } from "@/lib/auth";

                                  
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")                         
    .replace(/[^\w\-]+/g, "")                             
    .replace(/\-\-+/g, "-")                                    
    .replace(/^-+/, "")                     
    .replace(/-+$/, "");                   
}

                                             
export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ name: 1 });
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Fetch categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

                                                         
export async function POST(request: Request) {
  try {
                                       
    await requireAuth(["admin"]);

    await dbConnect();
    const { name, slug, icon } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

                                       
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug: finalSlug }],
    });
    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name or slug already exists" },
        { status: 409 }
      );
    }

    const newCategory = await Category.create({
      name,
      slug: finalSlug,
      icon,
    });

    return NextResponse.json(
      {
        message: "Category created successfully",
        category: newCategory,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create category error:", error);
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
