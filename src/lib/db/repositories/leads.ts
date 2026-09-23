import { withTenantContext } from "../client";

export interface LeadRow {
  id: string;
  tenant_id: string;
  full_name: string;
  phone: string;
  email?: string;
  intent_type: "buy" | "rent" | "invest";
  location_preference: string;
  budget: number;
  timeframe: string;
  demand_quote: string;
  hot_score: number;
  recommended_action: string;
  status: "new" | "in_progress" | "scheduled" | "archived";
  assigned_agent_id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export async function listLeads(tenantId: string): Promise<LeadRow[]> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `SELECT * FROM leads WHERE tenant_id = $1 ORDER BY hot_score DESC, created_at DESC`,
      [tenantId]
    );
    return res.rows.map(row => ({
      ...row,
      budget: parseFloat(row.budget)
    }));
  });
}

export async function createLead(
  tenantId: string,
  data: Omit<LeadRow, "id" | "tenant_id" | "created_at" | "updated_at">
): Promise<LeadRow> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `INSERT INTO leads (
        tenant_id, full_name, phone, email, intent_type, location_preference,
        budget, timeframe, demand_quote, hot_score, recommended_action, status, assigned_agent_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        tenantId,
        data.full_name,
        data.phone,
        data.email || null,
        data.intent_type || "buy",
        data.location_preference,
        data.budget || 0,
        data.timeframe || "Ahora",
        data.demand_quote,
        data.hot_score || 50,
        data.recommended_action || "Contactar por teléfono o WhatsApp.",
        data.status || "new",
        data.assigned_agent_id || null
      ]
    );
    const row = res.rows[0];
    return {
      ...row,
      budget: parseFloat(row.budget)
    };
  });
}

export async function updateLeadStatus(
  tenantId: string,
  id: string,
  status: LeadRow["status"]
): Promise<LeadRow | null> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `UPDATE leads SET status = $1, updated_at = NOW() 
       WHERE tenant_id = $2 AND id = $3 
       RETURNING *`,
      [status, tenantId, id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      budget: parseFloat(row.budget)
    };
  });
}
