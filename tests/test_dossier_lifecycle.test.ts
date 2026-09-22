import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DossierStateMachine } from '../src/lib/lifecycle/dossierStateMachine.ts';
import type { RealEstateDossier } from '../src/lib/lifecycle/dossierStateMachine.ts';
import { ProactiveDraftGenerator } from '../src/lib/lifecycle/proactiveDraftGenerator.ts';

describe('T1 & T2: Ciclo de Vida del Expediente y Generación Proactiva de Borradores (RF-M1, RF-M2)', () => {
  const sampleDossier: RealEstateDossier = {
    id: 'dos-test-01',
    tenantId: 'inmobia-test',
    title: 'Piso señorial en Calle Serrano, Madrid',
    referenceCode: 'EXP-MAD-SERRANO',
    operationType: 'venta',
    currentStage: 'captacion',
    askingPrice: 550000,
    minAcceptedPrice: 500000,
    propertyAddress: 'Calle Serrano 88, 3º Dcha, Madrid',
    cadastralReference: '9872014VK4797B0001TR',
    parties: [
      {
        fullName: 'Rodrigo Mendoza',
        dniNie: '50123456K',
        email: 'rodrigo@example.es',
        role: 'vendedor'
      }
    ],
    transitionHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  test('DossierStateMachine valida transiciones legales y bloquea saltos indebidos (RF-M1)', () => {
    // 1. Transición legal: de captacion a comercializacion
    assert.strictEqual(DossierStateMachine.isValidTransition('captacion', 'comercializacion'), true);
    
    // 2. Salto indebido: no se puede saltar de captacion a cierre_documental sin pasar por comercializacion/negociacion
    assert.strictEqual(DossierStateMachine.isValidTransition('captacion', 'cierre_documental'), false);
    
    // 3. De comercializacion a negociacion es válido
    assert.strictEqual(DossierStateMachine.isValidTransition('comercializacion', 'negociacion'), true);

    // 4. Ejecución de transición exitosa
    const updated = DossierStateMachine.transition(sampleDossier, 'comercializacion', 'Agente Asesor', 'Inmueble publicado');
    assert.strictEqual(updated.currentStage, 'comercializacion');
    assert.strictEqual(updated.transitionHistory.length, 1);
    assert.strictEqual(updated.transitionHistory[0].fromStage, 'captacion');
    assert.strictEqual(updated.transitionHistory[0].toStage, 'comercializacion');
  });

  test('ProactiveDraftGenerator genera Nota de Encargo con honorarios al entrar en captación (RF-M2)', () => {
    const draftRes = ProactiveDraftGenerator.generateForStage(sampleDossier);
    assert.ok(draftRes);
    assert.strictEqual(draftRes.stage, 'captacion');
    assert.strictEqual(draftRes.draft.status, 'draft_pending');
    assert.ok(draftRes.draft.content.includes('NOTA DE ENCARGO'));
    assert.ok(draftRes.draft.content.includes('Calle Serrano 88'));
    assert.ok(draftRes.draft.content.includes('550.000'));
    assert.ok(draftRes.draft.content.includes('3% (+IVA)'));
  });

  test('ProactiveDraftGenerator genera Hoja de Visita con corretaje al entrar en comercialización (RF-M2, RF-10)', () => {
    const comercialDossier: RealEstateDossier = {
      ...sampleDossier,
      currentStage: 'comercializacion',
      parties: [
        ...sampleDossier.parties,
        {
          fullName: 'Beatriz Navarro',
          dniNie: '03987654M',
          role: 'comprador'
        }
      ]
    };

    const draftRes = ProactiveDraftGenerator.generateForStage(comercialDossier);
    assert.ok(draftRes);
    assert.strictEqual(draftRes.stage, 'comercializacion');
    assert.strictEqual(draftRes.draft.status, 'draft_pending');
    assert.ok(draftRes.draft.content.includes('HOJA DE VISITA'));
    assert.ok(draftRes.draft.content.includes('Beatriz Navarro'));
    assert.ok(draftRes.draft.content.toLowerCase().includes('12 meses'));
  });

  test('ProactiveDraftGenerator genera Arras Penitenciales Art. 1454 C.C. en cierre documental (RF-M2, RF-8)', () => {
    const cierreDocDossier: RealEstateDossier = {
      ...sampleDossier,
      currentStage: 'cierre_documental',
      agreedPrice: 520000,
      depositAmount: 52000,
      parties: [
        ...sampleDossier.parties,
        {
          fullName: 'Beatriz Navarro',
          dniNie: '03987654M',
          role: 'comprador'
        }
      ]
    };

    const draftRes = ProactiveDraftGenerator.generateForStage(cierreDocDossier);
    assert.ok(draftRes);
    assert.strictEqual(draftRes.stage, 'cierre_documental');
    assert.strictEqual(draftRes.draft.status, 'draft_pending');
    assert.ok(draftRes.draft.content.includes('1454 DEL CÓDIGO CIVIL'));
    assert.ok(draftRes.draft.content.includes('520.000'));
    assert.ok(draftRes.draft.content.includes('52.000'));
  });

  test('ProactiveDraftGenerator genera Checklist Notarial (Art. 9.1.e LPH, CEE, IBI) en tramitación notarial (RF-M2)', () => {
    const notariaDossier: RealEstateDossier = {
      ...sampleDossier,
      currentStage: 'tramitacion_notarial'
    };

    const draftRes = ProactiveDraftGenerator.generateForStage(notariaDossier);
    assert.ok(draftRes);
    assert.strictEqual(draftRes.stage, 'tramitacion_notarial');
    assert.ok(draftRes.draft.content.includes('CHECKLIST DE CONTROL PREVIO A ESCRITURA NOTARIAL'));
    assert.ok(draftRes.draft.content.includes('9.1.e de la Ley de Propiedad Horizontal'));
    assert.ok(draftRes.draft.content.includes('CERTIFICADO ENERGÉTICO (CEE)'));
    assert.ok(draftRes.draft.content.includes('IBI'));
  });
});
