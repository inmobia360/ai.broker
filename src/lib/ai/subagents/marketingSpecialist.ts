import { BaseSpecialistSubagent } from "./base.ts";
import type { SpecialistDomain, SpecialistTaskRequest, SpecialistResponse, SpecialistDraftProposal } from "./types.ts";

export class MarketingSpecialistSubagent extends BaseSpecialistSubagent {
  readonly domain: SpecialistDomain = "marketing";
  readonly specialistName: string = "Asistente de Marketing y Portales";

  async executeInternalTask(req: SpecialistTaskRequest): Promise<SpecialistResponse> {
    if (!this.verifyBrokerToken(req.brokerSessionToken)) {
      throw new Error("Acceso no autorizado: la tarea de marketing debe ser invocada por el Director BROKER.");
    }

    const lower = req.userMessage.toLowerCase();
    let analysis = "";
    let draftProposal: SpecialistDraftProposal | undefined;

    if (lower.includes("idealista") || lower.includes("fotocasa") || lower.includes("anuncio") || lower.includes("ficha") || lower.includes("publicar")) {
      analysis = "Estrategia de difusión inmobiliaria: Redacción optimizada para portales de referencia en España evitando clichés robóticos ('mejor ver', 'oportunidad única') y destacando luminosidad, distribución, calificación energética y servicios de barrio.";
      draftProposal = {
        documentType: "idealista_ad",
        title: "Borrador de Ficha Descriptiva para Portales (Idealista / Fotocasa)",
        summary: "Descripción profesional, distribución y puntos fuertes redactados para captación en portales inmobiliarios.",
        content: `FICHA DE DIFUSIÓN EN PORTALES INMOBILIARIOS
[BORRADOR GENERADO POR ASISTENTE DE MARKETING - REVISIÓN HUMANA OBLIGATORIA]

TITULAR ATRACTIVO:
[PENDIENTE: TITULAR_DESCRIPTIVO]

DESCRIPCIÓN DE LA VIVIENDA:
Ubicada en [PENDIENTE: BARRIO_CIUDAD], esta vivienda destaca por su excelente luminosidad natural y óptima distribución de espacios.

CARACTERÍSTICAS PRINCIPALES:
- Superficie construida: [PENDIENTE: M2_CONSTRUIDOS] m²
- Dormitorios: [PENDIENTE: NUM_DORMITORIOS]
- Baños: [PENDIENTE: NUM_BAÑOS]
- Calefacción / Climatización: [PENDIENTE: TIPO_CALEFACCION]
- Certificado Energético: En trámite / [PENDIENTE: ETIQUETA_ENERGETICA]

ENTORNO Y SERVICIOS:
Zona consolidada con acceso inmediato a transporte público, colegios, comercio de proximidad y zonas verdes.`
      };
    } else {
      analysis = "Propuesta de posicionamiento y difusión inmobiliaria de la agencia.";
    }

    return {
      domain: this.domain,
      specialistName: this.specialistName,
      analysis,
      draftProposal
    };
  }
}
