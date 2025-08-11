import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const { DATABASE_URL, PG_POOL_MAX, PG_IDLE_TIMEOUT, PG_CONNECT_TIMEOUT, DRIZZLE_LOGGER, PGSSL } = Bun.env;
if (!DATABASE_URL) throw new Error('DATABASE_URL is missing. Put it in .env');

export const sql = postgres(DATABASE_URL, {
  max: Number(PG_POOL_MAX ?? 10),
  idle_timeout: Number(PG_IDLE_TIMEOUT ?? 20),
  connect_timeout: Number(PG_CONNECT_TIMEOUT ?? 10),
  ssl: PGSSL === 'require' ? 'require' : undefined,
});

export const db = drizzle(sql, { schema, logger: DRIZZLE_LOGGER === 'true' }) as PostgresJsDatabase<typeof schema>;

export async function closeDb(timeoutSeconds = 5) {
  await sql.end({ timeout: timeoutSeconds });
}
