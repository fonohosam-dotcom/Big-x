import { db } from './src/db/index.ts';
import { users } from './src/db/schema.ts';
async function test() {
  try {
    const r = await db.select().from(users);
    console.log(r);
  } catch(e) {
    console.log(e);
  }
}
test();
