import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  generateArrasPenitencialesContract,
  formatCurrencySpain
} from '../src/lib/legal/spain/arras.ts';
import { generateLauContract } from '../src/lib/legal/spain/lau.ts';
import { BrokerDirector } from '../src/lib/ai/brokerDirector.ts';

describe('T9: Generador de Contrato de Arras Penitenciales (Art. 1454 C.C. - RF-8)', () => {
  const tenantId = '00000000-0000-4000-8000-000000000001';

  test('formatCurrencySpain formatea números a estándar monetario español', () => {
    const formatted = formatCurrencySpain(325000);
    assert.ok(formatted?.includes('325.000'));
    assert.ok(formatted?.includes('€'));
  });

  test('Genera borrador referenciando expresamente el Art. 1454 del Código Civil español (RF-8)', () => {
    const contract = generateArrasPenitencialesContract();

    assert.strictEqual(contract.documentType, 'arras');
    assert.ok(contract.legalReference.includes('1454'), 'Debe citar el Art. 1454');
    assert.ok(contract.contractText.includes('1454 DEL CÓDIGO CIVIL'), 'El texto debe contener el Art. 1454 C.C.');
    assert.ok(contract.contractText.includes('ARRAS PENITENCIALES'), 'Debe calificar las arras como penitenciales');
    assert.ok(
      contract.contractText.includes('perderá íntegramente la cantidad') || contract.contractText.includes('perderá'),
      'Debe advertir la pérdida de señal por parte del comprador'
    );
    assert.ok(
      contract.contractText.includes('devolver las arras duplicadas') || contract.contractText.includes('doble'),
      'Debe advertir la devolución duplicada por parte del vendedor'
    );
  });

  test('Detecta campos ausentes con etiquetas [PENDIENTE: ...] sin inventar datos (RF-8, Casos Límite)', () => {
    const contract = generateArrasPenitencialesContract({
      municipio: 'Madrid',
      vendedor: {
        nombreCompleto: 'Carlos Gómez Fernández'
        // DNI no suministrado intencionadamente
      },
      comprador: {
        nombreCompleto: 'Elena Ruiz Martínez'
        // DNI no suministrado
      },
      condiciones: {
        precioTotal: 280000
        // Importe señal no suministrado
      }
    });

    assert.strictEqual(contract.isComplete, false, 'No debe considerarse completo si faltan datos esenciales');
    assert.ok(contract.detectedPendingFields.includes('DNI_VENDEDOR'), 'Debe detectar DNI_VENDEDOR pendiente');
    assert.ok(contract.detectedPendingFields.includes('DNI_COMPRADOR'), 'Debe detectar DNI_COMPRADOR pendiente');
    assert.ok(contract.detectedPendingFields.includes('IMPORTE_SEÑAL_ARRAS'), 'Debe detectar IMPORTE_SEÑAL pendiente');
    assert.ok(contract.detectedPendingFields.includes('REFERENCIA_CATASTRAL'), 'Debe detectar REFERENCIA_CATASTRAL pendiente');

    // En el texto deben aparecer las etiquetas explícitas
    assert.ok(contract.contractText.includes('[PENDIENTE: DNI_VENDEDOR]'));
    assert.ok(contract.contractText.includes('[PENDIENTE: DNI_COMPRADOR]'));
    assert.ok(contract.contractText.includes('[PENDIENTE: IMPORTE_SEÑAL_ARRAS]'));

    // Los datos sí suministrados deben estar presentes
    assert.ok(contract.contractText.includes('Carlos Gómez Fernández'));
    assert.ok(contract.contractText.includes('Elena Ruiz Martínez'));
    assert.ok(contract.contractText.includes('280.000'));
  });

  test('Genera contrato completo sin etiquetas [PENDIENTE] cuando todos los datos son suministrados (RF-8)', () => {
    const contract = generateArrasPenitencialesContract({
      municipio: 'Valencia',
      fecha: '15 de octubre de 2026',
      vendedor: {
        nombreCompleto: 'Juan López Navarro',
        dniNie: '12345678Z',
        domicilio: 'Calle Colón 14, 3ºB, Valencia',
        estadoCivil: 'casado en régimen de gananciales'
      },
      comprador: {
        nombreCompleto: 'María Torres Santos',
        dniNie: '87654321A',
        domicilio: 'Avenida del Puerto 50, 1ºA, Valencia',
        estadoCivil: 'soltera'
      },
      inmueble: {
        direccion: 'Calle Cirilo Amorós 22, 4ºD, Valencia',
        referenciaCatastral: '9876543VK4797S0001WX',
        datosRegistrales: 'Registro de la Propiedad nº 4 de Valencia, tomo 1200, libro 340, folio 89, finca 14502',
        cargas: 'libre de toda carga, hipoteca y arrendatarios'
      },
      condiciones: {
        precioTotal: 350000,
        importeSenalArras: 35000,
        formaPagoSenal: 'transferencia bancaria OMF a la cuenta de la parte vendedora',
        plazoMaximoNotaria: '15 de diciembre de 2026'
      }
    });

    assert.strictEqual(contract.isComplete, true);
    assert.strictEqual(contract.detectedPendingFields.length, 0, 'No debe haber campos pendientes');
    assert.ok(!contract.contractText.includes('[PENDIENTE:'), 'No debe contener ninguna etiqueta [PENDIENTE:');
    assert.strictEqual(contract.economicSummary.porcentajeSenal, 10, 'El porcentaje de señal debe ser exactamente 10%');
    assert.strictEqual(contract.economicSummary.precioTotal, 350000);
    assert.strictEqual(contract.economicSummary.importeSenal, 35000);

    // Comprobar cláusula de notaría y gastos conforme a ley española
    assert.ok(contract.contractText.includes('Plusvalía Municipal'));
    assert.ok(contract.contractText.includes('Notario que libremente elija la PARTE COMPRADORA'));
    assert.ok(contract.contractText.includes('Transmisiones Patrimoniales'));
  });

  test('El Director BROKER genera propuesta con borrador de arras penitenciales integrado (RF-4, RF-8)', async () => {
    const director = new BrokerDirector(tenantId);
    const result = await director.processUserMessage('Necesito formalizar un contrato de arras para un piso en Barcelona');

    assert.ok(result.delegatedSpecialists.includes('legal'));
    const proposal = result.actionProposals.find(p => p.payload.documentType === 'arras');
    assert.ok(proposal, 'Debe existir la propuesta de arras');
    assert.ok(proposal.payload.content.includes('1454 DEL CÓDIGO CIVIL'));
    assert.ok(proposal.payload.content.includes('ARRAS PENITENCIALES'));
    assert.strictEqual(proposal.requiresHumanApproval, true);
  });
});

