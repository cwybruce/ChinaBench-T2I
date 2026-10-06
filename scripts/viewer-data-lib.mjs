import { sceneForCase } from './scene-catalog.mjs';
function normalizeResult(row){
  if(!row) return {state:'not_generated',total_score:null,result_image:null,atomic_scores:null};
  const reviewed=Number.isFinite(row.total_score)&&Array.isArray(row.atomic_scores)&&row.atomic_scores.every(x=>x&&typeof x.passed==='boolean');
  return {state:reviewed?'reviewed':'pending',total_score:reviewed?row.total_score:null,result_image:row.result_image??null,atomic_scores:reviewed?row.atomic_scores:null};
}
function defaultDeps(rubric){
  const negative=/不要|没有|无|不出现|总数|共/;
  let rootIndex=rubric.findIndex(r=>String(r.type||'').toUpperCase()==='C1'&&!negative.test(String(r.description||'')));
  if(rootIndex<0) rootIndex=rubric.findIndex(r=>String(r.type||'').toUpperCase()==='C2'&&!negative.test(String(r.description||'')));
  const root=rootIndex>=0?`q${rootIndex}`:null;
  return rubric.map((r,i)=>({id:`q${i}`,depends_on:(root&&i!==rootIndex&&!negative.test(String(r.description||'')))?[root]:[]}));
}
function defaultScene(item,rubric){ return sceneForCase(item.id,rubric,item.title||item.id); }
export function buildViewerData({core=[],anchors=[],run={results:[]}}){
  const resultMap=new Map((run.results||[]).map(x=>[x.test_id,x]));
  return [...core,...anchors].map(item=>{
    const rubric=(item.rubric||[]).map((r,i)=>({...r,id:`q${i}`}));
    return {id:item.id,title:item.title||item.id,suite:item.suite||(String(item.id).includes('A')?'anchor':'core'),zodiac:item.zodiac||'',difficulty:item.difficulty??null,capabilities:item.capabilities||[],prompt:item.prompt_cn||item.prompt||'',rubric,evaluation_graph:defaultDeps(rubric),scene_spec:defaultScene(item,rubric),result:normalizeResult(resultMap.get(item.id))};
  });
}
export function validateViewerCases(cases){
  const errors=[],ids=new Set();
  for(const c of cases){
    if(ids.has(c.id)) errors.push(`duplicate id ${c.id}`); ids.add(c.id);
    const sum=(c.rubric||[]).reduce((s,x)=>s+Number(x.points||0),0); if(Math.abs(sum-10)>1e-9) errors.push(`${c.id}: rubric sum ${sum}`);
    const nodeIds=new Set((c.evaluation_graph||[]).map(x=>x.id)); const adj=new Map((c.evaluation_graph||[]).map(x=>[x.id,x.depends_on||[]]));
    for(const [id,deps] of adj) for(const d of deps) if(!nodeIds.has(d)) errors.push(`${c.id}: missing dependency ${d} for ${id}`);
    const visiting=new Set(),done=new Set(); const dfs=id=>{if(visiting.has(id))return true;if(done.has(id))return false;visiting.add(id);for(const d of(adj.get(id)||[]))if(dfs(d))return true;visiting.delete(id);done.add(id);return false}; for(const id of nodeIds) if(dfs(id)){errors.push(`${c.id}: dependency cycle`);break;}
  }
  return {ok:errors.length===0,errors};
}
