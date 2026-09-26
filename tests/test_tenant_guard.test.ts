import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { 
  enforceTenantAccess, 
  resolveTenantFromRequest, 
  isValidTenantFormat 
} from '../src/lib/security/tenantGuard.ts';
import { 
  getSecurityAuditLogs, 
  clearSecurityAuditLogsForTests 
} from '../src/lib/security/audit.ts';

describe('T3: Contexto de Seguridad, Middleware y Detección de Cross-Tenant (RF-1, RF-3)', () => {

  beforeEach(() => {
    clearSecurityAuditLogsForTests();
  });

  test('isValidTenantFormat valida slugs y UUIDs correctamente', () => {
    assert.strictEqual(isValidTenantFormat('inmobia360'), true);
    assert.strictEqual(isValidTenantFormat('agencia-madrid-centro'), true);
    assert.strictEqual(isValidTenantFormat('123e4567-e89b-12d3-a456-426614174000'), true);
    
    // Formatos inválidos
    assert.strictEqual(isValidTenantFormat(''), false);
    assert.strictEqual(isValidTenantFormat('a'), false); // muy corto
    assert.strictEqual(isValidTenantFormat('agencia$invalida!'), false);
    assert.strictEqual(isValidTenantFormat('   '), false);
  });

  test('resolveTenantFromRequest extrae el tenant de cabeceras x-tenant-id y x-verified-tenant-id', () => {
    const req1 = new Request('http://localhost/api/chat', {
      headers: { 'x-tenant-id': 'agencia-valencia' }
    });
    assert.strictEqual(resolveTenantFromRequest(req1), 'agencia-valencia');

    const req2 = new Request('http://localhost/api/chat', {
      headers: { 'x-verified-tenant-id': 'agencia-bilbao' }
    });
    assert.strictEqual(resolveTenantFromRequest(req2), 'agencia-bilbao');
  });

  test('resolveTenantFromRequest resuelve el tenant por subdominio del host', () => {
    const req = new Request('https://sevilla-prime.inmobia360.com/api/chat', {
      headers: { host: 'sevilla-prime.inmobia360.com' }
    });
    assert.strictEqual(resolveTenantFromRequest(req), 'sevilla-prime');

    // Subdominios reservados no deben ser tratados como tenant
    const reqWww = new Request('https://www.inmobia360.com/api/chat', {
      headers: { host: 'www.inmobia360.com' }
    });
    assert.strictEqual(resolveTenantFromRequest(reqWww), null);
  });

  test('enforceTenantAccess rechaza con 401 peticiones sin contexto de tenant (RF-1)', () => {
    const req = new Request('http://localhost/api/chat');
    const result = enforceTenantAccess(req);

    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.statusCode, 401);
    assert.ok(result.error?.includes('Autenticación requerida'));

    // Verifica que se registró la alerta de auditoría
    const logs = getSecurityAuditLogs();
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].eventType, 'UNAUTHORIZED_TENANT_ACCESS');
  });

  test('enforceTenantAccess rechaza con 400 identificadores de tenant con formato inválido', () => {
    const req = new Request('http://localhost/api/chat', {
      headers: { 'x-tenant-id': '!@#_invalido_$$' }
    });
    const result = enforceTenantAccess(req);

    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.statusCode, 400);

    const logs = getSecurityAuditLogs();
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].eventType, 'INVALID_TENANT_FORMAT');
  });

  test('enforceTenantAccess permite acceso legítimo con status 200', () => {
    const req = new Request('http://localhost/api/chat', {
      headers: { 'x-tenant-id': 'inmobia360-central' }
    });
    const result = enforceTenantAccess(req);

    assert.strictEqual(result.authorized, true);
    assert.strictEqual(result.statusCode, 200);
    assert.strictEqual(result.tenantId, 'inmobia360-central');

    const logs = getSecurityAuditLogs();
    assert.strictEqual(logs.length, 0); // Cero alertas para accesos legítimos
  });

  test('Bloqueo de Inyección Cross-Tenant: Devuelve 403 y registra alerta crítica (RF-3)', () => {
    // Usuario autenticado en "agencia-madrid" intentando operar sobre "agencia-barcelona"
    const req = new Request('http://localhost/api/dossiers', {
      headers: { 
        'x-tenant-id': 'agencia-madrid',
        'x-forwarded-for': '192.168.1.50'
      }
    });

    const result = enforceTenantAccess(req, 'agencia-barcelona');

    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.statusCode, 403);
    assert.ok(result.error?.includes('Acceso denegado'));

    // Verificar que se registró la alerta de seguridad crítica en auditoría
    const logs = getSecurityAuditLogs();
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].eventType, 'CROSS_TENANT_ACCESS_ATTEMPT');
    assert.strictEqual(logs[0].severity, 'CRITICAL');
    assert.strictEqual(logs[0].authenticatedTenantId, 'agencia-madrid');
    assert.strictEqual(logs[0].attemptedTenantId, 'agencia-barcelona');
    assert.strictEqual(logs[0].ipAddress, '192.168.1.50');
  });

  test('resolveTenantFromRequest resuelve inmobia360 para app.inmobia360.com y cookies', () => {
    // 1. Host app.inmobia360.com
    const reqApp = new Request('https://app.inmobia360.com/api/chat', {
      headers: { host: 'app.inmobia360.com' }
    });
    assert.strictEqual(resolveTenantFromRequest(reqApp), 'inmobia360');

    // 2. Cookie de sesión inmobia_tenant
    const reqCookie = new Request('http://localhost/api/chat', {
      headers: { cookie: 'session_id=abc; inmobia_tenant=inmobia360; other=123' }
    });
    assert.strictEqual(resolveTenantFromRequest(reqCookie), 'inmobia360');
  });

});
