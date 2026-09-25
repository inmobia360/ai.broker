import { NextResponse } from "next/server";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { 
  getTenantNotificationConfig, 
  sendTelegramAlert, 
  sendWebhookNotification,
  formatTelegramLeadMessage,
  LeadNotificationData
} from "@/lib/leads/notificationDispatcher";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    const body = await req.json().catch(() => ({}));
    const currentConfig = getTenantNotificationConfig(tenantId);

    // Permitir probar parámetros enviados directamente en el body o los ya guardados
    const webhookUrl = body.webhookUrl || currentConfig.webhookUrl;
    const telegramBotToken = body.telegramBotToken || currentConfig.telegramBotToken;
    const telegramChatId = body.telegramChatId || currentConfig.telegramChatId;
    const agencyName = body.agencyName || "Inmobia 360 Real Estate Tech";

    const testLead: LeadNotificationData = {
      id: "lead-test-simulated",
      full_name: "Alejandro Mendoza (Inversor - Prueba)",
      phone: "+34 622 334 455",
      email: "amendoza.inversiones@gmail.com",
      location_preference: "Gran Vía, Madrid",
      property_title: "Ático Exclusivo en Gran Vía",
      budget: 700000,
      timeframe: "Ahora",
      demand_quote: "Hola, me interesa mucho este ático. Cuento con 700.000€ al contado y desearía agendar una visita privada.",
      hot_score: 98,
      recommended_action: "Llamar en menos de 15 minutos para formalizar visita y transferir dossier.",
      created_at: new Date()
    };

    const results: Record<string, any> = {};

    // 1. Probar Telegram si se facilitaron credenciales
    if (telegramBotToken && telegramChatId) {
      const { message } = formatTelegramLeadMessage(testLead, agencyName);
      const testMsg = `🧪 *[NOTIFICACIÓN DE PRUEBA]*\n\n${message}`;
      const tgRes = await sendTelegramAlert(telegramBotToken, telegramChatId, testMsg);
      results["telegram"] = tgRes;
    } else {
      results["telegram"] = { success: false, message: "Faltan credenciales de Telegram (Token o Chat ID)" };
    }

    // 2. Probar Webhook si se facilitó URL
    if (webhookUrl) {
      const webhookPayload = {
        event: "lead.hot_detected.test",
        is_test: true,
        timestamp: new Date().toISOString(),
        agency: agencyName,
        tenant_id: tenantId,
        lead: testLead
      };
      const hookRes = await sendWebhookNotification(webhookUrl, webhookPayload);
      results["webhook"] = hookRes;
    } else {
      results["webhook"] = { success: false, message: "No se configuró Webhook URL" };
    }

    const anySuccess = (results["telegram"]?.success || results["webhook"]?.success);

    return NextResponse.json({
      ok: anySuccess || false,
      message: anySuccess 
        ? "Prueba de alerta ejecutada correctamente en los canales disponibles"
        : "No se pudo entregar la alerta de prueba. Verifica las credenciales.",
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Error al emitir alerta de prueba" },
      { status: 500 }
    );
  }
}
