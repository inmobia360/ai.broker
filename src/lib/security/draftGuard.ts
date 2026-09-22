import { recordSecurityAudit } from "./audit.ts";

export type DraftStatus = "draft_pending" | "approved" | "rejected";
export type TransmissionChannel = "whatsapp" | "email" | "pdf";

export interface DraftRecord {
  id: string;
  tenantId: string;
  dossierId?: string;
  documentType: string;
  title: string;
  content: string;
  status: DraftStatus;
  approvedAt?: Date;
  approvedBy?: string;
  channel?: TransmissionChannel;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class DraftNotApprovedError extends Error {
  public statusCode: number = 403;
  public draftId: string;
  public draftStatus: DraftStatus;

  constructor(draftId: string, status: DraftStatus, details?: string) {
    super(
      `Bloqueo de Seguridad Modo Borrador Seguro (RF-6, Principio 3): El documento '${draftId}' se encuentra en estado '${status}'. Está terminantemente prohibido el envío exterior o emisión automática sin aprobación humana explícita previa.${
        details ? ` Detalles: ${details}` : ""
      }`
    );
    this.name = "DraftNotApprovedError";
    this.draftId = draftId;
    this.draftStatus = status;
  }
}

export class DraftGuardViolationError extends Error {
  public statusCode: number = 400;
  constructor(message: string) {
    super(`Violación del Guardián de Borrador Seguro (RF-5, RF-6): ${message}`);
    this.name = "DraftGuardViolationError";
  }
}

// Almacén seguro de borradores (en memoria para alta velocidad y sincronizable con PostgreSQL RLS)
const draftsStore: Map<string, DraftRecord> = new Map();

export class DraftGuard {
  /**
   * Persiste una propuesta de documento o comunicación generada por la IA.
   * Por definición constitucional (RF-5), el estado inicial SIEMPRE es 'draft_pending'.
   */
  static createDraft(
    tenantId: string,
    params: {
      documentType: string;
      title: string;
      content: string;
      dossierId?: string;
      metadata?: Record<string, any>;
    }
  ): DraftRecord {
    if (!tenantId || tenantId.trim() === "") {
      throw new DraftGuardViolationError("El borrador debe estar rigurosamente vinculado a un tenant_id válido.");
    }
    if (!params.title || !params.content) {
      throw new DraftGuardViolationError("El borrador requiere título y contenido no vacíos.");
    }

    const draftId = `draft-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const record: DraftRecord = {
      id: draftId,
      tenantId: tenantId.trim(),
      dossierId: params.dossierId,
      documentType: params.documentType,
      title: params.title,
      content: params.content,
      status: "draft_pending", // Inviolable: nunca 'approved' en creación por IA
      metadata: params.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    draftsStore.set(draftId, record);
    return record;
  }

  /**
   * Obtiene un borrador garantizando aislamiento multi-tenant estricto (RF-1).
   */
  static getDraft(tenantId: string, draftId: string): DraftRecord | null {
    const draft = draftsStore.get(draftId);
    if (!draft || draft.tenantId !== tenantId) {
      return null;
    }
    return draft;
  }

  /**
   * Lista todos los borradores de un tenant específico.
   */
  static listDrafts(
    tenantId: string,
    filter?: { status?: DraftStatus; documentType?: string }
  ): DraftRecord[] {
    const result: DraftRecord[] = [];
    for (const draft of draftsStore.values()) {
      if (draft.tenantId === tenantId) {
        if (filter?.status && draft.status !== filter.status) continue;
        if (filter?.documentType && draft.documentType !== filter.documentType) continue;
        result.push(draft);
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Acción humana explícita para aprobar un borrador (Human-in-the-Loop).
   */
  static approveDraft(
    tenantId: string,
    draftId: string,
    approvedByUserId: string,
    channel?: TransmissionChannel
  ): DraftRecord {
    const draft = this.getDraft(tenantId, draftId);
    if (!draft) {
      throw new DraftGuardViolationError(`Borrador no encontrado o perteneciente a otro tenant: '${draftId}'`);
    }

    draft.status = "approved";
    draft.approvedAt = new Date();
    draft.approvedBy = approvedByUserId;
    if (channel) {
      draft.channel = channel;
    }
    draft.updatedAt = new Date();

    draftsStore.set(draftId, draft);
    return draft;
  }

  /**
   * Acción humana para rechazar o descartar un borrador.
   */
  static rejectDraft(tenantId: string, draftId: string, reason?: string): DraftRecord {
    const draft = this.getDraft(tenantId, draftId);
    if (!draft) {
      throw new DraftGuardViolationError(`Borrador no encontrado o perteneciente a otro tenant: '${draftId}'`);
    }

    draft.status = "rejected";
    draft.metadata = { ...draft.metadata, rejectionReason: reason };
    draft.updatedAt = new Date();

    draftsStore.set(draftId, draft);
    return draft;
  }

  /**
   * Guardián de Transmisión Exterior (RF-6).
   * Intercepta y valida rigurosamente que NINGÚN documento sea emitido a clientes
   * o redes externas (WhatsApp, correo, descarga o APIs de portales) sin firma de aprobación previa.
   */
  static authorizeTransmission(
    tenantId: string,
    draftId: string,
    channel: TransmissionChannel
  ): DraftRecord {
    const draft = this.getDraft(tenantId, draftId);
    if (!draft) {
      recordSecurityAudit({
        eventType: "UNAPPROVED_TRANSMISSION_ATTEMPT",
        severity: "HIGH",
        authenticatedTenantId: tenantId,
        endpoint: `/api/transmission/${channel}`,
        details: `Intento de emisión de borrador inexistente o ajeno '${draftId}'.`
      });
      throw new DraftGuardViolationError(`Borrador inexistente o inaccesible: '${draftId}'.`);
    }

    if (draft.status !== "approved") {
      // Registro de incidente de seguridad: intento de envío no autorizado
      recordSecurityAudit({
        eventType: "UNAPPROVED_TRANSMISSION_ATTEMPT",
        severity: "CRITICAL",
        authenticatedTenantId: tenantId,
        endpoint: `/api/transmission/${channel}`,
        details: `BLOQUEO RF-6: Intento de emisión automática del borrador '${draft.title}' (${draftId}) en estado '${draft.status}' por canal '${channel}' sin visto bueno humano.`
      });

      throw new DraftNotApprovedError(
        draftId,
        draft.status,
        `Se intentó transmitir por canal '${channel}'. El agente debe validar y pulsar 'Aprobar' previamente.`
      );
    }

    return draft;
  }

  /**
   * Simulación de canal de envío exterior con interceptación garantizada.
   */
  static async executeSafeDispatch(
    tenantId: string,
    draftId: string,
    channel: TransmissionChannel,
    recipient: string
  ): Promise<{ success: boolean; channel: TransmissionChannel; recipient: string; dispatchedContent: string }> {
    // La autorización previa es obligatoria antes de cualquier emisión
    const approvedDraft = this.authorizeTransmission(tenantId, draftId, channel);

    return {
      success: true,
      channel,
      recipient,
      dispatchedContent: approvedDraft.content
    };
  }

  /**
   * Limpia el almacén en memoria para ejecuciones limpias de tests.
   */
  static clearForTests(): void {
    draftsStore.clear();
  }
}
