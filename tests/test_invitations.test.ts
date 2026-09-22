import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  createInvitation,
  validateInvitationToken,
  acceptInvitationAndRegister,
  clearInvitationsAndUsersForTests,
} from '../src/lib/auth/invitations.ts';

describe('T4: Sistema de Invitaciones y Registro con Vinculación de Tenant (RF-2)', () => {

  beforeEach(() => {
    clearInvitationsAndUsersForTests();
  });

  test('createInvitation genera un token seguro vinculado al tenant_id y con fecha de expiración', () => {
    const inv = createInvitation({
      tenantId: 'inmobia-valencia',
      email: 'agente.carmen@inmobia360.com',
      role: 'agent',
      expiresInHours: 24,
    });

    assert.ok(inv.token && inv.token.length === 64, 'El token debe ser un hash criptográfico de 64 caracteres.');
    assert.strictEqual(inv.tenantId, 'inmobia-valencia');
    assert.strictEqual(inv.email, 'agente.carmen@inmobia360.com');
    assert.strictEqual(inv.role, 'agent');
    assert.strictEqual(inv.usedAt, null);
    assert.ok(inv.expiresAt > new Date(), 'La fecha de expiración debe ser futura.');
  });

  test('createInvitation rechaza peticiones sin tenant_id o con email inválido', () => {
    assert.throws(
      () => createInvitation({ tenantId: '', email: 'test@inmobia360.com' }),
      /Violación de Tenant/i
    );

    assert.throws(
      () => createInvitation({ tenantId: 'agencia-madrid', email: 'email_invalido_sin_arroba' }),
      /Correo electrónico inválido/i
    );
  });

  test('validateInvitationToken comprueba existencia y estado no usado', () => {
    const inv = createInvitation({
      tenantId: 'inmobia-sevilla',
      email: 'juan.perez@inmobia360.com',
    });

    const val = validateInvitationToken(inv.token);
    assert.strictEqual(val.valid, true);
    assert.strictEqual(val.invitation?.tenantId, 'inmobia-sevilla');

    // Token inexistente
    const valInexistente = validateInvitationToken('token_totalmente_falso');
    assert.strictEqual(valInexistente.valid, false);
    assert.strictEqual(valInexistente.reason, 'NOT_FOUND');
  });

  test('validateInvitationToken detecta tokens expirados', () => {
    // Crear invitación expirada (hace 1 hora)
    const inv = createInvitation({
      tenantId: 'inmobia-madrid',
      email: 'caducado@inmobia360.com',
      expiresInHours: -1,
    });

    const val = validateInvitationToken(inv.token);
    assert.strictEqual(val.valid, false);
    assert.strictEqual(val.reason, 'EXPIRED');
  });

  test('acceptInvitationAndRegister consume el enlace, vincula al usuario al tenant e invalida el token (RF-2)', () => {
    const inv = createInvitation({
      tenantId: 'agencia-costa-sol',
      email: 'laura.asesora@inmobia360.com',
      role: 'agent',
    });

    // 1. Aceptar invitación y registrar usuario
    const result = acceptInvitationAndRegister({
      token: inv.token,
      fullName: 'Laura Asesora Inmobiliaria',
      password: 'passwordSeguro123!',
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.user, 'Debe devolver el registro del usuario creado.');
    assert.strictEqual(result.user?.tenantId, 'agencia-costa-sol', 'El usuario debe quedar vinculado al tenant_id de la invitación.');
    assert.strictEqual(result.user?.email, 'laura.asesora@inmobia360.com');
    assert.strictEqual(result.user?.fullName, 'Laura Asesora Inmobiliaria');

    // 2. Comprobar que el token quedó invalidado
    const valPostRegistro = validateInvitationToken(inv.token);
    assert.strictEqual(valPostRegistro.valid, false);
    assert.strictEqual(valPostRegistro.reason, 'ALREADY_USED');

    // 3. Intento de reusar el mismo token debe ser rechazado
    const segundoIntento = acceptInvitationAndRegister({
      token: inv.token,
      fullName: 'Intruso',
    });

    assert.strictEqual(segundoIntento.success, false);
    assert.strictEqual(segundoIntento.code, 'ALREADY_USED');
    assert.ok(segundoIntento.error?.includes('ya ha sido utilizada'));
  });

});
