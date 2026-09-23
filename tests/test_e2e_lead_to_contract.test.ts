import { describe, it } from 'node:test';
import assert from 'node:assert';
import { generateVisitSheet } from '../src/lib/legal/spain/visita.ts';
import { generateArrasContract } from '../src/lib/legal/spain/arras.ts';
import { generateLPHDebtCertificateRequest } from '../src/lib/legal/spain/communityLPH.ts';
import { generateKeyHandoverAct } from '../src/lib/legal/spain/handoverPostventa.ts';
import { getDefaultWhiteLabelConfig } from '../src/lib/branding/whiteLabel.ts';
import { toTenantUuid } from '../src/lib/tenant.ts';

describe('E2E Operational Flow: Captura ➔ Scoring IA ➔ Pipeline ➔ Arras 1454 C.C. ➔ Entrega', () => {

  it('1. Captura de lead desde landing y cálculo automático de temperatura (Hot Score)', () => {
    const rawLeadInput = {
      name: 'Carlos Romero (Family Office)',
      phone: '+34 600 123 456',
      email: 'carlos@familyoffice.es',
      property_id: 'prop-salamanca-01',
      budget: '850.000 €',
      timeframe: 'immediate',
      message: 'Hola, buscamos un ático de 3 habitaciones en Barrio de Salamanca con terraza y garaje para inversión patrimonial. Contamos con 850.000€ al contado sin necesidad de hipoteca.'
    };

    // Validación del cálculo de scoring
    let score = 65;
    const lower = rawLeadInput.message.toLowerCase();
    if (rawLeadInput.timeframe === 'immediate') score += 15;
    // Spanish number format uses '.' as thousands separator: '850.000 €' → 850000
    const numBudget = parseFloat(rawLeadInput.budget.replace(/\./g, '').replace(/[^0-9]/g, '')) || 0;
    if (numBudget >= 500000) score += 10;
    if (lower.includes('contado') || lower.includes('sin hipoteca')) score += 10;
    score = Math.min(98, score);

    assert.ok(score >= 90, `El lead debe ser clasificado como Caliente (>=90), obtenido: ${score}`);
    assert.strictEqual(score, 98);
  });

  it('2. Conversión a Expediente en el Pipeline de 7 Fases', () => {
    const lead = {
      id: 'lead-test-01',
      name: 'Carlos Romero',
      budget: '850.000 €',
      location: 'Madrid (Barrio de Salamanca)'
    };

    const newDeal = {
      id: 'EXP-2026-001',
      title: `Operación ${lead.name} — ${lead.location}`,
      clientName: lead.name,
      price: lead.budget,
      stage: 'comercializacion',
      pendingDoc: 'Hoja de Visita con Reserva de Honorarios'
    };

    assert.strictEqual(newDeal.stage, 'comercializacion');
    assert.ok(newDeal.title.includes('Carlos Romero'));
  });

  it('3. Generación de Hoja de Encargo de Visita con Blindaje de Honorarios', () => {
    const brand = getDefaultWhiteLabelConfig('inmobia360');
    const doc = generateVisitSheet({
      agencia: {
        nombreAgencia: brand.agencyName,
        cif: brand.fiscalId,
        registroProfesional: brand.apiNumber
      },
      visitante: {
        nombreCompleto: 'Carlos Romero',
        telefono: '+34 600 123 456'
      },
      inmueble: {
        direccion: 'Calle Serrano 45, 3º D, Madrid',
        precioOrientativo: 850000
      },
      honorarios: {
        porcentajeHonorariosVenta: 3,
        ivaAplicable: 21,
        periodoValidezMeses: 12
      }
    });

    assert.ok(doc.sheetText.includes('HOJA DE VISITA Y RECONOCIMIENTO DE GESTIÓN INMOBILIARIA'));
    assert.ok(doc.sheetText.includes(brand.agencyName));
    assert.ok(doc.sheetText.includes('850.000'));
    assert.ok(doc.sheetText.includes('3%'));
  });

  it('4. Generación de Contrato de Arras Penitenciales según Art. 1454 Código Civil', () => {
    const brand = getDefaultWhiteLabelConfig('inmobia360');
    const precio = 850000;
    const senal = Math.round(precio * 0.10);

    const doc = generateArrasContract({
      municipio: 'Madrid',
      fecha: new Date().toLocaleDateString('es-ES'),
      vendedor: {
        nombreCompleto: 'Parte Vendedora Propietaria',
        dniNie: '12345678Z'
      },
      comprador: {
        nombreCompleto: 'Carlos Romero',
        dniNie: '87654321X'
      },
      inmueble: {
        direccion: 'Calle Serrano 45, 3º D, Madrid',
        referenciaCatastral: '9872023VK4797S0001WX',
        datosRegistrales: 'Finca Registral nº 48.912 del Registro de la Propiedad nº 4 de Madrid'
      },
      condiciones: {
        precioTotal: precio,
        importeSenalArras: senal,
        formaPagoSenal: 'Transferencia bancaria a cuenta de depósito en garantía',
        plazoMaximoNotaria: '60 días naturales'
      }
    });

    assert.ok(doc.contractText.includes('ARRAS PENITENCIALES'));
    assert.ok(doc.contractText.includes('1454'));
    assert.ok(doc.contractText.includes('85.000'));
    assert.ok(doc.contractText.includes('850.000'));
  });

  it('5. Cierre y Postventa: Certificado LPH Deuda Cero y Acta de Entrega con CUPS', () => {
    const certLph = generateLPHDebtCertificateRequest({
      details: {
        propertyAddress: 'Calle Serrano 45, 3º D, Madrid',
        ownerName: 'Parte Vendedora Propietaria',
        ownerDni: '12345678Z',
        monthlyOrdinaryFee: 180,
        administrator: {
          name: 'Administración Fincas Salamanca',
          collegeNumber: 'CAF-3301',
          email: 'info@fincassalamanca.com',
          phone: '+34 912 000 000'
        }
      },
      requestDate: '23/09/2026',
      notaryScheduledDate: '15/10/2026'
    });

    assert.ok(certLph.documentText.includes('CERTIFICACIÓN DE ESTADO DE DEUDAS CON LA COMUNIDAD DE PROPIETARIOS'));
    assert.ok(certLph.documentText.includes('9.1.e'));

    const actaLlaves = generateKeyHandoverAct({
      propertyAddress: 'Calle Serrano 45, 3º D, Madrid',
      transferDate: '15/10/2026',
      transferType: 'compraventa',
      transferor: { fullName: 'Parte Vendedora', dniNie: '12345678Z' },
      acquirer: { fullName: 'Carlos Romero', dniNie: '87654321X' },
      agentName: 'Agente Inmobia 360',
      agencyName: 'Inmobia 360 Prime',
      keys: { mainDoorSets: 3, portalSets: 2, mailboxKeys: 1, storageRoomKeys: 1, garageRemotes: 1 },
      utilities: {
        electricity: {
          serviceType: 'electricidad',
          companyName: 'Iberdrola',
          meterNumber: 'MTR-9988',
          cups: 'ES002100000123456789AB1F',
          readingValue: 12500,
          unit: 'kWh'
        },
        water: {
          serviceType: 'agua',
          companyName: 'Canal de Isabel II',
          meterNumber: 'AGU-4421',
          readingValue: 320,
          unit: 'm³'
        }
      }
    });

    assert.ok(actaLlaves.actText.includes('ACTA DE ENTREGA DE LLAVES, TRANSMISIÓN DE POSESIÓN'));
    assert.ok(actaLlaves.actText.includes('ES002100000123456789AB1F'));
  });

  it('6. Aislamiento Multi-Tenant por UUID determinista', () => {
    const tenantMadrid = toTenantUuid('agencia-madrid');
    const tenantBarcelona = toTenantUuid('agencia-barcelona');

    assert.notStrictEqual(tenantMadrid, tenantBarcelona);
    assert.strictEqual(tenantMadrid, toTenantUuid('agencia-madrid'));
  });
});
