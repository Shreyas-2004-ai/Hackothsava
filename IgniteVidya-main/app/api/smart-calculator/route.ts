import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      console.error("No image data received");
      return NextResponse.json({ success: false, error: "No image provided" });
    }

    console.log("Image data length:", image.length);

    const googleApiKey = process.env.GOOGLE_AI_API_KEY;

    if (!googleApiKey) {
      console.error("GOOGLE_AI_API_KEY not found in environment");
      return NextResponse.json({
        success: false,
        error: "API key not configured",
      });
    }

    console.log("API key found, making request to Gemini...");

    // Add a small delay to help with rate limiting (free tier: 15 RPM)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const prompt = `You are an AI family assistant for ApnaParivar platform. Analyze this family photo or drawing and provide helpful insights.

Your tasks:
- IDENTIFY PEOPLE: Count and describe the people in the image (age groups, gender if visible)
- RELATIONSHIPS: Suggest possible family relationships based on visual cues (e.g., "appears to be parents with children", "multi-generational family")
- OCCASION: Identify if this looks like a special occasion (wedding, festival, gathering, etc.)
- DETAILS: Note any cultural elements, traditional clothing, or significant details
- SUGGESTIONS: Provide helpful suggestions for organizing this in a family tree

Respond in this exact JSON format:
{
  "result": "[Brief summary: e.g., 'Family of 5 members across 2 generations']",
  "explanation": "[Detailed analysis with relationships, occasion, cultural elements, and suggestions for family tree organization]"
}

Be respectful, culturally sensitive, and helpful!`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${googleApiKey}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 300,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      // Provide more specific error messages
      if (response.status === 429) {
        return NextResponse.json({
          success: false,
          error: "Rate limit reached. Please wait a moment and try again.",
        });
      } else if (response.status === 400) {
        return NextResponse.json({
          success: false,
          error: "Invalid request. Please try drawing again.",
        });
      }

      return NextResponse.json({
        success: false,
        error: "Failed to analyze image. Please try again.",
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Parse JSON response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          success: true,
          result: parsedResult.result,
          explanation: parsedResult.explanation,
        });
      }
    } catch (parseError) {
      return NextResponse.json({
        success: true,
        result: "See explanation",
        explanation: text,
      });
    }

    return NextResponse.json({
      success: true,
      result: "Analysis complete",
      explanation: text,
    });
  } catch (error) {
    console.error("Smart Calculator API Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to analyze image",
    });
  }
}
