import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const web = path.join(root, 'src', 'web');
const assets = [
  ['sidebar.css', 'sidebar-css.html'],
  ['sidebar.js', 'sidebar-js.html'],
];

for (const [sourceName, outputName] of assets) {
  const source = fs.readFileSync(path.join(web, sourceName), 'utf8');
  fs.writeFileSync(path.join(web, outputName), source);
}

console.log('Generated Apps Script HTML includes for sidebar assets.');
