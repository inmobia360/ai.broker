import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateVisitSheet } from '../src/lib/legal/spain/visita.ts';
import { generateArrasContract } from '../src/lib/legal/spain/arras.ts';
import { generateLPHDebtCertificateRequest } from '../src/lib/legal/spain/communityLPH.ts';
import { generateKeyHandoverAct, validateCupsFormat } from '../src/lib/legal/spain/handoverPostventa.ts';
import { PIPELINE_STAGES, INITIAL_PIPELINE_CASES } from '../src/lib/pipeline/pipelineTypes.ts';
import type { PipelineCase } from '../src/lib/pipeline/pipelineTypes.ts';
import { PRIORITY_LEADS } from '../src/lib/leads/leadTypes.ts';

describe('SPEC-008: Conexión End-to-End: Lead Captado ➔ Pipeline ➔ Visita ➔ Arras (RF-PIPE1, RF-VISITA, RF-ARRAS)', () => {
  
  test('RF-VISITA: Genera Hoja de Encargo de Visita con blindaje de honorarios y protección RGPD', () => {
    const lead = PRIORITY_LEADS[0];
    const visitOutput = generateVisitSheet({
      agencia: {
        nombreAgencia: 'Inmobia 360 Boutique',
        cif: 'B-88776655',
        registroProfesional: 'RAICV-1234'
      },
      visitante: {
        nombreCompleto: lead.name,
        telefono: lead.phone,
        email: 'lead@ejemplo.com'
      },
      inmueble: {
        direccion: `Inmueble en ${lead.location}`,
        municipio: 'Madrid',
        precioOrientativo: 850000,
        tipoOperacion: 'venta'
      },
      honorarios: {
        porcentajeHonorariosVenta: 3,
        ivaAplicable: 21,
        periodoValidezMeses: 12
      }
    });

    assert.strictEqual(visitOutput.documentType, 'visita');
    assert.ok(visitOutput.sheetText.includes('HOJA DE VISITA Y RECONOCIMIENTO DE GESTIÓN'));
    assert.ok(visitOutput.sheetText.includes(lead.name));
    assert.ok(visitOutput.sheetText.includes('Inmobia 360 Boutique'));
    assert.ok(visitOutput.sheetText.includes('BLINDAJE DE HONORARIOS'));
    assert.ok(visitOutput.sheetText.includes('RGPD'));
    assert.strictEqual(visitOutput.summary.visitanteNombre, lead.name);
    assert.strictEqual(visitOutput.readyForDigitalSignature, true);
  });

  test('RF-ARRAS: Genera Contrato de Arras Penitenciales según Art. 1454 C.C. con señal del 10%', () => {
    const lead = PRIORITY_LEADS[0];
    const price = 850000;
    const arrasDeposit = Math.round(price * 0.10);

    const arrasOutput = generateArrasContract({
      municipio: 'Madrid',
      vendedor: {
        nombreCompleto: 'Inversiones Inmobiliarias Madrid S.L.',
        dniNie: 'B-12345678',
        domicilio: 'Calle Serrano 45, Madrid'
      },
      comprador: {
        nombreCompleto: lead.name,
        dniNie: '12345678Z',
        domicilio: 'Paseo de la Castellana 100, Madrid'
      },
      inmueble: {
        direccion: 'Calle Lagasca 88, 4º Derecha, Madrid',
        referenciaCatastral: '9872023VK4797S0001WX',
        datosRegistrales: 'Finca Registral nº 48.912, Registro nº 4 de Madrid'
      },
      condiciones: {
        precioTotal: price,
        importeSenalArras: arrasDeposit,
        formaPagoSenal: 'Transferencia bancaria a cuenta de depósito en garantía',
        plazoMaximoNotaria: '30 de noviembre de 2026'
      }
    });

    assert.strictEqual(arrasOutput.documentType, 'arras');
    assert.ok(arrasOutput.contractText.includes('ARTÍCULO 1454 DEL CÓDIGO CIVIL'));
    assert.ok(arrasOutput.contractText.includes('arras penitenciales'));
    assert.strictEqual(arrasOutput.economicSummary.precioTotal, price);
    assert.strictEqual(arrasOutput.economicSummary.importeSenal, arrasDeposit);
    assert.strictEqual(arrasOutput.economicSummary.porcentajeSenal, 10);
  });

  test('RF-PIPE1: Estructura de las 7 fases del Pipeline Kanban y progresión cronológica', () => {
    assert.strictEqual(PIPELINE_STAGES.length, 7);
    const expectedStages = [
      'captacion',
      'calificacion',
      'comercializacion',
      'negociacion',
      'arras',
      'tramitacion_notarial',
      'postventa'
    ];
    PIPELINE_STAGES.forEach((stage, idx) => {
      assert.strictEqual(stage.id, expectedStages[idx]);
      assert.strictEqual(stage.stepNumber, idx + 1);
    });
  });

  test('RF-CONV: Conversión de Lead Captado a Expediente del Pipeline', () => {
    const lead = PRIORITY_LEADS[1]; // Sophie Müller
    const newCase: PipelineCase = {
      id: `EXP-2026-${String(INITIAL_PIPELINE_CASES.length + 1).padStart(3, '0')}`,
      title: `Operación ${lead.name.split(' ')[0]} — ${lead.location}`,
      clientName: lead.name,
      price: lead.budget,
      stage: 'comercializacion',
      pendingDoc: 'Hoja de Visita con Reserva de Honorarios',
      suggestedAction: lead.suggestedPrompt
    };

    assert.ok(newCase.id.startsWith('EXP-2026-'));
    assert.strictEqual(newCase.clientName, 'Sophie Müller');
    assert.strictEqual(newCase.stage, 'comercializacion');
    assert.strictEqual(newCase.price, '1.300.000 €');
  });

  test('RF-POST: Generación de Certificado LPH Art. 9.1.e y Acta de Entrega con CUPS', () => {
    // 1. Solicitud LPH
    const lphOutput = generateLPHDebtCertificateRequest({
      details: {
        propertyAddress: 'Calle Alcalá 120, 2º B, Madrid',
        ownerName: 'Carlos Romero',
        ownerDni: '12345678Z',
        monthlyOrdinaryFee: 145,
        administrator: {
          name: 'Fincas Madrid Colegiadas',
          collegeNumber: 'CAF-5511',
          email: 'admin@fincasmadrid.com'
        }
      }
    });
    assert.strictEqual(lphOutput.documentType, 'lph_debt_certificate_request');
    assert.ok(lphOutput.documentText.includes('ARTÍCULO 9.1.e) DE LA LEY DE PROPIEDAD HORIZONTAL'));
    assert.ok(lphOutput.documentText.includes('Carlos Romero'));

    // 2. Validación de CUPS
    const validCups = 'ES0021000001234567AB1F';
    const invalidCups = '12345';
    assert.strictEqual(validateCupsFormat(validCups), true);
    assert.strictEqual(validateCupsFormat(invalidCups), false);

    // 3. Acta de Entrega de Llaves
    const handoverOutput = generateKeyHandoverAct({
      propertyAddress: 'Calle Alcalá 120, 2º B, Madrid',
      transferType: 'compraventa',
      transferor: { fullName: 'Vendedor Ejemplo', dniNie: '00000000A' },
      acquirer: { fullName: 'Carlos Romero', dniNie: '12345678Z' },
      keys: {
        mainDoorSets: 2,
        portalSets: 2,
        mailboxKeys: 1,
        storageRoomKeys: 1,
        garageRemotes: 1
      },
      utilities: {
        electricity: {
          serviceType: 'electricidad',
          readingValue: 12500,
          unit: 'kWh',
          cups: validCups
        },
        water: {
          serviceType: 'agua',
          readingValue: 240,
          unit: 'm³'
        }
      }
    });
    assert.strictEqual(handoverOutput.documentType, 'key_handover_and_meter_act');
    assert.ok(handoverOutput.actText.includes('ENTREGA DE LLAVES'));
    assert.ok(handoverOutput.utilityTransferAuthorizationText.includes(validCups));
  });
});
