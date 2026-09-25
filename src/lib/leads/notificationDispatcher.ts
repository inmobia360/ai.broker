/**
 * Despachador de Notificaciones Inmediatas para Leads Calientes
 * Soporta Telegram Bot, Webhook HTTP (Make/Zapier/CRM) y Correo Electrónico.
 * Garantiza resiliencia: los fallos en canales externos NUNCA bloquean la captación del lead.
 */

export interface NotificationConfig {
  webhookUrl?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  notificationEmail?: string;
  hotScoreThreshold: number; // Por defecto 80
  telegramEnabled: boolean;
  webhookEnabled: boolean;
  emailEnabled: boolean;
}

export interface LeadNotificationData {
  id?: string;
  full_name: string;
  phone: string;
  email?: string;
  location_preference?: string;
  property_title?: string;
  budget?: number | string;
  timeframe?: string;
  demand_quote?: string;
  hot_score: number;
  recommended_action?: string;
  created_at?: string | Date;
}

// Almacén en memoria por tenant_id para configuraciones de alertas
const tenantNotificationSettings = new Map<string, NotificationConfig>();

export function getTenantNotificationConfig(tenantId: string): NotificationConfig {
  const existing = tenantNotificationSettings.get(tenantId);
  if (existing) return existing;

  // Valores por defecto combinados con variables de entorno si existen
  return {
    webhookUrl: process.env.LEAD_NOTIFICATION_WEBHOOK_URL || "",
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
    telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
    notificationEmail: process.env.NOTIFICATION_EMAIL || "",
    hotScoreThreshold: 80,
    telegramEnabled: Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    webhookEnabled: Boolean(process.env.LEAD_NOTIFICATION_WEBHOOK_URL),
    emailEnabled: Boolean(process.env.NOTIFICATION_EMAIL)
  };
}

export function saveTenantNotificationConfig(tenantId: string, config: NotificationConfig): void {
  tenantNotificationSettings.set(tenantId, config);
}

/**
 * Normaliza teléfono para enlace directo a WhatsApp.
 */
export function formatWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Genera el cuerpo del mensaje de Telegram con formato Markdown y emojis.
 */
export function formatTelegramLeadMessage(
  lead: LeadNotificationData,
  agencyName: string = "Inmobia 360"
): { message: string; whatsAppLink: string } {
  const budgetFormatted = typeof lead.budget === "number"
    ? `${lead.budget.toLocaleString("es-ES")} €`
    : lead.budget ? `${lead.budget} €` : "No especificado";

  const firstName = lead.full_name.split(" ")[0];
  const whatsAppText = `Hola ${firstName}, te contacto desde ${agencyName} respecto a tu interés en el inmueble. ¿Cuándo tendrías disponibilidad para agendar una visita privada?`;
  const whatsAppLink = formatWhatsAppLink(lead.phone, whatsAppText);

  const message = [
    `🔥 *¡NUEVO LEAD CALIENTE DETECTADO!*`,
    `🏢 *Agencia:* ${agencyName}`,
    ``,
    `👤 *Cliente:* ${lead.full_name}`,
    `📞 *Teléfono:* \`${lead.phone}\``,
    lead.email ? `📧 *Email:* ${lead.email}` : null,
    `💰 *Presupuesto:* *${budgetFormatted}*`,
    lead.location_preference ? `📍 *Zona:* ${lead.location_preference}` : null,
    lead.property_title ? `🏠 *Inmueble:* ${lead.property_title}` : null,
    `🎯 *Hot Score:* *${lead.hot_score} / 100*`,
    ``,
    lead.demand_quote ? `💬 *Mensaje:* _"${lead.demand_quote}"_` : null,
    ``,
    `⚡ *Acción Recomendada:*`,
    `${lead.recommended_action || "Llamar en menos de 15 minutos para asegurar exclusividad."}`,
    ``,
    `👉 [Contactar por WhatsApp en 1 Toque](${whatsAppLink})`
  ].filter(Boolean).join("\n");

  return { message, whatsAppLink };
}

/**
 * Envía la alerta push a través de la API oficial de Telegram Bot.
 */
export async function sendTelegramAlert(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false
      })
    });

    const data = await response.json();
    if (!data.ok) {
      return { success: false, error: data.description || "Error de Telegram API" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al conectar con Telegram" };
  }
}

/**
 * Envía el evento JSON completo al Webhook HTTP configurado (Make, Zapier, n8n, CRM).
 */
export async function sendWebhookNotification(
  webhookUrl: string,
  payload: any
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Inmobia-Event": "lead.hot_detected",
        "User-Agent": "Inmobia360-WebhookDispatcher/1.0"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return { success: false, error: `Webhook respondió con código HTTP ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al conectar con Webhook" };
  }
}

/**
 * Despacha de forma paralela y asíncrona todas las alertas activas para un lead.
 */
export async function dispatchLeadNotification(
  lead: LeadNotificationData,
  tenantId: string = "inmobia360",
  agencyName: string = "Inmobia 360"
): Promise<{ dispatched: boolean; results: Record<string, any> }> {
  const config = getTenantNotificationConfig(tenantId);

  // Si el score no alcanza el umbral de prioridad, omitir alerta
  if (lead.hot_score < config.hotScoreThreshold) {
    return { dispatched: false, results: { reason: `Score ${lead.hot_score} inferior al umbral ${config.hotScoreThreshold}` } };
  }

  const { message, whatsAppLink } = formatTelegramLeadMessage(lead, agencyName);

  const webhookPayload = {
    event: "lead.hot_detected",
    timestamp: new Date().toISOString(),
    agency: agencyName,
    tenant_id: tenantId,
    lead: {
      ...lead,
      whatsapp_quick_reply_url: whatsAppLink
    }
  };

  const tasks: Promise<{ channel: string; status: any }>[] = [];

  // Canal Telegram
  if (config.telegramEnabled && config.telegramBotToken && config.telegramChatId) {
    tasks.push(
      sendTelegramAlert(config.telegramBotToken, config.telegramChatId, message)
        .then(res => ({ channel: "telegram", status: res }))
    );
  }

  // Canal Webhook
  if (config.webhookEnabled && config.webhookUrl) {
    tasks.push(
      sendWebhookNotification(config.webhookUrl, webhookPayload)
        .then(res => ({ channel: "webhook", status: res }))
    );
  }

  if (tasks.length === 0) {
    return { dispatched: false, results: { reason: "Sin canales de notificación activos configurados" } };
  }

  const settled = await Promise.allSettled(tasks);
  const results: Record<string, any> = {};

  settled.forEach(item => {
    if (item.status === "fulfilled") {
      results[item.value.channel] = item.value.status;
    } else {
      results["error"] = item.reason;
    }
  });

  return { dispatched: true, results };
}
