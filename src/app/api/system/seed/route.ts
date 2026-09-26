import { NextResponse } from "next/server";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { DEMO_PROPERTIES } from "@/lib/properties/propertyTypes";
import { PRIORITY_LEADS } from "@/lib/leads/leadTypes";
import { INITIAL_PIPELINE_CASES } from "@/lib/pipeline/pipelineTypes";
import { getDbPool } from "@/lib/db/client";
import { listProperties, createProperty } from "@/lib/db/repositories/properties";
import { listLeads, createLead } from "@/lib/db/repositories/leads";
import { listDeals, createDeal, PipelineStage } from "@/lib/db/repositories/pipeline";
import { getBranding, saveBranding } from "@/lib/db/repositories/branding";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return handleSeed(req);
}

export async function POST(req: Request) {
  return handleSeed(req);
}

async function handleSeed(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    const pool = getDbPool();

    // 0. Asegurar que la entidad Tenant existe físicamente en la tabla tenants (FK compliance)
    const existingTenantRes = await pool.query(
      `SELECT id FROM tenants WHERE slug = $1 OR id::text = $2 LIMIT 1`,
      [rawTenant, tenantId]
    ).catch(() => ({ rows: [] }));

    let effectiveTenantId = tenantId;
    if (existingTenantRes.rows.length > 0) {
      effectiveTenantId = existingTenantRes.rows[0].id;
    } else {
      const inserted = await pool.query(
        `INSERT INTO tenants (id, slug, agency_name, status, settings)
         VALUES ($1, $2, $3, 'active', '{}'::jsonb)
         ON CONFLICT (id) DO NOTHING
         RETURNING id`,
        [tenantId, rawTenant, "Inmobia 360"]
      ).catch(() => null);
      if (inserted && inserted.rows.length > 0) {
        effectiveTenantId = inserted.rows[0].id;
      }
    }

    // Asegurar usuario director por defecto
    await pool.query(
      `INSERT INTO users (tenant_id, email, full_name, role)
       VALUES ($1, 'director@inmobia360.com', 'Director General', 'director')
       ON CONFLICT (tenant_id, email) DO NOTHING`,
      [effectiveTenantId]
    ).catch(() => null);

    const results: Record<string, { inserted: number; existing: number }> = {};

    // 1. Semillado de Propiedades
    const existingProperties = await listProperties(effectiveTenantId).catch(() => []);
    let propsInserted = 0;
    if (existingProperties.length === 0) {
      for (const p of DEMO_PROPERTIES) {
        await createProperty(effectiveTenantId, {
          title: p.title,
          price: p.price,
          location: p.location,
          bedrooms: p.rooms,
          bathrooms: p.baths,
          built_area_m2: p.m2,
          operation_type: p.type.toLowerCase().includes("alquiler") ? "rent" : "sale",
          status: p.status === "disponible" ? "active" : p.status === "arras_firmadas" ? "sold" : "reserved",
          cadastral_reference: p.cadastralRef,
          walkscore: 88,
          highlights: ["Exclusiva Colegiada", p.type],
          images: [p.imageUrl],
          metadata: {
            address: p.address,
            description: p.description
          }
        });
        propsInserted++;
      }
    }
    results["properties"] = { inserted: propsInserted, existing: existingProperties.length };

    // 2. Semillado de Leads Prioritarios
    const existingLeads = await listLeads(effectiveTenantId).catch(() => []);
    let leadsInserted = 0;
    if (existingLeads.length === 0) {
      for (const l of PRIORITY_LEADS) {
        const rawBudget = parseFloat(l.budget.replace(/[^0-9.]/g, "")) || 0;
        await createLead(effectiveTenantId, {
          full_name: l.name,
          phone: l.phone,
          email: l.name.includes("Müller") ? "sophie.muller@invest-europa.com" : "carlos.romero@familyoffice-madrid.es",
          intent_type: l.category.toLowerCase().includes("alquiler") ? "rent" : l.category.toLowerCase().includes("inversión") ? "invest" : "buy",
          location_preference: l.location,
          budget: rawBudget,
          timeframe: l.timeframe,
          demand_quote: l.inquiry,
          hot_score: l.score,
          recommended_action: l.recommendedAction,
          status: "new"
        });
        leadsInserted++;
      }
    }
    results["leads"] = { inserted: leadsInserted, existing: existingLeads.length };

    // 3. Semillado de Pipeline Deals
    const existingDeals = await listDeals(effectiveTenantId).catch(() => []);
    let dealsInserted = 0;
    if (existingDeals.length === 0) {
      for (const c of INITIAL_PIPELINE_CASES) {
        const rawValue = parseFloat(c.price.replace(/[^0-9.]/g, "")) || 500000;
        await createDeal(effectiveTenantId, {
          title: `${c.id}: ${c.title} — ${c.clientName}`,
          stage: c.stage as PipelineStage,
          deal_value: rawValue,
          commission_rate: c.feePercentage || 3,
          metadata: {
            clientName: c.clientName,
            clientDni: c.clientDni,
            clientPhone: c.clientPhone,
            clientEmail: c.clientEmail,
            cadastralRef: c.cadastralRef,
            assignedAgent: c.assignedAgent,
            visitDate: c.visitDate,
            visitTime: c.visitTime,
            pendingDoc: c.pendingDoc,
            suggestedAction: c.suggestedAction
          }
        });
        dealsInserted++;
      }
    }
    results["pipeline_deals"] = { inserted: dealsInserted, existing: existingDeals.length };

    // 4. Semillado de Marca Colegiada
    const existingBrand = await getBranding(effectiveTenantId).catch(() => null);
    let brandConfigured = false;
    if (!existingBrand) {
      await saveBranding(effectiveTenantId, {
        agency_name: "Inmobia 360",
        tagline: "Agencia Inmobiliaria Colegiada & AI Broker OS",
        primary_color: "#2563EB",
        accent_color: "#F97316",
        tax_id: "B-88392104",
        association_number: "API-COL-45892",
        support_email: "director@inmobia360.com",
        support_phone: "+34 600 123 456",
        country_code: "ES",
        max_team_seats: 5,
        plan_type: "boutique"
      });
      brandConfigured = true;
    }
    results["branding"] = { inserted: brandConfigured ? 1 : 0, existing: existingBrand ? 1 : 0 };

    return NextResponse.json({
      ok: true,
      success: true,
      message: "Proceso de semillado PostgreSQL completado con aislamiento multi-tenant.",
      tenantId: effectiveTenantId,
      results
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        success: false,
        error: error.message || "Error al semillar datos en PostgreSQL"
      },
      { status: 500 }
    );
  }
}
