import { initDb } from './src/db/init.ts';
import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';

async function run() {
  await initDb();
  await db.insert(users).values({ email: 'a@a.com', name: 'A', passwordHash: '123', role: 'citizen' });
  console.log(await db.select().from(users));
}
run();
