export interface VisitorDetails {
  nombreCompleto?: string;
  dniNie?: string;
  telefono?: string;
  email?: string;
  domicilio?: string;
}

export interface VisitPropertyDetails {
  direccion?: string;
  municipio?: string;
  referenciaCatastral?: string;
  precioOrientativo?: number;
  tipoOperacion?: "venta" | "alquiler";
}

export interface VisitAgencyDetails {
  nombreAgencia?: string;
  cif?: string;
  nombreAgente?: string;
  registroProfesional?: string; // ej: AICAT, RAICV, API
}

export interface VisitHonorariosDetails {
  porcentajeHonorariosVenta?: number; // ej: 3% o 4%
  importeFijoHonorarios?: number;
  ivaAplicable?: number; // 21%
  periodoValidezMeses?: number; // ej: 12 meses tras la visita
}

export interface VisitSheetInput {
  agencia?: VisitAgencyDetails;
  visitante?: VisitorDetails;
  inmueble?: VisitPropertyDetails;
  honorarios?: VisitHonorariosDetails;
  fechaVisita?: string | Date;
  horaVisita?: string;
}

export interface VisitSheetOutput {
  title: string;
  documentType: "visita";
  legalReference: string;
  sheetText: string;
  detectedPendingFields: string[];
  isComplete: boolean;
  readyForDigitalSignature: boolean;
  summary: {
    visitanteNombre: string;
    visitanteDni: string;
    inmuebleDireccion: string;
    porcentajeHonorarios: number | null;
  };
}

/**
 * Genera la Hoja de Visita con Reconocimiento de Gestión y Blindaje de Honorarios de Corretaje Inmobiliario (RF-10).
 * Incorpora cláusula de blindaje frente a elusión de honorarios, protección RGPD y espacio de firma digital.
 */
