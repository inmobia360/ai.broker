import { describe, it } from "node:test";
import assert from "node:assert";
import {
  formatWhatsAppLink,
  formatTelegramLeadMessage,
  getTenantNotificationConfig,
  saveTenantNotificationConfig,
  dispatchLeadNotification
} from "../src/lib/leads/notificationDispatcher.ts";
import type {
  LeadNotificationData,
  NotificationConfig
} from "../src/lib/leads/notificationDispatcher.ts";

describe("Notificaciones Inmediatas de Leads Calientes (Telegram / Webhook / WhatsApp)", () => {
  it("formatWhatsAppLink sanitiza el teléfono y codifica el texto para deep linking directo", () => {
    const phone = "+34 (622) 33-44-55";
    const text = "Hola Alejandro, te contacto desde Inmobia 360.";
    const link = formatWhatsAppLink(phone, text);

    assert.ok(link.startsWith("https://wa.me/34622334455?text="));
    assert.ok(link.includes("Hola%20Alejandro"));
    assert.ok(!link.includes("("));
    assert.ok(!link.includes("+"));
  });

  it("formatTelegramLeadMessage genera el mensaje Markdown con Hot Score y enlace rápido a WhatsApp", () => {
    const lead: LeadNotificationData = {
      full_name: "Isabel Domínguez",
      phone: "+34 655 443 322",
      email: "isabel@luxuryinversiones.com",
      budget: 850000,
      hot_score: 95,
      location_preference: "Salamanca, Madrid",
      property_title: "Piso Señorial en Jorge Juan",
      demand_quote: "Buscamos comprar de inmediato para destinar a alquiler premium.",
      recommended_action: "Llamada inmediata del Director Broker."
    };

    const { message, whatsAppLink } = formatTelegramLeadMessage(lead, "Inmobia 360");

    assert.ok(message.includes("🔥 *¡NUEVO LEAD CALIENTE DETECTADO!*"));
    assert.ok(message.includes("👤 *Cliente:* Isabel Domínguez"));
    assert.ok(message.includes("📞 *Teléfono:* `+34 655 443 322`"));
    assert.ok(message.includes("850.000 €"));
    assert.ok(message.includes("🎯 *Hot Score:* *95 / 100*"));
    assert.ok(message.includes("Salamanca, Madrid"));
    assert.ok(message.includes("👉 [Contactar por WhatsApp en 1 Toque]"));
    assert.ok(whatsAppLink.includes("wa.me/34655443322"));
  });

  it("getTenantNotificationConfig y saveTenantNotificationConfig aíslan la configuración por tenant", () => {
    const tenantA = "tenant-agency-madrid";
    const tenantB = "tenant-agency-barcelona";

    const customConfigA: NotificationConfig = {
      webhookUrl: "https://make.com/webhook/madrid",
      telegramBotToken: "token-madrid-123",
      telegramChatId: "chat-madrid-999",
      notificationEmail: "alerts@madrid.com",
      hotScoreThreshold: 85,
      telegramEnabled: true,
      webhookEnabled: true,
      emailEnabled: false
    };

    saveTenantNotificationConfig(tenantA, customConfigA);

    const retrievedA = getTenantNotificationConfig(tenantA);
    const retrievedB = getTenantNotificationConfig(tenantB);

    assert.strictEqual(retrievedA.telegramBotToken, "token-madrid-123");
    assert.strictEqual(retrievedA.hotScoreThreshold, 85);
    assert.strictEqual(retrievedA.telegramEnabled, true);

    // Tenant B debe tener configuración por defecto, no la de A
    assert.notStrictEqual(retrievedB.telegramBotToken, "token-madrid-123");
    assert.strictEqual(retrievedB.hotScoreThreshold, 80);
  });

  it("dispatchLeadNotification descarta alertas si el Hot Score es menor al umbral configurado", async () => {
    const tenantTest = "tenant-test-threshold";
    saveTenantNotificationConfig(tenantTest, {
      webhookUrl: "https://example.com/webhook",
      telegramBotToken: "mock-token",
      telegramChatId: "mock-chat",
      notificationEmail: "test@example.com",
      hotScoreThreshold: 80,
      telegramEnabled: true,
      webhookEnabled: true,
      emailEnabled: false
    });

    const coldLead: LeadNotificationData = {
      full_name: "Contacto Curioso",
      phone: "+34 600 112 233",
      hot_score: 65, // Menor que 80
      budget: 150000
    };

    const result = await dispatchLeadNotification(coldLead, tenantTest, "Agencia Test");
    assert.strictEqual(result.dispatched, false);
    assert.ok(result.results.reason.includes("inferior al umbral"));
  });

  it("dispatchLeadNotification procede cuando el Hot Score es >= umbral", async () => {
    const tenantTest = "tenant-test-hot";
    // Canales deshabilitados para evitar llamadas de red reales en el test
    saveTenantNotificationConfig(tenantTest, {
      webhookUrl: "",
      telegramBotToken: "",
      telegramChatId: "",
      notificationEmail: "",
      hotScoreThreshold: 80,
      telegramEnabled: false,
      webhookEnabled: false,
      emailEnabled: false
    });

    const hotLead: LeadNotificationData = {
      full_name: "Carlos Comprador Directo",
      phone: "+34 611 223 344",
      hot_score: 92, // Mayor que 80
      budget: 600000
    };

    const result = await dispatchLeadNotification(hotLead, tenantTest, "Agencia Test");
    // Al no haber canales activos devuelve dispatched: false con razón de canales no activos, pero NO fue rechazado por umbral
    assert.strictEqual(result.dispatched, false);
    assert.ok(result.results.reason.includes("Sin canales de notificación activos"));
  });
});
