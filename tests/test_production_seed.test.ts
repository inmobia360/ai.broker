import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DEMO_PROPERTIES } from '../src/lib/properties/propertyTypes.ts';
import { PRIORITY_LEADS } from '../src/lib/leads/leadTypes.ts';
import { INITIAL_PIPELINE_CASES } from '../src/lib/pipeline/pipelineTypes.ts';
import { toTenantUuid } from '../src/lib/tenant.ts';

describe('T15: Semillado Idempotente y Persistencia Multi-Tenant (Seed)', () => {

  test('Los datos maestros de semillado están definidos y completos', () => {
    assert.strictEqual(DEMO_PROPERTIES.length, 5, 'Deben existir 5 propiedades de catálogo base');
    assert.strictEqual(PRIORITY_LEADS.length, 2, 'Deben existir 2 leads prioritarios calientes');
    assert.strictEqual(INITIAL_PIPELINE_CASES.length, 7, 'Deben existir 7 expedientes del pipeline');

    for (const prop of DEMO_PROPERTIES) {
      assert.ok(prop.id, 'La propiedad debe tener id');
      assert.ok(prop.title, 'La propiedad debe tener título');
      assert.ok(prop.price > 0, 'La propiedad debe tener precio positivo');
      assert.ok(prop.cadastralRef, 'Debe incluir referencia catastral');
    }

    for (const lead of PRIORITY_LEADS) {
      assert.ok(lead.id, 'El lead debe tener id');
      assert.ok(lead.name, 'El lead debe tener nombre');
      assert.ok(lead.phone, 'El lead debe tener teléfono');
      assert.ok(lead.category, 'El lead debe tener categoría de intención');
    }

    for (const deal of INITIAL_PIPELINE_CASES) {
      assert.ok(deal.id, 'El expediente debe tener id');
      assert.match(deal.id, /^EXP-\d{4}-\d{3}$/, 'El id debe contener el código de expediente');
      assert.ok(deal.stage, 'El expediente debe tener fase asignada');
      assert.ok(deal.clientName, 'El expediente debe tener nombre de cliente');
    }
  });

  test('La resolución de UUID del tenant es determinista para la persistencia', () => {
    const uuid1 = toTenantUuid('inmobia360');
    const uuid2 = toTenantUuid('inmobia360');
    assert.strictEqual(uuid1, uuid2, 'El UUID generado debe ser determinista');
    assert.match(uuid1, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});

