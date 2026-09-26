import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit, clearRateLimitsForTesting } from '../src/lib/security/rateLimiter.ts';

describe('T14: Limitador de Tasa Perimétrico y Anti-Saturación (Rate Limiter)', () => {

  beforeEach(() => {
    clearRateLimitsForTesting();
  });

  test('Permite peticiones consecutivas dentro del umbral configurado', () => {
    const key = 'test-ip-1';
    const limit = 5;

    for (let i = 1; i <= limit; i++) {
      const res = checkRateLimit(key, limit, 60000);
      assert.strictEqual(res.allowed, true, `La petición ${i} debería permitirse`);
      assert.strictEqual(res.remaining, limit - i);
      assert.strictEqual(res.retryAfterSeconds, 0);
    }
  });

  test('Bloquea con 429 / allowed=false al superar el límite estipulado', () => {
    const key = 'test-ip-blocked';
    const limit = 3;

    // Consumir las 3 permitidas
    for (let i = 0; i < limit; i++) {
      checkRateLimit(key, limit, 60000);
    }

    // La 4ª debe ser rechazada
    const blockedRes = checkRateLimit(key, limit, 60000);
    assert.strictEqual(blockedRes.allowed, false);
    assert.strictEqual(blockedRes.remaining, 0);
    assert.ok(blockedRes.retryAfterSeconds > 0, 'Debe devolver un tiempo de espera positivo');
    assert.ok(blockedRes.retryAfterSeconds <= 60, 'El tiempo de reintento debe estar dentro de la ventana');
  });

  test('Mantiene aislamiento entre diferentes IPs y prefijos', () => {
    const ipA = 'chat:192.168.1.50';
    const ipB = 'chat:192.168.1.51';
    const limit = 2;

    checkRateLimit(ipA, limit, 60000);
    checkRateLimit(ipA, limit, 60000);
    const resA = checkRateLimit(ipA, limit, 60000);
    assert.strictEqual(resA.allowed, false, 'IP A debe estar bloqueada');

    // IP B no debe estar bloqueada
    const resB = checkRateLimit(ipB, limit, 60000);
    assert.strictEqual(resB.allowed, true, 'IP B debe tener cuota disponible');
    assert.strictEqual(resB.remaining, 1);
  });

  test('Distingue entre endpoints de Chat (25/min) y Leads (10/min)', () => {
    const chatKey = 'chat:10.0.0.1';
    const leadsKey = 'leads:10.0.0.1';

    const chatRes = checkRateLimit(chatKey, 25, 60000);
    const leadsRes = checkRateLimit(leadsKey, 10, 60000);

    assert.strictEqual(chatRes.allowed, true);
    assert.strictEqual(chatRes.limit, 25);
    assert.strictEqual(leadsRes.allowed, true);
    assert.strictEqual(leadsRes.limit, 10);
  });
});
