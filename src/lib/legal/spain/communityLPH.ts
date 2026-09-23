/**
 * Módulo de Comunidad de Propietarios (LPH) y Finca Madre
 * Régimen legal: Ley 49/1960, de 21 de julio, sobre Propiedad Horizontal (LPH),
 * especialmente Art. 9.1.e (certificado de deudas para escrituración) y Art. 9.1.f (fondo de reserva).
 */

export interface DerramaPending {
  concept: string;
  totalAmount: number;
  monthlyFee: number;
  remainingMonths: number;
  approvedDate?: string;
  isSellerLiability?: boolean; // Derramas vencidas vs futuras según acuerdo de junta
}

export interface CommunityAdministrator {
  name: string;
  collegeNumber?: string;
  email?: string;
  phone?: string;
  company?: string;
}

export interface CommunityLPHDetails {
  propertyAddress: string;
  cadastralReference?: string;
  cadastralCoefficient?: number; // Porcentaje de cuota de participación (ej. 2.45)
  buildingYear?: number;
  itePassed?: boolean;
  monthlyOrdinaryFee: number;
  reserveFundContribution?: number; // Cuota a dotación del fondo de reserva
  pendingDerramas?: DerramaPending[];
  administrator: CommunityAdministrator;
  presidentName?: string;
  ownerName: string;
  ownerDni: string;
}

export interface LPHRequestInput {
  details: CommunityLPHDetails;
  requestDate?: string | Date;
  notaryScheduledDate?: string | Date;
  deliveryMethod?: "email" | "burofax" | "postal";
}

export interface LPHRequestOutput {
  title: string;
  documentType: "lph_debt_certificate_request";
  legalReference: string;
  documentText: string;
  detectedPendingFields: string[];
  isComplete: boolean;
  financialSummary: {
    monthlyOrdinaryFee: number;
    totalPendingDerramas: number;
    activeDerramasCount: number;
  };
}

/**
 * Calcula el importe total pendiente de liquidación por derramas extraordinarias aprobadas.
 */
export function calculateTotalPendingDerramas(derramas?: DerramaPending[]): number {
  if (!derramas || derramas.length === 0) return 0;
  return derramas.reduce((acc, d) => acc + (d.monthlyFee * d.remainingMonths), 0);
}

/**
 * Formatea cantidades a moneda euros estándar español.
 */
