import { renderScene, stateClass } from './scene-renderer.js';

export function formatOfficialScore(result) {
  return result?.review_state === 'reviewed' && Number.isFinite(Number(result.total_score)) ? Number(result.total_score).toFixed(1) : '—';
}

export function deriveAtomicState(result, atomic) {
  if (result?.review_state !== 'reviewed') return 'pending';
  if (atomic?.passed === true || atomic?.state === 'pass') return 'pass';
  if (atomic?.passed === false || atomic?.state === 'fail') return 'fail';
  if (atomic?.state === 'skipped') return 'skipped';
  if (atomic?.state === 'n/a') return 'n/a';
  return 'pending';
}

export function propagateStates(nodes) {
  const out=nodes.map(n=>({...n,depends_on:[...(n.depends_on||[])]}));
  const map=new Map(out.map(n=>[n.id,n]));
  let changed=true;
  while(changed){
    changed=false;
    for(const n of out){
      if(!n.depends_on.length) continue;
      const blocked=n.depends_on.some(id=>['fail','skipped','n/a'].includes(map.get(id)?.state));
      if(blocked && n.state!=='skipped'){ n.state='skipped'; changed=true; }
    }
  }
  return out;
}

function atomicStateFromRun(runItem, i, reviewState) {
  const a=runItem?.atomic_scores?.[i] || {};
  return deriveAtomicState({review_state:reviewState},a);
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

export function normalizeCaseData(core, anchors, run, sceneSpecs={}) {
  const runMap=new Map((run?.results||[]).map(r=>[r.test_id,r]));
  return [...(core?.questions||[]),...(anchors?.questions||[])].map(q=>{
    const r=runMap.get(q.id)||{};
    const reviewed=r.total_score!=null && (r.atomic_scores||[]).length===q.rubric.length && r.atomic_scores.every(a=>a.passed===true||a.passed===false||['skipped','n/a'].includes(a.state));
    const review_state=reviewed?'reviewed':'pending';
    const supplement=sceneSpecs[q.id]||{};
    const rubricBase=q.rubric.map((item,i)=>({id:`q${i}`,type:item.type,description:item.description,points:Number(item.points)}));
    const dependencyMap=inferDependencies(rubricBase,supplement.dependencies||{});
    const rubric=rubricBase.map((item,i)=>({...item,depends_on:[...(dependencyMap[item.id]||[])],state:atomicStateFromRun(r,i,review_state),awarded:reviewed?(r.atomic_scores?.[i]?.awarded??0):null}));
    return {
      id:q.id,title:q.title,suite:q.suite,zodiac:q.zodiac,difficulty:q.difficulty,capabilities:q.capabilities||[],prompt:q.prompt_cn,
      rubric,evaluation_graph:rubric.map(x=>({id:x.id,depends_on:x.depends_on,state:x.state})),scene_spec:supplement.scene||{entities:[],relations:[],labels:[]},
      result:{...r,review_state,total_score:reviewed?r.total_score:null}
    };
  });
}

function publicResultPath(value) {
  if(!value) return null;
  return value.startsWith('web/') ? `../${value.slice(4)}` : value;
}

const PHASES=['PROMPT LOCKED','PARSE','BUILD GRAPH','VERIFY','PROPAGATE','AGGREGATE'];
let app=null;

function markForState(s){ return s==='pass'?'✓':s==='fail'?'✕':s==='skipped'?'↷':s==='n/a'?'—':'•'; }
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

class ViewerController {
  constructor(caseData, runMeta={}){
    this.caseData=caseData; this.runMeta=runMeta; this.stepIndex=-1; this.timer=null; this.speed=1; this.mode='spec';
    this.sceneHandle=null; this.sequence=this.buildSequence();
  }
  buildSequence(){
    return [
      {kind:'phase',phase:0},{kind:'phase',phase:1},{kind:'phase',phase:2},
      ...this.caseData.rubric.map((r,i)=>({kind:'rubric',phase:3,index:i,id:r.id})),
      {kind:'phase',phase:4},{kind:'phase',phase:5}
    ];
  }
  mount(){
    document.title=`${this.caseData.id} · ${this.caseData.title} · ChinaBench-T2I`;
    document.getElementById('caseTitle').textContent=`${this.caseData.id}｜${this.caseData.title}`;
    document.getElementById('promptText').textContent=this.caseData.prompt;
    document.getElementById('caseBadges').innerHTML=[this.caseData.suite,this.caseData.zodiac,`L${this.caseData.difficulty}`,...this.caseData.capabilities].map(x=>`<span class="badge">${esc(x)}</span>`).join('');
    this.sceneHandle=renderScene(document.getElementById('specScene'),this.caseData);
    this.renderChecklist(); this.renderResult(); this.renderMeta(); this.updateProgress();
  }
  renderChecklist(){
    document.getElementById('checklist').innerHTML=this.caseData.rubric.map(r=>`<div class="check-row is-pending" data-check-id="${esc(r.id)}"><div class="state-mark">•</div><div class="check-main"><b>${esc(r.id)} · ${esc(r.description)}</b><small>${r.depends_on.length?`depends on ${r.depends_on.join(', ')}`:'ROOT'} · ${esc(r.type)}</small></div><div class="points">${r.points} pt</div></div>`).join('');
    document.getElementById('scoreValue').textContent=formatOfficialScore(this.caseData.result);
    document.getElementById('scoreState').textContent=this.caseData.result.review_state==='reviewed'?'已复核':'待复核';
  }
  renderResult(){
    const img=document.getElementById('resultImage'), ph=document.getElementById('resultPlaceholder');
    const src=publicResultPath(this.caseData.result.result_image);
    if(src){img.src=src;img.hidden=false;ph.hidden=true;}else{img.removeAttribute('src');img.hidden=true;ph.hidden=false;}
  }
  renderMeta(){
    const r=this.caseData.result;
    const meta={
      'Generator Product':this.runMeta.generator_product||'ChatGPT Image Generation',
      'Generator Model':this.runMeta.generator_model||'exact model undisclosed',
      'Model Visibility':this.runMeta.generator_model_visibility||'undisclosed',
      'Evaluator':this.runMeta.evaluator_model||'GPT-5.6 Sol',
      'Selection':this.runMeta.selection_policy||'first_image',
      'Generation Date':r.generation_date||'—','Generation ID':r.generation_id||'—','Status':r.status||'awaiting_generation'
    };
    document.getElementById('metadata').innerHTML=Object.entries(meta).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  }
  setMode(mode){
    this.mode=mode;document.getElementById('app').dataset.view=mode;
    document.querySelectorAll('.mode-button').forEach(b=>{const on=b.dataset.view===mode;b.classList.toggle('is-active',on);b.setAttribute('aria-selected',String(on));});
    document.getElementById('viewLabel').textContent=mode==='spec'?'SPEC ILLUSTRATION':'MODEL OUTPUT';
    document.getElementById('viewNote').textContent=mode==='spec'?'HTML/CSS/SVG · not model evidence':'real generated output · scoring evidence';
  }
  applyStep(step){
    document.querySelectorAll('.check-row').forEach(r=>r.classList.remove('is-current'));
    const stage=document.getElementById('visualStage');stage.classList.toggle('is-scanning',step?.phase===3);
    if(!step){document.getElementById('phaseChip').textContent='READY';document.getElementById('phaseTitle').textContent='等待开始';return;}
    document.getElementById('phaseChip').textContent=PHASES[step.phase];
    document.getElementById('phaseTitle').textContent=step.kind==='rubric'?`验证 ${step.id}`:PHASES[step.phase];
    if(step.kind==='rubric'){
      const row=document.querySelector(`[data-check-id="${step.id}"]`); const item=this.caseData.rubric[step.index];
      row?.classList.add('is-current','is-revealed');
      row?.classList.remove('is-pending','is-pass','is-fail','is-skipped','is-na');
      const state=this.caseData.result.review_state==='reviewed'?item.state:'pending';
      row?.classList.add(stateClass(state)); const mark=row?.querySelector('.state-mark'); if(mark) mark.textContent=markForState(state);
      this.sceneHandle?.highlightNode(step.id,state);
    }
    if(step.phase===4 && this.caseData.result.review_state==='reviewed'){
      const propagated=propagateStates(this.caseData.evaluation_graph);
      for(const n of propagated){const row=document.querySelector(`[data-check-id="${n.id}"]`);if(!row)continue;row.classList.remove('is-pass','is-fail','is-pending','is-skipped','is-na');row.classList.add(stateClass(n.state));row.querySelector('.state-mark').textContent=markForState(n.state);}
    }
    this.updateProgress();
  }
  updateProgress(){
    const phase=this.stepIndex<0?0:(this.sequence[this.stepIndex]?.phase??0)+1;
    document.querySelectorAll('.timeline i').forEach((x,i)=>x.classList.toggle('is-on',i<phase));
  }
  step(delta=1){this.pause();this.stepIndex=Math.max(-1,Math.min(this.sequence.length-1,this.stepIndex+delta));this.applyStep(this.sequence[this.stepIndex]);}
  reset(){this.pause();this.stepIndex=-1;this.sceneHandle?.clearHighlights();this.renderChecklist();this.applyStep(null);this.updateProgress();}
  play(){this.pause();const tick=()=>{if(this.stepIndex>=this.sequence.length-1){this.pause();return;}this.stepIndex++;this.applyStep(this.sequence[this.stepIndex]);this.timer=setTimeout(tick,Math.max(220,800/this.speed));};tick();}
  pause(){if(this.timer){clearTimeout(this.timer);this.timer=null;}}
  setSpeed(v){this.speed=Number(v)||1;}
}

async function fetchJson(url){const r=await fetch(url);if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json();}
async function boot(){
  const id=new URLSearchParams(location.search).get('id');
  try{
    const [core,anchors,run,sceneSpecs]=await Promise.all([
      fetchJson('../../benchmark/v0.1/questions.json'),fetchJson('../../benchmark/v0.1/anchors.json'),fetchJson('../../results/chatgpt-image/run-2026-10-06.json'),fetchJson('../data/scene-specs-v0.1.json')
    ]);
    const cases=normalizeCaseData(core,anchors,run,sceneSpecs);
    const selected=cases.find(c=>c.id===id) || cases[0];
    if(!selected) throw new Error('No benchmark cases found');
    app=new ViewerController(selected,run);app.mount();app.setMode('spec');
    if(!id){history.replaceState(null,'',`?id=${encodeURIComponent(selected.id)}`);}
    document.querySelectorAll('.mode-button').forEach(b=>b.addEventListener('click',()=>app.setMode(b.dataset.view)));
    document.getElementById('playButton').onclick=()=>app.play();document.getElementById('pauseButton').onclick=()=>app.pause();document.getElementById('stepNextButton').onclick=()=>app.step(1);document.getElementById('stepPrevButton').onclick=()=>app.step(-1);document.getElementById('resetButton').onclick=()=>app.reset();document.getElementById('speedSelect').onchange=e=>app.setSpeed(e.target.value);
    document.addEventListener('keydown',e=>{if(e.target?.matches('input,select,textarea,button'))return;if(e.code==='Space'){e.preventDefault();app.play();}else if(e.key==='ArrowRight')app.step(1);else if(e.key==='ArrowLeft')app.step(-1);else if(e.key==='Home')app.reset();});
  }catch(err){const p=document.getElementById('errorPanel');p.hidden=false;p.textContent=`无法载入测试：${err.message}`;document.getElementById('viewerGrid').hidden=true;}
}

if(typeof window!=='undefined'&&typeof document!=='undefined') boot();
