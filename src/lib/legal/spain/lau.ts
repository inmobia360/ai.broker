import { formatCurrencySpain } from "./arras.ts";

export interface LauPartyDetails {
  nombreCompleto?: string;
  dniNie?: string;
  domicilio?: string;
  esPersonaJuridica?: boolean;
  cif?: string;
  representanteLegal?: string;
}

export interface LauPropertyDetails {
  direccion?: string;
  referenciaCatastral?: string;
  incluyeMobiliario?: boolean;
}

export interface LauEconomicConditions {
  rentaMensual?: number;
  fianzaLegalMeses?: number; // 1 mensualidad por ley (art. 36.1 LAU)
  garantiaAdicionalMeses?: number; // Máximo 2 mensualidades (art. 36.5 LAU)
  cuentaBancariaPago?: string;
  organismoFianzaAutonomico?: string;
}

export interface LauContractInput {
  municipio?: string;
  fecha?: string | Date;
  arrendador?: LauPartyDetails;
  arrendatario?: LauPartyDetails;
  inmueble?: LauPropertyDetails;
  condiciones?: LauEconomicConditions;
}

export interface LauContractOutput {
  title: string;
  documentType: "lau";
  legalReference: string;
  contractText: string;
  detectedPendingFields: string[];
  isComplete: boolean;
  economicSummary: {
    rentaMensual: number | null;
    fianzaLegal: number | null;
    duracionMinimaAnos: number;
  };
}

/**
 * Genera el borrador formal de Contrato de Arrendamiento de Vivienda Habitual conforme a la
 * Ley 29/1994 de Arrendamientos Urbanos (LAU) y la Ley 12/2023 por el Derecho a la Vivienda (RF-9).
 * Detecta campos ausentes y los etiqueta como [PENDIENTE: NOMBRE_CAMPO] sin alucinaciones.
 */
