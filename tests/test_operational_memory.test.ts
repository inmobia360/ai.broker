import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { OperationalMemoryStore } from '../src/lib/memory/operationalMemoryStore.ts';

describe('T7: Memoria Operativa Estructurada y Aprendizaje de Casos Resueltos (RF-M8)', () => {
  const tenantA = 'agencia-valencia-centro';
  const tenantB = 'agencia-zaragoza-norte';

  test('Permite registrar casos resueltos en las 4 categorías operativas', async () => {
    const memory = await OperationalMemoryStore.recordCaseMemory({
      tenantId: tenantA,
      category: 'negociacion_objeciones',
      title: 'Objeción por falta de ascensor en finca clásica',
      problemDescription: 'El comprador argumenta que un 3º sin ascensor no vale 220.000 € y ofrece 190.000 €.',
      solutionApplied: 'Se aportó el acta de la comunidad con proyecto de instalación de ascensor ya aprobado y derrama asumida por el vendedor en arras, cerrando en 212.000 €.',
      tags: ['ascensor', 'derrama', 'objecion_precio']
    });

    assert.ok(memory.id.startsWith('mem-'));
    assert.strictEqual(memory.tenantId, tenantA);
    assert.strictEqual(memory.category, 'negociacion_objeciones');
    assert.strictEqual(memory.embedding.length, 768);
  });

  test('Recupera por similitud semántica casos previos para enriquecer la respuesta del Broker (RAG)', async () => {
    // Consulta de un agente con un problema similar sobre ascensor y derrama
    const query = 'Tengo un comprador que regatea el precio porque el edificio no tiene ascensor en la finca';
    const similar = await OperationalMemoryStore.retrieveSimilarCases(tenantA, query, { minSimilarity: 0.50 });

    assert.ok(similar.length > 0);
    const topCase = similar[0];
    assert.ok(topCase.similarityScore >= 0.50);
    assert.strictEqual(topCase.record.title, 'Objeción por falta de ascensor en finca clásica');
    assert.ok(topCase.record.solutionApplied.includes('acta de la comunidad'));

    // Formateo del contexto few-shot
    const contextPrompt = OperationalMemoryStore.formatFewShotContext(similar);
    assert.ok(contextPrompt.includes('EXPERIENCIA PREVIA Y CASOS SIMILARES'));
    assert.ok(contextPrompt.includes('Solución exitosa demostrada'));
  });

  test('Garantiza aislamiento estricto: Una agencia jamás accede a la memoria de otra agencia competidora', async () => {
    // Registrar caso confidencial en Tenant B
    await OperationalMemoryStore.recordCaseMemory({
      tenantId: tenantB,
      category: 'politicas_comerciales',
      title: 'Comisión reducida para promotor local',
      problemDescription: 'Acuerdo especial de 1.5% para cartera de 10 chalets.',
      solutionApplied: 'Autorizado por la dirección solo para volumen superior a 5 operaciones anuales.'
    });

    // Consultar desde Tenant A
    const leaked = await OperationalMemoryStore.retrieveSimilarCases(tenantA, 'comisión reducida para promotor de chalets');
    const hasLeak = leaked.some(c => c.record.tenantId === tenantB);
    assert.strictEqual(hasLeak, false);
  });
});
