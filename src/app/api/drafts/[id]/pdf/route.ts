import { NextResponse } from "next/server";
import { getAuthorizedPdfDocument } from "@/lib/drafts/deliveryChannels";
import { enforceTenantAccess } from "@/lib/security/tenantGuard";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const draftId = params.id;

    // Validación perimetral multi-tenant (RF-1, RF-3)
    const authResult = enforceTenantAccess(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode }
      );
    }

    const tenantId = authResult.tenantId!;

    // Obtención de documento interceptado por RF-6
    const pdfDoc = getAuthorizedPdfDocument(tenantId, draftId);

    return new NextResponse(new Uint8Array(pdfDoc.buffer), {
      status: 200,
      headers: {
        "Content-Type": pdfDoc.contentType,
        "Content-Disposition": `attachment; filename="${pdfDoc.filename}"`,
        "Content-Length": pdfDoc.buffer.length.toString()
      }
    });
  } catch (err: any) {
    const status = err.statusCode || 500;
    return NextResponse.json(
      { error: err.message || "Error al generar PDF del borrador" },
      { status }
    );
  }
}
