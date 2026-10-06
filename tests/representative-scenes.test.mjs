import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

function load(){return JSON.parse(fs.readFileSync('web/data/scene-specs-v0.1.json','utf8'));}
function entity(spec,id){return spec.scene.entities.find(e=>e.id===id);}

 test('CB-001 encodes three ordered mice, colors, and middle lantern binding',()=>{
  const s=load()['CB-001'];
  assert.equal(s.scene.entities.filter(e=>e.kind==='animal').length,3);
  assert.equal(entity(s,'mouse-left').color,'#8b9299');
  assert.equal(entity(s,'mouse-middle').color,'#f0f1f2');
  assert.equal(entity(s,'mouse-right').color,'#23272c');
  assert.equal(s.scene.relations.find(r=>r.id==='holds-lantern').from,'mouse-middle');
  assert.deepEqual(s.dependencies.q5,['q0','q2']);
});

test('CB-007 keeps white-left tea action separate from gray-right tray action',()=>{
  const s=load()['CB-007'];
  assert.equal(entity(s,'rabbit-white').x < entity(s,'rabbit-gray').x,true);
  assert.ok(s.scene.relations.some(r=>r.id==='pour-tea'&&r.from==='rabbit-white'&&r.to==='red-cup'));
  assert.ok(s.scene.relations.some(r=>r.id==='holds-tray'&&r.from==='rabbit-gray'&&r.to==='tray'));
});

test('CB-022 preserves exact 春 text and no-extra-text check',()=>{
  const s=load()['CB-022'];
  assert.equal(entity(s,'red-paper').label,'春');
  assert.equal(s.scene.labels.some(l=>l.text==='春'),true);
  assert.ok(s.dependencies.q4.includes('q3'));
});

test('CB-A05 exposes twelve unique zodiac entities arranged as a ring',()=>{
  const s=load()['CB-A05'];
  const z=s.scene.entities.filter(e=>e.kind==='zodiac');
  assert.equal(z.length,12);
  assert.equal(new Set(z.map(e=>e.label)).size,12);
  assert.ok(s.scene.relations.some(r=>r.kind==='ring'));
});

test('CB-A06 preserves exact couplet strings and placement semantics',()=>{
  const s=load()['CB-A06'];
  const labels=s.scene.labels.map(l=>l.text);
  assert.ok(labels.includes('春风入户'));
  assert.ok(labels.includes('喜气盈门'));
  assert.ok(labels.includes('万事如意'));
  const right=s.scene.labels.find(l=>l.text==='春风入户');
  const left=s.scene.labels.find(l=>l.text==='喜气盈门');
  const top=s.scene.labels.find(l=>l.text==='万事如意');
  assert.ok(right.x>50 && left.x<50 && top.y<35);
});
