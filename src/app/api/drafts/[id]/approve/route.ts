import { NextResponse } from "next/server";
import { approveAndPrepareChannels } from "@/lib/drafts/deliveryChannels";
import { enforceTenantAccess } from "@/lib/security/tenantGuard";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const draftId = params.id;
    const body = await req.json();
    const { tenantId: bodyTenantId, approvedByUserId, channel = "pdf", phone, email } = body;

    // Validación perimetral multi-tenant (RF-1, RF-3)
    const authResult = enforceTenantAccess(req, bodyTenantId);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode }
      );
    }

    const tenantId = authResult.tenantId!;

    // Aprobación humana explícita y generación de canales de salida (RF-7)
    const result = approveAndPrepareChannels(tenantId, draftId, {
      approvedByUserId,
      channel,
      phone,
      email
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json(
      { error: err.message || "Error al aprobar borrador" },
      { status }
    );
  }
}
