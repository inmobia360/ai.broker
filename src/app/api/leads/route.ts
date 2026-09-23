import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { listLeads, createLead, updateLeadStatus } from "@/lib/db/repositories/leads";
import { PRIORITY_LEADS } from "@/components/dashboard/PriorityLeadsWidget";

const CreateLeadSchema = z.object({
  full_name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional(),
  intent_type: z.enum(["buy", "rent", "invest"]).default("buy"),
  location_preference: z.string().min(2),
  budget: z.number().default(0),
  timeframe: z.string().default("Ahora"),
  demand_quote: z.string().min(5),
  hot_score: z.number().int().min(0).max(100).default(50),
  recommended_action: z.string().default("Llamar y calificar solvencia."),
  status: z.enum(["new", "in_progress", "scheduled", "archived"]).default("new")
});

export async function GET(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    try {
      const dbLeads = await listLeads(tenantId);
      if (dbLeads && dbLeads.length > 0) {
        return NextResponse.json({ ok: true, data: dbLeads, source: "database" });
      }
    } catch {
      // Fallback a leads demo iniciales
    }

    return NextResponse.json({ ok: true, data: PRIORITY_LEADS, source: "initial_demo" });
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
    const parsed = CreateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Datos de lead inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    try {
      const created = await createLead(tenantId, parsed.data);
      return NextResponse.json({ ok: true, data: created }, { status: 201 });
    } catch {
      const synthetic = {
        id: `lead-${Date.now()}`,
        tenant_id: tenantId,
        ...parsed.data,
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

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json(
        { ok: false, error: "Se requiere id y status" },
        { status: 400 }
      );
    }

    try {
      const updated = await updateLeadStatus(tenantId, id, status);
      return NextResponse.json({ ok: true, data: updated });
    } catch {
      return NextResponse.json({ ok: true, data: { id, status, updated_at: new Date() }, fallback: true });
    }
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
