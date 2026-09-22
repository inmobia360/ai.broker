/**
 * Máquina de Estados Finita del Ciclo de Vida del Expediente Inmobiliario
 * Proyecto: AI BROKER (inmobia360)
 * Requisito Funcional: RF-M1
 */

export type DossierStage = 
  | 'captacion'
  | 'comercializacion'
  | 'negociacion'
  | 'cierre_comercial'
  | 'cierre_documental'
  | 'tramitacion_notarial'
  | 'postventa';

export interface StageTransitionRecord {
  fromStage: DossierStage;
  toStage: DossierStage;
  timestamp: string;
  triggeredBy: string;
  reason?: string;
  associatedDraftId?: string;
}

export interface DossierParty {
  fullName: string;
  dniNie?: string;
  phone?: string;
  email?: string;
  role: 'vendedor' | 'comprador' | 'arrendador' | 'arrendatario';
  financialPreApproval?: boolean;
  maxBudget?: number;
}

export interface RealEstateDossier {
  id: string;
  tenantId: string;
  title: string;
  referenceCode: string;
  operationType: 'venta' | 'alquiler';
  currentStage: DossierStage;
  askingPrice: number;
  minAcceptedPrice?: number;
  agreedPrice?: number;
  depositAmount?: number;
  propertyAddress: string;
  cadastralReference?: string;
  propertyRegistryData?: {
    registryNumber?: string;
    book?: string;
    folio?: string;
    volume?: string;
    mortgageChargesEuro?: number;
    hasCommunityDebt?: boolean;
    energyCertificateRating?: string;
  };
  parties: DossierParty[];
  transitionHistory: StageTransitionRecord[];
  createdAt: string;
  updatedAt: string;
}

// Mapa de transiciones legítimas del ciclo de vida inmobiliario
const ALLOWED_TRANSITIONS: Record<DossierStage, DossierStage[]> = {
  captacion: ['comercializacion'],
  comercializacion: ['negociacion', 'captacion'],
  negociacion: ['cierre_comercial', 'comercializacion'],
  cierre_comercial: ['cierre_documental', 'negociacion'],
  cierre_documental: ['tramitacion_notarial', 'negociacion'],
  tramitacion_notarial: ['postventa', 'cierre_documental'],
  postventa: [], // Estado terminal
};

export class DossierStateMachine {
  /**
   * Valida si una transición entre dos etapas es conforme al flujo natural
   */
  static isValidTransition(current: DossierStage, next: DossierStage): boolean {
    return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
  }

  /**
   * Ejecuta la transición de etapa en el expediente inmobiliario
   */
  static transition(
    dossier: RealEstateDossier,
    nextStage: DossierStage,
    triggeredBy: string = 'Agente Asesor',
    reason?: string,
    associatedDraftId?: string
  ): RealEstateDossier {
    if (!this.isValidTransition(dossier.currentStage, nextStage)) {
      throw new Error(
        `Transición no permitida: no es posible pasar el expediente de '${dossier.currentStage}' a '${nextStage}'.`
      );
    }

    const record: StageTransitionRecord = {
      fromStage: dossier.currentStage,
      toStage: nextStage,
      timestamp: new Date().toISOString(),
      triggeredBy,
      reason,
      associatedDraftId,
    };

    return {
      ...dossier,
      currentStage: nextStage,
      transitionHistory: [...dossier.transitionHistory, record],
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Obtiene la siguiente etapa natural sugerida en el ciclo
   */
  static getNextSuggestedStage(current: DossierStage): DossierStage | null {
    const list = ALLOWED_TRANSITIONS[current];
    return list && list.length > 0 ? list[0] : null;
  }

  /**
   * Nombres amigables en español peninsular normativo
   */
  static getStageLabel(stage: DossierStage): string {
    const labels: Record<DossierStage, string> = {
      captacion: '1. Captación y Encargo de Venta',
      comercializacion: '2. Comercialización y Visitas',
      negociacion: '3. Negociación y Banda de Acuerdo',
      cierre_comercial: '4. Cierre Comercial (Pre-acuerdo)',
      cierre_documental: '5. Cierre Documental (Arras / Contrato)',
      tramitacion_notarial: '6. Gestoría y Preparación Notarial',
      postventa: '7. Cierre de Operación y Post-venta',
    };
    return labels[stage] || stage;
  }
}
