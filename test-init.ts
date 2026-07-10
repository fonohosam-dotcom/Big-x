import { initDb } from './src/db/init.ts';
initDb().then(() => console.log('ok')).catch(console.error);
