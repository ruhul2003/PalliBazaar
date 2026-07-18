import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Product, Category, Cart, Order } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const SYSTEM_INSTRUCTION = `You are the PalliBazaar AI Assistant, a friendly, warm, and highly knowledgeable local village bazaar helper.
Your job is to assist users in navigating PalliBazaar, finding local farm-fresh crops, dairy, organic honey, handwoven crafts, and healthy livestock, answering questions, checking their orders/cart, and giving advice on prices or local districts (e.g., Jessore, Rajshahi, Sundarbans).
Keep your tone warm, welcoming, helpful, and community-oriented, fitting a direct rural-to-urban marketplace.
If a search yields no results, suggest alternative keywords or ask if they'd like to browse other categories.
For navigation, guide users to:
- '/shop' to browse listings.
- '/analyzer' to analyze crop yields or sales sheets.
- '/cart' to review checkout.
- '/items/add' to add new products (for sellers).`;

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: "searchProducts",
        description: "Search products in the marketplace database using name/query, category, price range, and district.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "Search term/keyword for the product name (e.g. 'milk', 'honey', 'rice')" },
            category: { type: "STRING", description: "Category slug or name (e.g. 'fruits', 'vegetables', 'dairy', 'handicrafts')" },
            minPrice: { type: "NUMBER", description: "Minimum price in BDT" },
            maxPrice: { type: "NUMBER", description: "Maximum price in BDT" },
            district: { type: "STRING", description: "District/location of origin (e.g. 'Jessore', 'Rajshahi', 'Dhaka', 'Khulna')" }
          }
        }
      },
      {
        name: "getCategories",
        description: "Retrieve list of all product categories available on PalliBazaar.",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      },
      {
        name: "getUserCartAndOrders",
        description: "Get the current logged-in user's cart items and their recent order history. Use this when they ask about their cart, checkout, or recent purchases.",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      }
    ]
  }
];

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request payload. 'messages' array is required." }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        response: "Hello! I am the PalliBazaar AI Assistant. (Note: GEMINI_API_KEY is not configured in .env.local, running in demo mode). How can I help you explore our local village products today?",
        suggestedPrompts: [
          "Browse categories",
          "What is PalliBazaar?",
          "How do I sell my crops?"
        ]
      });
    }

    const currentUser = await getCurrentUser();

    // Map conversation history to Gemini format
    const contents: any[] = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    const executeTool = async (name: string, args: any) => {
      switch (name) {
        case "searchProducts": {
          const query: any = { isApproved: true };
          if (args.query) {
            query.name = { $regex: args.query, $options: "i" };
          }
          if (args.category) {
            const cat = await Category.findOne({
              $or: [
                { name: { $regex: args.category, $options: "i" } },
                { slug: { $regex: args.category, $options: "i" } }
              ]
            });
            if (cat) query.category = cat._id;
          }
          if (args.minPrice || args.maxPrice) {
            query.price = {};
            if (args.minPrice) query.price.$gte = args.minPrice;
            if (args.maxPrice) query.price.$lte = args.maxPrice;
          }
          if (args.district) {
            query.district = { $regex: new RegExp(`^${args.district}$`, "i") };
          }

          const products = await Product.find(query)
            .populate("category", "name slug")
            .limit(5);

          return {
            products: products.map(p => ({
              id: p._id,
              name: p.name,
              price: p.price,
              district: p.district,
              shortDescription: p.shortDescription || p.description.substring(0, 80),
              category: (p.category as any)?.name || "General",
              image: p.images?.[0] || ""
            }))
          };
        }

        case "getCategories": {
          const categories = await Category.find({});
          return {
            categories: categories.map(c => ({ name: c.name, slug: c.slug }))
          };
        }

        case "getUserCartAndOrders": {
          if (!currentUser) {
            return { error: "User is not logged in. Tell them they need to sign in to view their cart or orders." };
          }
          const cart = await Cart.findOne({ user: currentUser._id }).populate("items.product");
          const orders = await Order.find({ customer: currentUser._id })
            .populate("items.product")
            .sort({ createdAt: -1 })
            .limit(3);

          return {
            cart: cart ? cart.items.map((i: any) => ({
              productName: i.product?.name || "Unknown Product",
              quantity: i.quantity,
              price: i.product?.price || 0
            })) : [],
            orders: orders.map(o => ({
              orderId: o._id,
              totalAmount: o.totalAmount,
              paymentStatus: o.paymentStatus,
              orderStatus: o.orderStatus,
              createdAt: o.createdAt,
              items: o.items.map((i: any) => ({
                productName: i.product?.name || "Unknown Product",
                quantity: i.quantity
              }))
            }))
          };
        }

        default:
          return { error: `Tool ${name} not found.` };
      }
    };

    // First API call to Gemini
    let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        tools: TOOLS
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API call failed:", errorText);
      return NextResponse.json({ error: "Failed to communicate with AI model." }, { status: 500 });
    }

    let data = await response.json();
    let candidate = data.candidates?.[0];
    let part = candidate?.content?.parts?.[0];

    // If Gemini requested a function call
    if (part?.functionCall) {
      const { name, args } = part.functionCall;
      console.log(`AI Agent executing tool: ${name}`, args);

      const toolResult = await executeTool(name, args);

      contents.push(candidate.content);
      contents.push({
        role: "function",
        parts: [{
          functionResponse: {
            name,
            response: { result: toolResult }
          }
        }]
      });

      // Second API call to Gemini
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          tools: TOOLS
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API second call failed:", errorText);
        return NextResponse.json({ error: "Failed to resolve AI response after tool execution." }, { status: 500 });
      }

      data = await response.json();
      candidate = data.candidates?.[0];
      part = candidate?.content?.parts?.[0];
    }

    const aiResponseText = part?.text || "I'm sorry, I couldn't process that request.";

    const suggestedPrompts = [];
    if (aiResponseText.toLowerCase().includes("product") || aiResponseText.toLowerCase().includes("search") || aiResponseText.toLowerCase().includes("find")) {
      suggestedPrompts.push("Show livestock in Rajshahi", "Show handicrafts", "What organic honey is available?");
    } else if (currentUser) {
      suggestedPrompts.push("Check my cart", "Show my last orders", "What fresh fruits do you have?");
    } else {
      suggestedPrompts.push("What is PalliBazaar?", "Browse fresh crops", "How do I list a product?");
    }

    return NextResponse.json({
      response: aiResponseText,
      suggestedPrompts
    });

  } catch (error: any) {
    console.error("Error in AI Chat Route:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
