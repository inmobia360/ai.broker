import crypto from "crypto";

export function toTenantUuid(tenantSlugOrId: string): string {
  if (!tenantSlugOrId || tenantSlugOrId.trim() === "") {
    return "00000000-0000-0000-0000-000000000001";
  }
  const trimmed = tenantSlugOrId.trim().toLowerCase();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(trimmed)) {
    return trimmed;
  }
  const hash = crypto.createHash("md5").update(trimmed).digest("hex");
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

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

  getTenantUuid(): string {
    return toTenantUuid(this.tenantId);
  }

  enforceTenantScope<T extends { tenantId: string }>(record: T): T {
    if (record.tenantId !== this.tenantId) {
      throw new Error(`Violacion de Aislamiento Multi-tenant: el registro pertenece a ${record.tenantId}, no a ${this.tenantId}`);
    }
    return record;
  }
}

