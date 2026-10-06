import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const ids=[...Array.from({length:24},(_,i)=>`CB-${String(i+1).padStart(3,'0')}`),...Array.from({length:6},(_,i)=>`CB-A${String(i+1).padStart(2,'0')}`)];

test('results overview exposes suite capability zodiac and difficulty filters',()=>{
  const html=fs.readFileSync('web/results/index.html','utf8');
  for(const id of ['filterSuite','filterCapability','filterZodiac','filterDifficulty','resultsGrid']) assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/results-index\.js/);
});

test('overview cards route through canonical case viewer',()=>{
  const js=fs.readFileSync('web/js/results-index.js','utf8');
  assert.match(js,/case\.html\?id=/);
  assert.match(js,/generated_pending_review/);
  assert.match(js,/awaiting_generation/);
});

test('all 30 legacy pages preserve their own selected test id',()=>{
  for(const id of ids){
    const path=`web/results/${id}.html`;
    assert.equal(fs.existsSync(path),true,`${path} exists`);
    const html=fs.readFileSync(path,'utf8');
    assert.match(html,new RegExp(`case\\.html\\?id=${id.replace('-','\\-')}`),`${id} target`);
  }
});

test('pending overview copy never implies an official numeric score',()=>{
  const js=fs.readFileSync('web/js/results-index.js','utf8');
  assert.match(js,/待复核/);
  assert.match(js,/score.*'—'/s);
});
