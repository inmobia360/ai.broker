import type { CountryAdapter, CurrencyConfig, LegalFramework, CadastreConfig } from "../types.ts";

export const SpainCurrency: CurrencyConfig = {
  code: "EUR",
  symbol: "€",
  position: "after",
  thousandSeparator: ".",
  decimalSeparator: ",",
  format(amount: number): string {
    const formatted = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formatted} €`;
  }
};

export const SpainLegalFramework: LegalFramework = {
  civilCodeArrasRef: "Artículo 1454 del Código Civil (Arras Penitenciales)",
  possessionHandoverRef: "Artículo 1462 del Código Civil (Tradición instrumental y toma de posesión)",
  leasingLawRef: "Ley 29/1994, de 24 de noviembre, de Arrendamientos Urbanos (LAU)",
  communityDebtRef: "Artículo 9.1.e de la Ley 49/1960 de Propiedad Horizontal (Plazo preceptivo de 7 días naturales)",
  taxIdName: "NIF / CIF / NIE",
  professionalAssociationName: "Colegiación Oficial API / Registro Obligatorio AICAT"
};

export const SpainCadastre: CadastreConfig = {
  name: "Sede Electrónica del Catastro del Ministerio de Hacienda de España",
  searchUrlTemplate: "https://www1.sedecatastro.gob.es/CYGConsulta/OVCConsulta.aspx",
  supports3DView: true,
  // 20 caracteres alfanuméricos de la Referencia Catastral urbana/rústica
  referenceFormatRegex: /^[0-9]{7}[A-Z]{2}[0-9]{4}[A-Z]{1}[0-9]{4}[A-Z]{2}$/i
};

export class SpainCountryAdapter implements CountryAdapter {
  readonly code = "ES" as const;
  readonly name = "España";
  readonly currency = SpainCurrency;
  readonly legal = SpainLegalFramework;
  readonly cadastre = SpainCadastre;

  formatPrice(amount: number): string {
    return this.currency.format(amount);
  }

  validateTaxId(taxId: string): boolean {
    const cleaned = taxId.trim().toUpperCase().replace(/[\s-]/g, "");
    if (!cleaned || cleaned.length !== 9) return false;

    // Validación simplificada y robusta de DNI, NIE y CIF
    const dniRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/;

    return dniRegex.test(cleaned) || nieRegex.test(cleaned) || cifRegex.test(cleaned);
  }

  validateUtilityCode(cups: string): boolean {
    const cleaned = cups.trim().toUpperCase().replace(/[\s-]/g, "");
    // Formato estándar español de CUPS: ES + 16 dígitos + 2 caracteres de control
    return /^ES[0-9]{16}[A-Z]{2}[0-9A-Z]?$/i.test(cleaned);
  }
}

export const spainAdapter = new SpainCountryAdapter();
