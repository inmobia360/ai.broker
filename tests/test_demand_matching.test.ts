import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DemandMatcher } from '../src/lib/matching/demandMatcher.ts';
import type { BuyerProfile, PropertyMatchTarget } from '../src/lib/matching/demandMatcher.ts';

describe('T3 & T4: Emparejamiento Inverso de Demanda Inteligente (RF-M3, RF-M4, RNF-M1)', () => {
  const targetProperty: PropertyMatchTarget = {
    id: 'prop-eixample-01',
    tenantId: 'agencia-barcelona',
    title: 'Ático luminoso con terraza en Eixample Dreta',
    zone: 'Eixample, Barcelona',
    price: 490000,
    bedrooms: 3,
    propertyType: 'atico',
    description: 'Ático reformado con terraza de 25m², 3 habitaciones, finca regia con ascensor.'
  };

  const sampleBuyers: BuyerProfile[] = [
    {
      id: 'buyer-01',
      tenantId: 'agencia-barcelona',
      fullName: 'Carlos Puig',
      targetZones: ['Eixample', 'Gràcia'],
      maxBudget: 520000,
      minBedrooms: 2,
      propertyTypePreference: 'atico',
      hasFinancialPreApproval: true,
      notes: 'Busca ático con terraza soleada para entrar a vivir.'
    },
    {
      id: 'buyer-02',
      tenantId: 'agencia-barcelona',
      fullName: 'Marta Soler',
      targetZones: ['Poblenou', 'Sant Martí'],
      maxBudget: 350000, // Presupuesto muy por debajo
      propertyTypePreference: 'piso',
      hasFinancialPreApproval: false,
      notes: 'Busca piso cerca del mar económico.'
    },
    {
      id: 'buyer-cross-tenant',
      tenantId: 'agencia-madrid-competidora', // Tenant diferente
      fullName: 'Ignacio Gómez',
      targetZones: ['Eixample'],
      maxBudget: 600000,
      propertyTypePreference: 'atico',
      hasFinancialPreApproval: true
    }
  ];

  test('DemandMatcher empareja al comprador compatible y redacta mensaje en español (RF-M3, RF-M4)', async () => {
    const matches = await DemandMatcher.matchPropertyToBuyers(targetProperty, sampleBuyers, 0.75);

    // Debe emparejar a Carlos Puig y excluir a Marta Soler por presupuesto insuficiente
    assert.strictEqual(matches.length, 1);
    const topMatch = matches[0];
    assert.strictEqual(topMatch.buyer.fullName, 'Carlos Puig');
    assert.ok(topMatch.affinityScore >= 0.75);
    assert.ok(topMatch.reasons.some(r => r.includes('Eixample')));
    assert.ok(topMatch.reasons.some(r => r.includes('pre-aprobada')));

    // Mensaje sugerido estructurado para WhatsApp / Email
    assert.ok(topMatch.suggestedOutreachMessage.includes('Carlos Puig'));
    assert.ok(topMatch.suggestedOutreachMessage.includes('Eixample'));
    assert.ok(topMatch.suggestedOutreachMessage.includes('490.000 €'));
    assert.ok(topMatch.suggestedOutreachMessage.includes('visita preferente'));
  });

  test('DemandMatcher bloquea estrictamente compradores de otras agencias (RNF-M1 Aislamiento)', async () => {
    const matches = await DemandMatcher.matchPropertyToBuyers(targetProperty, sampleBuyers, 0.50);
    // Asegurar que Ignacio Gómez (de agencia-madrid-competidora) NUNCA aparece en los resultados
    const hasCrossTenant = matches.some(m => m.buyer.id === 'buyer-cross-tenant');
    assert.strictEqual(hasCrossTenant, false);
  });
});
