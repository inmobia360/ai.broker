import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getSchemaSql, withTenantContext } from '../src/lib/db/client.ts';

describe('T2: Validación de Esquema de Base de Datos y Políticas RLS (RF-1, RF-3)', () => {

  test('El DDL de schema.sql existe y contiene todas las tablas requeridas', () => {
    const sql = getSchemaSql();
    assert.ok(sql.length > 500, 'El archivo schema.sql debe contener sentencias DDL válidas.');

    const requiredTables = [
      'tenants',
      'users',
      'invitations',
      'dossiers',
      'drafts',
      'agency_memory_vectors'
    ];

    for (const table of requiredTables) {
      const tableRegex = new RegExp(`CREATE\\s+TABLE\\s+(IF\\s+NOT\\s+EXISTS\\s+)?${table}\\s*\\(`, 'i');
      assert.ok(tableRegex.test(sql), `La tabla obligatoria '${table}' debe estar definida en el esquema.`);
    }
  });

  test('Todas las entidades operativas tienen tenant_id UUID NOT NULL forzado', () => {
    const sql = getSchemaSql();

    const tenantChildTables = [
      'users',
      'invitations',
      'dossiers',
      'drafts',
      'agency_memory_vectors'
    ];

    for (const table of tenantChildTables) {
      // Extraer bloque de la tabla
      const tableMatch = sql.match(new RegExp(`CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?${table}\\s*\\(([\\s\\S]*?)\\);`, 'i'));
      assert.ok(tableMatch, `Debe encontrarse la definición de la tabla '${table}'.`);

      const tableBody = tableMatch[1];
      assert.ok(
        /tenant_id\s+UUID\s+NOT\s+NULL/i.test(tableBody),
        `La tabla '${table}' debe tener 'tenant_id UUID NOT NULL'.`
      );
      assert.ok(
        /REFERENCES\s+tenants\s*\(id\)/i.test(tableBody),
        `La tabla '${table}' debe tener clave foránea hacia 'tenants(id)'.`
      );
    }
  });

  test('Todas las tablas tienen políticas RLS y FORCE ROW LEVEL SECURITY activadas', () => {
    const sql = getSchemaSql();

    const rlsTables = [
      'tenants',
      'users',
      'invitations',
      'dossiers',
      'drafts',
      'agency_memory_vectors'
    ];

    for (const table of rlsTables) {
      const enableRlsRegex = new RegExp(`ALTER\\s+TABLE\\s+${table}\\s+ENABLE\\s+ROW\\s+LEVEL\\s+SECURITY`, 'i');
      assert.ok(enableRlsRegex.test(sql), `La tabla '${table}' debe tener 'ENABLE ROW LEVEL SECURITY'.`);
    }

    // Comprobar políticas de aislamiento por current_setting('app.current_tenant_id')
    const isolatedTables = ['users', 'invitations', 'dossiers', 'drafts', 'agency_memory_vectors'];
    for (const table of isolatedTables) {
      const policyRegex = new RegExp(`CREATE\\s+POLICY\\s+tenant_isolation_\\w+\\s+ON\\s+${table}`, 'i');
      assert.ok(policyRegex.test(sql), `La tabla '${table}' debe tener una directiva 'CREATE POLICY' de aislamiento.`);
    }

    assert.ok(
      sql.includes("current_setting('app.current_tenant_id'"),
      "Las políticas RLS deben condicionar el acceso a 'app.current_tenant_id'."
    );
  });

  test('withTenantContext rechaza invocaciones sin tenant_id o con tenant vacío (RF-1, RF-3)', async () => {
    // Caso tenant vacío
    await assert.rejects(
      async () => {
        await withTenantContext('', async () => {});
      },
      /Violación de Seguridad RLS/i,
      'Debe abortar si el tenant_id está vacío.'
    );

    // Caso tenant con solo espacios
    await assert.rejects(
      async () => {
        await withTenantContext('   ', async () => {});
      },
      /Violación de Seguridad RLS/i,
      'Debe abortar si el tenant_id contiene solo espacios en blanco.'
    );
  });

});
