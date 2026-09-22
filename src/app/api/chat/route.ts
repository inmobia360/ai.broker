import { NextResponse } from "next/server";
import { BrokerDirector } from "@/lib/ai/brokerDirector";
import { enforceTenantAccess } from "@/lib/security/tenantGuard";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, tenantId: bodyTenantId, history = [] } = body;

    // Validación perimetral de seguridad multi-tenant (RF-1, RF-3)
    const authResult = enforceTenantAccess(req, bodyTenantId);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode }
      );
    }

    const verifiedTenantId = authResult.tenantId!;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
    }

    // Canalización exclusiva a través del Director BROKER (RF-4)
    const director = new BrokerDirector(verifiedTenantId);
    const result = await director.processUserMessage(message, history);

    return NextResponse.json({
      reply: result.reply,
      provider: result.provider,
      actionProposals: result.actionProposals,
      delegatedSpecialists: result.delegatedSpecialists,
      tenantId: verifiedTenantId
    });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Error al procesar consulta con BROKER"
    }, { status: 500 });
  }
}
