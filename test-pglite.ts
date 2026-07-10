import { PGlite } from '@electric-sql/pglite';
async function test() {
  try {
    const db = new PGlite('file://./pglite-data');
    console.log(await db.query("SELECT 'ok'"));
  } catch(e) {
    console.log("Error:", e);
  }
}
test();
