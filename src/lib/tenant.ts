export class TenantContext {
  private tenantId: string;

  constructor(tenantId: string) {
    if (!tenantId || tenantId.trim() === "") {
      throw new Error("Violacion Constitucional: Toda operacion requiere tenant_id explicito y no nulo.");
    }
    this.tenantId = tenantId.trim();
  }

  getTenantId(): string {
    return this.tenantId;
  }

  enforceTenantScope<T extends { tenantId: string }>(record: T): T {
    if (record.tenantId !== this.tenantId) {
      throw new Error(`Violacion de Aislamiento Multi-tenant: el registro pertenece a ${record.tenantId}, no a ${this.tenantId}`);
    }
    return record;
  }
}
