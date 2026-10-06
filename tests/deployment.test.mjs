import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Pages workflow validates viewer data before deployment',()=>{
  const yml=fs.readFileSync('.github/workflows/pages.yml','utf8');
  assert.match(yml,/node --test tests\/\*\.test\.mjs/);
  assert.match(yml,/node scripts\/build-viewer-data\.mjs/);
  assert.match(yml,/node scripts\/validate-viewer\.mjs web\/data\/cases-v0\.1\.json/);
});

test('Pages workflow publishes every runtime data directory',()=>{
  const yml=fs.readFileSync('.github/workflows/pages.yml','utf8');
  for(const token of ['cp -r web _site/web','cp -r benchmark _site/benchmark','results/chatgpt-image/run-2026-10-06.json']) assert.match(yml,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.match(yml,/actions\/deploy-pages@v4/);
});

test('web README documents spec illustration versus model output',()=>{
  const md=fs.readFileSync('web/README.md','utf8');
  assert.match(md,/SPEC ILLUSTRATION/);
  assert.match(md,/MODEL OUTPUT/);
  assert.match(md,/case\.html\?id=CB-001/);
});

test('feature branch pushes validate but only main can deploy Pages',()=>{
  const yml=fs.readFileSync('.github/workflows/pages.yml','utf8');
  assert.match(yml,/feat\/\*\*/);
  assert.match(yml,/github\.ref == 'refs\/heads\/main'/);
});
