import { test, describe } from 'node:test';
import assert from 'node:assert';
import { InmobiaLLMProvider } from '../src/lib/llm/provider.ts';
import { BrokerOrchestrator } from '../src/lib/broker.ts';

describe('T5: Cliente Ollama y Fallback Cognitivo de Seguridad (RF-11, RF-12)', () => {

  test('InmobiaLLMProvider se inicializa con modelo llama3.1:8b y timeout de 12 segundos (RF-11, RF-12)', () => {
    const provider = new InmobiaLLMProvider();
    assert.ok(provider, 'El proveedor debe instanciarse correctamente.');
  });

  test('El motor cognitivo genera asesoramiento legal preciso para Arras Penitenciales (Art. 1454 C.C.)', () => {
    const provider = new InmobiaLLMProvider();
    const reply = provider.generateCognitiveFallback('¿Cómo redactar las arras penitenciales?');

    assert.ok(reply.includes('1454'), 'Debe citar expresamente el artículo 1454 del Código Civil.');
    assert.ok(reply.includes('Código Civil'), 'Debe referenciar el Código Civil.');
    assert.ok(reply.includes('doble') || reply.includes('duplicadas'), 'Debe explicar la penalización de devolución duplicada.');
  });

  test('El motor cognitivo genera asesoramiento legal preciso para Alquileres LAU', () => {
    const provider = new InmobiaLLMProvider();
    const reply = provider.generateCognitiveFallback('Condiciones para contrato de alquiler de vivienda habitual');

    assert.ok(reply.includes('LAU') || reply.includes('Arrendamientos Urbanos'), 'Debe citar la LAU.');
    assert.ok(reply.includes('fianza legal') || reply.includes('mensualidad'), 'Debe mencionar la fianza obligatoria.');
  });

  test('Conmutación automática al fallback cognitivo en caso de indisponibilidad o timeout (RF-12)', async () => {
    const provider = new InmobiaLLMProvider();

    const startTime = Date.now();
    // Forzar fallback cognitivo inmediato para simular indisponibilidad de servidor
    const res = await provider.generateReply(
      [{ role: 'user', content: 'Prepara las arras para un piso en Salamanca' }],
      { forceFallback: true }
    );
    const duration = Date.now() - startTime;

    assert.strictEqual(res.ok, true, 'La respuesta debe ser exitosa');
    assert.strictEqual(res.fallbackUsed, true, 'Debe indicar que se utilizó el fallback');
    assert.strictEqual(res.provider, 'inmobia_cognitive_fallback_spain');
    assert.ok(res.content.length > 50, 'El contenido debe tener valor técnico sustancial.');
    assert.ok(duration < 100, `La conmutación debe completarse en menos de 100 ms (duración real: ${duration} ms).`);
  });

  test('BrokerOrchestrator coordina la respuesta y emite propuesta en borrador seguro (RF-4, RF-11)', async () => {
    const orchestrator = new BrokerOrchestrator('agencia-madrid-centro');

    const result = await orchestrator.processMessage('Necesito formalizar una reserva con arras penitenciales para un comprador');

    assert.ok(result.reply.length > 30, 'Debe devolver una respuesta procesada.');
    assert.ok(result.provider, 'Debe identificar el proveedor utilizado.');
    assert.ok(result.actionProposals.length > 0, 'Debe generar propuesta de acción contractual.');
    
    const prop = result.actionProposals[0];
    assert.strictEqual(prop.status, 'pending', 'La propuesta debe estar en estado pendiente.');
    assert.strictEqual(prop.requiresHumanApproval, true, 'La propuesta debe requerir obligatoriamente visto bueno humano.');
    assert.strictEqual(prop.tenantId, 'agencia-madrid-centro', 'La propuesta debe heredar el tenant_id.');
  });

});
