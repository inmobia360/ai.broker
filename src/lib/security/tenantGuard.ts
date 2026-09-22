import { recordSecurityAudit } from './audit.ts';

export interface TenantAuthResult {
  authorized: boolean;
  tenantId?: string;
  statusCode: number;
  error?: string;
}

/**
 * Valida sintácticamente un identificador de tenant (slug alfanumérico con guiones o UUID v4).
 */
export function isValidTenantFormat(tenantId: string): boolean {
  if (!tenantId || typeof tenantId !== 'string') return false;
  const trimmed = tenantId.trim();
  if (trimmed.length < 2 || trimmed.length > 64) return false;

  // UUID v4 o slug alfanumérico con guiones/subguiones
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const slugRegex = /^[a-z0-9][a-z0-9_-]{1,62}[a-z0-9]$/i;

  return uuidRegex.test(trimmed) || slugRegex.test(trimmed);
}

/**
 * Extrae el tenant_id de la petición HTTP evaluando:
 * 1. Cabecera 'x-tenant-id' o 'x-verified-tenant-id'.
 * 2. Cabecera 'authorization' (Bearer token simulado / JWT).
 * 3. Subdominio del host (ej: agencia-norte.inmobia360.com -> agencia-norte).
 */
export function resolveTenantFromRequest(req: Request): string | null {
  // 1. Cabeceras directas de tenant
  const directHeader = req.headers.get('x-verified-tenant-id') || req.headers.get('x-tenant-id');
  if (directHeader && directHeader.trim()) {
    return directHeader.trim().toLowerCase();
  }

  // 2. Token Bearer en Authorization
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    // Soporte para tokens estructurados tipo "tenant:<id>" o tokens mock
    if (token.startsWith('tenant:')) {
      return token.split(':')[1]?.toLowerCase() || null;
    }
  }

  // 3. Resolución por subdominio del Host
  const host = req.headers.get('host') || '';
  if (host.includes('.inmobia360.com')) {
    const sub = host.split('.')[0].toLowerCase();
    if (sub && sub !== 'www' && sub !== 'app' && sub !== 'api') {
      return sub;
    }
  }

  return null;
}

/**
 * Aplica el control estricto de acceso por tenant conforme a RF-1 y RF-3:
 * - Si falta el tenant_id: 401 Unauthorized.
 * - Si el tenant_id tiene formato inválido: 400 Bad Request.
 * - Si el cliente intenta consultar o manipular un targetTenantId diferente al de su sesión: 403 Forbidden + Alerta de Auditoría.
 */
export function enforceTenantAccess(
  req: Request,
  targetTenantId?: string
): TenantAuthResult {
  const endpoint = new URL(req.url, 'http://localhost').pathname;
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;

  const resolvedTenant = resolveTenantFromRequest(req);

  // Caso 1: Falta el tenant_id en la petición (RF-1)
  if (!resolvedTenant) {
    recordSecurityAudit({
      eventType: 'UNAUTHORIZED_TENANT_ACCESS',
      severity: 'HIGH',
      endpoint,
      ipAddress: clientIp,
      details: 'Intento de acceso a recurso protegido sin tenant_id en cabeceras ni sesión.',
    });

    return {
      authorized: false,
      statusCode: 401,
      error: 'Autenticación requerida: No se proporcionó un tenant_id válido en la petición.',
    };
  }

  // Caso 2: Formato de tenant inválido
  if (!isValidTenantFormat(resolvedTenant)) {
    recordSecurityAudit({
      eventType: 'INVALID_TENANT_FORMAT',
      severity: 'WARNING',
      attemptedTenantId: resolvedTenant,
      endpoint,
      ipAddress: clientIp,
      details: `Formato de tenant_id inválido recibido: '${resolvedTenant}'`,
    });

    return {
      authorized: false,
      statusCode: 400,
      error: 'Identificador de agencia (tenant_id) con formato no válido.',
    };
  }

  // Caso 3: Violación de aislamiento cruzado (Cross-tenant attack) (RF-3)
  if (targetTenantId) {
    const normalizedTarget = targetTenantId.trim().toLowerCase();
    if (normalizedTarget !== resolvedTenant) {
      recordSecurityAudit({
        eventType: 'CROSS_TENANT_ACCESS_ATTEMPT',
        severity: 'CRITICAL',
        authenticatedTenantId: resolvedTenant,
        attemptedTenantId: normalizedTarget,
        endpoint,
        ipAddress: clientIp,
        details: `Violación de Aislamiento RLS: El tenant '${resolvedTenant}' intentó acceder a recursos del tenant '${normalizedTarget}'.`,
      });

      return {
        authorized: false,
        statusCode: 403,
        error: 'Acceso denegado: No tienes permisos para acceder o modificar los recursos de otra agencia.',
      };
    }
  }

  // Acceso autorizado
  return {
    authorized: true,
    tenantId: resolvedTenant,
    statusCode: 200,
  };
}
