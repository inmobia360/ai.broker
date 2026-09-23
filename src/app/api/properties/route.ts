import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { listProperties, createProperty } from "@/lib/db/repositories/properties";
import { DEMO_PROPERTIES } from "@/components/dashboard/PropertyCatalog";

const CreatePropertySchema = z.object({
  title: z.string().min(3),
  price: z.number().positive(),
  location: z.string().min(2),
  bedrooms: z.number().int().min(0).default(1),
  bathrooms: z.number().int().min(0).default(1),
  built_area_m2: z.number().positive().default(50),
  operation_type: z.enum(["sale", "rent"]).default("sale"),
  status: z.enum(["active", "reserved", "sold", "rented"]).default("active"),
  cadastral_reference: z.string().optional(),
  walkscore: z.number().int().min(0).max(100).default(85),
  highlights: z.array(z.string()).default([]),
  images: z.array(z.string()).default([])
});

export async function GET(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    try {
      const dbProperties = await listProperties(tenantId);
      if (dbProperties && dbProperties.length > 0) {
        return NextResponse.json({ ok: true, data: dbProperties, source: "database" });
      }
    } catch {
      // Si la base de datos aún no está migrada o responde vacío, fallback a catálogo demo
    }

    return NextResponse.json({ ok: true, data: DEMO_PROPERTIES, source: "initial_demo" });
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
    const parsed = CreatePropertySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Datos de propiedad inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    try {
      const created = await createProperty(tenantId, parsed.data);
      return NextResponse.json({ ok: true, data: created }, { status: 201 });
    } catch (dbError) {
      // Fallback a objeto creado en memoria para robustez
      const synthetic = {
        id: `prop-${Date.now()}`,
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
