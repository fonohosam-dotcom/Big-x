import { db } from './index.ts';
import fs from 'fs';
import path from 'path';

export async function initDb() {
  try {
    const migrationDir = path.join(process.cwd(), 'drizzle');
    const files = fs.readdirSync(migrationDir).filter(f => f.endsWith('.sql'));
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationDir, file), 'utf8');
      const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
      for (const statement of statements) {
        try {
          // @ts-ignore
          await db.execute(statement);
        } catch (err: any) {
          if (err.message && (err.message.includes('already exists') || err.message.includes('duplicate'))) {
             // Ignore table/type already exists
          } else {
             console.error("Statement failed:", statement.slice(0, 100), "Error:", err);
          }
        }
      }
    }
    console.log("Database schema applied.");
  } catch (e) {
    console.error("Failed to initialize db", e);
  }
}
