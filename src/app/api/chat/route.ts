import { NextResponse } from "next/server";
import { BrokerOrchestrator } from "@/lib/broker";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, tenantId = "tenant-inmobia360", history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const orchestrator = new BrokerOrchestrator(tenantId);
    const result = await orchestrator.processMessage(message, history);

    return NextResponse.json({
      reply: result.reply,
      actionProposals: result.actionProposals,
      tenantId
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Error al procesar consulta con BROKER"
    }, { status: 500 });
  }
}
