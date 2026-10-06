import fs from 'node:fs';
import {validateViewerCases} from './build-viewer-data.mjs';
const file=process.argv[2]||'web/data/cases-v0.1.json';const data=JSON.parse(fs.readFileSync(file,'utf8'));const r=validateViewerCases(data.cases||data);if(!r.ok){console.error(r.errors.join('\\n'));process.exit(1)}console.log('viewer validation: '+(data.cases||data).length+' cases, 0 errors');