export function generateLauContract(input: LauContractInput = {}): LauContractOutput {
  const pendingFields: string[] = [];

  const resolveField = (val: string | undefined, tag: string): string => {
    if (val && val.trim() !== "") {
      return val.trim();
    }
    pendingFields.push(tag);
    return `[PENDIENTE: ${tag}]`;
  };

  const resolveNumberField = (val: number | undefined, tag: string): string => {
    if (val !== undefined && val !== null && !isNaN(val) && val > 0) {
      return formatCurrencySpain(val)!;
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

  const municipio = resolveField(input.municipio, "MUNICIPIO");
  const fecha = resolveDateField(input.fecha, "FECHA_CONTRATO");

  // Arrendador (Persona física o jurídica)
  const esJuridica = Boolean(input.arrendador?.esPersonaJuridica);
  const duracionMinimaAnos = esJuridica ? 7 : 5;

  let arrendadorDesc = "";
  if (esJuridica) {
    const razonSocial = resolveField(input.arrendador?.nombreCompleto, "RAZON_SOCIAL_ARRENDADOR");
    const cif = resolveField(input.arrendador?.cif || input.arrendador?.dniNie, "CIF_ARRENDADOR");
    const representante = resolveField(input.arrendador?.representanteLegal, "REPRESENTANTE_LEGAL_ARRENDADOR");
    arrendadorDesc = `la mercantil ${razonSocial}, con CIF número ${cif}, representada en este acto por D./Dña. ${representante}`;
  } else {
    const nombreArr = resolveField(input.arrendador?.nombreCompleto, "NOMBRE_ARRENDADOR");
    const dniArr = resolveField(input.arrendador?.dniNie, "DNI_ARRENDADOR");
    const domArr = resolveField(input.arrendador?.domicilio, "DOMICILIO_ARRENDADOR");
    arrendadorDesc = `D./Dña. ${nombreArr}, con DNI/NIE ${dniArr}, y domicilio en ${domArr}`;
  }

  // Arrendatario
  const inquilinoNombre = resolveField(input.arrendatario?.nombreCompleto, "NOMBRE_ARRENDATARIO");
  const inquilinoDni = resolveField(input.arrendatario?.dniNie, "DNI_ARRENDATARIO");
  const inquilinoDom = resolveField(input.arrendatario?.domicilio, "DOMICILIO_ARRENDATARIO");

  // Inmueble
  const direccionInmueble = resolveField(input.inmueble?.direccion, "DIRECCION_INMUEBLE");
  const refCatastral = resolveField(input.inmueble?.referenciaCatastral, "REFERENCIA_CATASTRAL");
  const mobiliarioTexto = input.inmueble?.incluyeMobiliario
    ? "amueblada, según inventario descriptivo anexo que forma parte inseparable del presente contrato"
    : "sin amueblar";

  // Condiciones Económicas
  const rentaFormatted = resolveNumberField(input.condiciones?.rentaMensual, "RENTA_MENSUAL");
  const rentaNum = input.condiciones?.rentaMensual || null;
  const fianzaNum = rentaNum; // Fianza legal de 1 mensualidad conforme al art. 36.1 LAU
  const fianzaFormatted = rentaNum ? formatCurrencySpain(rentaNum)! : "[PENDIENTE: FIANZA_LEGAL_1_MES]";
  const cuentaPago = resolveField(input.condiciones?.cuentaBancariaPago, "IBAN_CUENTA_PAGO");
  const organismoFianza = input.condiciones?.organismoFianzaAutonomico?.trim() || "el organismo público de depósito de fianzas de la Comunidad Autónoma competente";

  const contractText = `CONTRATO DE ARRENDAMIENTO DE VIVIENDA HABITUAL
(SUJETO RIGUROSAMENTE A LA LEY 29/1994 DE ARRENDAMIENTOS URBANOS - LAU)

En ${municipio}, a ${fecha}.

REUNIDOS:

DE UNA PARTE, EN CONCEPTO DE PARTE ARRENDADORA:
${arrendadorDesc}.

DE OTRA PARTE, EN CONCEPTO DE PARTE ARRENDATARIA:
D./Dña. ${inquilinoNombre}, mayor de edad, con DNI/NIE número ${inquilinoDni}, y domicilio a efectos de este contrato en la propia vivienda arrendada sita en ${inquilinoDom}.

Ambas partes se reconocen mutuamente plena capacidad jurídica para otorgar el presente contrato de arrendamiento de vivienda, y al efecto:

EXPONEN:

I.- Que la PARTE ARRENDADORA es propietaria en pleno dominio de la vivienda sita en:
${direccionInmueble}.
Referencia Catastral: ${refCatastral}.
La vivienda se arrienda ${mobiliarioTexto}, en perfecto estado de conservación y habitabilidad, con los suministros de agua y luz en funcionamiento.

II.- Que la PARTE ARRENDATARIA tiene interés en arrendar la finca descrita para destinarla exclusivamente a su VIVIENDA PERMANENTE Y HABITUAL, conviniendo las partes formalizar este contrato con sujeción a las siguientes:

CLÁUSULAS:

PRIMERA.- RÉGIMEN JURÍDICO APLICABLE.
El presente contrato se rige de forma imperativa por los Títulos I y IV de la Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos (LAU), por los pactos contenidos en el mismo en el marco del Título II de dicha Ley, y supletoriamente por el Código Civil español.

SEGUNDA.- DESTINO Y USO DE LA VIVIENDA.
La finca arrendada se destinará única y exclusivamente a satisfacer la necesidad permanente de vivienda del arrendatario y de su unidad familiar. Queda expresamente prohibida la cesión del contrato, el subarriendo total o parcial, así como el hospedaje o explotación turística de la vivienda.

TERCERA.- DURACIÓN Y PRÓRROGAS LEGALES OBLIGATORIAS (ARTS. 9 Y 10 LAU).
1. El plazo de duración inicial pactado es de UN AÑO, a contar desde el ${fecha}.
2. Conforme al artículo 9 de la LAU, si el plazo pactado fuere inferior a ${duracionMinimaAnos} años (al ser la parte arrendadora ${esJuridica ? "persona jurídica" : "persona física"}), llegado el día de vencimiento, el contrato se prorrogará obligatoriamente por plazos anuales hasta alcanzar una duración mínima de ${duracionMinimaAnos} AÑOS, salvo que el arrendatario manifieste al arrendador, con al menos 30 días de antelación a la fecha de terminación, su voluntad de no renovarlo.
3. Conforme al artículo 10 de la LAU, concluido el periodo obligatorio de ${duracionMinimaAnos} años, si ninguna de las partes notifica a la otra su voluntad de no renovarlo con la antelación legal establecida, el contrato se prorrogará necesariamente por plazos anuales hasta un máximo de TRES AÑOS más.
4. Desistimiento del arrendatario (Art. 11 LAU): El arrendatario podrá desistir del contrato una vez transcurridos al menos seis meses, comunicándolo con al menos 30 días de antelación.

CUARTA.- RENTA MENSUAL Y PAGO (ART. 17 LAU).
1. La renta mensual inicial convenida es de ${rentaFormatted} al mes.
2. El pago se efectuará por meses anticipados dentro de los siete primeros días de cada mes mediante transferencia bancaria al número de cuenta IBAN: ${cuentaPago}.
3. En ningún caso el arrendador podrá exigir el pago anticipado de más de una mensualidad de renta.

QUINTA.- ACTUALIZACIÓN DE LA RENTA (ART. 18 LAU).
La renta solo podrá ser actualizada por el arrendador en la fecha en que se cumpla cada año de vigencia del contrato, en los términos y con sujeción a los límites y coeficientes máximos fijados por la legislación vigente (Ley 12/2023 por el Derecho a la Vivienda).

SEXTA.- FIANZA LEGAL OBLIGATORIA (ART. 36 LAU) Y DEPÓSITO AUTONÓMICO.
1. A la firma del presente contrato, la PARTE ARRENDATARIA entrega a la PARTE ARRENDADORA en metálico la cantidad de ${fianzaFormatted}, equivalente exactamente a UNA MENSUALIDAD de renta, en concepto de FIANZA LEGAL OBLIGATORIA conforme al artículo 36.1 de la LAU.
2. La fianza responderá de los desperfectos que pudieran causarse en la vivienda imputables al arrendatario y del cumplimiento de las obligaciones contractuales.
3. La PARTE ARRENDADORA se obliga formalmente a ingresar el importe de la fianza en ${organismoFianza}, dentro del plazo legal previsto por la normativa autonómica aplicable.
4. Concluida la relación arrendaticia y entregadas las llaves, la fianza será restituida al arrendatario en el plazo máximo de 30 días, devengando el interés legal si transcurriere dicho plazo sin reembolso.

SÉPTIMA.- GASTOS GENERALES, SUMINISTROS Y GESTIÓN INMOBILIARIA (ART. 20 LAU).
1. Los gastos por servicios y suministros de la vivienda (electricidad, agua, gas y telecomunicaciones) individualizados mediante aparatos contadores serán de cuenta y cargo exclusivo del arrendatario.
2. De conformidad con el artículo 20.1 de la LAU vigente, los gastos de gestión inmobiliaria y los de formalización del contrato serán a cargo del arrendador.

OCTAVA.- FUERO Y JURISDICCIÓN.
Para la resolución de cuantas controversias pudieran surgir en relación con el presente contrato, las partes se someten a los Juzgados y Tribunales del lugar en que radica la finca arrendada.

En prueba de plena conformidad, firman el presente contrato por duplicado ejemplar en el lugar y fecha arriba indicados.

_______________________________                  _______________________________
PARTE ARRENDADORA                                PARTE ARRENDATARIA`;

  return {
    title: "Borrador de Contrato de Arrendamiento de Vivienda Habitual (LAU 29/1994)",
    documentType: "lau",
    legalReference: "Ley 29/1994 de Arrendamientos Urbanos (LAU) y Ley 12/2023",
    contractText,
    detectedPendingFields: pendingFields,
    isComplete: pendingFields.length === 0,
    economicSummary: {
      rentaMensual: rentaNum,
      fianzaLegal: fianzaNum,
      duracionMinimaAnos
    }
  };
}
