import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  DraftGuard,
  DraftNotApprovedError,
  DraftGuardViolationError
} from '../src/lib/security/draftGuard.ts';
import { getSecurityAuditLogs, clearSecurityAuditLogsForTests } from '../src/lib/security/audit.ts';
import { BrokerDirector } from '../src/lib/ai/brokerDirector.ts';

describe('T7: Guardián de Borrador Seguro y Bloqueo de Envíos Automáticos (RF-5, RF-6)', () => {
  const tenantMadrid = '00000000-0000-4000-8000-000000000001';
  const tenantBarcelona = '00000000-0000-4000-8000-000000000002';
  const userId = 'usr-agente-madrid-01';

  beforeEach(() => {
    DraftGuard.clearForTests();
    clearSecurityAuditLogsForTests();
  });

  test('Todo borrador creado nace obligatoriamente en estado draft_pending (RF-5)', () => {
    const draft = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'arras',
      title: 'Contrato de Arras Penitenciales - Calle Alcalá 45',
      content: 'Contrato de arras conforme al Art. 1454 del Código Civil...',
      metadata: { precio: 350000 }
    });

    assert.ok(draft.id.startsWith('draft-'));
    assert.strictEqual(draft.tenantId, tenantMadrid);
    assert.strictEqual(draft.status, 'draft_pending', 'El estado inicial debe ser draft_pending');
    assert.strictEqual(draft.approvedAt, undefined, 'No debe tener fecha de aprobación previa');
    assert.strictEqual(draft.approvedBy, undefined, 'No debe tener usuario aprobador previo');
  });

  test('La creación de borrador rechaza peticiones sin tenant_id o con datos vacíos (RF-1, RF-5)', () => {
    assert.throws(
      () => {
        DraftGuard.createDraft('', {
          documentType: 'arras',
          title: 'Título',
          content: 'Contenido'
        });
      },
      (err: any) => {
        assert.ok(err instanceof DraftGuardViolationError);
        assert.ok(err.message.includes('tenant_id'));
        return true;
      }
    );

    assert.throws(
      () => {
        DraftGuard.createDraft(tenantMadrid, {
          documentType: 'arras',
          title: '',
          content: ''
        });
      },
      (err: any) => {
        assert.ok(err instanceof DraftGuardViolationError);
        return true;
      }
    );
  });

  test('El Director BROKER persiste automáticamente las propuestas en draft_pending (RF-4, RF-5)', async () => {
    const director = new BrokerDirector(tenantMadrid);
    const result = await director.processUserMessage('Genera un contrato de arras para la reserva del piso en Chamberí');

    assert.ok(result.actionProposals.length > 0);
    const proposal = result.actionProposals[0];
    const draftId = proposal.payload.draftId;

    assert.ok(draftId, 'La propuesta debe tener un draftId asociado');
    const persistedDraft = DraftGuard.getDraft(tenantMadrid, draftId);
    assert.ok(persistedDraft, 'El borrador debe estar persistido en el Guardián de Borradores');
    assert.strictEqual(persistedDraft.status, 'draft_pending', 'Debe estar en estado draft_pending');
  });

  test('Bloqueo de Envíos Automáticos: Intentar emitir un borrador no aprobado lanza DraftNotApprovedError (RF-6)', async () => {
    const draft = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'whatsapp_reply',
      title: 'Mensaje de cualificación al cliente',
      content: 'Estimado cliente, nos pondremos en contacto en 15 minutos.'
    });

    // Intentar transmitir directamente por WhatsApp sin aprobación previa
    await assert.rejects(
      async () => {
        await DraftGuard.executeSafeDispatch(tenantMadrid, draft.id, 'whatsapp', '+34600112233');
      },
      (err: any) => {
        assert.ok(err instanceof DraftNotApprovedError, 'Debe lanzar DraftNotApprovedError');
        assert.strictEqual(err.statusCode, 403);
        assert.strictEqual(err.draftStatus, 'draft_pending');
        assert.ok(err.message.includes('RF-6'));
        assert.ok(err.message.includes('Modo Borrador Seguro'));
        return true;
      }
    );

    // Comprobar que se ha registrado una alerta crítica en auditoría
    const auditLogs = getSecurityAuditLogs(tenantMadrid);
    const unapprovedAlert = auditLogs.find(l => l.eventType === 'UNAPPROVED_TRANSMISSION_ATTEMPT');
    assert.ok(unapprovedAlert, 'Debe registrar alerta UNAPPROVED_TRANSMISSION_ATTEMPT');
    assert.strictEqual(unapprovedAlert.severity, 'CRITICAL');
  });

  test('Aprobación humana (Human-in-the-Loop) permite la transmisión exterior autorizada (RF-5, RF-6)', async () => {
    const draft = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'arras',
      title: 'Arras Penitenciales aprobadas',
      content: 'Contrato definitivo de arras listo para firma.'
    });

    // 1. El usuario revisa y aprueba el borrador en 1 toque
    const approved = DraftGuard.approveDraft(tenantMadrid, draft.id, userId, 'pdf');
    assert.strictEqual(approved.status, 'approved');
    assert.strictEqual(approved.approvedBy, userId);
    assert.strictEqual(approved.channel, 'pdf');
    assert.ok(approved.approvedAt instanceof Date);

    // 2. Ahora la transmisión está permitida
    const dispatchResult = await DraftGuard.executeSafeDispatch(tenantMadrid, draft.id, 'pdf', 'notaria@madrid.es');
    assert.strictEqual(dispatchResult.success, true);
    assert.strictEqual(dispatchResult.channel, 'pdf');
    assert.strictEqual(dispatchResult.dispatchedContent, approved.content);
  });

  test('Un borrador rechazado no puede ser transmitido (RF-6)', async () => {
    const draft = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'lau',
      title: 'Borrador con cláusula no acordada',
      content: 'Contrato con cláusula no aceptada por el propietario'
    });

    DraftGuard.rejectDraft(tenantMadrid, draft.id, 'Discrepancia en fianza');

    await assert.rejects(
      async () => {
        DraftGuard.authorizeTransmission(tenantMadrid, draft.id, 'email');
      },
      (err: any) => {
        assert.ok(err instanceof DraftNotApprovedError);
        assert.strictEqual(err.draftStatus, 'rejected');
        return true;
      }
    );
  });

  test('Aislamiento Multi-tenant: Un tenant no puede acceder ni emitir borradores de otra agencia (RF-1, RF-3)', () => {
    const draftMadrid = DraftGuard.createDraft(tenantMadrid, {
      documentType: 'arras',
      title: 'Arras exclusivas Madrid',
      content: 'Contenido privado agencia Madrid'
    });

    // Tenant Barcelona intenta acceder
    const accessAttempt = DraftGuard.getDraft(tenantBarcelona, draftMadrid.id);
    assert.strictEqual(accessAttempt, null, 'No debe ser visible para otro tenant');

    // Tenant Barcelona intenta transmitir
    assert.throws(
      () => {
        DraftGuard.authorizeTransmission(tenantBarcelona, draftMadrid.id, 'whatsapp');
      },
      (err: any) => {
        assert.ok(err instanceof DraftGuardViolationError);
        assert.ok(err.message.includes('inaccesible'));
        return true;
      }
    );
  });
});
