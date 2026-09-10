import { NextResponse } from "next/server";
import { BrokerOrchestrator } from "@/lib/broker";

export async function POST(req: Request) {
  try {
    const host = req.headers.get("host") || "";
    // Resolucion automatica de subdominio inmobia360 (ej: broker.inmobia360.com -> inmobia360)
    let autoTenant = "inmobia360";
    if (host.includes(".inmobia360.com")) {
      autoTenant = host.split(".")[0];
    }

    const body = await req.json();
    const { message, tenantId = autoTenant, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    const orchestrator = new BrokerOrchestrator(tenantId);
    const result = await orchestrator.processMessage(message, history);

    return NextResponse.json({
      reply: result.reply,
      provider: result.provider,
      actionProposals: result.actionProposals,
      tenantId
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Error al procesar consulta con BROKER"
    }, { status: 500 });
  }
}
