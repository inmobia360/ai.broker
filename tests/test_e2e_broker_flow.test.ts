import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { createInvitation, acceptInvitationAndRegister } from '../src/lib/auth/invitations.ts';
import { BrokerDirector } from '../src/lib/ai/brokerDirector.ts';
import { DraftGuard, DraftNotApprovedError } from '../src/lib/security/draftGuard.ts';
import { approveAndPrepareChannels, getAuthorizedPdfDocument } from '../src/lib/drafts/deliveryChannels.ts';
import { AgencyVectorStore } from '../src/lib/db/vectorStore.ts';
import { clearSecurityAuditLogsForTests } from '../src/lib/security/audit.ts';

describe('T13: Verificación End-to-End del Flujo Institucional AI BROKER (RF-1 a RF-13)', () => {
  const tenantMadrid = '00000000-0000-4000-8000-000000000001';
  const tenantBarcelona = '00000000-0000-4000-8000-000000000002';
  const directorEmail = 'director@inmobiamadrid.com';
  const agentEmail = 'carlos.agente@inmobiamadrid.com';

  beforeEach(() => {
    DraftGuard.clearForTests();
    AgencyVectorStore.clearForTests();
    clearSecurityAuditLogsForTests();
  });

  test('Flujo Completo: Invitación -> Registro -> Consulta Broker -> Arras 1454 C.C. -> Borrador Seguro -> Visto Bueno -> Canales Salida -> Memoria Vectorial', async () => {
    // ------------------------------------------------------------------------
    // PASO 1: Registro e Invitación Multi-tenant (RF-1, RF-2, RF-3)
    // ------------------------------------------------------------------------
    const invitation = createInvitation({
      tenantId: tenantMadrid,
      email: agentEmail,
      role: 'agent'
    });
    assert.ok(invitation.token, 'Debe generar token de invitación');

    const registration = acceptInvitationAndRegister({
      token: invitation.token,
      fullName: 'Carlos Ruiz',
      password: 'PasswordSeguro123!'
    });
    assert.ok(registration.user, 'El usuario registrado debe existir');
    assert.strictEqual(registration.user.tenantId, tenantMadrid);
    assert.strictEqual(registration.user.email, agentEmail);
    const agentUserId = registration.user.id;

    // ------------------------------------------------------------------------
    // PASO 2: Interlocutor Único Director BROKER e Inferencia (RF-4, RF-11, RF-12)
    // ------------------------------------------------------------------------
    const director = new BrokerDirector(tenantMadrid);
    assert.strictEqual(director.isSingleInterlocutorEnforced(), true);

    const brokerQuery = 'Tengo una reserva para la compraventa del piso en Gran Vía 42 por 320.000 €. Señal acordada de 32.000 € en arras penitenciales. Prepara el contrato.';
    const brokerResponse = await director.processUserMessage(brokerQuery);

    assert.ok(brokerResponse.reply.length > 0, 'El Broker debe responder con criterio directivo');
    assert.ok(brokerResponse.delegatedSpecialists.includes('legal'), 'Debe delegar en especialista legal');
    assert.ok(brokerResponse.actionProposals.length > 0, 'Debe formular propuestas en borrador');

    // ------------------------------------------------------------------------
    // PASO 3: Generador de Arras y Modo Borrador Seguro (RF-5, RF-6, RF-8)
    // ------------------------------------------------------------------------
    const arrasProposal = brokerResponse.actionProposals.find(p => p.payload.documentType === 'arras');
    assert.ok(arrasProposal, 'Debe existir la propuesta de arras penitenciales');
    assert.strictEqual(arrasProposal.requiresHumanApproval, true, 'Inviolable: debe requerir visto bueno');

    const draftId = arrasProposal.payload.draftId;
    assert.ok(draftId, 'El borrador debe estar persistido');

    // Verificación de contenido legal Art. 1454 C.C.
    const rawDraft = DraftGuard.getDraft(tenantMadrid, draftId)!;
    assert.strictEqual(rawDraft.status, 'draft_pending', 'El estado inicial debe ser draft_pending');
    assert.ok(rawDraft.content.includes('1454 DEL CÓDIGO CIVIL'), 'Debe citar el Art. 1454 C.C.');
    assert.ok(rawDraft.content.includes('ARRAS PENITENCIALES'));

    // Verificación de Bloqueo de Emisión no autorizada (RF-6)
    assert.throws(
      () => {
        getAuthorizedPdfDocument(tenantMadrid, draftId);
      },
      (err: any) => {
        assert.ok(err instanceof DraftNotApprovedError);
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('RF-6'));
        return true;
      }
    );

    // ------------------------------------------------------------------------
    // PASO 4: Visto Bueno Humano y Generación Multicanal (RF-7)
    // ------------------------------------------------------------------------
    const approvalResult = approveAndPrepareChannels(tenantMadrid, draftId, {
      approvedByUserId: agentUserId,
      channel: 'whatsapp',
      phone: '+34 655 44 33 22',
      email: 'comprador@inversion.com'
    });

    assert.strictEqual(approvalResult.success, true);
    assert.strictEqual(approvalResult.draft.status, 'approved');
    assert.strictEqual(approvalResult.draft.approvedBy, agentUserId);

    // Comprobar enlace de WhatsApp listo para 1 toque
    assert.ok(approvalResult.deliveryChannels.whatsapp.deepLink.includes('34655443322'));
    assert.ok(approvalResult.deliveryChannels.whatsapp.deepLink.startsWith('https://wa.me/'));

    // Comprobar exportación a PDF ahora permitida
    const pdfDoc = getAuthorizedPdfDocument(tenantMadrid, draftId);
    assert.strictEqual(pdfDoc.contentType, 'application/pdf');
    assert.ok(pdfDoc.buffer.length > 200);

    // ------------------------------------------------------------------------
    // PASO 5: Memoria Canónica y Búsqueda Vectorial Aislada (RF-13, Principio 2)
    // ------------------------------------------------------------------------
    const memoryRecord = await director.consolidateCanonicalMemory({
      category: 'procedure',
      contentAnonimized: 'Expediente Gran Vía 42: Compraventa formalizada con arras penitenciales de 32.000 €.'
    });
    assert.strictEqual(memoryRecord.approvedByBroker, true);

    await AgencyVectorStore.insertDocument(
      tenantMadrid,
      'Expediente Gran Vía 42: Inmueble reservado mediante contrato de arras penitenciales Art. 1454 CC.',
      { expedienteId: 'MAD-GV-42', draftId }
    );

    // Búsqueda en Madrid recupera el expediente
    const searchMadrid = await AgencyVectorStore.searchSimilar(
      tenantMadrid,
      'arras penitenciales en Gran Vía'
    );
    assert.ok(searchMadrid.length > 0);
    assert.strictEqual(searchMadrid[0].document.tenantId, tenantMadrid);

    // Búsqueda idéntica en Barcelona NO recupera nada de Madrid (Cero fugas)
    const searchBarcelona = await AgencyVectorStore.searchSimilar(
      tenantBarcelona,
      'arras penitenciales en Gran Vía'
    );
    assert.strictEqual(searchBarcelona.length, 0, 'Barcelona no debe tener acceso a los contratos de Madrid');
  });
});
