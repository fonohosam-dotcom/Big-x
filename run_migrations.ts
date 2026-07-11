import { initDb } from './src/db/init.ts';
initDb().then(() => {
  console.log("DB initialized manually.");
  process.exit(0);
});
