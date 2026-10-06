const esc=(v='')=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function fetchJson(url){const r=await fetch(url);if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json();}

function normalize(core,anchors,run){
  const runMap=new Map((run?.results||[]).map(r=>[r.test_id,r]));
  return [...(core?.questions||[]),...(anchors?.questions||[])].map(q=>{
    const r=runMap.get(q.id)||{status:'awaiting_generation'};
    const reviewed=r.total_score!=null;
    const score=reviewed?Number(r.total_score).toFixed(1):'—';
    const status=r.status==='generated_pending_review'?'已生成 · 待复核':r.status==='awaiting_generation'?'待生成':reviewed?'已复核':(r.status||'待生成');
    return {...q,result:r,score,status,reviewed};
  });
}

function statusClass(c){if(c.reviewed)return'is-reviewed';if(c.result.status==='generated_pending_review')return'is-generated';return'is-pending';}
function card(c){
  return `<a class="result-card card" href="case.html?id=${encodeURIComponent(c.id)}" data-suite="${esc(c.suite)}" data-zodiac="${esc(c.zodiac)}" data-difficulty="${esc(c.difficulty)}">
    <div class="result-card-top"><span class="case-id">${esc(c.id)}</span><span class="status-dot ${statusClass(c)}">${esc(c.status)}</span></div>
    <h2>${esc(c.title)}</h2>
    <p>${esc(c.prompt_cn)}</p>
    <div class="result-tags">${(c.capabilities||[]).map(x=>`<span>${esc(x)}</span>`).join('')}<span>L${esc(c.difficulty)}</span><span>${esc(c.zodiac)}</span></div>
    <div class="result-card-foot"><span>${esc(c.suite)}</span><strong>${c.score} <small>/ 10</small></strong></div>
  </a>`;
}

function fillZodiacs(cases){
  const sel=document.getElementById('filterZodiac');
  [...new Set(cases.map(c=>c.zodiac))].sort().forEach(z=>sel.insertAdjacentHTML('beforeend',`<option value="${esc(z)}">${esc(z)}</option>`));
}
function applyFilters(cases){
  const suite=document.getElementById('filterSuite').value,cap=document.getElementById('filterCapability').value,zodiac=document.getElementById('filterZodiac').value,diff=document.getElementById('filterDifficulty').value;
  const filtered=cases.filter(c=>(suite==='all'||c.suite===suite)&&(cap==='all'||c.capabilities.includes(cap))&&(zodiac==='all'||c.zodiac===zodiac)&&(diff==='all'||String(c.difficulty)===diff));
  document.getElementById('resultsGrid').innerHTML=filtered.map(card).join('')||'<div class="empty-state">没有符合筛选条件的测试。</div>';
}

async function boot(){
  try{
    const [core,anchors,run]=await Promise.all([fetchJson('../../benchmark/v0.1/questions.json'),fetchJson('../../benchmark/v0.1/anchors.json'),fetchJson('../../results/chatgpt-image/run-2026-10-06.json')]);
    const cases=normalize(core,anchors,run);fillZodiacs(cases);applyFilters(cases);
    document.getElementById('metricGenerated').textContent=cases.filter(c=>c.result.result_image).length;
    document.getElementById('metricReviewed').textContent=cases.filter(c=>c.reviewed).length;
    ['filterSuite','filterCapability','filterZodiac','filterDifficulty'].forEach(id=>document.getElementById(id).addEventListener('change',()=>applyFilters(cases)));
    document.getElementById('clearFilters').onclick=()=>{for(const id of ['filterSuite','filterCapability','filterZodiac','filterDifficulty'])document.getElementById(id).value='all';applyFilters(cases);};
  }catch(err){const p=document.getElementById('resultsError');p.hidden=false;p.textContent=`无法载入结果：${err.message}`;}
}
if(typeof window!=='undefined'&&typeof document!=='undefined')boot();
