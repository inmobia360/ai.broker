/**
 * Módulo de Postventa Física: Acta de Entrega de Llaves, Posesión y Lectura de Contadores
 * Régimen legal español: Arts. 1462 y ss. del Código Civil (traditio / entrega de posesión),
 * Ley 24/2013 del Sector Eléctrico y normativa de suministros energéticos y de aguas.
 */

export interface KeysInventory {
  mainDoorSets: number;
  portalSets: number;
  mailboxKeys: number;
  storageRoomKeys: number;
  garageRemotes: number;
  otherKeysDescription?: string;
}

export interface UtilityReading {
  serviceType: "electricidad" | "agua" | "gas";
  companyName?: string;
  meterNumber?: string;
  cups?: string; // Código Unificado de Punto de Suministro (20-22 caracteres alfanuméricos)
  readingValue: number;
  unit: "kWh" | "m³";
  readingDate?: string;
}

export interface HandoverParty {
  fullName: string;
  dniNie: string;
  phone?: string;
  email?: string;
}

export interface HandoverInput {
  propertyAddress: string;
  transferDate?: string | Date;
  transferType: "compraventa" | "arrendamiento";
  transferor: HandoverParty; // Vendedor o Arrendador
  acquirer: HandoverParty;   // Comprador o Arrendatario
  agentName?: string;
  agencyName?: string;
  keys: KeysInventory;
  utilities: {
    electricity: UtilityReading;
    water: UtilityReading;
    gas?: UtilityReading;
  };
  propertyStateObservations?: string;
}

export interface HandoverOutput {
  title: string;
  documentType: "key_handover_and_meter_act";
  legalReference: string;
  actText: string;
  utilityTransferAuthorizationText: string;
  detectedPendingFields: string[];
  isComplete: boolean;
  inventorySummary: {
    totalKeysSets: number;
    totalRemotes: number;
    servicesRecordedCount: number;
  };
}

/**
 * Valida formato orientativo de código CUPS español (empieza por ES seguido de dígitos y letras).
 */
export function validateCupsFormat(cups?: string): boolean {
  if (!cups) return false;
  const cleanCups = cups.trim().toUpperCase();
  return /^ES[0-9]{16}[A-Z0-9]{2,4}$/.test(cleanCups);
}

/**
 * Genera el Acta de Entrega de Llaves, Posesión y Lectura de Contadores,
 * junto con la autorización de cambio de titularidad de suministros.
 */
