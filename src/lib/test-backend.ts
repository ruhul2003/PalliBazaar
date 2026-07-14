import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

                                                           
dotenv.config({ path: ".env.local" });

async function runTestAndSeed() {
  console.log("🚀 Starting PalliBazaar Backend Verification & Database Seeding...");

  try {
    const { dbConnect } = await import("./db");
    const { User, Category, Product, Order, Review, Wishlist, Cart, Notification } = await import("./models");

    await dbConnect();
    console.log("✅ Database Connection Successful!");

    console.log("\n🧹 Cleaning up previous test data...");
    await User.deleteMany({ email: /test_palli_/ });
    await Category.deleteMany({ slug: /test-category|fruits|vegetables|dairy|handicrafts|seeds|livestock/ });
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Wishlist.deleteMany({});
    await Cart.deleteMany({});
    await Notification.deleteMany({});
    console.log("🧹 DB Cleanup complete.");

                                                 
                                                        
                                                 
    console.log("\n👤 Creating Test & Demo Accounts...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const adminUser = await User.create({
      name: "Abir Hossain (Admin)",
      email: "test_palli_admin@example.com",
      passwordHash,
      role: "admin",
      isVerified: true,
      phoneNumber: "01711111111",
      addresses: [
        { street: "Sector 4", city: "Uttara", district: "Dhaka", zipCode: "1230", isDefault: true }
      ],
      isBanned: false,
    });
    console.log(`- Created Admin: ${adminUser.email}`);

    const sellerUser = await User.create({
      name: "Kazi Farm (Seller)",
      email: "test_palli_seller@example.com",
      passwordHash,
      role: "seller",
      isVerified: true,
      phoneNumber: "01722222222",
      addresses: [
        { street: "Kazi Road", city: "Jessore Sadar", district: "Jessore", zipCode: "7400", isDefault: true }
      ],
      isBanned: false,
    });
    console.log(`- Created Seller: ${sellerUser.email}`);

    const customerUser = await User.create({
      name: "Rahim Ali (Customer)",
      email: "test_palli_customer@example.com",
      passwordHash,
      role: "customer",
      isVerified: true,
      phoneNumber: "01733333333",
      addresses: [
        { street: "Mirpur 10", city: "Dhaka", district: "Dhaka", zipCode: "1216", isDefault: true }
      ],
      isBanned: false,
    });
    console.log(`- Created Customer: ${customerUser.email}`);

    // ==========================================
    // 3. CREATE CATEGORIES
    // ==========================================
    console.log("\n📂 Seeding Product Categories...");
    const categoriesData = [
      { name: "Fruits", slug: "fruits", icon: "🍎" },
      { name: "Vegetables", slug: "vegetables", icon: "🥬" },
      { name: "Dairy & Milk", slug: "dairy", icon: "🥛" },
      { name: "Handicrafts", slug: "handicrafts", icon: "🏺" },
      { name: "Seeds & Fertilizer", slug: "seeds", icon: "🌱" },
      { name: "Livestock", slug: "livestock", icon: "🐄" },
    ];

    const seededCategories = await Category.insertMany(categoriesData);
    console.log(`✅ Seeded ${seededCategories.length} categories.`);

    // Find category ids for product mapping
    const fruitCat = seededCategories.find((c) => c.slug === "fruits")!;
    const vegCat = seededCategories.find((c) => c.slug === "vegetables")!;
    const dairyCat = seededCategories.find((c) => c.slug === "dairy")!;
    const craftCat = seededCategories.find((c) => c.slug === "handicrafts")!;
    const seedCat = seededCategories.find((c) => c.slug === "seeds")!;
    const liveCat = seededCategories.find((c) => c.slug === "livestock")!;

    // ==========================================
    // 4. CREATE PRODUCTS
    // ==========================================
    const productsData = [
      // 1. FRUITS
      {
        name: "Fresh Organic Mangoes (Himsagar)",
        description: "Directly harvested from the orchards of Rajshahi. Sweet, juicy, and 100% formalin-free.",
        price: 150,
        images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600"],
        category: fruitCat._id,
        stock: 50,
        seller: sellerUser._id,
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
        seller: sellerUser._id,
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
        seller: sellerUser._id,
        district: "Khulna",
        isApproved: true,
      },
      // 2. VEGETABLES
      {
        name: "Fresh Green Chilis (Kacha Morich)",
        description: "Extra spicy, freshly plucked green chilis from Bogra. Perfect for daily cooking.",
        price: 80,
        images: ["https://images.unsplash.com/photo-1563206767-5b18f218e8de?q=80&w=600"],
        category: vegCat._id,
        stock: 100,
        seller: sellerUser._id,
        district: "Bogra",
        isApproved: true,
      },
      {
        name: "Organic Red Amaranth (Lal Shak)",
        description: "Nutrient-rich, fiber-packed fresh red amaranth leaves. Grown without chemical pesticides in Savar.",
        price: 25,
        images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=600"],
        category: vegCat._id,
        stock: 80,
        seller: sellerUser._id,
        district: "Savars",
        isApproved: true,
      },
      {
        name: "Round Green Eggplants (Gol Begun)",
        description: "Large, glossy, soft-textured green eggplants from Jamalpur. Ideal for frying and traditional bhorta.",
        price: 60,
        images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600"],
        category: vegCat._id,
        stock: 40,
        seller: sellerUser._id,
        district: "Jamalpur",
        isApproved: true,
      },
      // 3. DAIRY
      {
        name: "Desi Cow Milk (Pure)",
        description: "Fresh milk from grass-fed cows. Delivered raw and untouched.",
        price: 90,
        images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=600"],
        category: dairyCat._id,
        stock: 30,
        seller: sellerUser._id,
        district: "Jessore",
        isApproved: true,
      },
      {
        name: "Premium Pabna Ghee",
        description: "Homemade traditional clarified butter made from pure desi cow milk in Pabna. Rich aroma and texture.",
        price: 1400,
        images: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=600"],
        category: dairyCat._id,
        stock: 25,
        seller: sellerUser._id,
        district: "Pabna",
        isApproved: true,
      },
      {
        name: "Traditional Clay-Pot Dahi (Buffalo Curd)",
        description: "Authentic buffalo milk yogurt (Dahi) prepared inside clay pots in Bhola. Rich, thick, and sweet.",
        price: 220,
        images: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600"],
        category: dairyCat._id,
        stock: 15,
        seller: sellerUser._id,
        district: "Bhola",
        isApproved: true,
      },
      // 4. HANDICRAFTS
      {
        name: "Handmade Nakshi Kantha",
        description: "Exquisite traditional hand-embroidered quilt made by rural women artisans of Jessore.",
        price: 2500,
        images: ["https://images.unsplash.com/photo-1606744824163-985d376605aa?q=80&w=600"],
        category: craftCat._id,
        stock: 5,
        seller: sellerUser._id,
        district: "Jessore",
        isApproved: true,
      },
      {
        name: "Terracotta Flower Tub (Clay Pottery)",
        description: "Hand-sculpted traditional clay terracotta pot for plants. Breathable material, crafted in Rayerbazar.",
        price: 180,
        images: ["https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600"],
        category: craftCat._id,
        stock: 30,
        seller: sellerUser._id,
        district: "Dhaka",
        isApproved: true,
      },
      {
        name: "Handcrafted Bamboo Basket (Jhuri)",
        description: "Lightweight, highly durable basket hand-woven from natural bamboo strips by Sylhet craftsmen.",
        price: 120,
        images: ["https://images.unsplash.com/photo-1595475207264-40a2dfebd6c2?q=80&w=600"],
        category: craftCat._id,
        stock: 50,
        seller: sellerUser._id,
        district: "Sylhet",
        isApproved: true,
      },
      // 5. SEEDS
      {
        name: "High Yield Paddy Seeds (BRRI Dhan-28)",
        description: "Premium quality certified paddy seeds for high crop yield. Best for Boro season.",
        price: 60,
        images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600"],
        category: seedCat._id,
        stock: 500,
        seller: sellerUser._id,
        district: "Mymensingh",
        isApproved: true,
      },
      {
        name: "Organic Vermicompost Fertilizer",
        description: "100% organic, earthworm-produced compost. Excellent nutrient source for crop fields and home gardens.",
        price: 25,
        images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600"],
        category: seedCat._id,
        stock: 1000,
        seller: sellerUser._id,
        district: "Rangpur",
        isApproved: true,
      },
      {
        name: "Premium Mustard Seeds (Shorisha)",
        description: "Selected black mustard seeds for oil extraction or sowing. Yields high quality crop.",
        price: 110,
        images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600"],
        category: seedCat._id,
        stock: 200,
        seller: sellerUser._id,
        district: "Tangail",
        isApproved: true,
      },
      // 6. LIVESTOCK
      {
        name: "Healthy Black Bengal Goat",
        description: "Active, grass-fed Black Bengal goat. Ideal for farming or Eid-ul-Adha.",
        price: 12000,
        images: ["https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=600"],
        category: liveCat._id,
        stock: 3,
        seller: sellerUser._id,
        district: "Kushtia",
        isApproved: true,
      },
      {
        name: "Desi Poultry Hen (Free Range)",
        description: "Naturally reared, active free-range local hens (Desi Murgi). Healthy and organic feed.",
        price: 450,
        images: ["https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=600"],
        category: liveCat._id,
        stock: 15,
        seller: sellerUser._id,
        district: "Narsingdi",
        isApproved: true,
      },
      {
        name: "Healthy Desi Cow (Ox)",
        description: "Well-reared Desi Ox fed on organic grass, straw, and husk. Ready for field work or Qurbani.",
        price: 85000,
        images: ["https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?q=80&w=600"],
        category: liveCat._id,
        stock: 2,
        seller: sellerUser._id,
        district: "Sirajganj",
        isApproved: false, // Keeping one livestock unapproved to test Admin Approval flow
      },
    ];

    const seededProducts = await Product.insertMany(productsData);
    console.log(`✅ Seeded ${seededProducts.length} products.`);

    const mangoProduct = seededProducts.find((p) => p.name.includes("Mangoes"))!;
    const kanthaProduct = seededProducts.find((p) => p.name.includes("Nakshi"))!;
    const goatProduct = seededProducts.find((p) => p.name.includes("Goat"))!;

    // ==========================================
    // 5. TEST CART & WISHLIST CREATION
    // ==========================================
    console.log("\n🛒 Testing Cart and Wishlist operations...");
    const cart = await Cart.create({
      user: customerUser._id,
      items: [
        { product: mangoProduct._id, quantity: 3 },
        { product: kanthaProduct._id, quantity: 1 },
      ],
    });
    console.log(`- Created Cart for customer: ${cart.items.length} items added.`);

    const wishlist = await Wishlist.create({
      user: customerUser._id,
      products: [kanthaProduct._id],
    });
    console.log(`- Created Wishlist for customer: ${wishlist.products.length} products saved.`);

    // ==========================================
    // 6. CREATE ORDERS (COD and Stripe)
    // ==========================================
    console.log("\n💳 Seeding Orders...");

    // Order 1: COD, Delivered
    const order1 = await Order.create({
      customer: customerUser._id,
      items: [
        { product: mangoProduct._id, quantity: 2, price: mangoProduct.price },
      ],
      totalAmount: mangoProduct.price * 2,
      shippingAddress: {
        street: "Road 1, Block A",
        city: "Dhaka",
        district: "Dhaka",
        zipCode: "1216",
        phoneNumber: "01733333333",
      },
      paymentMethod: "cod",
      paymentStatus: "paid", // Delivered cash on delivery
      orderStatus: "delivered",
    });
    console.log(`- Seeded Order 1 (Delivered, BDT ${order1.totalAmount})`);

    // Order 2: Stripe, Pending
    const order2 = await Order.create({
      customer: customerUser._id,
      items: [
        { product: kanthaProduct._id, quantity: 1, price: kanthaProduct.price },
      ],
      totalAmount: kanthaProduct.price * 1,
      shippingAddress: {
        street: "Road 1, Block A",
        city: "Dhaka",
        district: "Dhaka",
        zipCode: "1216",
        phoneNumber: "01733333333",
      },
      paymentMethod: "stripe",
      paymentStatus: "pending",
      orderStatus: "pending",
    });
    console.log(`- Seeded Order 2 (Pending, BDT ${order2.totalAmount})`);

    // ==========================================
    // 7. CREATE REVIEWS (Verify Ratings calculation logic)
    // ==========================================
    console.log("\n⭐ Seeding Reviews and updating rating fields...");
    const review = await Review.create({
      product: mangoProduct._id,
      customer: customerUser._id,
      rating: 5,
      comment: "Absolutely amazing mangoes! Extemely sweet and fresh. Highly recommended!",
      images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600"],
    });
    console.log(`- Seeded Review for Mango product: 5 stars.`);

    // Recalculate average rating for mango product
    const mangoReviews = await Review.find({ product: mangoProduct._id });
    const count = mangoReviews.length;
    const sum = mangoReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const average = parseFloat((sum / count).toFixed(1));

    mangoProduct.ratings = { average, count };
    await mangoProduct.save();
    console.log(`✅ Product Rating Updated: ${mangoProduct.name} rating count is now ${count} with average ${average}.`);

    // ==========================================
    // 8. NOTIFICATIONS CREATION
    // ==========================================
    console.log("\n🔔 Seeding Notifications...");
    await Notification.create({
      recipient: sellerUser._id,
      message: `New Order Received: You have a new order (#${order2._id}) containing 'Handmade Nakshi Kantha'.`,
      type: "order",
    });
    await Notification.create({
      recipient: customerUser._id,
      message: `Your order #${order1._id} for amount BDT ${order1.totalAmount} has been delivered. Thank you for shopping!`,
      type: "order",
    });
    console.log("✅ Seeded Notifications.");

    // ==========================================
    // SUMMARY
    // ==========================================
    console.log("\n=======================================================");
    console.log("🔥 DATABASE VERIFICATION & SEEDING COMPLETED SUCCESSFUL!");
    console.log("=======================================================");
    console.log(`User Accounts:`);
    console.log(`  - Admin:    test_palli_admin@example.com (pw: password123)`);
    console.log(`  - Seller:   test_palli_seller@example.com (pw: password123)`);
    console.log(`  - Customer: test_palli_customer@example.com (pw: password123)`);
    console.log(`Data Seeded:`);
    console.log(`  - Categories: ${seededCategories.length}`);
    const approvedCount = seededProducts.filter((p) => p.isApproved).length;
    const pendingCount = seededProducts.filter((p) => !p.isApproved).length;
    console.log(`  - Products:   ${seededProducts.length} (${approvedCount} Approved, ${pendingCount} Pending Admin Approval)`);
    console.log(`  - Orders:     2 (1 Delivered, 1 Pending Stripe Payment)`);
    console.log(`  - Reviews:    1 (5 Star Review on Organic Mangoes)`);
    console.log("=======================================================\n");

  } catch (error) {
    console.error("❌ Test script failed with error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

runTestAndSeed();
