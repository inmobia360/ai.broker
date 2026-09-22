import { DraftGuard } from "../security/draftGuard.ts";
import type { DraftRecord } from "../security/draftGuard.ts";

export interface DeliveryChannelsResult {
  draftId: string;
  documentType: string;
  title: string;
  whatsapp: {
    deepLink: string;
    recipientPhone?: string;
    previewText: string;
  };
  email: {
    mailtoLink: string;
    recipientEmail?: string;
    subject: string;
    body: string;
  };
  pdf: {
    downloadUrl: string;
    filename: string;
    contentType: string;
  };
}

/**
 * Limpia y normaliza números de teléfono para deep-link de WhatsApp Web/App.
 * Ejemplo: "+34 600 12 34 56" -> "34600123456"
 */
export function sanitizePhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly;
}

/**
 * Genera el deep-link directo para remitir el documento por WhatsApp en 1 toque (RF-7).
 */
export function generateWhatsAppDeepLink(phone: string, message: string): string {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message);
  return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/?text=${encodedText}`;
}

/**
 * Genera el enlace mailto con asunto y cuerpo preparados para el cliente de correo del agente (RF-7).
 */
export function generateMailtoLink(email: string, subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
}

/**
 * Genera un buffer binario PDF 1.4 válido y autónomo sin dependencias nativas externas pesadas.
 */
export function generatePdfBuffer(title: string, content: string): Buffer {
  // Limpieza y escape de caracteres para sintaxis de streams PDF
  const sanitizedTitle = title.replace(/[()\\]/g, "");
  const lines = content.split("\n").slice(0, 45); // Paginación básica para el borrador

  let textStream = `BT\n/F1 16 Tf\n50 780 Td\n(${sanitizedTitle}) Tj\nET\n`;
  textStream += `BT\n/F1 10 Tf\n50 750 Td\n14 TL\n`;

  for (const line of lines) {
    const escapedLine = line.replace(/[()\\]/g, "\\$&");
    textStream += `(${escapedLine}) '\n`;
  }
  textStream += `ET\n`;

  const streamLength = Buffer.byteLength(textStream, "utf-8");

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${textStream}endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000${(300 + streamLength).toString().padStart(3, "0")} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${400 + streamLength}
%%EOF`;

  return Buffer.from(pdf, "utf-8");
}

/**
 * Prepara los tres canales de salida (WhatsApp, Email, PDF) una vez aprobado el borrador (RF-7).
 */
export function prepareDeliveryChannels(
  draft: DraftRecord,
  options?: { phone?: string; email?: string }
): DeliveryChannelsResult {
  const phone = options?.phone || "";
  const email = options?.email || "";

  // 1. Mensaje de WhatsApp: resumen formal con enlace o texto ejecutivo
  const whatsappPreview = `Estimado cliente, le adjunto el documento '${draft.title}' preparado por nuestra dirección de agencia para su revisión y conformidad:\n\n${draft.content.substring(0, 500)}...`;
  const whatsappLink = generateWhatsAppDeepLink(phone, whatsappPreview);

  // 2. Correo electrónico: Asunto corporativo y cuerpo completo
  const emailSubject = `Documentación Inmobiliaria: ${draft.title}`;
  const emailBody = `Estimado cliente,\n\nLe remitimos la documentación acordada:\n\n${draft.content}\n\nQuedamos a su disposición para cualquier aclaración.\nAtentamente,\nDirección de Agencia Inmobiliaria.`;
  const mailtoLink = generateMailtoLink(email, emailSubject, emailBody);

  // 3. Exportación a PDF: Descarga oficial
  const filename = `${draft.documentType}_${draft.id.substring(draft.id.lastIndexOf("-") + 1)}.pdf`;
  const pdfDownloadUrl = `/api/drafts/${draft.id}/pdf`;

  return {
    draftId: draft.id,
    documentType: draft.documentType,
    title: draft.title,
    whatsapp: {
      deepLink: whatsappLink,
      recipientPhone: phone || undefined,
      previewText: whatsappPreview
    },
    email: {
      mailtoLink,
      recipientEmail: email || undefined,
      subject: emailSubject,
      body: emailBody
    },
    pdf: {
      downloadUrl: pdfDownloadUrl,
      filename,
      contentType: "application/pdf"
    }
  };
}

/**
 * Servicio unificado de aprobación humana y preparación de canales de salida (RF-7).
 */
export function approveAndPrepareChannels(
  tenantId: string,
  draftId: string,
  params: {
    approvedByUserId: string;
    channel?: "whatsapp" | "email" | "pdf";
    phone?: string;
    email?: string;
  }
) {
  if (!params.approvedByUserId || typeof params.approvedByUserId !== "string") {
    throw new Error("Se requiere el identificador de usuario que autoriza (approvedByUserId)");
  }

  const channel = params.channel || "pdf";
  const approvedDraft = DraftGuard.approveDraft(tenantId, draftId, params.approvedByUserId, channel);
  const deliveryChannels = prepareDeliveryChannels(approvedDraft, {
    phone: params.phone,
    email: params.email
  });

  return {
    success: true,
    message: "Borrador aprobado formalmente. Canales de salida preparados.",
    draft: approvedDraft,
    deliveryChannels
  };
}

/**
 * Obtiene el archivo PDF autorizado para descarga, interceptando borradores no aprobados (RF-6, RF-7).
 */
export function getAuthorizedPdfDocument(tenantId: string, draftId: string) {
  const approvedDraft = DraftGuard.authorizeTransmission(tenantId, draftId, "pdf");
  const pdfBuffer = generatePdfBuffer(approvedDraft.title, approvedDraft.content);
  const filename = `${approvedDraft.documentType}_${approvedDraft.id.substring(approvedDraft.id.lastIndexOf("-") + 1)}.pdf`;

  return {
    buffer: pdfBuffer,
    filename,
    contentType: "application/pdf"
  };
}