export function generateVisitSheet(input: VisitSheetInput = {}): VisitSheetOutput {
  const pendingFields: string[] = [];

  const resolveField = (val: string | undefined, tag: string): string => {
    if (val && val.trim() !== "") {
      return val.trim();
    }
    pendingFields.push(tag);
    return `[PENDIENTE: ${tag}]`;
  };

  const resolveDateField = (val: string | Date | undefined, tag: string): string => {
    if (!val) {
      pendingFields.push(tag);
      return `[PENDIENTE: ${tag}]`;
    }
    if (val instanceof Date) {
      return val.toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
    }
    return val;
  };

  const agenciaNombre = input.agencia?.nombreAgencia?.trim() || "Inmobia 360 Servicios Inmobiliarios";
  const agenteNombre = resolveField(input.agencia?.nombreAgente, "NOMBRE_AGENTE_ACOMPAÑANTE");
  const fechaVisita = resolveDateField(input.fechaVisita || new Date(), "FECHA_VISITA");
  const horaVisita = resolveField(input.horaVisita, "HORA_VISITA");

  // Visitante
  const visitanteNombre = resolveField(input.visitante?.nombreCompleto, "NOMBRE_VISITANTE");
  const visitanteDni = resolveField(input.visitante?.dniNie, "DNI_VISITANTE");
  const visitanteTel = resolveField(input.visitante?.telefono, "TELEFONO_VISITANTE");
  const visitanteEmail = input.visitante?.email?.trim() || "[PENDIENTE: EMAIL_VISITANTE]";

  // Inmueble
  const direccionInmueble = resolveField(input.inmueble?.direccion, "DIRECCION_INMUEBLE");
  const refCatastral = resolveField(input.inmueble?.referenciaCatastral, "REFERENCIA_CATASTRAL");
  const tipoOp = input.inmueble?.tipoOperacion === "alquiler" ? "Arrendamiento" : "Compraventa";
  const precioOrientativo = input.inmueble?.precioOrientativo
    ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(input.inmueble.precioOrientativo)
    : null;

  // Honorarios
  const pctHonorarios = input.honorarios?.porcentajeHonorariosVenta ?? 3.0;
  const mesesValidez = input.honorarios?.periodoValidezMeses ?? 12;

  const sheetText = `HOJA DE VISITA Y RECONOCIMIENTO DE GESTIÓN INMOBILIARIA CON PACTO DE HONORARIOS
(CONFORME AL CÓDIGO CIVIL Y JURISPRUDENCIA DEL TRIBUNAL SUPREMO SOBRE CORRETAJE INMOBILIARIO)

FECHA DE VISITA: ${fechaVisita}                 HORA: ${horaVisita}
AGENCIA INTERMEDIARIA: ${agenciaNombre}
AGENTE QUE ACOMPAÑA: ${agenteNombre}

DATOS DEL VISITANTE / CLIENTE DEMANDANTE:
D./Dña.: ${visitanteNombre}
DNI / NIE / Pasaporte: ${visitanteDni}
Teléfono de contacto: ${visitanteTel}
Correo electrónico: ${visitanteEmail}

DATOS DEL INMUEBLE OBJETO DE LA VISITA:
Dirección completa: ${direccionInmueble}
Referencia Catastral: ${refCatastral}
Operación interesada: ${tipoOp}${precioOrientativo ? `\nPrecio orientativo de salida: ${precioOrientativo}` : ""}

MANIFESTACIONES Y ESTIPULACIONES:

PRIMERA.- RECONOCIMIENTO DE MEDIACIÓN Y VISITA.
El VISITANTE declara expresamente que ha visitado en el día y hora indicados el inmueble reseñado gracias única y exclusivamente a la mediación, presentación y acompañamiento profesional de la AGENCIA.

SEGUNDA.- PACTO Y BLINDAJE DE HONORARIOS PROFESIONALES.
En el supuesto de que el VISITANTE, su cónyuge, ascendientes, descendientes, personas que convivieren con él, o cualquier sociedad en la que participe como socio, administrador o apoderado, adquiera o arriende en el futuro el inmueble visitado:
1. El VISITANTE se compromete firme e irrevocablemente a abonar a la AGENCIA los honorarios profesionales de corretaje convenidos, fijados en el ${pctHonorarios}% del precio final de transmisión (más el IVA legalmente aplicable).
2. El devengo de dichos honorarios operará si la formalización o perfeccionamiento de la operación se realiza en el plazo de ${mesesValidez} MESES a contar desde la fecha de la presente visita, con independencia de que la compraventa se concluya directamente con la propiedad o a través de terceros intermediarios.

TERCERA.- CONFIDENCIALIDAD DE LA INFORMACIÓN.
El VISITANTE se compromete a no facilitar a terceras personas ningún dato, precio, circunstancia o contacto del propietario facilitado por la AGENCIA, respondiendo civilmente de los perjuicios ocasionados en caso de elusión de honorarios.

CUARTA.- CLÁUSULA DE INFORMACIÓN DE PROTECCIÓN DE DATOS (RGPD Y LOPD-GDD 3/2018).
Los datos de carácter personal facilitados serán tratados por la AGENCIA con la finalidad de gestionar la visita realizada y el seguimiento del corretaje inmobiliario. Puede ejercer sus derechos de acceso, rectificación, supresión y oposición dirigiéndose a la AGENCIA.

DOCUMENTO PREPARADO PARA FIRMA BIOMÉTRICA / DIGITAL EN PANTALLA:

____________________________________________         ____________________________________________
FIRMA DEL AGENTE / REPRESENTANTE AGENCIA             FIRMA DIGITAL DEL VISITANTE (CONFORME)
`;

  return {
    title: "Hoja de Visita con Reconocimiento de Honorarios",
    documentType: "visita",
    legalReference: "Código Civil español y Jurisprudencia del Tribunal Supremo sobre corretaje y mediación",
    sheetText,
    detectedPendingFields: pendingFields,
    isComplete: pendingFields.length === 0,
    readyForDigitalSignature: true,
    summary: {
      visitanteNombre,
      visitanteDni,
      inmuebleDireccion: direccionInmueble,
      porcentajeHonorarios: pctHonorarios
    }
  };
}
