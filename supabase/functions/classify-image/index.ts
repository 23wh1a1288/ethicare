import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Strip data URL prefix if present
    const base64Data = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
    const mimeMatch = imageBase64.match(/^data:(image\/\w+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an image classification system for a personal image protection platform. Analyze the provided image and classify it into EXACTLY ONE of these categories. Respond with ONLY a JSON object, no other text.

Categories:
1. "Normal Selfie" - A regular photo of a person (face visible, appropriate content). Risk: "Safe", Flagged: false
2. "Educational Content" - Diagrams, charts, infographics, cyber security content, text-heavy images. Risk: "Safe", Flagged: false  
3. "Blurred / Censored" - Image appears blurred, pixelated, or censored. May contain inappropriate content that has been obscured. Risk: "Moderate Risk", Flagged: true
4. "Face + Explicit" - Contains a recognizable face alongside explicit, inappropriate, or NSFW content. Risk: "High Risk", Flagged: true
5. "Explicit (No Face)" - Contains explicit or inappropriate content without a recognizable face. Risk: "High Risk", Flagged: true

For most normal photos (landscapes, objects, selfies, group photos, documents), classify as "Normal Selfie" or "Educational Content".

Response format (JSON only):
{"category": "...", "risk": "Safe|Moderate Risk|High Risk", "flagged": false|true, "reasoning": "brief explanation"}`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                },
              },
              {
                type: "text",
                text: "Classify this image according to the categories provided. Return only JSON.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    
    let classification;
    try {
      classification = JSON.parse(jsonStr);
    } catch {
      // Fallback if JSON parsing fails
      classification = {
        category: "Normal Selfie",
        risk: "Safe",
        flagged: false,
        reasoning: "Could not parse AI response, defaulting to safe.",
      };
    }

    return new Response(JSON.stringify(classification), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
