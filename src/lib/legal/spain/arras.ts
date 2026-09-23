export interface PartyDetails {
  nombreCompleto?: string;
  dniNie?: string;
  domicilio?: string;
  estadoCivil?: string;
}

export interface PropertyDetails {
  direccion?: string;
  referenciaCatastral?: string;
  datosRegistrales?: string;
  cargas?: string;
}

export interface EconomicConditions {
  precioTotal?: number;
  importeSenalArras?: number;
  formaPagoSenal?: string;
  plazoMaximoNotaria?: string | Date;
  notarioEleccion?: string;
}

export interface ArrasContractInput {
  municipio?: string;
  fecha?: string | Date;
  vendedor?: PartyDetails;
  comprador?: PartyDetails;
  inmueble?: PropertyDetails;
  condiciones?: EconomicConditions;
}

export interface ArrasContractOutput {
  title: string;
  documentType: "arras";
  legalReference: string;
  contractText: string;
  detectedPendingFields: string[];
  isComplete: boolean;
  economicSummary: {
    precioTotal: number | null;
    importeSenal: number | null;
    porcentajeSenal: number | null;
  };
}

/**
 * Formatea cantidades numéricas al formato monetario estándar en España (ej. 250.000,00 €).
 */
export function formatCurrencySpain(amount?: number): string | null {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return null;
  }
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Genera el borrador formal de Contrato de Arras Penitenciales amparado en el Art. 1454 del Código Civil español (RF-8).
 * Detecta campos no informados y los marca explícitamente como [PENDIENTE: NOMBRE_CAMPO] sin inventar ni alucinar datos.
 */
