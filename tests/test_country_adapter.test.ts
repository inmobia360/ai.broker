import { describe, it } from "node:test";
import assert from "node:assert";
import { spainAdapter, SpainCountryAdapter } from "../src/lib/country/adapters/spain.ts";
import { countryRegistry, getActiveCountry } from "../src/lib/country/registry.ts";

describe("T1 & T2: Capa de Adaptación Internacional (Multi-País) (RF-P10, RF-P11)", () => {
  it("El adaptador oficial para España implementa el marco legal exigido", () => {
    assert.strictEqual(spainAdapter.code, "ES");
    assert.strictEqual(spainAdapter.name, "España");
    assert.strictEqual(spainAdapter.currency.code, "EUR");
    assert.strictEqual(spainAdapter.currency.symbol, "€");

    // Verificación de normativas específicas
    assert.ok(spainAdapter.legal.civilCodeArrasRef.includes("1454"));
    assert.ok(spainAdapter.legal.possessionHandoverRef.includes("1462"));
    assert.ok(spainAdapter.legal.communityDebtRef.includes("9.1.e"));
    assert.ok(spainAdapter.legal.leasingLawRef.includes("29/1994"));
  });

  it("Formatea adecuadamente los importes en euros (€)", () => {
    assert.strictEqual(spainAdapter.formatPrice(450000), "450.000 €");
    assert.strictEqual(spainAdapter.formatPrice(1250000), "1.250.000 €");
  });

  it("Valida identificadores fiscales españoles (NIF, NIE, CIF)", () => {
    // DNI válido
    assert.strictEqual(spainAdapter.validateTaxId("12345678Z"), true);
    // CIF válido (B: sociedad de responsabilidad limitada)
    assert.strictEqual(spainAdapter.validateTaxId("B12345678"), true);
    // NIE válido
    assert.strictEqual(spainAdapter.validateTaxId("X1234567L"), true);
    // Inválidos
    assert.strictEqual(spainAdapter.validateTaxId("1234"), false);
    assert.strictEqual(spainAdapter.validateTaxId(""), false);
  });

  it("Valida códigos CUPS de electricidad en España", () => {
    assert.strictEqual(spainAdapter.validateUtilityCode("ES0021000000000001AB"), true);
    assert.strictEqual(spainAdapter.validateUtilityCode("FR0021000000000001AB"), false);
    assert.strictEqual(spainAdapter.validateUtilityCode("12345"), false);
  });

  it("CountryRegistry resuelve el adaptador por defecto para España", () => {
    const active = getActiveCountry();
    assert.strictEqual(active.code, "ES");

    const resolved = countryRegistry.getAdapter("es");
    assert.strictEqual(resolved.code, "ES");

    // Fallback a España para países aún no implementados
    const fallback = countryRegistry.getAdapter("XX");
    assert.strictEqual(fallback.code, "ES");
  });
});
