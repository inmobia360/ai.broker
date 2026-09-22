import { NextResponse } from 'next/server';
import { acceptInvitationAndRegister } from '@/lib/auth/invitations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, fullName, password } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token de invitación requerido.' }, { status: 400 });
    }

    const result = acceptInvitationAndRegister({
      token,
      fullName,
      password,
    });

    if (!result.success) {
      const status = result.code === 'ALREADY_USED' ? 410 : result.code === 'EXPIRED' ? 410 : 400;
      return NextResponse.json({ error: result.error, code: result.code }, { status });
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado y vinculado a la agencia correctamente.',
      user: {
        id: result.user!.id,
        email: result.user!.email,
        fullName: result.user!.fullName,
        role: result.user!.role,
        tenantId: result.user!.tenantId,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error al procesar registro' }, { status: 500 });
  }
}
