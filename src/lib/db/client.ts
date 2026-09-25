import fs from 'fs';
import path from 'path';
import pg from 'pg';
import type { Pool as PgPoolType, PoolClient, QueryResult, QueryResultRow } from 'pg';

const PoolConstructor = pg.Pool || (pg as any).default?.Pool;

let poolInstance: PgPoolType | null = null;

export function getDbPool(): PgPoolType {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ai_broker';
    poolInstance = new PoolConstructor({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return poolInstance;
}

/**
 * Ejecuta una consulta o transacción forzando la variable de sesión 'app.current_tenant_id'
 * para que PostgreSQL active sus políticas de Row Level Security (RLS).
 * Garantiza cumplimiento de RF-1 y RF-3.
 */
export async function withTenantContext<T>(
  tenantId: string,
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  if (!tenantId || tenantId.trim() === '') {
    throw new Error('Violación de Seguridad RLS: Se requiere un tenant_id válido para ejecutar consultas.');
  }

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // Inyectar contexto de tenant_id en la sesión de la conexión local
    await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId.trim()]);
    
    const result = await callback(client);
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Helper para obtener el DDL del esquema SQL para migraciones o tests
 */
export function getSchemaSql(): string {
  const candidatePaths = [
    path.join(process.cwd(), 'src', 'lib', 'db', 'schema.sql'),
    path.join(process.cwd(), 'schema.sql'),
    '/app/src/lib/db/schema.sql',
    path.resolve(process.cwd(), '..', 'src', 'lib', 'db', 'schema.sql')
  ];

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf8');
      }
    } catch {
      // continuar con la siguiente ruta
    }
  }

  throw new Error("No se pudo localizar el archivo schema.sql en las rutas del sistema.");
}
