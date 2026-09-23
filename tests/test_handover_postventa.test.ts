import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  generateKeyHandoverAct, 
  validateCupsFormat 
} from '../src/lib/legal/spain/handoverPostventa.ts';
import type { HandoverInput } from '../src/lib/legal/spain/handoverPostventa.ts';

describe('T2: Módulo Postventa Física: Entrega de Llaves y Contadores (RF-WLD3, RF-WLD4)', () => {
  const sampleHandover: HandoverInput = {
    propertyAddress: 'Calle Serrano 45, 3º Dcha, 28001 Madrid',
    transferType: 'compraventa',
    transferor: {
      fullName: 'Doña Carmen Gómez Alarcón',
      dniNie: '52987654M',
      phone: '+34 600 111 222',
      email: 'carmen@ejemplo.es'
    },
    acquirer: {
      fullName: 'Don Carlos Romero',
      dniNie: '09876543T',
      phone: '+34 600 333 444',
      email: 'carlos@familyoffice.es'
    },
    agencyName: 'Inmobia 360',
    agentName: 'Director Broker',
    keys: {
      mainDoorSets: 3,
      portalSets: 2,
      mailboxKeys: 2,
      storageRoomKeys: 1,
      garageRemotes: 2,
      otherKeysDescription: 'Llave magnética de acceso a piscina'
    },
    utilities: {
      electricity: {
        serviceType: 'electricidad',
        companyName: 'Iberdrola Clientes',
        cups: 'ES0021000001234567AB',
        readingValue: 4852,
        unit: 'kWh'
      },
      water: {
        serviceType: 'agua',
        companyName: 'Canal de Isabel II',
        meterNumber: 'CYII-998822',
        readingValue: 148,
        unit: 'm³'
      },
      gas: {
        serviceType: 'gas',
        companyName: 'Naturgy',
        meterNumber: 'GAS-774411',
        readingValue: 932,
        unit: 'm³'
      }
    },
    propertyStateObservations: 'Vivienda revisada conjuntamente; electrodomésticos comprobados en correcto funcionamiento.'
  };

  test('Valida correctamente el formato de código CUPS de electricidad en España', () => {
    assert.strictEqual(validateCupsFormat('ES0021000001234567AB'), true);
    assert.strictEqual(validateCupsFormat('ES00311234567890123456'), true);
    assert.strictEqual(validateCupsFormat('123456'), false);
    assert.strictEqual(validateCupsFormat(''), false);
  });

  test('Genera el acta de posesión física con inventario de llaves y Art. 1462 Código Civil (RF-WLD3)', () => {
    const res = generateKeyHandoverAct(sampleHandover);

    assert.strictEqual(res.documentType, 'key_handover_and_meter_act');
    assert.ok(res.isComplete);
    assert.strictEqual(res.detectedPendingFields.length, 0);

    // Inventario
    assert.strictEqual(res.inventorySummary.totalKeysSets, 8); // 3+2+2+1
    assert.strictEqual(res.inventorySummary.totalRemotes, 2);
    assert.strictEqual(res.inventorySummary.servicesRecordedCount, 3); // Luz, agua, gas

    // Verificaciones normativas
    assert.ok(res.actText.includes('Artículo 1462 del Código Civil'));
    assert.ok(res.actText.includes('Doña Carmen Gómez Alarcón'));
    assert.ok(res.actText.includes('Don Carlos Romero'));
    assert.ok(res.actText.includes('ES0021000001234567AB'));
    assert.ok(res.actText.includes('4852 kWh'));
    assert.ok(res.actText.includes('CYII-998822'));
    assert.ok(res.actText.includes('148 m³'));
  });

  test('Genera la autorización expresa para el cambio de titularidad de suministros (RF-WLD4)', () => {
    const res = generateKeyHandoverAct(sampleHandover);

    assert.ok(res.utilityTransferAuthorizationText.includes('AUTORIZACIÓN EXPRESA PARA CAMBIO DE TITULARIDAD'));
    assert.ok(res.utilityTransferAuthorizationText.includes('SIN CORTE DE SERVICIO'));
    assert.ok(res.utilityTransferAuthorizationText.includes('ES0021000001234567AB'));
    assert.ok(res.utilityTransferAuthorizationText.includes('CYII-998822'));
  });
});
