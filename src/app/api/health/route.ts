import { NextResponse } from "next/server";
import { ollama } from "@/lib/ollama";

export async function GET() {
  const ollamaStatus = await ollama.checkHealth();

  return NextResponse.json({
    status: "ok",
    platform: "AI BROKER",
    domain: "broker.inmobia360.com",
    ollama: {
      status: ollamaStatus,
      endpoint: process.env.OLLAMA_BASE_URL || "https://72.62.27.4",
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
      authConfigured: Boolean(process.env.OLLAMA_AUTH_PASSWORD || process.env.OLLAMA_AUTH_TOKEN)
    },
    timestamp: new Date().toISOString()
  });
}
