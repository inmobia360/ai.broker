import { test, describe } from 'node:test';
import assert from 'node:assert';
import { BrokerDirector } from '../src/lib/ai/brokerDirector.ts';
import { LegalSpecialistSubagent } from '../src/lib/ai/subagents/legalSpecialist.ts';
import { CommercialSpecialistSubagent } from '../src/lib/ai/subagents/commercialSpecialist.ts';
import { MarketingSpecialistSubagent } from '../src/lib/ai/subagents/marketingSpecialist.ts';
import {
  SubagentDirectAccessBlockedError,
  CanonicalMemoryWriteForbiddenError
} from '../src/lib/ai/subagents/base.ts';

describe('T6: Orquestador Central Director BROKER y Bloqueo de Subagentes (RF-4)', () => {
  const tenantId = '00000000-0000-4000-8000-000000000001';

  test('El Director BROKER se instancia y certifica el principio de Interlocutor Único (RF-4)', () => {
    const director = new BrokerDirector(tenantId);
    assert.strictEqual(director.getTenantId(), tenantId);
    assert.strictEqual(director.isSingleInterlocutorEnforced(), true);
  });

  test('Los subagentes rechazan cualquier intento de interacción directa con el usuario (RF-4)', async () => {
    const legalSpecialist = new LegalSpecialistSubagent();
    const commercialSpecialist = new CommercialSpecialistSubagent();
    const marketingSpecialist = new MarketingSpecialistSubagent();

    // 1. Asistente Legal
    await assert.rejects(
      async () => {
        await legalSpecialist.handleUserDirectly('Redáctame unas arras directamente');
      },
      (err: any) => {
        assert.ok(err instanceof SubagentDirectAccessBlockedError);
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('RF-4'));
        assert.ok(err.message.includes('Director BROKER'));
        return true;
      }
    );

    // 2. Asistente Comercial
    await assert.rejects(
      async () => {
        await commercialSpecialist.handleUserDirectly('Dime si el lead es solvente');
      },
      (err: any) => {
        assert.ok(err instanceof SubagentDirectAccessBlockedError);
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );

    // 3. Asistente de Marketing
    await assert.rejects(
      async () => {
        await marketingSpecialist.handleUserDirectly('Publica este piso en Idealista');
      },
      (err: any) => {
        assert.ok(err instanceof SubagentDirectAccessBlockedError);
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );
  });

  test('Los subagentes tienen terminantemente prohibido escribir en memoria canónica (Principio 2 Constitución)', async () => {
    const legalSpecialist = new LegalSpecialistSubagent();
    const commercialSpecialist = new CommercialSpecialistSubagent();
    const marketingSpecialist = new MarketingSpecialistSubagent();

    await assert.rejects(
      async () => {
        await legalSpecialist.writeCanonicalMemory({ regla: 'comision_5_porciento' });
      },
      (err: any) => {
        assert.ok(err instanceof CanonicalMemoryWriteForbiddenError);
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('Principio 2'));
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await commercialSpecialist.writeCanonicalMemory({ cliente: 'VIP' });
      },
      (err: any) => {
        assert.ok(err instanceof CanonicalMemoryWriteForbiddenError);
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await marketingSpecialist.writeCanonicalMemory({ portal: 'Idealista' });
      },
      (err: any) => {
        assert.ok(err instanceof CanonicalMemoryWriteForbiddenError);
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );
  });

  test('Solo el Director BROKER puede consolidar y autorizar memoria canónica', async () => {
    const director = new BrokerDirector(tenantId);
    const entry = await director.consolidateCanonicalMemory({
      category: 'policy',
      contentAnonimized: 'Política de agencia: honorarios estándar del 4% en compraventas residenciales.'
    });

    assert.ok(entry.id);
    assert.strictEqual(entry.tenantId, tenantId);
    assert.strictEqual(entry.status, 'approved');
    assert.strictEqual(entry.approvedByBroker, true);
    assert.strictEqual(entry.category, 'policy');
  });

  test('El Director BROKER delega en el especialista legal y consolida propuesta de Arras (RF-4, RF-8)', async () => {
    const director = new BrokerDirector(tenantId);
    const result = await director.processUserMessage('Necesito preparar un contrato de arras penitenciales para un piso');

    assert.ok(result.reply.length > 0);
    assert.ok(result.delegatedSpecialists.includes('legal'), 'Debe haber delegado internamente en el especialista jurídico');
    assert.ok(result.actionProposals.length > 0, 'Debe generar propuesta de acción');

    const arrasProposal = result.actionProposals.find(p => p.payload.documentType === 'arras');
    assert.ok(arrasProposal, 'Debe incluir propuesta de contrato de arras');
    assert.strictEqual(arrasProposal.requiresHumanApproval, true, 'Debe exigir aprobación humana (Modo Borrador Seguro)');
    assert.strictEqual(arrasProposal.status, 'pending');
    assert.ok(arrasProposal.payload.content.includes('1454'), 'El borrador debe incluir el Art. 1454 C.C.');
    assert.ok(arrasProposal.payload.content.includes('[PENDIENTE:'), 'Debe marcar campos ausentes como [PENDIENTE:]');
  });

  test('El Director BROKER delega en el especialista comercial ante consulta de lead (RF-4)', async () => {
    const director = new BrokerDirector(tenantId);
    const result = await director.processUserMessage('Cualifica este nuevo comprador lead que pregunta por el chalet');

    assert.ok(result.delegatedSpecialists.includes('commercial'), 'Debe haber delegado internamente en comercial');
    const qualProposal = result.actionProposals.find(p => p.payload.documentType === 'buyer_qualification');
    assert.ok(qualProposal, 'Debe incluir propuesta de cualificación');
    assert.strictEqual(qualProposal.requiresHumanApproval, true);
    assert.strictEqual(qualProposal.status, 'pending');
  });

  test('El Director BROKER delega en el especialista de marketing para publicación en Idealista (RF-4)', async () => {
    const director = new BrokerDirector(tenantId);
    const result = await director.processUserMessage('Redacta la ficha descriptiva para publicar el anuncio en Idealista');

    assert.ok(result.delegatedSpecialists.includes('marketing'), 'Debe haber delegado internamente en marketing');
    const mktProposal = result.actionProposals.find(p => p.payload.documentType === 'idealista_ad');
    assert.ok(mktProposal, 'Debe incluir propuesta de anuncio para portal');
    assert.strictEqual(mktProposal.requiresHumanApproval, true);
    assert.strictEqual(mktProposal.status, 'pending');
  });
});
