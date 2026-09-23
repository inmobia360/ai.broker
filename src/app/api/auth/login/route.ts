import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { toTenantUuid } from "@/lib/tenant";

export async function POST(req: Request) {
  try {
    const { email, password, tenant_slug } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Debes introducir email y contraseña" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const resolvedSlug = tenant_slug?.trim().toLowerCase() || "inmobia360";
    const tenantId = toTenantUuid(resolvedSlug);

    // Usuario demo o autenticado
    const isDirector = cleanEmail.includes("director") || cleanEmail.includes("juan") || cleanEmail.includes("admin");
    const user = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: isDirector ? "Director Broker Titular" : "Agente Inmobiliario Asociado",
      role: isDirector ? "director" : "agent",
      tenant_id: tenantId,
      tenant_slug: resolvedSlug
    };

    // Almacenar cookie de sesión HTTP-only
    const cookieStore = await cookies();
    cookieStore.set("ai_broker_session", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/"
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
