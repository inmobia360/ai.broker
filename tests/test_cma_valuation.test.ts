import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CmaValuator } from '../src/lib/valuation/cmaValuator.ts';
import type { CmaPropertyInput } from '../src/lib/valuation/cmaValuator.ts';

describe('T2: Motor de Prevaloración Rápida ACM y Generación de Dossier (RF-CMA2, RF-CMA3)', () => {
  const sampleInput: CmaPropertyInput = {
    address: 'Calle Serrano 88, Madrid',
    builtM2: 120,
    bedrooms: 3,
    bathrooms: 2,
    constructionYear: 1955,
    hasElevator: true,
    condition: 'reformado',
    clientTargetPrice: 850000,
    cadastralReference: '9872014VK4797B0001TR'
  };

  test('Calcula la valoración ACM con horquilla de precio de salida y cierre en notaría (RF-CMA2)', async () => {
    const res = await CmaValuator.calculateValuation('agencia-madrid-01', sampleInput);

    assert.ok(res.estimatedPricePerM2 > 4000);
    assert.strictEqual(res.builtM2, 120);

    // El precio de salida en portales debe ser superior al cierre estimado (margen de negociación)
    assert.ok(res.recommendedListingPrice > res.estimatedClosingPrice);
    assert.strictEqual(res.negotiationMarginPct, 6.0);

    // Variación con la pretensión del cliente
    assert.ok(res.clientPriceVariancePct !== null);
  });

  test('Aplica penalización para inmuebles a reformar y sin ascensor', async () => {
    const unrenovated = await CmaValuator.calculateValuation('agencia-madrid-01', {
      ...sampleInput,
      condition: 'a_reformar',
      hasElevator: false
    });

    const renovated = await CmaValuator.calculateValuation('agencia-madrid-01', {
      ...sampleInput,
      condition: 'reformado',
      hasElevator: true
    });

    assert.ok(unrenovated.estimatedPricePerM2 < renovated.estimatedPricePerM2);
  });

  test('Emite el Dossier de Prevaloración en borrador seguro (RF-CMA3, RF-5)', async () => {
    const res = await CmaValuator.calculateValuation('agencia-madrid-01', sampleInput);

    assert.ok(res.dossierReportDraft);
    assert.strictEqual(res.dossierReportDraft.status, 'draft_pending');
    assert.ok(res.dossierReportDraft.content.includes('DOSSIER PROFESIONAL DE PREVALORACIÓN'));
    assert.ok(res.dossierReportDraft.content.includes('Calle Serrano 88'));
    assert.ok(res.dossierReportDraft.content.includes('ARGUMENTARIO DE CAPTACIÓN'));
  });

  test('Bloquea valoraciones sin tenant_id válido (RNF-CMA1)', async () => {
    await assert.rejects(
      async () => {
        await CmaValuator.calculateValuation('', sampleInput);
      },
      /Se requiere un tenant_id válido/
    );
  });
});
