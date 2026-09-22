import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DraftGuard, DraftNotApprovedError, DraftGuardViolationError } from '../src/lib/security/draftGuard.ts';
import {
  prepareDeliveryChannels,
  generateWhatsAppDeepLink,
  generateMailtoLink,
  generatePdfBuffer,
  sanitizePhoneNumber,
  approveAndPrepareChannels,
  getAuthorizedPdfDocument
} from '../src/lib/drafts/deliveryChannels.ts';

describe('T8: Módulo de Aprobación Humana y Selección de Canales de Salida (RF-7)', () => {
  const tenantMadrid = '00000000-0000-4000-8000-000000000001';
  const tenantBarcelona = '00000000-0000-4000-8000-000000000002';
  const userId = 'usr-agente-madrid-01';

  beforeEach(() => {
    DraftGuard.clearForTests();
  });

  test('sanitizePhoneNumber normaliza números telefónicos para deep-link internacional', () => {
    assert.strictEqual(sanitizePhoneNumber('+34 600 12 34 56'), '34600123456');
    assert.strictEqual(sanitizePhoneNumber('612-345-678'), '612345678');
    assert.strictEqual(sanitizePhoneNumber('(+34) 91 123 45 67'), '34911234567');
  });

  test('generateWhatsAppDeepLink genera enlace seguro con texto codificado (RF-7)', () => {
    const link = generateWhatsAppDeepLink('+34 600 11 22 33', 'Contrato de Arras listo: precio 250.000 €');
    assert.ok(link.startsWith('https://wa.me/34600112233?text='));
    assert.ok(link.includes(encodeURIComponent('Contrato de Arras listo: precio 250.000 €')));
  });

  test('generateMailtoLink prepara asunto y cuerpo para correo (RF-7)', () => {
    const link = generateMailtoLink('cliente@email.com', 'Documento de Arras', 'Estimado cliente, adjuntamos borrador.');
    assert.ok(link.startsWith('mailto:cliente@email.com?subject='));
    assert.ok(link.includes('subject=' + encodeURIComponent('Documento de Arras')));
    assert.ok(link.includes('body=' + encodeURIComponent('Estimado cliente, adjuntamos borrador.')));
  });

  test('generatePdfBuffer genera un archivo PDF 1.4 válido', () => {
    const buffer = generatePdfBuffer('Contrato de Arras', 'Cláusula primera: señal de 15.000 €');
    assert.ok(Buffer.isBuffer(buffer));
    assert.ok(buffer.length > 200, 'El buffer PDF debe contener la estructura mínima');
    const header = buffer.subarray(0, 8).toString('utf-8');
    assert.ok(header.startsWith('%PDF-1.4'), 'Debe contar con encabezado estándar PDF 1.4');
  });

  test('prepareDeliveryChannels genera las 3 opciones de salida tras aprobación (RF-7)', () => {
    const draft = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'arras',
      title: 'Contrato de Arras - Gran Vía 12',
      content: 'Contrato de arras penitenciales bajo el Art. 1454 del Código Civil.'
    });

    DraftGuard.approveDraft(tenantMadrid, draft.id, userId, 'whatsapp');
    const approvedDraft = DraftGuard.getDraft(tenantMadrid, draft.id)!;

    const channels = prepareDeliveryChannels(approvedDraft, {
      phone: '+34 600 11 22 33',
      email: 'comprador@inmobia.es'
    });

    assert.strictEqual(channels.draftId, draft.id);
    assert.strictEqual(channels.documentType, 'arras');

    // 1. WhatsApp
    assert.ok(channels.whatsapp.deepLink.includes('wa.me/34600112233'));
    assert.ok(channels.whatsapp.previewText.includes('Gran Vía 12'));

    // 2. Email
    assert.ok(channels.email.mailtoLink.includes('mailto:comprador@inmobia.es'));
    assert.ok(channels.email.subject.includes('Gran Vía 12'));

    // 3. PDF
    assert.strictEqual(channels.pdf.downloadUrl, `/api/drafts/${draft.id}/pdf`);
    assert.ok(channels.pdf.filename.endsWith('.pdf'));
    assert.strictEqual(channels.pdf.contentType, 'application/pdf');
  });

  test('approveAndPrepareChannels aprueba formalmente y retorna canales listos para el agente (RF-7)', () => {
    const draft = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'lau',
      title: 'Contrato de Arrendamiento Chamberí',
      content: 'Contrato de alquiler de vivienda habitual LAU 29/1994.'
    });

    const result = approveAndPrepareChannels(tenantMadrid, draft.id, {
      approvedByUserId: userId,
      channel: 'whatsapp',
      phone: '+34 677 88 99 00',
      email: 'inquilino@test.com'
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.draft.status, 'approved');
    assert.strictEqual(result.draft.approvedBy, userId);
    assert.ok(result.deliveryChannels);
    assert.ok(result.deliveryChannels.whatsapp.deepLink.includes('34677889900'));
    assert.ok(result.deliveryChannels.pdf.downloadUrl);
    assert.ok(result.deliveryChannels.email.mailtoLink.includes('inquilino@test.com'));
  });

  test('getAuthorizedPdfDocument bloquea con DraftNotApprovedError si el borrador está pendiente (RF-6)', () => {
    const draft = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'visita',
      title: 'Hoja de Visita sin firmar',
      content: 'Hoja de visita pendiente de validación.'
    });

    assert.throws(
      () => {
        getAuthorizedPdfDocument(tenantMadrid, draft.id);
      },
      (err: any) => {
        assert.ok(err instanceof DraftNotApprovedError);
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('RF-6'));
        return true;
      }
    );
  });

  test('getAuthorizedPdfDocument genera el documento PDF una vez aprobado (RF-7)', () => {
    const draft = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'arras',
      title: 'Arras Aprobadas',
      content: 'Contrato de arras aprobado con señal.'
    });

    DraftGuard.approveDraft(tenantMadrid, draft.id, userId, 'pdf');

    const pdfDoc = getAuthorizedPdfDocument(tenantMadrid, draft.id);
    assert.strictEqual(pdfDoc.contentType, 'application/pdf');
    assert.ok(pdfDoc.filename.includes('arras'));
    assert.ok(Buffer.isBuffer(pdfDoc.buffer));
    assert.ok(pdfDoc.buffer.length > 200);
  });

  test('Aislamiento Multi-tenant: Un tenant no puede aprobar ni descargar borradores de otro (RF-1, RF-3)', () => {
    const draftMadrid = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'arras',
      title: 'Arras Madrid',
      content: 'Contenido exclusivo Madrid'
    });

    // Tenant Barcelona intenta aprobar el borrador de Madrid
    assert.throws(
      () => {
        approveAndPrepareChannels(tenantBarcelona, draftMadrid.id, {
          approvedByUserId: 'usr-barcelona',
          channel: 'pdf'
        });
      },
      (err: any) => {
        assert.ok(err instanceof DraftGuardViolationError);
        assert.ok(err.message.includes('otro tenant'));
        return true;
      }
    );

    // Tenant Barcelona intenta descargar PDF del borrador de Madrid
    assert.throws(
      () => {
        getAuthorizedPdfDocument(tenantBarcelona, draftMadrid.id);
      },
      (err: any) => {
        assert.ok(err instanceof DraftGuardViolationError);
        assert.ok(err.message.includes('inaccesible'));
        return true;
      }
    );
  });
});
