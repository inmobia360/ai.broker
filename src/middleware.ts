import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { enforceTenantAccess } from './lib/security/tenantGuard';
import { checkRateLimit } from './lib/security/rateLimiter';

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
    // 1. Rate Limiting perimétrico para prevenir saturación de inferencia y spam
    if (pathname.startsWith('/api/chat') || (pathname.startsWith('/api/leads') && request.method === 'POST')) {
      const forwardedFor = request.headers.get('x-forwarded-for');
      const ip = (forwardedFor ? forwardedFor.split(',')[0].trim() : null) ||
                 request.headers.get('x-real-ip') ||
                 '127.0.0.1';

      const isChat = pathname.startsWith('/api/chat');
      const limit = isChat ? 25 : 10;
      const key = `${isChat ? 'chat' : 'leads'}:${ip}`;
      const rateLimitResult = checkRateLimit(key, limit);

      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: 'Demasiadas peticiones. Por favor, espera antes de continuar.',
            retryAfter: rateLimitResult.retryAfterSeconds,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(rateLimitResult.retryAfterSeconds),
            },
          }
        );
      }
    }

    // 2. Control de Acceso y Aislamiento Multi-Tenant (RF-1, RF-3)
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
