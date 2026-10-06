import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inferDependencies } from '../scripts/build-viewer-data.mjs';
import { inferDependencies as inferBrowserDependencies } from '../web/js/eval-viewer.js';

const expected=[...Array.from({length:24},(_,i)=>`CB-${String(i+1).padStart(3,'0')}`),...Array.from({length:6},(_,i)=>`CB-A${String(i+1).padStart(2,'0')}`)];

test('all 30 V0.1 cases have explicit non-empty scene specs',()=>{
  const specs=JSON.parse(fs.readFileSync('web/data/scene-specs-v0.1.json','utf8'));
  assert.equal(Object.keys(specs).length,30);
  assert.deepEqual(Object.keys(specs).sort(),expected.sort());
  for(const id of expected){
    assert.ok(Array.isArray(specs[id].scene.entities) && specs[id].scene.entities.length>0,`${id} entities`);
    assert.equal(specs[id].scene.coverage,'rubric-checklist',`${id} coverage marker`);
  }
});

test('default dependency inference roots non-subject checks in earlier subject/count nodes',()=>{
  const rubric=[
    {id:'q0',type:'C1',description:'主体存在'},
    {id:'q1',type:'C3',description:'主体为红色'},
    {id:'q2',type:'C5',description:'主体执行动作'}
  ];
  const expected={q0:[],q1:['q0'],q2:['q0']};
  assert.deepEqual(inferDependencies(rubric,{}),expected);
  assert.deepEqual(inferBrowserDependencies(rubric,{}),expected);
});

test('explicit dependencies override inferred dependencies',()=>{
  const rubric=[{id:'q0',type:'C1'},{id:'q1',type:'C5'},{id:'q2',type:'C1'}];
  assert.deepEqual(inferDependencies(rubric,{q1:['q2']}),{q0:[],q1:['q2'],q2:[]});
});
