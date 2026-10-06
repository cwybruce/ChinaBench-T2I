import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSceneSvg, stateClass } from '../web/js/scene-renderer.js';

const baseCase = {
  id:'CB-T', title:'测试', prompt:'测试',
  rubric:[{id:'q0',description:'“春”字正确',points:10,depends_on:[]}],
  evaluation_graph:[{id:'q0',depends_on:[]}],
  scene_spec:{
    entities:[
      {id:'dog',kind:'animal',label:'狗',x:28,y:55,color:'#d9a441'},
      {id:'paper',kind:'text_surface',label:'春',x:68,y:50,color:'#b72f35'}
    ],
    relations:[{id:'writes',from:'dog',to:'paper',label:'书写',kind:'action'}],
    labels:[{id:'exact-text',text:'春',x:68,y:50}]
  }
};

test('scene markup exposes stable entity and relation ids', () => {
  const svg=buildSceneSvg(baseCase);
  assert.match(svg,/data-entity-id="dog"/);
  assert.match(svg,/data-entity-id="paper"/);
  assert.match(svg,/data-relation-id="writes"/);
});

test('scene markup preserves exact Chinese Unicode text', () => {
  const svg=buildSceneSvg(baseCase);
  assert.match(svg,/>春</);
  assert.match(svg,/书写/);
});

test('unknown primitive falls back to labeled benchmark node', () => {
  const c=structuredClone(baseCase);
  c.scene_spec.entities=[{id:'mystery',kind:'not-real',label:'未知图元',x:50,y:50}];
  const svg=buildSceneSvg(c);
  assert.match(svg,/data-entity-id="mystery"/);
  assert.match(svg,/未知图元/);
  assert.match(svg,/scene-fallback/);
});

test('stateClass supports all benchmark atomic states', () => {
  assert.equal(stateClass('pending'),'is-pending');
  assert.equal(stateClass('pass'),'is-pass');
  assert.equal(stateClass('fail'),'is-fail');
  assert.equal(stateClass('skipped'),'is-skipped');
  assert.equal(stateClass('n/a'),'is-na');
});
