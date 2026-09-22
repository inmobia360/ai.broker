import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NeighborhoodAnalyzer } from '../src/lib/geo/neighborhoodAnalyzer.ts';
import type { NeighborhoodProfile } from '../src/lib/geo/neighborhoodAnalyzer.ts';

describe('T1: Analizador de Micro-Zona y Dotaciones Urbanas (RF-CMA1)', () => {
  test('Analiza dotaciones en Madrid Serrano y calcula tiempos a pie', async () => {
    const profile = await NeighborhoodAnalyzer.analyzeNeighborhood('Calle Serrano 88, Madrid');

    assert.ok(profile.zone.includes('Salamanca') || profile.zone.includes('Madrid'));
    assert.ok(profile.amenities.length >= 4);

    // Debe incluir transporte público con cálculo de tiempo a pie
    const transport = profile.amenities.find(a => a.category === 'transporte');
    assert.ok(transport);
    assert.ok(transport.distanceMeters > 0);
    assert.ok(transport.walkMinutes > 0);
    assert.ok(transport.name.toLowerCase().includes('metro') || transport.name.toLowerCase().includes('emt'));

    // Verificación de WalkScore
    assert.ok(profile.walkScore >= 70);
    assert.ok(profile.summaryReport.includes('INFORME DE MICRO-ZONA'));
  });

  test('Identifica servicios específicos en Barcelona Eixample', async () => {
    const profile = await NeighborhoodAnalyzer.analyzeNeighborhood('Carrer de Girona 45, Eixample, Barcelona');

    assert.ok(profile.zone.includes('Eixample'));
    const hasGreen = profile.amenities.some(a => a.category === 'zonas_verdes');
    const hasEducation = profile.amenities.some(a => a.category === 'educacion');
    const hasHealth = profile.amenities.some(a => a.category === 'salud');

    assert.strictEqual(hasGreen, true);
    assert.strictEqual(hasEducation, true);
    assert.strictEqual(hasHealth, true);
    assert.ok(profile.transportSummary.includes('Girona') || profile.transportSummary.includes('Verdaguer'));
  });

  test('Calcula correctamente la velocidad peatonal (~80 m/minuto)', async () => {
    const profile = await NeighborhoodAnalyzer.analyzeNeighborhood('Calle Ruzafa 12, Valencia');
    for (const item of profile.amenities) {
      const expectedMin = Math.round(item.distanceMeters / 80);
      assert.strictEqual(item.walkMinutes, expectedMin);
    }
  });
});
