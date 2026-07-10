import { drizzle } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './schema.ts';

// Use a global in-memory instance so that multiple imports share the same DB in dev
const globalForDb = globalThis as unknown as {
  pgliteClient: PGlite | undefined;
};

const client = globalForDb.pgliteClient ?? new PGlite();
if (process.env.NODE_ENV !== 'production') globalForDb.pgliteClient = client;

export const db = drizzle(client, { schema });
