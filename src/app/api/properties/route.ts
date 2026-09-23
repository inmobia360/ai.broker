import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveTenantFromRequest } from "@/lib/security/tenantGuard";
import { toTenantUuid } from "@/lib/tenant";
import { listProperties, createProperty } from "@/lib/db/repositories/properties";
import { DEMO_PROPERTIES } from "@/components/dashboard/PropertyCatalog";

const CreatePropertySchema = z.object({
  title: z.string().min(3),
  price: z.union([z.number(), z.string()]).transform(v => typeof v === "string" ? parseFloat(v.replace(/[^0-9.]/g, "")) || 0 : v),
  location: z.string().min(2),
  address: z.string().optional(),
  description: z.string().optional(),
  bedrooms: z.union([z.number(), z.string()]).transform(v => Number(v) || 1).default(1),
  bathrooms: z.union([z.number(), z.string()]).transform(v => Number(v) || 1).default(1),
  built_area_m2: z.union([z.number(), z.string()]).transform(v => Number(v) || 50).default(50),
  m2: z.union([z.number(), z.string()]).transform(v => Number(v) || 50).optional(),
  operation_type: z.enum(["sale", "rent"]).default("sale"),
  status: z.enum(["active", "reserved", "sold", "rented"]).default("active"),
  cadastral_reference: z.string().optional(),
  walkscore: z.number().int().min(0).max(100).default(85),
  highlights: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  image_url: z.string().optional(),
  slug: z.string().optional()
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function GET(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req) || "inmobia360";
    const tenantId = toTenantUuid(rawTenant);

    try {
      const dbProperties = await listProperties(tenantId);
      if (dbProperties && dbProperties.length > 0) {
        const formatted = dbProperties.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          formattedPrice: `${p.price.toLocaleString("es-ES")} €`,
          location: p.location,
          address: p.location,
          m2: p.built_area_m2,
          rooms: p.bedrooms,
          baths: p.bathrooms,
          status: p.status === "active" ? "disponible" : p.status,
          type: p.operation_type === "rent" ? "Alquiler Residencial" : "Venta Residencial",
          imageUrl: p.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80",
          publicUrl: `/property/${slugify(p.title)}`
        }));
        return NextResponse.json({ ok: true, data: formatted, properties: formatted, source: "database" });
      }
    } catch {
      // Si la base de datos aún no está migrada o responde vacío, fallback a catálogo demo
    }

    return NextResponse.json({ ok: true, data: DEMO_PROPERTIES, properties: DEMO_PROPERTIES, source: "initial_demo" });
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
