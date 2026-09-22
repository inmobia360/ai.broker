export interface TenantAuditLog {
  id: string;
  timestamp: string;
  eventType: 'CROSS_TENANT_ACCESS_ATTEMPT' | 'UNAUTHORIZED_TENANT_ACCESS' | 'INVALID_TENANT_FORMAT' | 'UNAPPROVED_TRANSMISSION_ATTEMPT' | 'DRAFT_GUARD_VIOLATION';
  severity: 'HIGH' | 'CRITICAL' | 'WARNING';
  authenticatedTenantId?: string;
  attemptedTenantId?: string;
  endpoint: string;
  ipAddress?: string;
  details: string;
}

const auditLogs: TenantAuditLog[] = [];

/**
 * Registra una alerta de auditoría de seguridad multi-tenant.
 * Cumple con el requisito RF-3 (registro de alertas de auditoría de seguridad).
 */
export function recordSecurityAudit(log: Omit<TenantAuditLog, 'id' | 'timestamp'>): TenantAuditLog {
  const entry: TenantAuditLog = {
    id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };

  auditLogs.push(entry);

  // Mantener un buffer de los últimos 500 eventos en memoria
  if (auditLogs.length > 500) {
    auditLogs.shift();
  }

  // Log estructurado en consola para monitorización / agregadores externos
  console.warn(`[SEGURIDAD-AUDITORIA] [${entry.severity}] ${entry.eventType}: ${entry.details}`);

  return entry;
}

export function getSecurityAuditLogs(filterTenantId?: string): TenantAuditLog[] {
  if (filterTenantId) {
    return auditLogs.filter(
      (l) => l.authenticatedTenantId === filterTenantId || l.attemptedTenantId === filterTenantId
    );
  }
  return [...auditLogs];
}

export function clearSecurityAuditLogsForTests(): void {
  auditLogs.length = 0;
}
