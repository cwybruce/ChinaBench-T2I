import test from 'node:test';
import assert from 'node:assert/strict';
import { buildViewerData, validateViewerCases } from '../scripts/build-viewer-data.mjs';

function makeQuestion(id, suite='core', prompt='测试“春”') {
  return {
    id, suite, zodiac: '鼠', title: `题目 ${id}`, difficulty: 2,
    capabilities: ['C1'], prompt_cn: prompt, max_score: 10,
    rubric: [{ type: 'C1', description: '主体存在', points: 10 }]
  };
}

function makeFixture() {
  const core = { questions: Array.from({length:24}, (_,i)=>makeQuestion(`CB-${String(i+1).padStart(3,'0')}`)) };
  const anchors = { questions: Array.from({length:6}, (_,i)=>makeQuestion(`CB-A${String(i+1).padStart(2,'0')}`,'anchor')) };
  const run = { results: [...core.questions, ...anchors.questions].map((q, i)=>({
    test_id:q.id,
    status:i < 2 ? 'generated_pending_review' : 'awaiting_generation',
    result_image:i < 2 ? `web/assets/results/${q.id}.jpg` : null,
    total_score:null,
    atomic_scores:i < 2 ? [{description:'主体存在',points:10,passed:null,awarded:null}] : []
  })) };
  return {core, anchors, run};
}

test('buildViewerData yields exactly 30 unique cases with stable atomic ids', () => {
  const {core, anchors, run}=makeFixture();
  const cases=buildViewerData({core, anchors, run});
  assert.equal(cases.length,30);
  assert.equal(new Set(cases.map(c=>c.id)).size,30);
  assert.equal(cases.filter(c=>c.suite==='core').length,24);
  assert.equal(cases.filter(c=>c.suite==='anchor').length,6);
  assert.deepEqual(cases[0].rubric.map(r=>r.id),['q0']);
});

test('rubrics remain out of 10 and Chinese Unicode survives unchanged', () => {
  const {core, anchors, run}=makeFixture();
  core.questions[0].prompt_cn='狗写“春”字；灯笼写“福”';
  const cases=buildViewerData({core, anchors, run});
  assert.equal(cases[0].rubric.reduce((s,r)=>s+r.points,0),10);
  assert.equal(cases[0].prompt,'狗写“春”字；灯笼写“福”');
});

test('pending runs never synthesize official score or pass states', () => {
  const {core, anchors, run}=makeFixture();
  const cases=buildViewerData({core, anchors, run});
  assert.equal(cases[0].result.review_state,'pending');
  assert.equal(cases[0].result.total_score,null);
  assert.equal(cases[0].result.atomic_scores[0].state,'pending');
});

test('validator rejects missing dependency targets and dependency cycles', () => {
  const {core, anchors, run}=makeFixture();
  const cases=buildViewerData({core, anchors, run});
  cases[0].evaluation_graph[0].depends_on=['missing'];
  let v=validateViewerCases(cases);
  assert.equal(v.ok,false);
  assert.match(v.errors.join('\n'),/missing dependency/i);

  const cases2=buildViewerData({core, anchors, run});
  cases2[0].rubric.push({id:'q1',type:'C1',description:'second',points:0,state:'pending',awarded:null});
  cases2[0].evaluation_graph.push({id:'q1',depends_on:['q0']});
  cases2[0].evaluation_graph[0].depends_on=['q1'];
  v=validateViewerCases(cases2);
  assert.equal(v.ok,false);
  assert.match(v.errors.join('\n'),/cycle/i);
});
