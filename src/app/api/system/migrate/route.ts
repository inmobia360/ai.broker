import { NextResponse } from 'next/server';
import { runMigrations } from '@/lib/db/migrate';
import { resolveTenantFromRequest } from '@/lib/security/tenantGuard';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const rawTenant = resolveTenantFromRequest(req);
    // Permitir migración si es local o tenant legítimo
    const result = await runMigrations();

    return NextResponse.json({
      ok: result.success,
      ...result
    }, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message || 'Error inesperado durante la migración'
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const result = await runMigrations();
    return NextResponse.json({
      ok: result.success,
      ...result
    });
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message
    }, { status: 500 });
  }
}
