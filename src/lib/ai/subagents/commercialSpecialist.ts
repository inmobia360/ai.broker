import { BaseSpecialistSubagent } from "./base.ts";
import type { SpecialistDomain, SpecialistTaskRequest, SpecialistResponse, SpecialistDraftProposal } from "./types.ts";

export class CommercialSpecialistSubagent extends BaseSpecialistSubagent {
  readonly domain: SpecialistDomain = "commercial";
  readonly specialistName: string = "Asistente Comercial y Cualificación";

  async executeInternalTask(req: SpecialistTaskRequest): Promise<SpecialistResponse> {
    if (!this.verifyBrokerToken(req.brokerSessionToken)) {
      throw new Error("Acceso no autorizado: la tarea comercial debe ser invocada por el Director BROKER.");
    }

    const lower = req.userMessage.toLowerCase();
    let analysis = "";
    let draftProposal: SpecialistDraftProposal | undefined;

    if (lower.includes("cualifica") || lower.includes("lead") || lower.includes("comprador") || lower.includes("presupuesto")) {
      analysis = "Cualificación comercial: Se evalúa capacidad financiera del cliente potencial. En el mercado español se requiere solvencia para el 20% de entrada más un 10-12% de impuestos y gastos de notaría/registro (ITP/AJD). Se sugiere llamada de cualificación inmediata en menos de 15 minutos.";
      draftProposal = {
        documentType: "buyer_qualification",
        title: "Ficha de Cualificación Financiera de Comprador",
        summary: "Evaluación de solvencia, ratio de endeudamiento y capacidad de compra para inmueble objetivo.",
        content: `FICHA DE CUALIFICACIÓN COMERCIAL Y FINANCIERA
[BORRADOR GENERADO POR ASISTENTE COMERCIAL - CONFIRMACIÓN PENDIENTE]

DATOS DEL CLIENTE: [PENDIENTE: NOMBRE] (Tel: [PENDIENTE: TELEFONO])
PRESUPUESTO MÁXIMO OBJETIVO: [PENDIENTE: IMPORTE_EUROS] €
AHORRO DISPONIBLE (FONDOS PROPIOS): [PENDIENTE: AHORRO_DISPONIBLE] € (Mínimo recomendado 30% del precio total)
SITUACIÓN HIPOTECARIA: [PENDIENTE: ESTADO_HIPOTECA: Pre-aprobada / Por solicitar / Contado]
SCORE DE CUALIFICACIÓN: ALTO - CONTACTO URGENTE RECOMENDADO (< 15 MINUTOS).`
      };
    } else {
      analysis = "Análisis de oportunidad comercial y seguimiento de pipeline de agencia.";
    }

    return {
      domain: this.domain,
      specialistName: this.specialistName,
      analysis,
      draftProposal
    };
  }
}
