import { withTenantContext } from "../client";

export interface BrandingRow {
  tenant_id: string;
  agency_name: string;
  tagline?: string;
  logo_url?: string;
  primary_color: string;
  accent_color: string;
  tax_id?: string;
  association_number?: string;
  support_phone?: string;
  support_email?: string;
  country_code: string;
  max_team_seats: number;
  plan_type: "solo" | "boutique";
  updated_at?: Date;
}

export async function getBranding(tenantId: string): Promise<BrandingRow | null> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `SELECT * FROM agency_branding WHERE tenant_id = $1`,
      [tenantId]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0];
  });
}

export async function saveBranding(
  tenantId: string,
  data: Omit<BrandingRow, "tenant_id" | "updated_at">
): Promise<BrandingRow> {
  return withTenantContext(tenantId, async (client) => {
    const res = await client.query(
      `INSERT INTO agency_branding (
        tenant_id, agency_name, tagline, logo_url, primary_color, accent_color,
        tax_id, association_number, support_phone, support_email, country_code,
        max_team_seats, plan_type, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
      ON CONFLICT (tenant_id) DO UPDATE SET
        agency_name = EXCLUDED.agency_name,
        tagline = EXCLUDED.tagline,
        logo_url = EXCLUDED.logo_url,
        primary_color = EXCLUDED.primary_color,
        accent_color = EXCLUDED.accent_color,
        tax_id = EXCLUDED.tax_id,
        association_number = EXCLUDED.association_number,
        support_phone = EXCLUDED.support_phone,
        support_email = EXCLUDED.support_email,
        country_code = EXCLUDED.country_code,
        max_team_seats = EXCLUDED.max_team_seats,
        plan_type = EXCLUDED.plan_type,
        updated_at = NOW()
      RETURNING *`,
      [
        tenantId,
        data.agency_name,
        data.tagline || null,
        data.logo_url || null,
        data.primary_color || "#1e3a8a",
        data.accent_color || "#f97316",
        data.tax_id || null,
        data.association_number || null,
        data.support_phone || null,
        data.support_email || null,
        data.country_code || "ES",
        data.max_team_seats || (data.plan_type === "solo" ? 1 : 5),
        data.plan_type || "boutique"
      ]
    );
    return res.rows[0];
  });
}
