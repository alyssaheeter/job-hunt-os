import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2];
if (!target) {
  console.error('Usage: node scripts/clasp-use.mjs <alyssa|mom>');
  process.exit(1);
}
if (!['alyssa', 'mom'].includes(target)) {
  console.error('Invalid target. Use "alyssa" or "mom".');
  process.exit(1);
}

const repoRoot = process.cwd();
const source = path.join(repoRoot, 'clasp', `.clasp.${target}.json.example`);
const dest = path.join(repoRoot, '.clasp.json');

if (!fs.existsSync(source)) {
  console.error(`Missing example config: ${source}`);
  process.exit(1);
}

if (fs.existsSync(dest) && process.env.FORCE !== '1') {
  console.error('Refusing to overwrite .clasp.json. Set FORCE=1 to overwrite.');
  process.exit(1);
}

fs.copyFileSync(source, dest);
console.log(`Wrote ${dest} from ${source}`);

const raw = fs.readFileSync(dest, 'utf8');
if (raw.includes('[FILL-IN')) {
  console.warn('Reminder: update .clasp.json with real scriptId/rootDir values.');
}
