import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Product } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    await dbConnect();
    const currentUser = await getCurrentUser();
    
    const body = await request.json();
    const { goal, budget } = body;
    
    if (!goal) {
      return NextResponse.json({ error: "Goal/preference is required." }, { status: 400 });
    }
    
    // Fetch available products to feed the model
    const products = await Product.find({ isApproved: true })
      .populate("category", "name slug")
      .limit(60);
      
    const availableProductsList = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      district: p.district,
      category: (p.category as any)?.name || "General",
      stock: p.stock
    }));

    if (!GEMINI_API_KEY) {
      // Mock / fallback response in demo mode
      // Let's filter some products that match terms in the goal roughly, or pick 2-3 products
      const searchTerms = goal.toLowerCase().split(" ");
      let filtered = availableProductsList.filter(p => 
        searchTerms.some((term: string) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
      );
      
      if (filtered.length === 0) {
        filtered = availableProductsList.slice(0, 2);
      } else {
        filtered = filtered.slice(0, 3);
      }

      const totalCost = filtered.reduce((acc, p) => acc + (p.price * 1), 0);
      return NextResponse.json({
        rationale: `Since you want "${goal}", I curated this package matching local staples. (Running in Demo Mode without API Key).`,
        plan: [
          "Check the freshness of the items.",
          "Prepare your kitchen tools.",
          "Combine ingredients according to your preferred traditional recipe."
        ],
        budgetUsed: totalCost,
        items: filtered.map(p => ({
          productId: p.id,
          name: p.name,
          price: p.price,
          quantity: 1
        }))
      });
    }

    const systemInstruction = `You are the PalliBazaar Agentic Personal Shopper.
Your job is to read a customer's specific culinary or household goal (e.g. making a traditional dish for N people, decorating a room, stocking healthy vegetables) and look at the list of currently available products in the bazaar.
Design a cohesive, step-by-step shopping basket and preparation plan that fits the customer's goal and their budget (if specified).
Only recommend products from the provided "Available Products" list. Do not make up products.
Keep the quantity reasonable based on their budget and target group size.
Your response MUST be a JSON object with the following fields:
- rationale: A concise paragraph explaining why this basket and plan perfectly matches their goal/budget.
- plan: An array of 3-5 strings detailing how to utilize these items (e.g., cooking steps, setup guide).
- budgetUsed: The calculated total cost of the suggested items (sum of price * quantity for each item).
- items: An array of objects, each with:
  - productId: The exact product ID string from the list.
  - name: The name of the product.
  - price: The unit price (number).
  - quantity: The suggested purchase quantity (integer, greater than 0, must not exceed available stock).`;

    const prompt = `Customer Goal: "${goal}"
${budget ? `Target Budget limit: ${budget} BDT` : ""}

Available Products:
${JSON.stringify(availableProductsList, null, 2)}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              rationale: { type: "STRING" },
              plan: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              budgetUsed: { type: "NUMBER" },
              items: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    productId: { type: "STRING" },
                    name: { type: "STRING" },
                    price: { type: "NUMBER" },
                    quantity: { type: "NUMBER" }
                  },
                  required: ["productId", "name", "price", "quantity"]
                }
              }
            },
            required: ["rationale", "plan", "budgetUsed", "items"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini Personal Shopper failed:", errorText);
      return NextResponse.json({ error: "Failed to generate personal shopper basket." }, { status: 500 });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("No response text from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error("Personal Shopper Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
