import { NextResponse } from "next/server";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { 
  getTenantNotificationConfig, 
  saveTenantNotificationConfig,
  NotificationConfig 
} from "@/lib/leads/notificationDispatcher";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    const config = getTenantNotificationConfig(tenantId);
    return NextResponse.json({ ok: true, data: config });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Error al obtener configuración de alertas" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    const body = await req.json();
    const config: NotificationConfig = {
      webhookUrl: body.webhookUrl || "",
      telegramBotToken: body.telegramBotToken || "",
      telegramChatId: body.telegramChatId || "",
      notificationEmail: body.notificationEmail || "",
      hotScoreThreshold: typeof body.hotScoreThreshold === "number" ? body.hotScoreThreshold : 80,
      telegramEnabled: Boolean(body.telegramEnabled),
      webhookEnabled: Boolean(body.webhookEnabled),
      emailEnabled: Boolean(body.emailEnabled)
    };

    saveTenantNotificationConfig(tenantId, config);

    return NextResponse.json({ ok: true, data: config });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Error al guardar configuración de alertas" },
      { status: 500 }
    );
  }
}
