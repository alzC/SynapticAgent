import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Connection singleton pour éviter les multiples connections
const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
};

const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.conn = conn;
}

export const db = drizzle(conn, { schema });

export * from './schema';