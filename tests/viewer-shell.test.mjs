import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { formatOfficialScore, deriveAtomicState, propagateStates } from '../web/js/eval-viewer.js';

function read(path){ return fs.readFileSync(path,'utf8'); }

test('pending results never format as numeric official scores', () => {
  assert.equal(formatOfficialScore({review_state:'pending',total_score:null}),'—');
  assert.equal(formatOfficialScore({review_state:'reviewed',total_score:8.5}),'8.5');
});

test('atomic state stays pending when review is not complete', () => {
  assert.equal(deriveAtomicState({review_state:'pending'},{passed:true}),'pending');
  assert.equal(deriveAtomicState({review_state:'reviewed'},{passed:true}),'pass');
  assert.equal(deriveAtomicState({review_state:'reviewed'},{passed:false}),'fail');
});

test('failed parent prevents a dependent child from earning a pass', () => {
  const nodes=[
    {id:'q0',depends_on:[],state:'fail'},
    {id:'q1',depends_on:['q0'],state:'pass'}
  ];
  const out=propagateStates(nodes);
  assert.equal(out.find(n=>n.id==='q1').state,'skipped');
});

test('viewer shell clearly separates spec illustration and model output', () => {
  const html=read('web/results/case.html');
  assert.match(html,/SPEC ILLUSTRATION/);
  assert.match(html,/MODEL OUTPUT/);
  assert.match(html,/data-view="spec"/);
  assert.match(html,/data-view="result"/);
});

test('viewer exposes keyboard controls and reduced-motion support', () => {
  const html=read('web/results/case.html');
  const css=read('web/css/eval-viewer.css');
  assert.match(html,/id="playButton"/);
  assert.match(html,/id="stepNextButton"/);
  assert.match(html,/id="stepPrevButton"/);
  assert.match(html,/id="resetButton"/);
  assert.match(css,/prefers-reduced-motion:\s*reduce/);
});
