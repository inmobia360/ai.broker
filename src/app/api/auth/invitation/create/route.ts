import { NextResponse } from 'next/server';
import { createInvitation } from '@/lib/auth/invitations';
import { enforceTenantAccess } from '@/lib/security/tenantGuard';

export async function POST(req: Request) {
  try {
    const authResult = enforceTenantAccess(req);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.statusCode });
    }

    const tenantId = authResult.tenantId!;
    const body = await req.json();
    const { email, role = 'agent', expiresInHours = 48 } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Correo electrónico obligatorio.' }, { status: 400 });
    }

    const invitation = createInvitation({
      tenantId,
      email,
      role,
      expiresInHours: Number(expiresInHours),
    });

    const inviteUrl = `https://${tenantId}.inmobia360.com/invite?token=${invitation.token}`;

    return NextResponse.json({
      success: true,
      invitation: {
        token: invitation.token,
        tenantId: invitation.tenantId,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        inviteUrl,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al generar invitación' }, { status: 500 });
  }
}
