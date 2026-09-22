import crypto from 'crypto';

export interface InvitationRecord {
  token: string;
  tenantId: string;
  email: string;
  role: 'director' | 'agent';
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface UserRecord {
  id: string;
  tenantId: string;
  email: string;
  fullName?: string;
  role: 'director' | 'agent';
  createdAt: Date;
}

// Almacén seguro para entorno de ejecución / testing con fallback a BD
const inMemoryInvitations = new Map<string, InvitationRecord>();
const inMemoryUsers = new Map<string, UserRecord>();

/**
 * Genera un token criptográficamente seguro de 64 caracteres hex.
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Crea una nueva invitación para vincular a un usuario a un tenant específico.
 * Cumple con RF-2.
 */
export function createInvitation(params: {
  tenantId: string;
  email: string;
  role?: 'director' | 'agent';
  expiresInHours?: number;
}): InvitationRecord {
  const { tenantId, email, role = 'agent', expiresInHours = 48 } = params;

  if (!tenantId || tenantId.trim() === '') {
    throw new Error('Violación de Tenant: La invitación requiere un tenant_id obligatorio.');
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Correo electrónico inválido para la invitación.');
  }

  const token = generateInvitationToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000);

  const invitation: InvitationRecord = {
    token,
    tenantId: tenantId.trim().toLowerCase(),
    email: normalizedEmail,
    role,
    expiresAt,
    usedAt: null,
    createdAt: now,
  };

  inMemoryInvitations.set(token, invitation);
  return invitation;
}

/**
 * Valida un token de invitación verificando existencia, fecha de caducidad y estado de uso.
 */
export function validateInvitationToken(token: string): {
  valid: boolean;
  reason?: 'NOT_FOUND' | 'EXPIRED' | 'ALREADY_USED';
  invitation?: InvitationRecord;
} {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'NOT_FOUND' };
  }

  const invitation = inMemoryInvitations.get(token.trim());
  if (!invitation) {
    return { valid: false, reason: 'NOT_FOUND' };
  }

  if (invitation.usedAt !== null) {
    return { valid: false, reason: 'ALREADY_USED', invitation };
  }

  if (new Date() > invitation.expiresAt) {
    return { valid: false, reason: 'EXPIRED', invitation };
  }

  return { valid: true, invitation };
}

/**
 * Consume una invitación válida y registra al usuario vinculándolo estrictamente
 * al tenant_id de la invitación. Invalida el token tras el registro exitoso.
 * Cumple con RF-2 (Registro por invitación y vinculación de tenant).
 */
export function acceptInvitationAndRegister(params: {
  token: string;
  password?: string;
  fullName?: string;
}): { success: boolean; user?: UserRecord; error?: string; code?: string } {
  const validation = validateInvitationToken(params.token);

  if (!validation.valid) {
    if (validation.reason === 'ALREADY_USED') {
      return { success: false, error: 'Esta invitación ya ha sido utilizada con anterioridad.', code: 'ALREADY_USED' };
    }
    if (validation.reason === 'EXPIRED') {
      return { success: false, error: 'La invitación ha caducado. Solicita un nuevo enlace a tu director.', code: 'EXPIRED' };
    }
    return { success: false, error: 'Enlace de invitación no encontrado o no válido.', code: 'NOT_FOUND' };
  }

  const invitation = validation.invitation!;

  // Comprobar si el usuario ya existe en ese tenant
  const userKey = `${invitation.tenantId}:${invitation.email}`;
  if (inMemoryUsers.has(userKey)) {
    return { success: false, error: 'Ya existe un usuario registrado con este correo en la agencia.', code: 'USER_EXISTS' };
  }

  // 1. Crear el usuario vinculado al tenant_id de la invitación
  const newUser: UserRecord = {
    id: `usr-${crypto.randomBytes(8).toString('hex')}`,
    tenantId: invitation.tenantId,
    email: invitation.email,
    fullName: params.fullName?.trim() || undefined,
    role: invitation.role,
    createdAt: new Date(),
  };

  inMemoryUsers.set(userKey, newUser);

  // 2. Invalidar la invitación inmediatamente (used_at = NOW)
  invitation.usedAt = new Date();
  inMemoryInvitations.set(invitation.token, invitation);

  return {
    success: true,
    user: newUser,
  };
}

/**
 * Helper para reiniciar estado en suites de pruebas.
 */
export function clearInvitationsAndUsersForTests(): void {
  inMemoryInvitations.clear();
  inMemoryUsers.clear();
}
