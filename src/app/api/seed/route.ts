import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User, Category, Product, Order, Review, Wishlist, Cart, Notification } from "@/lib/models";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET() {
  try {
    await dbConnect();
    console.log("✅ API Seed: Database Connected.");

    // Clear all test data
    const dbConnection = mongoose.connection.db;
    if (dbConnection) {
      await dbConnection.collection("accounts").deleteMany({});
      await dbConnection.collection("sessions").deleteMany({});
    }

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Wishlist.deleteMany({});
    await Cart.deleteMany({});
    await Notification.deleteMany({});
    console.log("🧹 DB Cleanup complete.");

    // 1. Create Test Accounts
    const adminSignUp = await auth.api.signUpEmail({
      body: {
        name: "Abir Hossain (Admin)",
        email: "test_palli_admin@example.com",
        password: "password123",
      }
    });
    const adminUser = await User.findByIdAndUpdate(
      adminSignUp.user.id,
      {
        role: "admin",
        isVerified: true,
        phoneNumber: "01711111111",
        addresses: [
          { street: "Sector 4", city: "Uttara", district: "Dhaka", zipCode: "1230", isDefault: true }
        ],
        isBanned: false,
      },
      { new: true }
    );

    const sellerSignUp = await auth.api.signUpEmail({
      body: {
        name: "Kazi Farm (Seller)",
        email: "test_palli_seller@example.com",
        password: "password123",
      }
    });
    const sellerUser = await User.findByIdAndUpdate(
      sellerSignUp.user.id,
      {
        role: "seller",
        isVerified: true,
        phoneNumber: "01722222222",
        addresses: [
          { street: "Kazi Road", city: "Jessore Sadar", district: "Jessore", zipCode: "7400", isDefault: true }
        ],
        isBanned: false,
      },
      { new: true }
    );

    const customerSignUp = await auth.api.signUpEmail({
      body: {
        name: "Rahim Ali (Customer)",
        email: "test_palli_customer@example.com",
        password: "password123",
      }
    });
    const customerUser = await User.findByIdAndUpdate(
      customerSignUp.user.id,
      {
        role: "customer",
        isVerified: true,
        phoneNumber: "01733333333",
        addresses: [
          { street: "Mirpur 10", city: "Dhaka", district: "Dhaka", zipCode: "1216", isDefault: true }
        ],
        isBanned: false,
      },
      { new: true }
    );

    // Seed Categories
    const categoriesData = [
      { name: "Fruits", slug: "fruits", icon: "🍎" },
      { name: "Vegetables", slug: "vegetables", icon: "🥬" },
      { name: "Dairy & Milk", slug: "dairy", icon: "🥛" },
      { name: "Handicrafts", slug: "handicrafts", icon: "🏺" },
      { name: "Seeds & Fertilizer", slug: "seeds", icon: "🌱" },
      { name: "Livestock", slug: "livestock", icon: "🐄" },
    ];

    const seededCategories = await Category.insertMany(categoriesData);

    const fruitCat = seededCategories.find((c) => c.slug === "fruits")!;
    const vegCat = seededCategories.find((c) => c.slug === "vegetables")!;
    const dairyCat = seededCategories.find((c) => c.slug === "dairy")!;
    const craftCat = seededCategories.find((c) => c.slug === "handicrafts")!;
    const seedCat = seededCategories.find((c) => c.slug === "seeds")!;
    const liveCat = seededCategories.find((c) => c.slug === "livestock")!;

    // Seed Products
    const productsData = [
      {
        name: "Fresh Organic Mangoes (Himsagar)",
        description: "Directly harvested from the orchards of Rajshahi. Sweet, juicy, and 100% formalin-free.",
        price: 150,
        images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600"],
        category: fruitCat._id,
        stock: 50,
        seller: sellerUser?._id,
        district: "Rajshahi",
        isApproved: true,
      },
      {
        name: "Sweet Organic Jackfruit (Kathal)",
        description: "Freshly harvested jackfruit from the hilly areas of Gazipur. Famous for sweet, firm, and golden-yellow pulp.",
        price: 350,
        images: ["https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=600"],
        category: fruitCat._id,
        stock: 15,
        seller: sellerUser?._id,
        district: "Gazipur",
        isApproved: true,
      },
      {
        name: "Natural Honey (Sundarbans)",
        description: "Pure multi-floral honey collected by Mouals from the Sundarbans mangrove forest.",
        price: 850,
        images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=600"],
        category: fruitCat._id,
        stock: 20,
        seller: sellerUser?._id,
        district: "Khulna",
        isApproved: true,
      },
      {
        name: "Fresh Green Chilis (Kacha Morich)",
        description: "Extra spicy, freshly plucked green chilis from Bogra. Perfect for daily cooking.",
        price: 80,
        images: ["https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=600"],
        category: vegCat._id,
        stock: 100,
        seller: sellerUser?._id,
        district: "Bogra",
        isApproved: true,
      },
      {
        name: "Organic Red Amaranth (Lal Shak)",
        description: "Nutrient-rich, fiber-packed fresh red amaranth leaves. Grown without chemical pesticides.",
        price: 25,
        images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=600"],
        category: vegCat._id,
        stock: 80,
        seller: sellerUser?._id,
        district: "Dhaka",
        isApproved: true,
      },
      {
        name: "Desi Cow Milk (Pure)",
        description: "Fresh milk from grass-fed cows. Delivered raw and untouched.",
        price: 90,
        images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600"],
        category: dairyCat._id,
        stock: 30,
        seller: sellerUser?._id,
        district: "Jessore",
        isApproved: true,
      },
      {
        name: "Premium Pabna Ghee",
        description: "Homemade traditional clarified butter made from pure desi cow milk in Pabna. Rich aroma.",
        price: 1400,
        images: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=600"],
        category: dairyCat._id,
        stock: 25,
        seller: sellerUser?._id,
        district: "Pabna",
        isApproved: true,
      },
      {
        name: "Handmade Nakshi Kantha",
        description: "Exquisite traditional hand-embroidered quilt made by rural women artisans of Jessore.",
        price: 2500,
        images: ["https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=600"],
        category: craftCat._id,
        stock: 5,
        seller: sellerUser?._id,
        district: "Jessore",
        isApproved: true,
      },
      {
        name: "High Yield Paddy Seeds (BRRI Dhan-28)",
        description: "Premium quality certified paddy seeds for high crop yield. Best for Boro season.",
        price: 60,
        images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600"],
        category: seedCat._id,
        stock: 500,
        seller: sellerUser?._id,
        district: "Mymensingh",
        isApproved: true,
      },
      {
        name: "Healthy Black Bengal Goat",
        description: "Active, grass-fed Black Bengal goat. Ideal for farming or Qurbani.",
        price: 12000,
        images: ["https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=600"],
        category: liveCat._id,
        stock: 3,
        seller: sellerUser?._id,
        district: "Kushtia",
        isApproved: true,
      }
    ];

    const seededProducts = await Product.insertMany(productsData);
    const mangoProduct = seededProducts.find((p) => p.name.includes("Mangoes"))!;

    // Cart & Wishlist
    await Cart.create({
      user: customerUser?._id,
      items: [{ product: mangoProduct._id, quantity: 2 }]
    });
    await Wishlist.create({
      user: customerUser?._id,
      products: [mangoProduct._id]
    });

    // Orders
    await Order.create({
      customer: customerUser?._id,
      items: [{ product: mangoProduct._id, quantity: 2, price: mangoProduct.price }],
      totalAmount: mangoProduct.price * 2,
      shippingAddress: {
        street: "Sector 4, Road 12",
        city: "Dhaka",
        district: "Dhaka",
        zipCode: "1230",
        phoneNumber: "01733333333"
      },
      paymentMethod: "cod",
      paymentStatus: "paid",
      orderStatus: "delivered"
    });

    // Reviews
    await Review.create({
      product: mangoProduct._id,
      customer: customerUser?._id,
      rating: 5,
      comment: "Absolutely amazing mangoes! Extremely sweet and fresh. Highly recommended!",
      images: []
    });

    // Update ratings count/average on Mango Product
    mangoProduct.ratings = { average: 5.0, count: 1 };
    await mangoProduct.save();

    return NextResponse.json({
      success: true,
      message: "PalliBazaar Original Database Seeding Successful!",
      accounts: {
        admin: "test_palli_admin@example.com",
        doctor: "test_palli_seller@example.com",
        patient: "test_palli_customer@example.com"
      }
    });
  } catch (error: any) {
    console.error("API Seed Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
