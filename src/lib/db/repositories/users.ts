import { withTenantContext } from "../client.ts";

export interface UserRow {
  id: string;
  tenant_id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role: "director" | "agent";
  created_at?: Date;
  updated_at?: Date;
}

export async function countTenantUsers(tenantId: string): Promise<number> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `SELECT COUNT(*)::int as count FROM users WHERE tenant_id = $1`,
      [tenantId]
    );
    return res.rows[0].count;
  });
}

export function evaluateSeatCapacity(
  currentUsersCount: number,
  planType: "solo" | "boutique" = "boutique"
): { allowed: boolean; currentCount: number; maxAllowed: number; error?: string } {
  const maxAllowed = planType === "solo" ? 1 : 5;
  const allowed = currentUsersCount < maxAllowed;
  return {
    allowed,
    currentCount: currentUsersCount,
    maxAllowed,
    error: allowed ? undefined : `Límite de capacidad superado: El plan actual permite un máximo de ${maxAllowed} integrantes.`
  };
}

export async function validateCapacity(
  tenantId: string,
  planType: "solo" | "boutique" = "boutique"
): Promise<{ allowed: boolean; currentCount: number; maxAllowed: number }> {
  const currentCount = await countTenantUsers(tenantId);
  const maxAllowed = planType === "solo" ? 1 : 5;
  return {
    allowed: currentCount < maxAllowed,
    currentCount,
    maxAllowed
  };
}

export async function createUserWithCapacityCheck(
  tenantId: string,
  userData: { email: string; password_hash?: string; full_name: string; role: "director" | "agent" },
  planType: "solo" | "boutique" = "boutique"
): Promise<UserRow> {
  const capacity = await validateCapacity(tenantId, planType);
  if (!capacity.allowed) {
    throw new Error(
      `Límite de capacidad superado: El plan actual permite un máximo de ${capacity.maxAllowed} integrantes (actuales: ${capacity.currentCount}).`
    );
  }

  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [tenantId, userData.email.toLowerCase().trim(), userData.password_hash || null, userData.full_name, userData.role]
    );
    return res.rows[0];
  });
}
