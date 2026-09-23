import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { listLeads, createLead, updateLeadStatus } from "@/lib/db/repositories/leads";
import { PRIORITY_LEADS } from "@/components/dashboard/PriorityLeadsWidget";

const CreateLeadSchema = z.object({
  full_name: z.string().min(2).optional(),
  name: z.string().min(2).optional(),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  intent_type: z.enum(["buy", "rent", "invest", "visit", "info"]).default("buy"),
  inquiry_type: z.enum(["buy", "rent", "invest", "visit", "info"]).optional(),
  location_preference: z.string().default("España"),
  property_id: z.string().optional(),
  property_title: z.string().optional(),
  budget: z.union([z.number(), z.string()]).transform(v => typeof v === "string" ? parseFloat(v.replace(/[^0-9.]/g, "")) || 0 : v).default(0),
  timeframe: z.string().default("Ahora"),
  demand_quote: z.string().optional(),
  message: z.string().optional(),
  hot_score: z.number().int().min(0).max(100).optional(),
  recommended_action: z.string().optional(),
  status: z.string().default("new")
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

    const d = parsed.data;
    const resolvedName = d.full_name || d.name || "Contacto Interesado";
    const resolvedQuote = d.demand_quote || d.message || "Interesado en inmueble de la cartera.";
    const resolvedIntent = (d.inquiry_type || d.intent_type || "buy") as "buy" | "rent" | "invest";

    // Cálculo cognitivo de temperatura (Hot Score 0-100)
    let score = d.hot_score;
    if (score === undefined) {
      score = 65;
      const lower = resolvedQuote.toLowerCase();
      if (d.timeframe === "immediate" || d.timeframe.toLowerCase().includes("ahora")) score += 15;
      if (d.budget >= 500000) score += 10;
      if (lower.includes("contado") || lower.includes("sin hipoteca") || lower.includes("inversión") || lower.includes("visita")) score += 10;
      score = Math.min(98, Math.max(45, score));
    }

    // Acción comercial sugerida por el Director Broker
    let action = d.recommended_action;
    if (!action) {
      if (score >= 90) {
        action = "Llamar en menos de 15 minutos y enviar dossier financiero de Cap Rate.";
      } else if (resolvedIntent === "invest") {
        action = "Enviar desglose de rentabilidad neta estimada antes de agendar llamada.";
      } else {
        action = "Contactar por WhatsApp para coordinar visita privada y transferir ficha técnica.";
      }
    }

    const normalizedLead = {
      full_name: resolvedName,
      phone: d.phone,
      email: d.email || undefined,
      intent_type: resolvedIntent,
      location_preference: d.location_preference,
      budget: d.budget,
      timeframe: d.timeframe === "immediate" ? "Ahora" : d.timeframe,
      demand_quote: resolvedQuote,
      hot_score: score,
      recommended_action: action,
      status: (d.status === "nuevo" ? "new" : d.status) as "new" | "in_progress" | "scheduled" | "archived"
    };

    try {
      const created = await createLead(tenantId, normalizedLead);
      return NextResponse.json({ ok: true, data: created }, { status: 201 });
    } catch {
      const synthetic = {
        id: `lead-${Date.now()}`,
        tenant_id: tenantId,
        ...normalizedLead,
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
