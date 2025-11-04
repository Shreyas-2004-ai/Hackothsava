import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    const companionPrompt = `You are the Apna Parivar Companion, a helpful and encouraging AI assistant for family tree management.

PERSONALITY & ROLE:
- You are supportive, motivating, and inspiring while being helpful
- You help families connect and preserve their heritage
- You're knowledgeable about family tree management, genealogy, and family relationships
- You use encouraging emojis and positive language
- You believe every family's story is important and worth preserving

RESPONSE RULES:
- ALWAYS give EXACTLY 2 sentences maximum
- Be motivating and encouraging, like a supportive family advisor
- Use encouraging emojis like 🌟, 👨‍👩‍👧‍👦, 💪, 🎯, 🌳, ⚡, 🚀, 💝, 📸, etc.
- Keep it positive and inspiring, focused on family connections
- Always be helpful with family tree questions and family management
- Encourage families to document their history and connect with relatives

User query: "${message}"

Respond as the motivating Apna Parivar Companion in exactly 2 sentences with encouraging emojis! 🌟`

    // Use the API key from environment variables
    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      console.error("GOOGLE_AI_API_KEY is not set")
      return NextResponse.json(
        {
          response: "I'm experiencing configuration issues. Please make sure the API key is properly set.",
        },
        { status: 500 },
      )
    }

    // Updated API endpoint - using the correct Gemini API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`

    console.log("Making request to:", apiUrl.replace(apiKey, "***API_KEY***"))

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
                text: companionPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 100,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    })

    console.log("API Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Google AI API error:", response.status, response.statusText)
      console.error("Error details:", errorText)

      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          {
            response:
              "I'm having trouble connecting to my AI service. The API endpoint might be incorrect. Please contact support.",
          },
          { status: 500 },
        )
      } else if (response.status === 403) {
        return NextResponse.json(
          {
            response:
              "I'm having authentication issues. Please check if the API key is valid and has proper permissions.",
          },
          { status: 500 },
        )
      } else if (response.status === 429) {
        return NextResponse.json(
          {
            response: "I'm receiving too many requests right now. Please wait a moment and try again.",
          },
          { status: 429 },
        )
      }

      return NextResponse.json(
        {
          response: "I'm having trouble connecting to my knowledge base right now. Please try again in a moment!",
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("API Response data:", JSON.stringify(data, null, 2))

    let aiResponse =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here to help you manage your family tree! 🌟 Let's work together to connect your family members and preserve your heritage! 💪"

    // Clean up the response
    aiResponse = aiResponse.trim()

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Apna Parivar Companion API error:", error)
    return NextResponse.json(
      {
        response:
          "I'm experiencing some technical difficulties right now. Please try again in a moment, and I'll be back to help you with your family tree! 🚀",
      },
      { status: 500 },
    )
  }
}