export function formatCurrencyLPH(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0,00 €";
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Genera el escrito formal de solicitud de Certificado de Corriente de Pago (Art. 9.1.e LPH).
 */
export function generateLPHDebtCertificateRequest(input: LPHRequestInput): LPHRequestOutput {
  const { details, requestDate, notaryScheduledDate } = input;
  const pendingFields: string[] = [];

  if (!details.propertyAddress) pendingFields.push("Dirección de la finca");
  if (!details.ownerName) pendingFields.push("Nombre del propietario");
  if (!details.ownerDni) pendingFields.push("DNI/NIE del propietario");
  if (!details.administrator?.name) pendingFields.push("Nombre del Administrador de Fincas");

  const formattedDate = requestDate 
    ? new Date(requestDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  const formattedNotaryDate = notaryScheduledDate
    ? new Date(notaryScheduledDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : "[FECHA ESTIMADA DE ESCRITURA]";

  const totalDerramas = calculateTotalPendingDerramas(details.pendingDerramas);
  const derramasCount = details.pendingDerramas?.length || 0;

  let derramasSection = "";
  if (derramasCount > 0 && details.pendingDerramas) {
    derramasSection = `\nDESGLOSE DE DERRAMAS EXTRAORDINARIAS EN CURSO REGISTRADAS:\n` +
      details.pendingDerramas.map((d, idx) => 
        `  ${idx + 1}. Concepto: ${d.concept} | Cuota mensual: ${formatCurrencyLPH(d.monthlyFee)} | Meses pendientes: ${d.remainingMonths} | Total restante: ${formatCurrencyLPH(d.monthlyFee * d.remainingMonths)}`
      ).join("\n") + "\n";
  } else {
    derramasSection = "\nNo constan derramas extraordinarias activas registradas en el expediente del inmueble.\n";
  }

  const documentText = `REQUERIMIENTO FORMAL DE CERTIFICACIÓN DE ESTADO DE DEUDAS CON LA COMUNIDAD DE PROPIETARIOS
AL AMPARO DEL ARTÍCULO 9.1.e) DE LA LEY DE PROPIEDAD HORIZONTAL (LEY 49/1960)

A LA ATENCIÓN DE:
D./Dña. ${details.administrator.name || "[ADMINISTRADOR DE FINCAS COLEGIADO]"}
${details.administrator.collegeNumber ? `N.º de Colegiado: ${details.administrator.collegeNumber}` : ""}
${details.administrator.company ? `Despacho / Administración: ${details.administrator.company}` : ""}
${details.administrator.email ? `Correo Electrónico: ${details.administrator.email}` : ""}
Y con el Visto Bueno del Sr./Sra. Presidente de la Comunidad: ${details.presidentName || "[PRESIDENTE DE LA COMUNIDAD]"}

DE PARTE DE:
D./Dña. ${details.ownerName || "[NOMBRE PROPIETARIO/VENDEDOR]"}
Con DNI/NIE n.º: ${details.ownerDni || "[DNI/NIE]"}
En calidad de titular dominical de la finca sita en: ${details.propertyAddress || "[DIRECCIÓN DE LA FINCA]"}
${details.cadastralReference ? `Referencia Catastral: ${details.cadastralReference}` : ""}
${details.cadastralCoefficient ? `Cuota de Participación en la Finca Madre: ${details.cadastralCoefficient}%` : ""}

En fecha: ${formattedDate}

EXPONE:

PRIMERO.— Que es legítimo propietario/a del departamento privativo anteriormente referenciado, perteneciente a la Comunidad de Propietarios que ustedes administran y representan.

SEGUNDO.— Que hallándose en trámites avanzados para la formalización de la transmisión onerosa del citado inmueble mediante otorgamiento de Escritura Pública Notarial prevista aproximadamente para el día ${formattedNotaryDate}, precisa inexcusablemente la certificación acreditativa del estado de deudas para con esta Comunidad de Propietarios.

TERCERO.— Que de conformidad con el Artículo 9.1.e) párrafo cuarto de la vigente Ley 49/1960, de 21 de julio, sobre Propiedad Horizontal:
«En el instrumento público mediante el que se transmita, por cualquier título, el inmueble o el derecho sobre el mismo, el transmitente deberá declarar hallarse al corriente en el pago de los gastos generales de la comunidad de propietarios o expresar los que adeude. El transmitente deberá aportar en este momento certificación sobre el estado de deudas con la comunidad coincidente con su declaración, sin la cual no podrá autorizarse el otorgamiento de la escritura pública...»
Disponiendo taxativamente el precepto que dicha certificación deberá ser expedida por el Secretario con el visto bueno del Presidente en el plazo máximo legal de SIETE DÍAS NATURALES desde su solicitud.

DATOS ECONÓMICOS REGISTRADOS:
- Cuota ordinaria comunitaria mensual: ${formatCurrencyLPH(details.monthlyOrdinaryFee)}
${details.reserveFundContribution ? `- Aportación mensual a Fondo de Reserva (Art. 9.1.f LPH): ${formatCurrencyLPH(details.reserveFundContribution)}\n` : ""}${derramasSection}
POR LO EXPUESTO, SOLICITA:

Que en el plazo máximo preceptivo de 7 días naturales establecido en el Artículo 9.1.e) de la Ley de Propiedad Horizontal, procedan a expedir y remitir al solicitante o a su agencia de intermediación autorizada la CERTIFICACIÓN OFICIAL de encontrarse el inmueble al corriente de pago de cuotas ordinarias y extraordinarias, derramas aprobadas y obligaciones con la Comunidad hasta la fecha de expedición, o en su caso, detallar las cantidades líquidas, vencidas y exigibles pendientes.

En ${details.propertyAddress ? details.propertyAddress.split(",")[0] : "Madrid"}, a ${formattedDate}.



_________________________________________             _________________________________________
Firma del Solicitante / Propietario                   Recibí del Administrador de Fincas
D./Dña. ${details.ownerName || "[PROPIETARIO]"}                Fecha de entrega: _____ / _____ / 2026
DNI: ${details.ownerDni || "[DNI]"}
`;

  return {
    title: "Solicitud de Certificado de Deuda Cero (Art. 9.1.e LPH)",
    documentType: "lph_debt_certificate_request",
    legalReference: "Ley 49/1960 de Propiedad Horizontal (Art. 9.1.e y 9.1.f)",
    documentText,
    detectedPendingFields: pendingFields,
    isComplete: pendingFields.length === 0,
    financialSummary: {
      monthlyOrdinaryFee: details.monthlyOrdinaryFee || 0,
      totalPendingDerramas: totalDerramas,
      activeDerramasCount: derramasCount
    }
  };
}
