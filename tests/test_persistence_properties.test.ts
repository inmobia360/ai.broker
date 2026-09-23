import { describe, it } from "node:test";
import assert from "node:assert";
import { getSchemaSql } from "../src/lib/db/client.ts";
import { toTenantUuid } from "../src/lib/tenant.ts";

describe("T3: Esquema de Base de Datos y Persistencia Multi-Tenant (RF-P1, RF-P2, RF-P3, RF-P4, RF-P5)", () => {
  it("El DDL contiene las tablas de producción requeridas", () => {
    const ddl = getSchemaSql();

    assert.ok(ddl.includes("CREATE TABLE IF NOT EXISTS properties"));
    assert.ok(ddl.includes("CREATE TABLE IF NOT EXISTS leads"));
    assert.ok(ddl.includes("CREATE TABLE IF NOT EXISTS pipeline_deals"));
    assert.ok(ddl.includes("CREATE TABLE IF NOT EXISTS agency_branding"));
  });

  it("Todas las tablas nuevas tienen tenant_id UUID y RLS activado", () => {
    const ddl = getSchemaSql();

    // Verificación de columnas tenant_id
    assert.ok(ddl.includes("tenant_id UUID NOT NULL REFERENCES tenants(id)"));

    // Verificación de activación de RLS
    assert.ok(ddl.includes("ALTER TABLE properties ENABLE ROW LEVEL SECURITY"));
    assert.ok(ddl.includes("ALTER TABLE leads ENABLE ROW LEVEL SECURITY"));
    assert.ok(ddl.includes("ALTER TABLE pipeline_deals ENABLE ROW LEVEL SECURITY"));
    assert.ok(ddl.includes("ALTER TABLE agency_branding ENABLE ROW LEVEL SECURITY"));

    // Verificación de FORCE ROW LEVEL SECURITY
    assert.ok(ddl.includes("ALTER TABLE properties FORCE ROW LEVEL SECURITY"));
    assert.ok(ddl.includes("ALTER TABLE leads FORCE ROW LEVEL SECURITY"));
    assert.ok(ddl.includes("ALTER TABLE pipeline_deals FORCE ROW LEVEL SECURITY"));
    assert.ok(ddl.includes("ALTER TABLE agency_branding FORCE ROW LEVEL SECURITY"));
  });

  it("toTenantUuid genera UUIDs deterministas y válidos a partir de slugs", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    const uuid1 = toTenantUuid("inmobia360");
    const uuid2 = toTenantUuid("inmobia360");
    const uuid3 = toTenantUuid("agencia-madrid-norte");

    assert.ok(uuidRegex.test(uuid1), "uuid1 debe ser un UUID válido");
    assert.ok(uuidRegex.test(uuid3), "uuid3 debe ser un UUID válido");
    assert.strictEqual(uuid1, uuid2, "El mismo slug debe generar siempre el mismo UUID");
    assert.notStrictEqual(uuid1, uuid3, "Distintos slugs deben generar UUIDs diferentes");
  });
});
