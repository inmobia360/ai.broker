/**
 * Capa de Adaptación Internacional (Multi-País) — AI BROKER
 * Permite replicar y franquiciar la plataforma a cualquier país
 * aislando normativas legales, monedas y fuentes catastrales.
 */

export type CountryCode = "ES" | "PE" | "MX" | "CO" | "CL" | "AR";

export interface CurrencyConfig {
  code: string; // "EUR", "PEN", "USD", "MXN"
  symbol: string; // "€", "S/", "$", "Mex$"
  position: "after" | "before";
  thousandSeparator: "." | ",";
  decimalSeparator: "," | ".";
  format(amount: number): string;
}

export interface LegalFramework {
  civilCodeArrasRef: string; // España: "Art. 1454 del Código Civil"
  possessionHandoverRef: string; // España: "Art. 1462 del Código Civil"
  leasingLawRef: string; // España: "Ley de Arrendamientos Urbanos (LAU 29/1994)"
  communityDebtRef: string; // España: "Art. 9.1.e Ley de Propiedad Horizontal"
  taxIdName: string; // España: "NIF/CIF", Perú: "RUC", México: "RFC"
  professionalAssociationName: string; // España: "Colegio Oficial de Agentes de la Propiedad Inmobiliaria (API / AICAT)"
}

export interface CadastreConfig {
  name: string; // "Sede Electrónica del Catastro de España"
  searchUrlTemplate: string;
  supports3DView: boolean;
  referenceFormatRegex: RegExp;
}

export interface CountryAdapter {
  code: CountryCode;
  name: string;
  currency: CurrencyConfig;
  legal: LegalFramework;
  cadastre: CadastreConfig;
  formatPrice(amount: number): string;
  validateTaxId(taxId: string): boolean;
  validateUtilityCode?(cupsOrCode: string): boolean;
}
