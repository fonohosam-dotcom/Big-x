const fs = require('fs');
let code = fs.readFileSync('src/db/seed.ts', 'utf-8');

code = code.replace("process.exit(0);", "");
code = code.replace(/seed\(\)\.catch\([\s\S]*?\);/, "");
code = code.replace("async function seed()", "export async function seed()");

fs.writeFileSync('src/db/seed.ts', code);
