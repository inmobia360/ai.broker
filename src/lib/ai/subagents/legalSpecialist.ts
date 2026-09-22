import { BaseSpecialistSubagent } from "./base.ts";
import type { SpecialistDomain, SpecialistTaskRequest, SpecialistResponse, SpecialistDraftProposal } from "./types.ts";
import { generateArrasPenitencialesContract } from "../../legal/spain/arras.ts";
import { generateLauContract } from "../../legal/spain/lau.ts";

export class LegalSpecialistSubagent extends BaseSpecialistSubagent {
  readonly domain: SpecialistDomain = "legal";
  readonly specialistName: string = "Asistente Jurídico Inmobiliario";

  async executeInternalTask(req: SpecialistTaskRequest): Promise<SpecialistResponse> {
    if (!this.verifyBrokerToken(req.brokerSessionToken)) {
      throw new Error("Acceso no autorizado: la tarea jurídica debe ser invocada por el Director BROKER.");
    }

    const lower = req.userMessage.toLowerCase();
    let analysis = "";
    let draftProposal: SpecialistDraftProposal | undefined;

    if (lower.includes("arras") || lower.includes("señal") || lower.includes("reserva")) {
      analysis = "Análisis jurídico: La operación requiere formalización mediante Arras Penitenciales amparadas en el Artículo 1454 del Código Civil español. En caso de desistimiento del comprador, perderá la cantidad entregada; si desiste la parte vendedora, deberá devolverlas duplicadas.";
      
      const arrasDoc = generateArrasPenitencialesContract({
        municipio: req.context?.municipio,
        fecha: req.context?.fecha,
        vendedor: req.context?.vendedor,
        comprador: req.context?.comprador,
        inmueble: req.context?.inmueble,
        condiciones: req.context?.condiciones
      });

      draftProposal = {
        documentType: "arras",
        title: arrasDoc.title,
        summary: "Contrato de arras penitenciales con fijación de señal, precio final y plazo máximo para otorgamiento de escritura pública ante notario (Art. 1454 C.C.).",
        content: arrasDoc.contractText,
        metadata: {
          legalReference: arrasDoc.legalReference,
          detectedPendingFields: arrasDoc.detectedPendingFields,
          isComplete: arrasDoc.isComplete
        }
      };
    } else if (lower.includes("alquiler") || lower.includes("arrendamiento") || lower.includes("lau")) {
      analysis = "Análisis jurídico: La relación arrendaticia de vivienda habitual se rige por la Ley 29/1994 de Arrendamientos Urbanos (LAU) y Ley 12/2023. Es imperativo reflejar la duración mínima de 5 años si el arrendador es persona física (7 años si es jurídica), prórrogas obligatorias, fianza legal obligatoria de una mensualidad (art. 36 LAU) y gastos de gestión inmobiliaria a cargo del arrendador.";
      
      const lauDoc = generateLauContract({
        municipio: req.context?.municipio,
        fecha: req.context?.fecha,
        arrendador: req.context?.arrendador,
        arrendatario: req.context?.arrendatario,
        inmueble: req.context?.inmueble,
        condiciones: req.context?.condiciones
      });

      draftProposal = {
        documentType: "lau",
        title: lauDoc.title,
        summary: "Contrato de arrendamiento residencial de vivienda habitual conforme a la Ley 29/1994 (LAU) y Ley 12/2023.",
        content: lauDoc.contractText,
        metadata: {
          legalReference: lauDoc.legalReference,
          detectedPendingFields: lauDoc.detectedPendingFields,
          isComplete: lauDoc.isComplete
        }
      };
    } else if (lower.includes("visita") || lower.includes("honorarios") || lower.includes("corretaje")) {
      analysis = "Análisis jurídico: El parte de visita requiere blindar el reconocimiento de gestión inmobiliaria y el devengo de honorarios en caso de formalizarse la compraventa o alquiler con el interesado presentado.";
      draftProposal = {
        documentType: "visita",
        title: "Borrador de Hoja de Visita con Reconocimiento de Honorarios",
        summary: "Documento acreditativo de visita a inmueble con estipulación expresa de honorarios de intermediación.",
        content: `HOJA DE VISITA Y RECONOCIMIENTO DE GESTIÓN INMOBILIARIA
[BORRADOR GENERADO POR ASISTENTE JURÍDICO - REVISIÓN HUMANA OBLIGATORIA]

VISITANTE: [PENDIENTE: NOMBRE_CLIENTE], con DNI/NIE [PENDIENTE: DNI_CLIENTE].
INMUEBLE VISITADO: [PENDIENTE: DIRECCIÓN_COMPLETA].
FECHA Y HORA: [PENDIENTE: FECHA_HORA_VISITA].

CLÁUSULA DE HONORARIOS PROFESIONALES:
El compareciente declara haber visitado el inmueble gracias a la intervención de la agencia y se compromete a abonar los honorarios profesionales estipulados (o el porcentaje pactado) en caso de compraventa o arrendamiento directo o indirecto de la citada finca.`
      };
    } else {
      analysis = "Análisis jurídico normativo: Consulta legal inmobiliaria bajo marco de derecho civil español y Ley por el Derecho a la Vivienda 12/2023.";
    }

    return {
      domain: this.domain,
      specialistName: this.specialistName,
      analysis,
      draftProposal
    };
  }
}
