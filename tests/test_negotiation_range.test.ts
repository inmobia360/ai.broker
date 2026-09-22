import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DealRangeCalculator } from '../src/lib/negotiation/dealRangeCalculator.ts';
import { ContingencyChecker } from '../src/lib/legal/spain/contingencyChecker.ts';

describe('T5 & T6: Módulo de Negociación y Protocolo de Contingencias Registrales (RF-M5, RF-M6, RF-M7)', () => {
  test('DealRangeCalculator analiza oferta en banda autorizada y sugiere contraoferta (RF-M5, RF-M6)', () => {
    // Escenario: Precio de salida 320.000 €, suelo de encargo 290.000 €, oferta 300.000 €
    const analysis = DealRangeCalculator.analyzeDeal({
      askingPrice: 320000,
      minAcceptedPrice: 290000,
      offeredPrice: 300000,
      buyerHasMortgagePreApproval: true,
      proposedCompletionDays: 45
    });

    assert.strictEqual(analysis.isViable, true);
    assert.strictEqual(analysis.closingProbability, 'alta');
    assert.strictEqual(analysis.dealZone.minViablePrice, 290000);
    assert.ok(analysis.dealZone.suggestedCounterOffer >= 300000);
    assert.ok(analysis.keyCommercialArguments.some(a => a.includes('pre-aprobación bancaria')));
    assert.ok(analysis.keyCommercialArguments.some(a => a.includes('45 días')));
  });

  test('DealRangeCalculator detecta oferta agresiva fuera de margen e indica baja viabilidad', () => {
    // Escenario: Precio de salida 320.000 €, suelo de encargo 290.000 €, oferta agresiva 240.000 € (-25%)
    const analysis = DealRangeCalculator.analyzeDeal({
      askingPrice: 320000,
      minAcceptedPrice: 290000,
      offeredPrice: 240000
    });

    assert.strictEqual(analysis.isViable, false);
    assert.strictEqual(analysis.closingProbability, 'baja');
    assert.strictEqual(analysis.discountPercentage, 25.0);
    assert.ok(analysis.recommendationToAgent.includes('por debajo del umbral mínimo'));
  });

  test('ContingencyChecker detecta hipotecas y embargos, alertando con la solución legal (RF-M7)', () => {
    const report = ContingencyChecker.auditProperty({
      propertyAddress: 'Calle Mayor 12, Madrid',
      hasActiveMortgage: true,
      mortgageBalanceEuro: 75000,
      hasJudicialEmbargo: true,
      embargoAmountEuro: 12000,
      hasCommunityDebt: true,
      energyCertificateStatus: 'ausente'
    });

    assert.strictEqual(report.hasCriticalBlockers, true);
    assert.ok(report.notaryReadinessScore < 50);
    assert.ok(report.contingencies.some(c => c.code === 'CARGA_HIPOTECA'));
    assert.ok(report.contingencies.some(c => c.code === 'EMBARGO_JUDICIAL'));
    assert.ok(report.contingencies.some(c => c.code === 'DEUDA_COMUNIDAD'));
    assert.ok(report.contingencies.some(c => c.code === 'CEE_AUSENTE'));

    // Comprobar que aporta la solución legal conforme a la LPH y Registro
    const embargoItem = report.contingencies.find(c => c.code === 'EMBARGO_JUDICIAL');
    assert.ok(embargoItem?.solutionAction.includes('Mandamiento Judicial'));

    const debtItem = report.contingencies.find(c => c.code === 'DEUDA_COMUNIDAD');
    assert.ok(debtItem?.solutionAction.includes('Art. 9.1.e LPH'));
  });
});
