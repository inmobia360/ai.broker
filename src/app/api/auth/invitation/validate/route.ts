import { NextResponse } from 'next/server';
import { validateInvitationToken } from '@/lib/auth/invitations';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token no especificado' }, { status: 400 });
    }

    const validation = validateInvitationToken(token);

    if (!validation.valid) {
      const messages: Record<string, string> = {
        NOT_FOUND: 'Enlace de invitación no encontrado o revocado.',
        EXPIRED: 'La invitación ha caducado.',
        ALREADY_USED: 'Esta invitación ya fue utilizada previamente.',
      };

      return NextResponse.json({
        valid: false,
        reason: validation.reason,
        error: messages[validation.reason || 'NOT_FOUND'],
      }, { status: 404 });
    }

    const inv = validation.invitation!;
    return NextResponse.json({
      valid: true,
      invitation: {
        tenantId: inv.tenantId,
        email: inv.email,
        role: inv.role,
        expiresAt: inv.expiresAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message }, { status: 500 });
  }
}