describe('T10: Generador de Contrato de Alquiler Residencial (LAU 29/1994 - RF-9)', () => {
  const tenantId = '00000000-0000-4000-8000-000000000001';

  test('Genera borrador de alquiler referenciando imperativamente la Ley 29/1994 (LAU) (RF-9)', () => {
    const contract = generateLauContract();

    assert.strictEqual(contract.documentType, 'lau');
    assert.ok(contract.legalReference.includes('29/1994'), 'Debe citar la Ley 29/1994');
    assert.ok(contract.contractText.includes('LEY 29/1994 DE ARRENDAMIENTOS URBANOS'));
    assert.ok(contract.contractText.includes('VIVIENDA PERMANENTE Y HABITUAL'));
  });

  test('Aplica duración legal mínima de 5 años para personas físicas y 7 años para personas jurídicas (RF-9, Arts. 9 y 10 LAU)', () => {
    // 1. Arrendador persona física: 5 años
    const contratoFisica = generateLauContract({
      arrendador: {
        nombreCompleto: 'Antonio Sánchez Marín',
        esPersonaJuridica: false
      }
    });
    assert.strictEqual(contratoFisica.economicSummary.duracionMinimaAnos, 5);
    assert.ok(contratoFisica.contractText.includes('5 AÑOS'));

    // 2. Arrendador persona jurídica (empresa): 7 años
    const contratoJuridica = generateLauContract({
      arrendador: {
        nombreCompleto: 'Inversiones Inmobiliarias Madrid S.L.',
        esPersonaJuridica: true,
        cif: 'B-87654321',
        representanteLegal: 'Laura Pérez'
      }
    });
    assert.strictEqual(contratoJuridica.economicSummary.duracionMinimaAnos, 7);
    assert.ok(contratoJuridica.contractText.includes('7 AÑOS'));
    assert.ok(contratoJuridica.contractText.includes('Inversiones Inmobiliarias Madrid S.L.'));
  });

  test('Incluye fianza legal obligatoria de 1 mensualidad y cláusula de depósito autonómico (RF-9, Art. 36 LAU)', () => {
    const contract = generateLauContract({
      condiciones: {
        rentaMensual: 1200,
        organismoFianzaAutonomico: 'Instituto de la Vivienda de Madrid (IVIMA)'
      }
    });

    assert.strictEqual(contract.economicSummary.fianzaLegal, 1200, 'La fianza legal debe ser de 1 mensualidad de renta');
    assert.ok(contract.contractText.includes('1200,00') || contract.contractText.includes('1.200,00'));
    assert.ok(contract.contractText.includes('€'));
    assert.ok(contract.contractText.includes('Instituto de la Vivienda de Madrid (IVIMA)'));
    assert.ok(contract.contractText.includes('artículo 36.1 de la LAU'));
  });

  test('Estipula que los gastos de gestión inmobiliaria corresponden al arrendador (Art. 20.1 LAU)', () => {
    const contract = generateLauContract();
    assert.ok(contract.contractText.includes('artículo 20.1 de la LAU'));
    assert.ok(contract.contractText.includes('gestión inmobiliaria'));
    assert.ok(contract.contractText.includes('serán a cargo del arrendador'));
  });

  test('Detecta campos ausentes con etiquetas [PENDIENTE: ...] sin inventar datos (Casos Límite)', () => {
    const contract = generateLauContract({
      municipio: 'Sevilla',
      arrendador: {
        nombreCompleto: 'Francisco Navarro'
        // DNI faltante
      },
      arrendatario: {
        nombreCompleto: 'Clara Domínguez'
        // DNI faltante
      }
      // Renta no suministrada intencionadamente
    });

    assert.strictEqual(contract.isComplete, false);
    assert.ok(contract.detectedPendingFields.includes('DNI_ARRENDADOR'));
    assert.ok(contract.detectedPendingFields.includes('DNI_ARRENDATARIO'));
    assert.ok(contract.detectedPendingFields.includes('RENTA_MENSUAL'));
    assert.ok(contract.detectedPendingFields.includes('REFERENCIA_CATASTRAL'));

    assert.ok(contract.contractText.includes('[PENDIENTE: DNI_ARRENDADOR]'));
    assert.ok(contract.contractText.includes('[PENDIENTE: RENTA_MENSUAL]'));
  });

  test('Genera contrato de arrendamiento completo sin etiquetas [PENDIENTE] si todos los datos existen', () => {
    const contract = generateLauContract({
      municipio: 'Zaragoza',
      fecha: '1 de noviembre de 2026',
      arrendador: {
        nombreCompleto: 'Javier Castillo Morales',
        dniNie: '11223344B',
        domicilio: 'Paseo Independencia 10, 4ºA, Zaragoza',
        esPersonaJuridica: false
      },
      arrendatario: {
        nombreCompleto: 'Beatriz Molina Vega',
        dniNie: '99887766C',
        domicilio: 'Calle Alfonso I 18, 2ºB, Zaragoza'
      },
      inmueble: {
        direccion: 'Calle Don Jaime I 35, 3º Izq, Zaragoza',
        referenciaCatastral: '5432109AB1234S0001KL',
        incluyeMobiliario: true
      },
      condiciones: {
        rentaMensual: 950,
        cuentaBancariaPago: 'ES91 2100 0418 4502 0005 1332',
        organismoFianzaAutonomico: 'Gobierno de Aragón'
      }
    });

    assert.strictEqual(contract.isComplete, true);
    assert.strictEqual(contract.detectedPendingFields.length, 0);
    assert.ok(!contract.contractText.includes('[PENDIENTE:'));
    assert.strictEqual(contract.economicSummary.rentaMensual, 950);
    assert.strictEqual(contract.economicSummary.fianzaLegal, 950);
    assert.ok(contract.contractText.includes('amueblada, según inventario descriptivo'));
    assert.ok(contract.contractText.includes('ES91 2100 0418 4502 0005 1332'));
  });

  test('El Director BROKER genera propuesta con contrato de arrendamiento LAU integrado (RF-4, RF-9)', async () => {
    const director = new BrokerDirector(tenantId);
    const result = await director.processUserMessage('Redacta un contrato de alquiler de vivienda habitual LAU en Madrid');

    assert.ok(result.delegatedSpecialists.includes('legal'));
    const proposal = result.actionProposals.find(p => p.payload.documentType === 'lau');
    assert.ok(proposal, 'Debe existir la propuesta de alquiler LAU');
    assert.ok(proposal.payload.content.includes('LEY 29/1994 DE ARRENDAMIENTOS URBANOS'));
    assert.ok(proposal.payload.content.includes('FIANZA LEGAL OBLIGATORIA'));
    assert.strictEqual(proposal.requiresHumanApproval, true);
  });
});

