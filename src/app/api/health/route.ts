import { NextResponse } from "next/server";
import { inmobiaLLM } from "@/lib/llm/provider";

export async function GET(req: Request) {
  const host = req.headers.get("host") || "broker.inmobia360.com";
  const startedAt = Date.now();

  const testReply = await inmobiaLLM.generateReply([
    { role: "user", content: "Estado del sistema inmobia360" }
  ]);

  return NextResponse.json({
    ok: true,
    platform: "AI BROKER",
    ecosystem: "inmobia360.com",
    host,
    llm: {
      provider: testReply.provider,
      latencyMs: testReply.latencyMs,
      endpoint: process.env.OLLAMA_URL || "https://72.62.27.4/api/chat",
      model: process.env.OLLAMA_MODEL || "llama3.1:8b",
      hasApiKey: Boolean(process.env.OLLAMA_API_KEY)
    },
    timestamp: new Date().toISOString()
  });
}
