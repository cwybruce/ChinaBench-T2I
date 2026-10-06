import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CAPABILITIES = new Set(['C1','C2','C3','C4','C5','C6','C7','C8']);

function scoreState(passed) {
  if (passed === true) return 'pass';
  if (passed === false) return 'fail';
  return 'pending';
}

function normalizeResult(runItem, rubric) {
  if (!runItem) {
    return { status:'awaiting_generation', review_state:'pending', result_image:null, total_score:null, atomic_scores:[] };
  }
  const atomic = rubric.map((r, i) => {
    const a = runItem.atomic_scores?.[i] || {};
    return {
      id:r.id,
      description:r.description,
      points:r.points,
      state:scoreState(a.passed),
      awarded:a.awarded ?? null
    };
  });
  const reviewed = runItem.total_score != null && atomic.every(a => a.state !== 'pending');
  return {
    status:runItem.status || (runItem.result_image ? 'generated_pending_review' : 'awaiting_generation'),
    review_state:reviewed ? 'reviewed' : 'pending',
    result_image:runItem.result_image ?? null,
    total_score:reviewed ? runItem.total_score : null,
    generation_id:runItem.generation_id ?? null,
    generation_date:runItem.generation_date ?? null,
    atomic_scores:atomic
  };
}

export function inferDependencies(rubric, explicit = {}) {
  const roots = rubric.filter(r => r.type === 'C1' || r.type === 'C2').map(r => r.id);
  const firstRoot = roots[0] || null;
  const out = {};
  for (const item of rubric) {
    if (Object.prototype.hasOwnProperty.call(explicit, item.id)) out[item.id] = [...explicit[item.id]];
    else if (item.type === 'C1' || item.type === 'C2' || !firstRoot) out[item.id] = [];
    else out[item.id] = [firstRoot];
  }
  return out;
}

export function buildViewerData({ core, anchors, run, sceneSpecs = {} }) {
  const questions = [...(core?.questions || []), ...(anchors?.questions || [])];
  const runMap = new Map((run?.results || []).map(r => [r.test_id, r]));
  return questions.map(q => {
    const supplement = sceneSpecs[q.id] || {};
    const rubricBase = (q.rubric || []).map((r, i) => ({ id:`q${i}`, type:r.type, description:r.description, points:Number(r.points) }));
    const dependencyMap = inferDependencies(rubricBase, supplement.dependencies || {});
    const rubric = rubricBase.map(r => ({...r, depends_on:[...(dependencyMap[r.id] || [])]}));
    return {
      id:q.id,
      title:q.title,
      suite:q.suite,
      zodiac:q.zodiac,
      difficulty:q.difficulty,
      capabilities:q.capabilities || [],
      prompt:q.prompt_cn,
      expected_failures:q.expected_failures || [],
      rubric,
      evaluation_graph:rubric.map(r => ({ id:r.id, depends_on:[...r.depends_on] })),
      scene_spec:supplement.scene || { kind:'rubric-map', entities:[], relations:[], labels:[] },
      result:normalizeResult(runMap.get(q.id), rubric)
    };
  });
}

function hasCycle(graph) {
  const deps = new Map(graph.map(n => [n.id, n.depends_on || []]));
  const visiting = new Set();
  const visited = new Set();
  const visit = id => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dep of deps.get(id) || []) if (visit(dep)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return [...deps.keys()].some(visit);
}

export function validateViewerCases(cases) {
  const errors = [];
  if (!Array.isArray(cases) || cases.length !== 30) errors.push(`expected 30 cases, got ${cases?.length ?? 'non-array'}`);
  const ids = new Set();
  for (const c of cases || []) {
    if (ids.has(c.id)) errors.push(`duplicate id ${c.id}`);
    ids.add(c.id);
    const total = (c.rubric || []).reduce((s,r)=>s+Number(r.points || 0),0);
    if (Math.abs(total - 10) > 1e-9) errors.push(`${c.id}: rubric total ${total}, expected 10`);
    for (const cap of c.capabilities || []) if (!CAPABILITIES.has(cap)) errors.push(`${c.id}: unknown capability ${cap}`);
    const nodeIds = new Set((c.evaluation_graph || []).map(n=>n.id));
    for (const node of c.evaluation_graph || []) {
      for (const dep of node.depends_on || []) if (!nodeIds.has(dep)) errors.push(`${c.id}: missing dependency ${dep} for ${node.id}`);
    }
    if (hasCycle(c.evaluation_graph || [])) errors.push(`${c.id}: dependency cycle detected`);
    if (!c.scene_spec || typeof c.scene_spec !== 'object') errors.push(`${c.id}: missing scene spec`);
  }
  return { ok:errors.length===0, errors };
}

function readJson(p) { return JSON.parse(fs.readFileSync(p,'utf8')); }
function writeJson(p, value) { fs.mkdirSync(path.dirname(p), {recursive:true}); fs.writeFileSync(p, JSON.stringify(value,null,2)+'\n'); }

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isCli) {
  const root = process.cwd();
  const core = readJson(path.join(root,'benchmark/v0.1/questions.json'));
  const anchors = readJson(path.join(root,'benchmark/v0.1/anchors.json'));
  const run = readJson(path.join(root,'results/chatgpt-image/run-2026-10-06.json'));
  const scenePath = path.join(root,'web/data/scene-specs-v0.1.json');
  const sceneSpecs = fs.existsSync(scenePath) ? readJson(scenePath) : {};
  const cases = buildViewerData({core, anchors, run, sceneSpecs});
  const result = validateViewerCases(cases);
  if (!result.ok) {
    console.error(result.errors.join('\n'));
    process.exit(1);
  }
  writeJson(path.join(root,'web/data/cases-v0.1.json'), {benchmark:'ChinaBench-T2I',version:'0.1',cases});
  console.log(`built ${cases.length} cases`);
}
