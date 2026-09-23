import { withTenantContext } from "../client";

export interface PropertyRow {
  id: string;
  tenant_id: string;
  title: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  built_area_m2: number;
  operation_type: "sale" | "rent";
  status: "active" | "reserved" | "sold" | "rented";
  cadastral_reference?: string;
  walkscore: number;
  highlights: string[];
  images: string[];
  assigned_agent_id?: string;
  metadata?: Record<string, unknown>;
  created_at?: Date;
  updated_at?: Date;
}

export async function listProperties(tenantId: string): Promise<PropertyRow[]> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `SELECT * FROM properties WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    );
    return res.rows.map(row => ({
      ...row,
      price: parseFloat(row.price),
      built_area_m2: parseFloat(row.built_area_m2),
      highlights: row.highlights || [],
      images: row.images || []
    }));
  });
}

export async function createProperty(
  tenantId: string,
  data: Omit<PropertyRow, "id" | "tenant_id" | "created_at" | "updated_at">
): Promise<PropertyRow> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `INSERT INTO properties (
        tenant_id, title, price, location, bedrooms, bathrooms, 
        built_area_m2, operation_type, status, cadastral_reference, 
        walkscore, highlights, images, assigned_agent_id, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        tenantId,
        data.title,
        data.price,
        data.location,
        data.bedrooms || 1,
        data.bathrooms || 1,
        data.built_area_m2 || 0,
        data.operation_type || "sale",
        data.status || "active",
        data.cadastral_reference || null,
        data.walkscore || 85,
        data.highlights || [],
        data.images || [],
        data.assigned_agent_id || null,
        JSON.stringify(data.metadata || {})
      ]
    );
    const row = res.rows[0];
    return {
      ...row,
      price: parseFloat(row.price),
      built_area_m2: parseFloat(row.built_area_m2)
    };
  });
}

export async function getPropertyById(tenantId: string, id: string): Promise<PropertyRow | null> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `SELECT * FROM properties WHERE tenant_id = $1 AND id = $2`,
      [tenantId, id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      ...row,
      price: parseFloat(row.price),
      built_area_m2: parseFloat(row.built_area_m2)
    };
  });
}
