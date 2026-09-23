import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RealEstateAIEngine } from '../src/lib/ai/realEstateAIEngine.ts';
import type { PropertyDataInput, LeadEvaluationInput } from '../src/lib/ai/realEstateAIEngine.ts';

describe('T14: Motor de Marketing Multicanal IA y Cualificación de Leads (RF-MKT10, RF-LEAD)', () => {
  const sampleProperty: PropertyDataInput = {
    title: 'Ático Dúplex Exclusivo en Barrio de Salamanca',
    propertyType: 'Ático Dúplex',
    operation: 'sale',
    location: 'Barrio de Salamanca, Madrid',
    city: 'Madrid',
    address: 'Calle Serrano 45',
    price: 890000,
    currency: '€',
    builtM2: 165,
    bedrooms: 3,
    bathrooms: 2,
    hasGarage: true,
    hasTerrace: true,
    hasElevator: true,
    cadastralRef: '5432101VK4753B0001TR',
    features: ['Terraza de 35 m²', 'Calefacción individual', 'Portero físico']
  };

  test('Genera los 10 canales comerciales sin alucinaciones de precios ni m²', async () => {
    const pack = await RealEstateAIEngine.generateMarketingPack(sampleProperty, { useOllama: false });

    assert.ok(pack.commercialTitle.includes('Ático Dúplex'));
    assert.ok(pack.commercialTitle.includes('165 m²'));
    assert.ok(pack.shortDescription.includes('890.000 €'));
    assert.ok(pack.shortDescription.includes('Madrid'));
    assert.ok(pack.longDescription.includes('5432101VK4753B0001TR'));
    assert.ok(pack.instagramCopy.includes('#Inmobiliaria'));
    assert.ok(pack.facebookCopy.includes('Salamanca'));
    assert.ok(pack.whatsappMessage.includes('*890.000 €*'));
    assert.ok(pack.videoScript.includes('[ESCENA 1 - GANCHO'));
    assert.ok(pack.investorAngle.includes('CAP RATE'));
    assert.ok(pack.foreignBuyerAngle.includes('SPAIN'));
    assert.ok(pack.translatedEn.includes('Exclusive'));
  });

  test('Evalúa Lead caliente con intención inmediata y presupuesto alineado', () => {
    const hotLead: LeadEvaluationInput = {
      name: 'María Luisa Torres',
      email: 'marialuisa@empresa.es',
      phone: '+34 654 321 987',
      inquiryType: 'visit',
      message: 'Deseo concertar una visita presencial este viernes para formalizar oferta.',
      budget: 890000,
      timeframe: 'immediate',
      consent: true,
      propertyPrice: 890000
    };

    const evaluation = RealEstateAIEngine.scoreLead(hotLead);

    assert.equal(evaluation.temperature, 'hot');
    assert.ok(evaluation.score >= 75);
    assert.ok(evaluation.recommendedAction.includes('Llamada telefónica prioritaria'));
  });

  test('Evalúa Lead templado o explorador con horizonte a medio plazo', () => {
    const warmLead: LeadEvaluationInput = {
      name: 'Javier Ruiz',
      email: 'javier@gmail.com',
      phone: '611222333',
      inquiryType: 'buy',
      message: 'Me gustaría recibir información técnica del edificio.',
      budget: 700000,
      timeframe: '3_6_months',
      consent: true,
      propertyPrice: 890000
    };

    const evaluation = RealEstateAIEngine.scoreLead(warmLead);

    assert.ok(evaluation.score < 75);
    assert.ok(evaluation.temperature === 'warm' || evaluation.temperature === 'cold');
    assert.ok(evaluation.aiSummary.length > 10);
  });
});
