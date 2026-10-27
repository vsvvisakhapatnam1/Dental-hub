import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `
You are the Dental Hub Pro AI Assistant, the official virtual assistant for "Dental Hub Pro" — India's premier specialized dental career, practice, clinic setup, and professional marketplace.
Your goal is to warmly, concisely, and professionally assist dentists, dental students, clinic owners, dental labs, and dental service providers.

Key Platform Information you know:
- Mission: One Platform. Every Dental Opportunity in India.
- For Dentists/Job Seekers: Free registration, browse full-time/part-time BDS & MDS associate dentist jobs, consultant positions, fellowship & MDS seats, overseas licensing opportunities (e.g. UAE/Dubai).
- For Clinics & Employers: Post opportunities (jobs, partnerships, clinic chair space sharing), search verified dentists & specialists, source verified dental labs and equipment.
- Clinic Setup & Design: Turnkey clinic architecture, ergonomic operatory layouts, radiation compliance, dental chairs & RVG sourcing.
- Verification: Multi-tier verification (Mobile, Email, Qualification, State Council Credential, Clinic & Organisation).
- Contact Info: Email info@dentalhubpro.com | Phone / WhatsApp: +91-89519 50389 | Location: Visakhapatnam, Hyderabad, Bengaluru, Mumbai & Pan-India.

Style: Friendly, concise, professional, encouraging. Keep responses within 2-4 sentences unless detailed assistance is specifically requested.
`;

export async function POST(req) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.AI_AGENT_API_KEY || "";

    // If Gemini API Key is configured, use Google Gemini Flash (Fast & Free)
    if (apiKey && apiKey !== "your_gemini_api_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: SYSTEM_INSTRUCTION,
        });

        // Format history if available
        const chat = model.startChat({
          history: Array.isArray(history)
            ? history.slice(-6).map((h) => ({
                role: h.sender === "user" ? "user" : "model",
                parts: [{ text: h.text }],
              }))
            : [],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return NextResponse.json({
          reply: responseText,
          provider: "gemini-1.5-flash",
          success: true,
        });
      } catch (geminiError) {
        console.warn("[Gemini API Error, using intelligent fallback]:", geminiError.message);
      }
    }

    // Intelligent Instant Fallback (works immediately even before user pastes API key)
    const lower = message.toLowerCase();
    let reply = "";

    if (lower.includes("job") || lower.includes("vacancy") || lower.includes("hiring") || lower.includes("associate")) {
      reply = "We have active Associate Dentist & Specialist openings across Hyderabad, Bengaluru, Chennai, and Mumbai! You can explore and apply under 'Find Opportunities' on our top menu, or let me know your preferred city!";
    } else if (lower.includes("post") || lower.includes("hire") || lower.includes("clinic space")) {
      reply = "You can easily post an opening or clinic space by clicking the 'Post Opportunity' button on the navbar. It takes less than 2 minutes to reach thousands of verified dental professionals!";
    } else if (lower.includes("price") || lower.includes("cost") || lower.includes("package") || lower.includes("pricing")) {
      reply = "Our listings start from ₹999 for 30-day standard listings, and ₹2,499 for Featured listings with WhatsApp outreach to 500+ dentists. Check our 'Pricing' page for full details!";
    } else if (lower.includes("contact") || lower.includes("call") || lower.includes("phone") || lower.includes("support")) {
      reply = "You can reach our team directly at +91-89519 50389 or email us at info@dentalhubpro.com. You can also click the WhatsApp button to chat with our staff!";
    } else if (lower.includes("clinic design") || lower.includes("setup") || lower.includes("interior") || lower.includes("equipment")) {
      reply = "We provide end-to-end clinic setup services — from CAD operatory layouts to equipment sourcing and AERB radiation compliance. Visit our 'Clinic Design' section to schedule a consultation!";
    } else {
      reply = "Hello! I am your Dental Hub Pro Assistant. I can help you find dental jobs, post practice opportunities, explore clinic spaces, or connect with verified specialists across India. How can I assist you today?";
    }

    return NextResponse.json({
      reply,
      provider: "built-in-assistant",
      note: apiKey ? "Gemini activated" : "Add GEMINI_API_KEY in .env for custom dynamic generation",
      success: true,
    });
  } catch (error) {
    console.error("[Chat API Error]:", error);
    return NextResponse.json(
      {
        reply: "Hello! Thank you for reaching out to Dental Hub Pro. Our support team is available at +91-89519 50389 or info@dentalhubpro.com. How can we help you today?",
        success: true,
      },
      { status: 200 }
    );
  }
}
