import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateLPHDebtCertificateRequest, 
  calculateTotalPendingDerramas,
  formatCurrencyLPH
} from '../src/lib/legal/spain/communityLPH.ts';
import type { CommunityLPHDetails } from '../src/lib/legal/spain/communityLPH.ts';

describe('T1: Módulo de Finca Madre y Certificación de Deuda LPH (RF-WLD1, RF-WLD2)', () => {
  const sampleDetails: CommunityLPHDetails = {
    propertyAddress: 'Calle Serrano 45, 3º Dcha, 28001 Madrid',
    cadastralReference: '5432101VK4753B0001TR',
    cadastralCoefficient: 2.45,
    monthlyOrdinaryFee: 135.5,
    reserveFundContribution: 15.0,
    administrator: {
      name: 'Don Juan Carlos Arriaga',
      collegeNumber: 'CAF Madrid Col. 3489',
      email: 'administracion@arriagafincas.es',
      company: 'Arriaga & Asociados Administradores de Fincas'
    },
    presidentName: 'Don Luis Menéndez',
    ownerName: 'Doña Carmen Gómez Alarcón',
    ownerDni: '52987654M',
    pendingDerramas: [
      {
        concept: 'Sustitución de caldera comunitaria e instalación de aerotermia',
        totalAmount: 600,
        monthlyFee: 50,
        remainingMonths: 12
      }
    ]
  };

  test('Calcula correctamente el importe total de derramas extraordinarias pendientes', () => {
    const total = calculateTotalPendingDerramas(sampleDetails.pendingDerramas);
    assert.strictEqual(total, 600); // 50 * 12

    const zero = calculateTotalPendingDerramas([]);
    assert.strictEqual(zero, 0);
  });

  test('Genera el requerimiento formal citando taxativamente el Art. 9.1.e LPH y plazo de 7 días (RF-WLD2)', () => {
    const output = generateLPHDebtCertificateRequest({
      details: sampleDetails,
      requestDate: '2026-09-23',
      notaryScheduledDate: '2026-10-15'
    });

    assert.strictEqual(output.documentType, 'lph_debt_certificate_request');
    assert.ok(output.isComplete);
    assert.strictEqual(output.detectedPendingFields.length, 0);

    // Verificaciones normativas de la Ley 49/1960
    assert.ok(output.documentText.includes('ARTÍCULO 9.1.e) DE LA LEY DE PROPIEDAD HORIZONTAL'));
    assert.ok(output.documentText.includes('SIETE DÍAS NATURALES'));
    assert.ok(output.documentText.includes('Don Juan Carlos Arriaga'));
    assert.ok(output.documentText.includes('Doña Carmen Gómez Alarcón'));
    assert.ok(output.documentText.includes('52987654M'));
    assert.ok(output.documentText.includes('Sustitución de caldera comunitaria'));
    assert.strictEqual(output.financialSummary.activeDerramasCount, 1);
    assert.strictEqual(output.financialSummary.totalPendingDerramas, 600);
  });

  test('Detecta campos incompletos cuando faltan datos obligatorios', () => {
    const incomplete = generateLPHDebtCertificateRequest({
      details: {
        propertyAddress: '',
        cadastralCoefficient: 1.0,
        monthlyOrdinaryFee: 50,
        administrator: { name: '' },
        ownerName: '',
        ownerDni: ''
      }
    });

    assert.strictEqual(incomplete.isComplete, false);
    assert.ok(incomplete.detectedPendingFields.includes('Dirección de la finca'));
    assert.ok(incomplete.detectedPendingFields.includes('Nombre del propietario'));
  });
});
