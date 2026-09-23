import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CmaValuator } from '../src/lib/valuation/cmaValuator.ts';
import type { CmaPropertyInput } from '../src/lib/valuation/cmaValuator.ts';

describe('SPEC-009: Tasador ACM Interactivo, Testigos Homologados, Catastro 3D y ZOPA (RF-ACM1 a RF-ACM5)', () => {

  const sampleMadridInput: CmaPropertyInput = {
    address: 'Calle Serrano 45, Barrio de Salamanca, Madrid',
    builtM2: 120,
    bedrooms: 3,
    bathrooms: 2,
    constructionYear: 1985,
    hasElevator: true,
    condition: 'buen_estado',
    cadastralReference: '5432101VK4753B0001TR',
    clientTargetPrice: 850000
  };

  test('RF-ACM1: Calcula el precio estimado por m² y cierre notarial con factores de corrección', async () => {
    const output = await CmaValuator.calculateValuation('inmobia360', sampleMadridInput);

    assert.strictEqual(output.propertyAddress, sampleMadridInput.address);
    assert.ok(output.zone.includes('Salamanca'));
    assert.strictEqual(output.builtM2, 120);

    // En Serrano el precio base es 6.200 €/m². Con ascensor (+5%) y WalkScore alto (+4%)
    assert.ok(output.estimatedPricePerM2 >= 6000);
    assert.strictEqual(output.estimatedClosingPrice, output.estimatedPricePerM2 * output.builtM2);
  });

  test('RF-ACM2: Genera testigos comparables homologados y representativos de la micro-zona', async () => {
    const output = await CmaValuator.calculateValuation('inmobia360', sampleMadridInput);

    assert.ok(Array.isArray(output.witnesses));
    assert.ok(output.witnesses.length >= 3);

    for (const witness of output.witnesses) {
      assert.ok(witness.id.startsWith('WIT-'));
      assert.ok(witness.address.length > 5);
      assert.ok(witness.distanceMeters > 0 && witness.distanceMeters < 1000);
      assert.ok(witness.builtM2 > 0);
      assert.ok(witness.price > 0);
      assert.ok(witness.pricePerM2 > 0);
      assert.strictEqual(witness.price, Math.round(witness.builtM2 * witness.pricePerM2));
      assert.ok(witness.sourcePortal.includes('Homologado') || witness.sourcePortal.includes('Notarial'));
    }
  });

  test('RF-ACM3: Computa la Banda de Negociación ZOPA (Venta Rápida, Notaría, Portales) y desviación', async () => {
    const output = await CmaValuator.calculateValuation('inmobia360', sampleMadridInput);

    // 1. Venta Rápida: -5% sobre cierre notarial
    assert.strictEqual(output.fastSalePrice, Math.round(output.estimatedClosingPrice * 0.95));

    // 2. Salida Portales: +6% margen de negociación sobre notaría
    assert.strictEqual(output.negotiationMarginPct, 6.0);
    assert.strictEqual(output.recommendedListingPrice, Math.round(output.estimatedClosingPrice * 1.06));

    // 3. Venta Rápida < Cierre Notaría < Salida Portales
    assert.ok(output.fastSalePrice < output.estimatedClosingPrice);
    assert.ok(output.estimatedClosingPrice < output.recommendedListingPrice);

    // 4. Desviación de la pretensión del cliente (850.000 € vs recommendedListingPrice)
    assert.ok(output.clientPriceVariancePct !== null);
    const expectedVariance = parseFloat((((850000 - output.recommendedListingPrice) / output.recommendedListingPrice) * 100).toFixed(1));
    assert.strictEqual(output.clientPriceVariancePct, expectedVariance);
  });

  test('RF-ACM4: Genera Dossier ACM Maquetado con Identidad de Marca Blanca y Enlaces 3D', async () => {
    const agencyContext = {
      agencyName: 'Inmobia 360 Prestige',
      associationNumber: 'RAICV-1842',
      fiscalId: 'B-99887766'
    };

    const output = await CmaValuator.calculateValuation('inmobia360', sampleMadridInput, agencyContext);
    const dossierText = output.dossierReportDraft.content;

    // Acreditación de agencia y colegiación
    assert.ok(dossierText.includes('Inmobia 360 Prestige'));
    assert.ok(dossierText.includes('RAICV-1842'));
    assert.ok(dossierText.includes('B-99887766'));

    // Finca y Catastro
    assert.ok(dossierText.includes('5432101VK4753B0001TR'));
    assert.ok(dossierText.includes('120 m²'));

    // Enlaces de entorno 3D
    assert.ok(dossierText.includes('Google Earth 3D'));
    assert.ok(dossierText.includes('https://earth.google.com'));
    assert.ok(dossierText.includes('Sede Catastro'));
    assert.ok(dossierText.includes('https://www1.sedecatastro.gob.es'));

    // Testigos y ZOPA
    assert.ok(dossierText.includes('MUESTREO DE TESTIGOS COMPARABLES HOMOLOGADOS'));
    assert.ok(dossierText.includes('BANDA DE CIERRE NOTARIAL (ZOPA)'));
    assert.ok(dossierText.includes('Venta Rápida (<30 días)'));

    // DeepLinks en objeto output
    assert.ok(output.deepLinks.googleEarth3D.startsWith('https://earth.google.com'));
    assert.ok(output.deepLinks.catastroVisor.includes('sedecatastro.gob.es'));
  });

  test('RF-ACM5: Emite el dossier bajo Modo Borrador Seguro (DraftGuard)', async () => {
    const output = await CmaValuator.calculateValuation('tenant-test-agencia', {
      address: 'Carrer de Mallorca 120, Eixample, Barcelona',
      builtM2: 95,
      bedrooms: 2,
      bathrooms: 1,
      constructionYear: 1970,
      hasElevator: true,
      condition: 'reformado'
    });

    assert.strictEqual(output.dossierReportDraft.status, 'draft_pending');
    assert.strictEqual(output.dossierReportDraft.tenantId, 'tenant-test-agencia');
    assert.strictEqual(output.dossierReportDraft.documentType, 'other');
    assert.ok(output.dossierReportDraft.title.includes('Dossier de Prevaloración ACM'));
    assert.strictEqual(output.dossierReportDraft.metadata?.type, 'cma_valuation');
    assert.ok(output.zone.includes('Eixample'));
  });

  test('RNF-ACM3: Valida rechazo de tenant_id inválido o superficie errónea', async () => {
    await assert.rejects(
      async () => {
        await CmaValuator.calculateValuation('', sampleMadridInput);
      },
      /Se requiere un tenant_id válido/
    );

    await assert.rejects(
      async () => {
        await CmaValuator.calculateValuation('inmobia360', {
          ...sampleMadridInput,
          builtM2: 0
        });
      },
      /La superficie construida debe ser un valor numérico positivo/
    );
  });
});
