import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized. Please log in to analyze farm data." }, { status: 401 });
    }

    const body = await request.json();
    const { dataContent, fileName } = body;

    if (!dataContent) {
      return NextResponse.json({ error: "Data content is required for AI analysis." }, { status: 400 });
    }

    if (!GEMINI_API_KEY) {
      // Fallback demo mock report for PalliBazaar when API Key is missing
      return NextResponse.json({
        summary: "Based on the submitted report, your crop yield is showing strong growth in leafy greens, but organic honey and fruit harvests indicate a seasonal deficit in Rajshahi/Sundarbans regions.",
        metrics: [
          { name: "Total Harvest Weight", value: "480 kg", status: "Optimal", advice: "Maintain current organic fertilizer." },
          { name: "Average Yield per Acre", value: "1.2 tons", status: "Normal", advice: "Normal range for Bogra soil type." },
          { name: "Total Estimated Revenue", value: "45,500 BDT", status: "Normal", advice: "Slightly higher than last month's averages." },
          { name: "Fertilizer Conversion Efficiency", value: "78%", status: "Underperforming", advice: "Incorporate organic vermicompost." }
        ],
        risks: [
          "Soil nutrient depletion risk due to continuous paddy cultivation.",
          "Estimated market price drop for Mangoes during peak season."
        ],
        actionItems: [
          "Apply premium organic vermicompost to restore soil nitrogen levels.",
          "Rotate crops next season (plant red amaranth or mustard seeds).",
          "Log your daily moisture levels using the PalliBazaar farmer dashboard."
        ],
        recommendedCategory: "seeds"
      });
    }

    const systemInstruction = `You are a professional agricultural consultant and marketplace sales analyst for PalliBazaar.
Analyze the user's uploaded crop harvest logs, farm expense sheets, sales logs, or seed yields.
Your response MUST be a JSON object with the following fields:
- summary: A concise, insightful summary paragraph explaining the crop status or sales efficiency based on the data.
- metrics: An array of objects, each representing an analyzed metric. Each object must have fields:
  - name: string (e.g. "Total Harvest Weight")
  - value: string (e.g. "450 kg")
  - status: string ("Optimal", "Normal", "Underperforming", "Deficit")
  - advice: string (short advice for this metric)
- risks: An array of strings representing potential risks or warnings (e.g. "Soil depletion danger", "Market pricing pressure").
- actionItems: An array of 3-5 strings listing concrete agricultural or sales steps.
- recommendedCategory: A string containing the category slug matching the most relevant marketplace category: "fruits", "vegetables", "dairy", "handicrafts", "seeds", or "livestock".`;

    const prompt = `File Name: ${fileName || "harvest_report.txt"}
Raw Harvest/Sales Data Content:
${dataContent}`;

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
              summary: { type: "STRING" },
              metrics: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    name: { type: "STRING" },
                    value: { type: "STRING" },
                    status: { type: "STRING" },
                    advice: { type: "STRING" }
                  },
                  required: ["name", "value", "status", "advice"]
                }
              },
              risks: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              actionItems: {
                type: "ARRAY",
                items: { type: "STRING" }
              },
              recommendedCategory: { type: "STRING" }
            },
            required: ["summary", "metrics", "risks", "actionItems", "recommendedCategory"]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini Data Analysis failed:", errorText);
      return NextResponse.json({ error: "Failed to compile AI data analysis report." }, { status: 500 });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("No text returned from Gemini API");
    }

    const parsedResult = JSON.parse(resultText);
    return NextResponse.json(parsedResult);

  } catch (error: any) {
    console.error("AI Data Analyze Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
