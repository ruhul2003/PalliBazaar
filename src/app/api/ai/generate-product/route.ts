import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role === "customer") {
      return NextResponse.json({ error: "Unauthorized. Sellers or Admins only." }, { status: 403 });
    }

    const body = await request.json();
    const { name, categoryName, district, notes, template = "organic", length = "medium" } = body;

    if (!name) {
      return NextResponse.json({ error: "Product name is required for AI generation." }, { status: 400 });
    }

    // Determine constraints based on length
    let lengthConstraint = "approx 100 words";
    if (length === "short") lengthConstraint = "between 30 and 50 words";
    if (length === "long") lengthConstraint = "between 180 and 250 words";

    // Determine constraints based on template
    let styleGuide = "emphasize health, pesticide-free, organic purity, and natural farming.";
    if (template === "heritage") {
      styleGuide = "emphasize traditional handcrafting, cultural heritage, village artisans, and generational history.";
    } else if (template === "marketing") {
      styleGuide = "emphasize premium luxury feel, rich taste/materials, value propositions, and direct direct-from-farmer benefits.";
    }

    if (!GEMINI_API_KEY) {
      // Fallback data for demo mode when API Key is not set
      return NextResponse.json({
        description: `This premium ${name} is sourced directly from the local fields of ${district || "our villages"}. Cultivated with care using traditional methods, it offers exceptional quality and natural goodness. Perfect for families looking for authentic rural produce.`,
        shortDescription: `Fresh, high-quality ${name} direct from village producers.`,
        suggestedPriceRange: "150 - 300 BDT",
        tags: [name.toLowerCase().replace(/\s+/g, "-"), "local", district?.toLowerCase() || "rural", "organic"]
      });
    }

    const systemInstruction = `You are a professional agricultural marketing copywriter and local crafts expert for PalliBazaar, an online bazaar connecting rural Bangladeshi farmers and craftsmen directly with urban customers.
Based on the provided product details, generate high-quality product copy.
Your response MUST be a JSON object with the following fields:
- description: A rich description which is strictly ${lengthConstraint} long. Style guide: ${styleGuide}
- shortDescription: A catchy 1-2 sentence summary (max 120 characters) that acts as a hook.
- suggestedPriceRange: A text stating a fair suggested price range in BDT based on Bangladeshi agricultural/handicraft market norms.
- tags: An array of 4-6 strings of short lowercase keywords.`;

    const prompt = `Product Name: ${name}
${categoryName ? `Category: ${categoryName}` : ""}
${district ? `District of Origin: ${district}` : ""}
${notes ? `Seller Notes/Preferences: ${notes}` : ""}`;

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
              description: { type: "STRING" },
              shortDescription: { type: "STRING" },
              suggestedPriceRange: { type: "STRING" },
              tags: {
                type: "ARRAY",
                items: { type: "STRING" }
              }
            },
            required: ["description", "shortDescription", "suggestedPriceRange", "tags"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini Content Gen failed:", errorText);
      return NextResponse.json({ error: "Failed to generate content with AI." }, { status: 500 });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("No text returned from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error("AI Generate Product Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
