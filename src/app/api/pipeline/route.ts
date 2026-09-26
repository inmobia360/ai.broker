import { NextResponse } from "next/server";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { listDeals, createDeal, updateDealStage, PipelineStage } from "@/lib/db/repositories/pipeline";
import { INITIAL_PIPELINE_CASES } from "@/lib/pipeline/pipelineTypes";

export async function GET(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    try {
      const deals = await listDeals(tenantId);
      if (deals && deals.length > 0) {
        return NextResponse.json({ ok: true, data: deals, source: "database" });
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({ ok: true, data: INITIAL_PIPELINE_CASES, source: "initial_demo" });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);
    const body = await req.json();

    try {
      const created = await createDeal(tenantId, {
        title: body.title,
        property_id: body.property_id,
        lead_id: body.lead_id,
        stage: body.stage || "captacion",
        deal_value: body.deal_value || 0,
        commission_rate: body.commission_rate || 3.0,
        assigned_agent_id: body.assigned_agent_id,
        metadata: body.metadata || {}
      });
      return NextResponse.json({ ok: true, data: created }, { status: 201 });
    } catch {
      const synthetic = {
        id: `deal-${Date.now()}`,
        tenant_id: tenantId,
        ...body,
        created_at: new Date()
      };
      return NextResponse.json({ ok: true, data: synthetic, fallback: true }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);
    const { id, stage } = await req.json();

    if (!id || !stage) {
      return NextResponse.json(
        { ok: false, error: "Se requiere id y stage" },
        { status: 400 }
      );
    }

    try {
      const updated = await updateDealStage(tenantId, id, stage as PipelineStage);
      return NextResponse.json({ ok: true, data: updated });
    } catch {
      return NextResponse.json({ ok: true, data: { id, stage, updated_at: new Date() }, fallback: true });
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
