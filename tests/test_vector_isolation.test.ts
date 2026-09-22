import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  AgencyVectorStore,
  generateEmbedding,
  cosineSimilarity,
  VECTOR_DIMENSION,
  VectorIsolationError
} from '../src/lib/db/vectorStore.ts';

describe('T12: Almacén Vectorial Aislado por Agencia (pgvector - RF-13)', () => {
  const tenantMadrid = '00000000-0000-4000-8000-000000000001';
  const tenantBarcelona = '00000000-0000-4000-8000-000000000002';

  beforeEach(() => {
    AgencyVectorStore.clearForTests();
  });

  test('generateEmbedding genera un vector de 768 dimensiones normalizado unitariamente', async () => {
    const text = 'Chalet independiente en Pozuelo de Alarcón con jardín y piscina';
    const embedding = await generateEmbedding(text);

    assert.strictEqual(embedding.length, VECTOR_DIMENSION, 'La dimensión debe ser exactamente 768');

    // Comprobar norma euclidiana L2 aproximada a 1
    let norm = 0;
    for (const v of embedding) {
      norm += v * v;
    }
    assert.ok(Math.abs(Math.sqrt(norm) - 1.0) < 0.001, 'El vector debe estar normalizado a norma 1');
  });

  test('cosineSimilarity calcula correctamente la similitud entre vectores', async () => {
    const v1 = await generateEmbedding('piso céntrico en Chamberí');
    const v2 = await generateEmbedding('piso céntrico en Chamberí'); // Idéntico
    const v3 = await generateEmbedding('nave industrial logística en polígono');

    const simIdentical = cosineSimilarity(v1, v2);
    const simDifferent = cosineSimilarity(v1, v3);

    assert.ok(Math.abs(simIdentical - 1.0) < 0.0001, 'Vectores idénticos deben tener similitud 1.0');
    assert.ok(simDifferent < simIdentical, 'Textos dispares deben tener menor similitud');
  });

  test('Rechaza inserciones o búsquedas sin tenant_id válido (RF-1, RF-13)', async () => {
    await assert.rejects(
      async () => {
        await AgencyVectorStore.insertDocument('', 'Contenido sin agencia');
      },
      (err: any) => {
        assert.ok(err instanceof VectorIsolationError);
        assert.ok(err.message.includes('tenant_id'));
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await AgencyVectorStore.searchSimilar('   ', 'consulta');
      },
      (err: any) => {
        assert.ok(err instanceof VectorIsolationError);
        return true;
      }
    );
  });

  test('Aislamiento Vectorial Estricto: Los vectores de un tenant NUNCA son recuperados por otro (RF-13, Principio 1)', async () => {
    // 1. Indexar expedientes en Agencia Madrid
    await AgencyVectorStore.insertDocument(
      tenantMadrid,
      'Exclusiva: Chalet de lujo en Pozuelo de Alarcón con piscina climatizada y 5 dormitorios. Precio: 950.000 €.',
      { reference: 'MAD-001', zona: 'Pozuelo', tipo: 'chalet' }
    );
    await AgencyVectorStore.insertDocument(
      tenantMadrid,
      'Política de comisiones internas Agencia Madrid: 4% sobre precio de venta en residencial.',
      { category: 'comisiones' }
    );

    // 2. Indexar expedientes en Agencia Barcelona
    await AgencyVectorStore.insertDocument(
      tenantBarcelona,
      'Exclusiva: Ático reformado en Eixample Dret con terraza panorámica de 40m2. Precio: 580.000 €.',
      { reference: 'BCN-001', zona: 'Eixample', tipo: 'atico' }
    );
    await AgencyVectorStore.insertDocument(
      tenantBarcelona,
      'Política de comisiones internas Agencia Barcelona: honorarios mínimos de 6.000 €.',
      { category: 'comisiones' }
    );

    assert.strictEqual(AgencyVectorStore.countVectors(tenantMadrid), 2);
    assert.strictEqual(AgencyVectorStore.countVectors(tenantBarcelona), 2);

    // 3. Búsqueda en Agencia Madrid: Debe encontrar su chalet en Pozuelo
    const madridResults = await AgencyVectorStore.searchSimilar(
      tenantMadrid,
      'chalet con piscina en Pozuelo de Alarcón',
      5
    );

    assert.ok(madridResults.length > 0, 'Madrid debe encontrar su expediente');
    assert.strictEqual(madridResults[0].document.tenantId, tenantMadrid);
    assert.ok(madridResults[0].document.content.includes('Pozuelo de Alarcón'));

    // Comprobar que NINGÚN resultado de Madrid pertenece a Barcelona
    const leakInMadrid = madridResults.find(r => r.document.tenantId === tenantBarcelona);
    assert.strictEqual(leakInMadrid, undefined, 'No debe existir fuga de datos de Barcelona en Madrid');

    // 4. Búsqueda en Agencia Barcelona de la misma consulta de Pozuelo:
    // Debe devolver 0 resultados de Pozuelo (aislamiento blindado)
    const barcelonaResults = await AgencyVectorStore.searchSimilar(
      tenantBarcelona,
      'chalet con piscina en Pozuelo de Alarcón',
      5
    );

    const pozueloInBcn = barcelonaResults.find(r => r.document.content.includes('Pozuelo'));
    assert.strictEqual(pozueloInBcn, undefined, 'Barcelona NUNCA debe ver los inmuebles o secretos de Madrid');

    // 5. Búsqueda en Agencia Barcelona de su propio ático en Eixample
    const bcnSelfResults = await AgencyVectorStore.searchSimilar(
      tenantBarcelona,
      'ático con terraza en Eixample',
      5
    );

    assert.ok(bcnSelfResults.length > 0, 'Barcelona debe encontrar su propio ático');
    assert.strictEqual(bcnSelfResults[0].document.tenantId, tenantBarcelona);
    assert.ok(bcnSelfResults[0].document.content.includes('Eixample'));
  });
});
