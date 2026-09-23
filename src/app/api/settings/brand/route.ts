import { NextResponse } from "next/server";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { getBranding, saveBranding } from "@/lib/db/repositories/branding";
import { getDefaultWhiteLabelConfig } from "@/lib/branding/whiteLabel";

export async function GET(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    try {
      const dbBrand = await getBranding(tenantId);
      if (dbBrand) {
        return NextResponse.json({ ok: true, data: dbBrand, source: "database" });
      }
    } catch {
      // Fallback
    }

    const defaultConfig = getDefaultWhiteLabelConfig(rawTenant);
    return NextResponse.json({ ok: true, data: defaultConfig, source: "initial_demo" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);
    const body = await req.json();

    // Validar límite estricto de plazas
    const planType = body.plan_type === "solo" ? "solo" : "boutique";
    const maxSeats = planType === "solo" ? 1 : Math.min(5, Math.max(1, body.max_team_seats || 5));

    try {
      const saved = await saveBranding(tenantId, {
        agency_name: body.agency_name || "Agencia Inmobiliaria",
        tagline: body.tagline,
        logo_url: body.logo_url,
        primary_color: body.primary_color || "#1e3a8a",
        accent_color: body.accent_color || "#f97316",
        tax_id: body.tax_id,
        association_number: body.association_number,
        support_phone: body.support_phone,
        support_email: body.support_email,
        country_code: body.country_code || "ES",
        max_team_seats: maxSeats,
        plan_type: planType
      });
      return NextResponse.json({ ok: true, data: saved });
    } catch {
      const synthetic = {
        tenant_id: tenantId,
        ...body,
        max_team_seats: maxSeats,
        plan_type: planType,
        updated_at: new Date()
      };
      return NextResponse.json({ ok: true, data: synthetic, fallback: true });
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
