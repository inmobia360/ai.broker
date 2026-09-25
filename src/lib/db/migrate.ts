import { getDbPool, getSchemaSql } from './client';

export interface MigrationResult {
  success: boolean;
  message: string;
  appliedTables?: string[];
  error?: string;
  durationMs: number;
}

/**
 * Ejecuta de forma idempotente las sentencias DDL del esquema principal (schema.sql).
 * Asegura que todas las tablas, índices y políticas RLS estén presentes en PostgreSQL.
 */
export async function runMigrations(): Promise<MigrationResult> {
  const startTime = Date.now();
  const pool = getDbPool();
  const client = await pool.connect();

  try {
    const ddl = getSchemaSql();

    // Ejecutar el DDL completo dentro de una transacción
    await client.query('BEGIN');
    await client.query(ddl);
    await client.query('COMMIT');

    // Consultar las tablas existentes en el esquema public
    const res = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    );

    const tables = res.rows.map(r => r.table_name);

    return {
      success: true,
      message: `Migración de esquema PostgreSQL completada con éxito. ${tables.length} tablas verificadas.`,
      appliedTables: tables,
      durationMs: Date.now() - startTime
    };
  } catch (error: any) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[DATABASE-MIGRATE] Error al aplicar esquema SQL:', error);
    return {
      success: false,
      message: 'Fallo al ejecutar la migración del esquema de base de datos.',
      error: error?.message || String(error),
      durationMs: Date.now() - startTime
    };
  } finally {
    client.release();
  }
}
