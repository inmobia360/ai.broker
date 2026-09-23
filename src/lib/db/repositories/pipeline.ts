import { withTenantContext } from "../client";

export type PipelineStage = 
  | "captacion"
  | "calificacion"
  | "valoracion"
  | "comercializacion"
  | "visitas"
  | "negociacion"
  | "arras"
  | "tramitacion_notarial"
  | "postventa"
  | "postventa_cierre";

export interface PipelineDealRow {
  id: string;
  tenant_id: string;
  title: string;
  property_id?: string;
  lead_id?: string;
  stage: PipelineStage;
  deal_value: number;
  commission_rate: number;
  assigned_agent_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: Date;
  updated_at?: Date;
}

export async function listDeals(tenantId: string): Promise<PipelineDealRow[]> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `SELECT * FROM pipeline_deals WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    );
    return res.rows.map(row => ({
      ...row,
      deal_value: parseFloat(row.deal_value),
      commission_rate: parseFloat(row.commission_rate)
    }));
  });
}

export async function createDeal(
  tenantId: string,
  data: Omit<PipelineDealRow, "id" | "tenant_id" | "created_at" | "updated_at">
): Promise<PipelineDealRow> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `INSERT INTO pipeline_deals (
        tenant_id, title, property_id, lead_id, stage, deal_value, commission_rate, assigned_agent_id, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        tenantId,
        data.title,
        data.property_id || null,
        data.lead_id || null,
        data.stage || "captacion",
        data.deal_value || 0,
        data.commission_rate || 3.0,
        data.assigned_agent_id || null,
        JSON.stringify(data.metadata || {})
      ]
    );
    const row = res.rows[0];
    return {
      ...row,
      deal_value: parseFloat(row.deal_value),
      commission_rate: parseFloat(row.commission_rate)
    };
  });
}

export async function updateDealStage(
  tenantId: string,
  id: string,
  stage: PipelineStage
): Promise<PipelineDealRow | null> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `UPDATE pipeline_deals SET stage = $1, updated_at = NOW() 
       WHERE tenant_id = $2 AND id = $3 
       RETURNING *`,
      [stage, tenantId, id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      deal_value: parseFloat(row.deal_value),
      commission_rate: parseFloat(row.commission_rate)
    };
  });
}
