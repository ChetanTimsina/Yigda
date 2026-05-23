import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/chatbot-knowledge";

export const runtime = "nodejs";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

export async function POST(request) {
  try {
    const { messages } = await request.json();
    if (!Array.isArray(messages) || !messages.length) {
      return NextResponse.json({ error: "messages array is required." }, { status: 400 });
    }

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama error ${response.status}: ${text}`);
    }

    const data = await response.json();
    const reply = data?.message?.content || "Sorry, I could not generate a response.";
    return NextResponse.json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chatbot request failed.";
    const isOffline = message.includes("ECONNREFUSED") || message.includes("fetch failed");
    return NextResponse.json(
      { error: isOffline ? "Ollama is not running. Start it with: ollama serve" : message },
      { status: 502 }
    );
  }
}
