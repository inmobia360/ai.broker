import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  getDefaultWhiteLabelConfig, 
  mergeWhiteLabelConfig,
  validateTeamCapacity, 
  formatAgencyRole,
  MAX_TEAM_SEATS
} from '../src/lib/branding/whiteLabel.ts';
import type { TeamMember } from '../src/lib/branding/whiteLabel.ts';

describe('T3: Módulo de Marca Blanca y Plazas de Equipo (RF-WLD10, RNF-WLD1)', () => {
  test('Inicializa la configuración por defecto con aislamiento de tenant_id', () => {
    const config = getDefaultWhiteLabelConfig('inmobia360');

    assert.strictEqual(config.tenantId, 'inmobia360');
    assert.strictEqual(config.agencyName, 'Inmobia 360');
    assert.ok(config.team.length <= MAX_TEAM_SEATS);
    assert.strictEqual(config.fiscalId, 'B-88776655');
  });

  test('Normaliza la marca persistida en snake_case y conserva los valores ausentes', () => {
    const defaults = getDefaultWhiteLabelConfig('inmobia360');
    const config = mergeWhiteLabelConfig(defaults, {
      tenant_id: 'tenant-uuid',
      agency_name: 'Inmobia Centro',
      tagline: 'Tu agencia, conectada',
      primary_color: '#112233',
      accent_color: '#445566',
      tax_id: 'B12345678',
      association_number: 'API-123',
      support_email: 'hola@inmobia360.test',
      support_phone: '+34 900 000 000'
    });

    assert.strictEqual(config.tenantId, 'tenant-uuid');
    assert.strictEqual(config.agencyName, 'Inmobia Centro');
    assert.strictEqual(config.brandSlogan, 'Tu agencia, conectada');
    assert.strictEqual(config.primaryColor, '#112233');
    assert.strictEqual(config.accentColor, '#445566');
    assert.strictEqual(config.fiscalId, 'B12345678');
    assert.strictEqual(config.apiNumber, 'API-123');
    assert.strictEqual(config.contactEmail, 'hola@inmobia360.test');
    assert.strictEqual(config.contactPhone, '+34 900 000 000');
    assert.strictEqual(config.address, defaults.address);
    assert.deepStrictEqual(config.team, defaults.team);
  });

  test('Valida que no se exceda el cupo máximo de 5 integrantes en el equipo', () => {
    const validTeam: TeamMember[] = [
      { id: '1', name: 'Agente 1', email: '1@a.es', role: 'broker_titular', phone: '1', active: true },
      { id: '2', name: 'Agente 2', email: '2@a.es', role: 'agente_senior', phone: '2', active: true },
      { id: '3', name: 'Agente 3', email: '3@a.es', role: 'agente_asociado', phone: '3', active: true },
      { id: '4', name: 'Agente 4', email: '4@a.es', role: 'coordinador', phone: '4', active: true },
      { id: '5', name: 'Agente 5', email: '5@a.es', role: 'agente_asociado', phone: '5', active: true }
    ];

    const resValid = validateTeamCapacity(validTeam);
    assert.strictEqual(resValid.valid, true);

    const exceededTeam: TeamMember[] = [
      ...validTeam,
      { id: '6', name: 'Agente 6', email: '6@a.es', role: 'agente_asociado', phone: '6', active: true }
    ];

    const resExceeded = validateTeamCapacity(exceededTeam);
    assert.strictEqual(resExceeded.valid, false);
    assert.ok(resExceeded.error?.includes('máximo de 5 agentes'));
  });

  test('Traduce adecuadamente los roles institucionales en español peninsular', () => {
    assert.strictEqual(formatAgencyRole('broker_titular'), 'Broker Titular / Director de Agencia');
    assert.strictEqual(formatAgencyRole('agente_senior'), 'Agente Inmobiliario Senior');
    assert.strictEqual(formatAgencyRole('coordinador'), 'Coordinador / Gestión Documental');
  });
});