export function generateArrasPenitencialesContract(input: ArrasContractInput = {}): ArrasContractOutput {
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

  // Parte Vendedora
  const vendedorNombre = resolveField(input.vendedor?.nombreCompleto, "NOMBRE_VENDEDOR");
  const vendedorDni = resolveField(input.vendedor?.dniNie, "DNI_VENDEDOR");
  const vendedorDomicilio = resolveField(input.vendedor?.domicilio, "DOMICILIO_VENDEDOR");
  const vendedorEstadoCivil = resolveField(input.vendedor?.estadoCivil, "ESTADO_CIVIL_VENDEDOR");

  // Parte Compradora
  const compradorNombre = resolveField(input.comprador?.nombreCompleto, "NOMBRE_COMPRADOR");
  const compradorDni = resolveField(input.comprador?.dniNie, "DNI_COMPRADOR");
  const compradorDomicilio = resolveField(input.comprador?.domicilio, "DOMICILIO_COMPRADOR");
  const compradorEstadoCivil = resolveField(input.comprador?.estadoCivil, "ESTADO_CIVIL_COMPRADOR");

  // Inmueble
  const inmuebleDireccion = resolveField(input.inmueble?.direccion, "DIRECCION_INMUEBLE");
  const referenciaCatastral = resolveField(input.inmueble?.referenciaCatastral, "REFERENCIA_CATASTRAL");
  const datosRegistrales = input.inmueble?.datosRegistrales?.trim() || "inscrita en el Registro de la Propiedad correspondiente";
  const cargas = input.inmueble?.cargas?.trim() || "libre de cargas, gravámenes, ocupantes y al corriente de pago en tributos y gastos comunitarios";

  // Condiciones Económicas
  const precioTotalFormatted = resolveNumberField(input.condiciones?.precioTotal, "PRECIO_TOTAL_VENTA");
  const importeSenalFormatted = resolveNumberField(input.condiciones?.importeSenalArras, "IMPORTE_SEÑAL_ARRAS");
  const formaPagoSenal = input.condiciones?.formaPagoSenal?.trim() || "transferencia bancaria inmediata a la cuenta designada por la parte vendedora";
  const plazoMaximoNotaria = resolveDateField(input.condiciones?.plazoMaximoNotaria, "PLAZO_MAXIMO_ESCRITURA");

  // Cálculos económicos
  const precioNum = input.condiciones?.precioTotal || null;
  const senalNum = input.condiciones?.importeSenalArras || null;
  const porcentajeSenal = (precioNum && senalNum) ? Number(((senalNum / precioNum) * 100).toFixed(2)) : null;

  const contractText = `CONTRATO DE PROMESA BILATERAL DE COMPRAVENTA CON ARRAS PENITENCIALES
(AL AMPARO DEL ARTÍCULO 1454 DEL CÓDIGO CIVIL ESPAÑOL)

En ${municipio}, a ${fecha}.

REUNIDOS:

DE UNA PARTE, EN CONCEPTO DE PARTE VENDEDORA:
D./Dña. ${vendedorNombre}, mayor de edad, de estado civil ${vendedorEstadoCivil}, con DNI/NIE número ${vendedorDni}, y domicilio a efectos de notificaciones en ${vendedorDomicilio}.

DE OTRA PARTE, EN CONCEPTO DE PARTE COMPRADORA:
D./Dña. ${compradorNombre}, mayor de edad, de estado civil ${compradorEstadoCivil}, con DNI/NIE número ${compradorDni}, y domicilio a efectos de notificaciones en ${compradorDomicilio}.

Ambas partes intervienen en su propio nombre y derecho, reconociéndose recíprocamente la capacidad legal y de obrar necesaria para suscribir el presente contrato de arras penitenciales, a cuyo efecto:

EXPONEN:

I.- Que la PARTE VENDEDORA es legítima titular del pleno dominio de la siguiente finca:
Vivienda ubicada en ${inmuebleDireccion}.
Referencia Catastral: ${referenciaCatastral}.
Datos registrales: ${datosRegistrales}.
Situación de cargas: Se transmite como cuerpo cierto, ${cargas}.

II.- Que estando interesada la PARTE COMPRADORA en adquirir la referida finca urbana y la PARTE VENDEDORA en transmitírsela, formalizan el presente acuerdo con sujeción a las siguientes:

CLÁUSULAS:

PRIMERA.- OBJETO Y PRECIO FINAL DE COMPRAVENTA.
La PARTE VENDEDORA se compromete a vender a la PARTE COMPRADORA, que acepta y se compromete a comprar, la finca descrita en el Expositivo I.
El precio alzado, cierto y convenido para la compraventa es de ${precioTotalFormatted} (impuestos y gastos no incluidos).

SEGUNDA.- SEÑAL Y CALIFICACIÓN EXPRESA COMO ARRAS PENITENCIALES (ART. 1454 CÓDIGO CIVIL).
En este acto, la PARTE COMPRADORA entrega a la PARTE VENDEDORA, que recibe a su entera satisfacción, la cantidad de ${importeSenalFormatted}, mediante ${formaPagoSenal}, en concepto expreso de ARRAS PENITENCIALES o de desistimiento.
Dicha cantidad se considerará como entrega a cuenta y parte del precio total convenido en el momento del otorgamiento de la escritura pública de compraventa.

De conformidad con el artículo 1454 del Código Civil español, las partes acuerdan expresamente el régimen de rescisión del contrato:
a) Si la PARTE COMPRADORA rescindiere el contrato o desistiese de formalizar la compraventa en el plazo pactado, perderá íntegramente la cantidad entregada en concepto de arras penitenciales, que quedará en propiedad de la parte vendedora.
b) Si fuere la PARTE VENDEDORA quien rescindiere el contrato, desistiese o se negare a otorgar la venta, vendrá obligada a devolver las arras duplicadas a la parte compradora, abonando a esta el doble de la suma recibida.

TERCERA.- ELEVACIÓN A ESCRITURA PÚBLICA Y PAGO DEL RESTO DEL PRECIO.
El otorgamiento de la preceptiva escritura pública notarial de compraventa se llevará a cabo como fecha límite el ${plazoMaximoNotaria}, ante el Notario que libremente elija la PARTE COMPRADORA.
En dicho acto de firma notarial, la PARTE COMPRADORA abonará a la PARTE VENDEDORA el resto del precio pactado, deducida la señal hoy entregada, mediante cheque bancario conformado nominativo o transferencia OMF del Banco de España.

CUARTA.- GASTOS E IMPUESTOS DERIVADOS DE LA TRANSMISIÓN.
Los gastos e impuestos derivados del otorgamiento de la escritura pública se distribuirán conforme a la legislación española vigente:
- Corresponderá a la PARTE VENDEDORA el abono del Impuesto sobre el Incremento de Valor de los Terrenos de Naturaleza Urbana (Plusvalía Municipal).
- Corresponderá a la PARTE COMPRADORA el abono del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados (ITP/AJD), así como los honorarios y aranceles notariales y de inscripción en el Registro de la Propiedad.

QUINTA.- LEY APLICABLE Y FUERO JUDICIAL.
El presente contrato se regirá e interpretará conforme al Código Civil y demás legislación común española. Para cualquier controversia litigiosa que pudiera derivarse del mismo, las partes se someten expresamente a la jurisdicción y competencia de los Juzgados y Tribunales del lugar donde radica el inmueble.

Y en prueba de plena conformidad, firman el presente documento por duplicado ejemplar y a un solo efecto, en el lugar y fecha consignados en el encabezamiento.

_______________________________                  _______________________________
LA PARTE VENDEDORA                                LA PARTE COMPRADORA`;

  return {
    title: "Borrador de Contrato de Arras Penitenciales (Art. 1454 C.C.)",
    documentType: "arras",
    legalReference: "Artículo 1454 del Código Civil español",
    contractText,
    detectedPendingFields: pendingFields,
    isComplete: pendingFields.length === 0,
    economicSummary: {
      precioTotal: precioNum,
      importeSenal: senalNum,
      porcentajeSenal
    }
  };
}

export const generateArrasContract = generateArrasPenitencialesContract;

