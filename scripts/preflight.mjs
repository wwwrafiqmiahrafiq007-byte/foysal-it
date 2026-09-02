import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = ['package.json', 'tsconfig.json', 'next.config.ts', 'eslint.config.mjs', '.env.example'];
const missing = requiredFiles.filter((file) => !existsSync(file));

if (missing.length) {
  console.error(`Preflight failed. Missing files: ${missing.join(', ')}`);
  process.exit(1);
}

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const requiredScripts = ['build', 'start', 'lint', 'typecheck'];
const missingScripts = requiredScripts.filter((name) => !pkg.scripts?.[name]);

if (missingScripts.length) {
  console.error(`Preflight failed. Missing scripts: ${missingScripts.join(', ')}`);
  process.exit(1);
}

console.log('FOYSAL IT preflight passed.');
