import fs from 'node:fs';
import { validateViewerCases } from './build-viewer-data.mjs';
const target = process.argv[2] || 'web/data/cases-v0.1.json';
const payload = JSON.parse(fs.readFileSync(target,'utf8'));
const result = validateViewerCases(payload.cases || payload);
if (!result.ok) {
  console.error(result.errors.join('\n'));
  process.exit(1);
}
console.log(`valid ${payload.cases?.length ?? payload.length} cases`);
