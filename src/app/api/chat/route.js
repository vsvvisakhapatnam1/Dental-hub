import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `
You are the Dental Hub Pro AI Assistant, the official virtual assistant for "Dental Hub Pro" — India's premier specialized dental career, practice, clinic setup, and professional marketplace.
Your goal is to warmly, concisely, and professionally assist dentists, dental students, clinic owners, dental labs, and dental service providers.

Key Platform Information:
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

    // Support both AI_AGENT_API_KEY and GEMINI_API_KEY
    const rawKey =
      process.env.AI_AGENT_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_AI_AGENT_API_KEY ||
      "";
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

    // If API Key is present, call Google Gemini 1.5 Flash
    if (apiKey && apiKey !== "your_gemini_api_key_here" && apiKey !== "your_copied_api_key_here") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: SYSTEM_INSTRUCTION,
        });

        let responseText = "";
        try {
          // Attempt chat with history
          const formattedHistory = Array.isArray(history) && history.length > 0
            ? history
                .filter((h) => h && h.text && typeof h.text === "string")
                .slice(-6)
                .map((h) => ({
                  role: h.sender === "user" ? "user" : "model",
                  parts: [{ text: h.text }],
                }))
            : [];

          const chat = model.startChat({
            history: formattedHistory,
          });

          const result = await chat.sendMessage(message);
          responseText = result.response.text();
        } catch (chatError) {
          // Fallback to single-turn content generation
          const prompt = `${SYSTEM_INSTRUCTION}\n\nUser Question: ${message}`;
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
        }

        if (responseText && responseText.trim()) {
          return NextResponse.json({
            reply: responseText.trim(),
            provider: "gemini-1.5-flash",
            success: true,
          });
        }
      } catch (geminiError) {
        console.error("[Gemini AI Agent Error]:", geminiError.message || geminiError);
        return NextResponse.json({
          reply: `⚠️ AI Agent connection note: ${geminiError.message || "Failed to reach AI Agent"}. Please check your AI_AGENT_API_KEY in .env.`,
          provider: "gemini-error-fallback",
          success: true,
        });
      }
    }

    // Smart Fallback when no API Key is added yet
    const lower = message.toLowerCase().trim();
    let reply = "";

    if (lower === "hey" || lower === "hi" || lower === "hello" || lower.startsWith("hi ") || lower.startsWith("hello ")) {
      reply = "Hello! 👋 Welcome to Dental Hub Pro. I can help you find dental jobs, post practice opportunities, explore clinic spaces, or schedule a consultation. What are you looking for today?";
    } else if (lower.includes("about") || lower.includes("what is") || lower.includes("tell me about") || lower.includes("who are you")) {
      reply = "Dental Hub Pro is India's dedicated dental career, practice & clinic setup marketplace. We connect dentists, clinic owners, dental labs, and equipment suppliers with verified opportunities and turnkey clinic solutions across India!";
    } else if (lower.includes("meeting") || lower.includes("schedule") || lower.includes("appointment") || lower.includes("call") || lower.includes("consult")) {
      reply = "You can schedule a consultation with our team right away! Call or WhatsApp us directly at +91-89519 50389 or email info@dentalhubpro.com. You can also click the green WhatsApp button below to start chatting instantly.";
    } else if (lower.includes("job") || lower.includes("vacancy") || lower.includes("hiring") || lower.includes("associate") || lower.includes("bds") || lower.includes("mds")) {
      reply = "We have active Associate Dentist and Specialist openings across Hyderabad, Bengaluru, Visakhapatnam, and Mumbai! Click 'Find Opportunities' in the top navbar to browse listings and apply.";
    } else if (lower.includes("post") || lower.includes("hire") || lower.includes("recruit")) {
      reply = "You can post an associate job, specialist requirement, or clinic chair sharing opportunity by clicking 'Post Opportunity' in the top navbar. Listings reach thousands of verified dentists.";
    } else if (lower.includes("price") || lower.includes("cost") || lower.includes("fee") || lower.includes("package") || lower.includes("pricing")) {
      reply = "Our listings start from ₹999 for 30-day verified postings, and ₹2,499 for Featured listings with direct WhatsApp outreach to 500+ dental professionals. Check our 'Pricing' page for details!";
    } else if (lower.includes("clinic design") || lower.includes("setup") || lower.includes("interior") || lower.includes("equipment")) {
      reply = "We provide end-to-end dental clinic setup — from ergonomic 2D/3D operatory layouts to dental chair sourcing and AERB radiation compliance. Visit our 'Clinic Design' section or reach out at +91-89519 50389!";
    } else if (lower.includes("contact") || lower.includes("phone") || lower.includes("email") || lower.includes("support")) {
      reply = "You can reach our team directly at +91-89519 50389 or email info@dentalhubpro.com. We are based in Visakhapatnam and operate pan-India.";
    } else {
      reply = `I am your Dental Hub Pro Assistant. I can help you find BDS/MDS jobs, post clinic vacancies, source equipment, or connect with verified specialists. 

(💡 Note: To enable unrestricted dynamic AI answers for any question, paste your key from https://aistudio.google.com/app/apikey into your .env file as AI_AGENT_API_KEY=...)`;
    }

    return NextResponse.json({
      reply,
      provider: "built-in-assistant",
      note: "Add AI_AGENT_API_KEY in .env for full dynamic LLM responses",
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
