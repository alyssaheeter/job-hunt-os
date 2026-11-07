import fs from 'node:fs';
import path from 'node:path';

const target = process.argv[2] || 'alyssa';
if (target !== 'alyssa') {
  console.error('Invalid target. This repository supports only alyssa.');
  process.exit(1);
}

const repoRoot = process.cwd();
const source = path.join(repoRoot, '.clasp-alyssa.json');
const dest = path.join(repoRoot, '.clasp.json');

if (!fs.existsSync(source)) {
  console.error(`Missing example config: ${source}`);
  process.exit(1);
}

if (fs.existsSync(dest) && process.env.FORCE !== '1') {
  console.warn('Reminder: .clasp.json already exists. Set FORCE=1 to overwrite.');
} else {
  fs.copyFileSync(source, dest);
  console.log(`Wrote ${dest} from ${source}`);
}

const raw = fs.readFileSync(dest, 'utf8');
if (raw.includes('[FILL-IN') || raw.includes('YOUR_ALYSSA_SCRIPT_ID_HERE')) {
  console.warn('Reminder: update .clasp.json with your real scriptId and rootDir values.');
}
