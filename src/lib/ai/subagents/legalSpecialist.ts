import { BaseSpecialistSubagent } from "./base.ts";
import type { SpecialistDomain, SpecialistTaskRequest, SpecialistResponse, SpecialistDraftProposal } from "./types.ts";

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
      draftProposal = {
        documentType: "arras",
        title: "Borrador de Contrato de Arras Penitenciales (Art. 1454 C.C.)",
        summary: "Contrato de arras penitenciales con fijación de señal, precio final y plazo máximo para otorgamiento de escritura pública ante notario.",
        content: `CONTRATO DE ARRAS PENITENCIALES (ARTÍCULO 1454 CÓDIGO CIVIL)
[BORRADOR GENERADO POR ASISTENTE JURÍDICO - REVISIÓN HUMANA OBLIGATORIA]

En [PENDIENTE: MUNICIPIO], a [PENDIENTE: FECHA].

REUNIDOS:
DE UNA PARTE, COMO PARTE VENDEDORA:
[PENDIENTE: NOMBRE_VENDEDOR], con DNI/NIE [PENDIENTE: DNI_VENDEDOR].

DE OTRA PARTE, COMO PARTE COMPRADORA:
[PENDIENTE: NOMBRE_COMPRADOR], con DNI/NIE [PENDIENTE: DNI_COMPRADOR].

EXPONEN:
I. Que la PARTE VENDEDORA es legítima propietaria de la finca sita en [PENDIENTE: DIRECCIÓN_INMUEBLE], inscrita en el Registro de la Propiedad con Referencia Catastral [PENDIENTE: REF_CATASTRAL].
II. Que ambas partes acuerdan la compraventa por el precio total de [PENDIENTE: PRECIO_VENTA] euros.

CLÁUSULAS:
PRIMERA.- OBJETO Y SEÑAL (ARRAS PENITENCIALES).
La PARTE COMPRADORA entrega en este acto a la PARTE VENDEDORA la cantidad de [PENDIENTE: IMPORTE_SEÑAL] euros en concepto de arras penitenciales, al amparo del artículo 1454 del Código Civil.

SEGUNDA.- PENALIZACIÓN POR DESISTIMIENTO.
Conforme a dicho precepto legal, si la PARTE COMPRADORA rescindiere el contrato, perderá la cantidad entregada. Si fuere la PARTE VENDEDORA quien rescindiere el contrato, vendrá obligada a devolver el doble de la cantidad recibida.

TERCERA.- ESCRITURA PÚBLICA NOTARIAL.
Las partes se obligan a formalizar la escritura pública de compraventa antes del [PENDIENTE: FECHA_LÍMITE_NOTARÍA].`
      };
    } else if (lower.includes("alquiler") || lower.includes("arrendamiento") || lower.includes("lau")) {
      analysis = "Análisis jurídico: La relación arrendaticia de vivienda habitual se rige por la Ley 29/1994 de Arrendamientos Urbanos (LAU). Es imperativo reflejar la duración mínima de 5 años si el arrendador es persona física (7 años si es jurídica), prórrogas obligatorias y la fianza legal de una mensualidad.";
      draftProposal = {
        documentType: "lau",
        title: "Borrador de Contrato de Arrendamiento de Vivienda Habitual (LAU)",
        summary: "Contrato de alquiler conforme a la Ley de Arrendamientos Urbanos (LAU 29/1994) con fianza legal obligatoria y desglose de suministros.",
        content: `CONTRATO DE ARRENDAMIENTO DE VIVIENDA HABITUAL (LEY 29/1994 LAU)
[BORRADOR GENERADO POR ASISTENTE JURÍDICO - REVISIÓN HUMANA OBLIGATORIA]

En [PENDIENTE: MUNICIPIO], a [PENDIENTE: FECHA].

REUNIDOS:
ARRENDADOR: [PENDIENTE: NOMBRE_ARRENDADOR], DNI [PENDIENTE: DNI_ARRENDADOR].
ARRENDATARIO: [PENDIENTE: NOMBRE_ARRENDATARIO], DNI [PENDIENTE: DNI_ARRENDATARIO].

CLÁUSULAS:
PRIMERA.- DURACIÓN Y PRÓRROGAS.
El plazo de duración pactado es de UN AÑO, prorrogable obligatoriamente hasta alcanzar cinco años (o siete si el arrendador fuese persona jurídica) conforme al art. 9 de la LAU.

SEGUNDA.- RENTA Y ACTUALIZACIÓN.
La renta mensual pactada es de [PENDIENTE: RENTA_MENSUAL] euros, pagadera dentro de los siete primeros días de cada mes.

TERCERA.- FIANZA LEGAL.
A la firma del presente contrato, el ARRENDATARIO entrega la cantidad de [PENDIENTE: FIANZA_1_MES] euros correspondiente a una mensualidad de renta en concepto de fianza legal obligatoria (art. 36 LAU).`
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
