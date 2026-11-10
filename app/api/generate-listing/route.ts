import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ListingInput = {
  productName?: string;
  brand?: string;
  category?: string;
  attributes?: string;
  description?: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const model = process.env.AI_GATEWAY_MODEL;

  if (!apiKey || !model) {
    return NextResponse.json(
      { error: "AI is not configured yet. Add AI_GATEWAY_API_KEY and AI_GATEWAY_MODEL in Vercel Environment Variables." },
      { status: 503 }
    );
  }

  let input: ListingInput;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const productName = String(input.productName ?? "").trim().slice(0, 180);
  const brand = String(input.brand ?? "").trim().slice(0, 100);
  const category = String(input.category ?? "").trim().slice(0, 100);
  const attributes = String(input.attributes ?? "").trim().slice(0, 3000);
  const description = String(input.description ?? "").trim().slice(0, 4000);

  if (!productName || !brand) {
    return NextResponse.json({ error: "Product name and exact brand are required." }, { status: 400 });
  }

  const prompt = `Prepare a cautious ecommerce listing draft from only these seller-provided facts.
Return ONLY valid JSON with keys: suggestedTitle, suggestedDescription, searchKeywords (array of 5 to 10 strings), missingInformation (array of strings).
Do not invent product specifications, certifications, health claims, pack quantity, dimensions, material, country of origin, or compatibility.
If facts are missing, list them in missingInformation and use neutral wording.
Do not claim Flipkart compliance or guarantee approval.
Seller facts:
Product name: ${productName}
Brand: ${brand}
Category: ${category}
Attributes: ${attributes || "Not supplied"}
Existing description: ${description || "Not supplied"}`;

  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You assist with accurate ecommerce listing drafts. Never fabricate product facts. Output strict JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("AI Gateway error:", response.status, detail.slice(0, 500));
      return NextResponse.json({ error: "AI provider request failed. Check the configured model and gateway credentials." }, { status: 502 });
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return NextResponse.json({ error: "AI returned an unexpected response." }, { status: 502 });
    }

    const parsed = JSON.parse(content);
    if (typeof parsed.suggestedTitle !== "string" || typeof parsed.suggestedDescription !== "string") {
      return NextResponse.json({ error: "AI response did not contain the expected listing fields." }, { status: 502 });
    }

    return NextResponse.json({
      suggestedTitle: parsed.suggestedTitle.slice(0, 250),
      suggestedDescription: parsed.suggestedDescription.slice(0, 5000),
      searchKeywords: Array.isArray(parsed.searchKeywords) ? parsed.searchKeywords.filter((v: unknown) => typeof v === "string").slice(0, 10) : [],
      missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation.filter((v: unknown) => typeof v === "string").slice(0, 15) : [],
    });
  } catch (error) {
    console.error("Listing generation failed:", error);
    return NextResponse.json({ error: "Could not generate the listing draft." }, { status: 500 });
  }
}