export function generateKeyHandoverAct(input: HandoverInput): HandoverOutput {
  const { propertyAddress, transferDate, transferType, transferor, acquirer, keys, utilities } = input;
  const pendingFields: string[] = [];

  if (!propertyAddress) pendingFields.push("Dirección de la finca");
  if (!transferor.fullName) pendingFields.push("Nombre de parte transmitente");
  if (!transferor.dniNie) pendingFields.push("DNI/NIE de parte transmitente");
  if (!acquirer.fullName) pendingFields.push("Nombre de parte adquirente");
  if (!acquirer.dniNie) pendingFields.push("DNI/NIE de parte adquirente");
  if (!utilities.electricity.cups) pendingFields.push("Código CUPS de electricidad");

  const formattedDate = transferDate
    ? new Date(transferDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

  const roleTransmitente = transferType === "compraventa" ? "PARTE VENDEDORA" : "PARTE ARRENDADORA";
  const roleAdquirente = transferType === "compraventa" ? "PARTE COMPRADORA" : "PARTE ARRENDATARIA";

  const totalKeys = (keys.mainDoorSets || 0) + (keys.portalSets || 0) + (keys.mailboxKeys || 0) + (keys.storageRoomKeys || 0);
  const totalRemotes = keys.garageRemotes || 0;
  let servicesCount = 2; // Electricidad + Agua
  if (utilities.gas && utilities.gas.readingValue >= 0) servicesCount++;

  const actText = `ACTA DE ENTREGA DE LLAVES, TRANSMISIÓN DE POSESIÓN Y LECTURA DE CONTADORES DE SUMINISTROS

En la finca sita en: ${propertyAddress || "[DIRECCIÓN DE LA PROPIEDAD]"}
A fecha: ${formattedDate}

REUNIDOS:

DE UNA PARTE (${roleTransmitente}):
D./Dña. ${transferor.fullName || "[NOMBRE TRANSMITENTE]"}, con DNI/NIE n.º ${transferor.dniNie || "[DNI/NIE]"},
con teléfono ${transferor.phone || "[TELÉFONO]"} y correo ${transferor.email || "[CORREO]"}.

DE OTRA PARTE (${roleAdquirente}):
D./Dña. ${acquirer.fullName || "[NOMBRE ADQUIRENTE]"}, con DNI/NIE n.º ${acquirer.dniNie || "[DNI/NIE]"},
con teléfono ${acquirer.phone || "[TELÉFONO]"} y correo ${acquirer.email || "[CORREO]"}.

En presencia de la agencia mediadora: ${input.agencyName || "Agencia Inmobiliaria"} ${input.agentName ? `(representada por D./Dña. ${input.agentName})` : ""}.

MANIFIESTAN Y CONVIENEN:

PRIMERO.— TRANSMISIÓN DE LA POSESIÓN MATERIAL.
Al amparo de lo dispuesto en el Artículo 1462 del Código Civil español, la ${roleTransmitente} hace entrega solemne y material de la posesión pacífica de la referida finca urbana a la ${roleAdquirente}, quien la recibe de plena conformidad en el estado físico y de conservación convenido.

SEGUNDO.— INVENTARIO Y ENTREGA DE LLAVES Y ACCESOS.
La ${roleTransmitente} entrega en este acto a la ${roleAdquirente} el juego completo de accesos al inmueble y sus anejos, sin reservarse copia alguna:
  1. Juegos de llaves de la puerta principal / acorazada: ${keys.mainDoorSets || 0} juego(s).
  2. Juegos de llaves del portal y accesos comunitarios: ${keys.portalSets || 0} juego(s).
  3. Llaves del casillero / buzón de correspondencia: ${keys.mailboxKeys || 0} llave(s).
  4. Llaves de cuarto trastero anejo: ${keys.storageRoomKeys || 0} llave(s).
  5. Mandos a distancia de apertura de cancela / garaje: ${keys.garageRemotes || 0} unidad(es).
  ${keys.otherKeysDescription ? `6. Otros accesos específicos: ${keys.otherKeysDescription}` : ""}

TERCERO.— LECTURA FEHACIENTE DE CONTADORES DE SUMINISTROS.
A fin de delimitar de manera exacta la liquidación de consumos entre las partes hasta el día de hoy, se procede conjuntamente a la verificación y lectura directa de los contadores:

  A) SUMINISTRO ELÉCTRICO:
     - Compañía Comercializadora actual: ${utilities.electricity.companyName || "[COMPAÑÍA ELÉCTRICA]"}
     - Código Unificado de Punto de Suministro (CUPS): ${utilities.electricity.cups || "[CÓDIGO CUPS]"}
     - Lectura a fecha de entrega: ${utilities.electricity.readingValue} kWh.

  B) SUMINISTRO DE AGUA SANITARIA:
     - Entidad / Compañía suministradora: ${utilities.water.companyName || "[COMPAÑÍA DE AGUAS]"}
     - Número de serie del contador: ${utilities.water.meterNumber || "[N.º CONTADOR]"}
     - Lectura a fecha de entrega: ${utilities.water.readingValue} m³.

  ${utilities.gas ? `C) SUMINISTRO DE GAS NATURAL:
     - Compañía Comercializadora actual: ${utilities.gas.companyName || "[COMPAÑÍA GAS]"}
     - Código CUPS / Contador: ${utilities.gas.cups || utilities.gas.meterNumber || "[CUPS / CONTADOR]"}
     - Lectura a fecha de entrega: ${utilities.gas.readingValue} m³.\n` : ""}
CUARTO.— LIQUIDACIÓN DE CONSUMOS Y CAMBIO DE TITULARIDAD.
La ${roleTransmitente} asume íntegramente los importes devengados por dichos consumos hasta la presente lectura, comprometiéndose a facilitar los justificantes de abono.
A partir de este momento, los consumos que se devenguen serán por cuenta exclusiva de la ${roleAdquirente}, quien se compromete a efectuar de forma inmediata el CAMBIO DE TITULARIDAD de las pólizas de suministro, autorizando expresamente la parte transmitente dicho traspaso sin interrupción ni baja de servicio.

${input.propertyStateObservations ? `OBSERVACIONES SOBRE EL ESTADO DEL INMUEBLE:\n${input.propertyStateObservations}\n` : ""}
En prueba de conformidad, firman la presente acta por duplicado ejemplar en el lugar y fecha al principio consignados.



_________________________________________             _________________________________________
${roleTransmitente}                                   ${roleAdquirente}
D./Dña. ${transferor.fullName || "[TRANSMITENTE]"}           D./Dña. ${acquirer.fullName || "[ADQUIRENTE]"}
DNI: ${transferor.dniNie || "[DNI]"}                           DNI: ${acquirer.dniNie || "[DNI]"}
`;

  const utilityTransferAuthorizationText = `AUTORIZACIÓN EXPRESA PARA CAMBIO DE TITULARIDAD DE SUMINISTROS
SIN CORTE DE SERVICIO

A LAS COMPAÑÍAS SUMINISTRADORAS DE ELECTRICIDAD, AGUA Y GAS:

D./Dña. ${transferor.fullName || "[TRANSMITENTE]"}, con DNI/NIE n.º ${transferor.dniNie || "[DNI/NIE]"},
anterior titular de los contratos de suministro suscritos para el inmueble sito en:
${propertyAddress || "[DIRECCIÓN DE LA PROPIEDAD]"}

AUTORIZA DE FORMA EXPRESA E IRREVOCABLE A:

D./Dña. ${acquirer.fullName || "[ADQUIRENTE]"}, con DNI/NIE n.º ${acquirer.dniNie || "[DNI/NIE]"},
nuevo/a titular legítimo/a del inmueble,

A realizar cuantas gestiones resulten necesarias ante las entidades comercializadoras y distribuidoras para formalizar a su nombre el TRASPASO O CAMBIO DE TITULARIDAD de los siguientes contratos de suministro, sin baja del servicio:

1. ELECTRICIDAD: Código CUPS n.º ${utilities.electricity.cups || "[CUPS]"} (Lectura de relevo: ${utilities.electricity.readingValue} kWh).
2. AGUA: Contador n.º ${utilities.water.meterNumber || "[N.º CONTADOR]"} (Lectura de relevo: ${utilities.water.readingValue} m³).
${utilities.gas ? `3. GAS: Código CUPS / Contador n.º ${utilities.gas.cups || utilities.gas.meterNumber || "[GAS]"} (Lectura de relevo: ${utilities.gas.readingValue} m³).\n` : ""}
En ${propertyAddress ? propertyAddress.split(",")[0] : "Madrid"}, a ${formattedDate}.

Firma del Titular Saliente: _________________________________________
DNI: ${transferor.dniNie || "[DNI]"}
`;

  return {
    title: "Acta de Entrega de Llaves, Posesión y Lectura de Contadores",
    documentType: "key_handover_and_meter_act",
    legalReference: "Código Civil español (Art. 1462) y Ley 24/2013 del Sector Eléctrico",
    actText,
    utilityTransferAuthorizationText,
    detectedPendingFields: pendingFields,
    isComplete: pendingFields.length === 0,
    inventorySummary: {
      totalKeysSets: totalKeys,
      totalRemotes,
      servicesRecordedCount: servicesCount
    }
  };
}
