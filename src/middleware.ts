import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { enforceTenantAccess } from './lib/security/tenantGuard';

/**
 * Middleware global de Next.js para forzar el aislamiento multi-tenant en todas las rutas API.
 * Cumple con RF-1 y RF-3 de forma perimetral.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rutas públicas exentas de verificación de tenant
  if (
    pathname === '/api/health' ||
    pathname.startsWith('/api/auth/login') ||
    pathname.startsWith('/api/auth/invitation/validate') ||
    pathname.startsWith('/api/auth/invitation/accept') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Interceptar rutas API protegidas
  if (pathname.startsWith('/api/')) {
    const authResult = enforceTenantAccess(request);

    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error,
          code: authResult.statusCode === 403 ? 'FORBIDDEN_CROSS_TENANT' : 'UNAUTHORIZED_TENANT',
        },
        { status: authResult.statusCode }
      );
    }

    // Inyectar la cabecera verificada a la petición interna
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-verified-tenant-id', authResult.tenantId!);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
